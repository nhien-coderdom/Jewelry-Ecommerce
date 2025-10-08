"use client";

import React from "react";
import { AlertOctagon, BadgeCheck, ShoppingCart } from "lucide-react";
import SkeletonProductInfo from "./SkeletonProductInfo";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  useAddCartItemMutation,
  useGetCartItemsQuery,
} from "../../../_state/_services/CartApi";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

const Details = ({ product }) => {
  const { user } = useUser();
  const router = useRouter();

  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation();
  const { data: cartData, refetch: refetchCart, isFetching } =
    useGetCartItemsQuery(user?.primaryEmailAddress?.emailAddress, {
      skip: !user,
    });

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_REST_API_URL;
      const email = user?.primaryEmailAddress?.emailAddress;
      const username = user?.fullName || user?.firstName || "Unknown";

      if (!product?.id) {
        alert("❌ Sản phẩm không hợp lệ!");
        return;
      }

      const stock = product?.attributes?.stock ?? 0;

      // ✅ 1. Lấy giỏ hàng hiện có
      const checkUrl = `${API_URL}/carts?populate[cart_items][populate][product][populate]=banner&filters[email][$eq]=${encodeURIComponent(
        email
      )}`;
      const checkRes = await fetch(checkUrl);
      const checkJson = await checkRes.json();
      

      let cartId = null;
      let existingCartItems = [];

      if (checkJson?.data?.length > 0) {
        const cart = checkJson.data[0];
        cartId = cart?.id;
        existingCartItems = cart?.attributes?.cart_items?.data || [];
        
      }

      // ✅ 2. Nếu chưa có cart thì tạo mới
      if (!cartId) {
        
        const createRes = await fetch(`${API_URL}/carts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { username, email },
          }),
        });

        const newCart = await createRes.json();
        cartId = newCart?.data?.id;
        
      }

      if (!cartId) {
        throw new Error("❌ Không tìm thấy hoặc tạo được giỏ hàng!");
      }

      // ✅ 3. Kiểm tra nếu sản phẩm đã tồn tại trong giỏ
      const existingItem = existingCartItems.find(
        (item) => item?.attributes?.product?.data?.id === product.id
      );

      if (existingItem) {
        // 👉 Nếu đã có, cộng thêm 1 số lượng (nhưng kiểm tra tồn kho trước)
        const currentQty = existingItem?.attributes?.quantity || 1;
        const newQty = currentQty + 1;

        if (newQty > stock) {
          alert(`⚠️ Không đủ hàng trong kho! (Còn lại ${stock})`);
          return;
        }

        // 🌀 Cập nhật lại số lượng
        const updateRes = await fetch(`${API_URL}/cart-items/${existingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: { quantity: newQty },
          }),
        });

        const updateJson = await updateRes.json();
        

        if (typeof refetchCart === "function") await refetchCart();
        alert("✅ Đã tăng số lượng sản phẩm trong giỏ hàng!");
        return;
      }

      // ✅ 4. Nếu chưa có → thêm mới (và kiểm tra tồn kho)
      if (stock <= 0) {
        alert("⚠️ Sản phẩm này đã hết hàng!");
        return;
      }

      
      await addCartItem({
        email: user?.primaryEmailAddress?.emailAddress,
        username: user?.fullName || user?.firstName || "Unknown",
        productId: product.id,
        quantity: 1,
      }).unwrap();

      // ✅ 5. Làm mới dữ liệu cart
      if (typeof refetchCart === "function") await refetchCart();

      alert("✅ Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      
      alert(error?.data?.message || "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
    }
  };

  if (!product?.id) {
    return <SkeletonProductInfo />;
  }

  const { attributes } = product;
  const price = attributes?.price || 0;
  const title = attributes?.title || "Unnamed product";

  return (
    <div>
      <h2 className="text-[22px] font-medium">{title}</h2>
      <h2 className="text-[15px] my-2 text-gray-400">
        {attributes?.category?.data?.attributes?.name || "N/A"}
      </h2>

      <div className="text-[14px] my-4 prose prose-invert max-w-none">
        {attributes?.description ? (
          <BlocksRenderer content={attributes.description} />
        ) : (
          <p className="text-gray-400">Không có mô tả</p>
        )}
      </div>

      <h2 className="text-[11px] text-gray-500 flex gap-2 my-3 items-center">
        {attributes?.instantDelivery ? (
          <BadgeCheck className="w-5 h-5 text-green-600" />
        ) : (
          <AlertOctagon />
        )}
        Eligible For Instant Delivery
      </h2>

      <h2 className="text-[24px] text-primary mb-4">$ {price}</h2>

      <button
        onClick={handleAddToCart}
        disabled={isAdding || isFetching}
        className="inline-flex items-center gap-2 rounded px-8 py-3 text-white bg-teal-600 hover:bg-teal-700 transition disabled:opacity-50"
      >
        <ShoppingCart size={20} />
        <span className="text-sm font-medium">
          {isAdding ? "Đang thêm..." : "Add To Cart"}
        </span>
      </button>
    </div>
  );
};

export default Details;
