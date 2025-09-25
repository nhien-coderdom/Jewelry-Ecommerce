"use client";

import React from "react";
import { AlertOctagon, BadgeCheck, ShoppingCart } from "lucide-react";
import SkeletonProductInfo from "./SkeletonProductInfo";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useAddToCartMutation,
  useGetCartItemsQuery,
} from "../../../_state/_services/CartApi";
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

const Details = ({ product }) => {
  const { user } = useUser();
  const router = useRouter();
  const [addToCart] = useAddToCartMutation();
  const { refetch: refetchCart } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress
  );

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/sign-in");
    } else {
      await addToCart({
        data: {
          username: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          products: [product?.id],
        },
      });
      refetchCart();
    }
  };

  // Kiểm tra dữ liệu sản phẩm trước khi render
  if (!product?.id) {
    return <SkeletonProductInfo />;
  }

  // Lấy dữ liệu sản phẩm từ đối tượng Strapi
  const { attributes } = product;

  return (
    <div>
      <h2 className="text-[22px] font-medium">{attributes?.title}</h2>
      <h2 className="text-[15px] my-2 text-gray-400">{attributes?.category?.data?.attributes?.name || 'N/A'}</h2>
      
      {/* Sử dụng BlocksRenderer để hiển thị nội dung Rich Text */}
      <div className="text-[14px] my-4 prose prose-invert max-w-none">
        <BlocksRenderer content={attributes.description} />
      </div>

      <h2 className="text-[11px] text-gray-500 flex gap-2 my-3 items-center">
        {attributes?.instantDelivery ? (
          <BadgeCheck className="w-5 h-5 text-green-600" />
        ) : (
          <AlertOctagon />
        )}{" "}
        Eligible For Instant Delivery
      </h2>
      <h2 className="text-[24px] text-primary mb-4">$ {attributes?.price}</h2>
      <button
        onClick={() => handleAddToCart()}
        className="inline-flex items-center gap-2 rounded px-8 py-3 text-white bg-teal-600 hover:bg-teal-700 transition"
      >
        <ShoppingCart size={20} />
        <span className="text-sm font-medium"> Add To Cart </span>
      </button>
    </div>
  );
};

export default Details;