"use client";
import React from "react";
import { ArrowRight } from "lucide-react";
import { BallTriangle } from "react-loader-spinner";
import {
  useGetProductsByCategoryQuery,
} from "../_state/_services/ProductApi";
import { useGetCategoriesQuery } from "../_state/_services/CategoryApi";
import ProductsList from "./ProductsList";
import Link from "next/link"; // Thêm Link từ Next.js để điều hướng

const CategorySection = () => {
  const { data: categories, isLoading: catLoading } = useGetCategoriesQuery();

  if (catLoading) {
    return (
      <div className="w-full h-[400px] flex justify-center items-center bg-gray-900">
        <BallTriangle height={80} width={80} color="#319795" visible />
      </div>
    );
  }

  // Thêm kiểm tra nếu không có danh mục nào được tìm thấy
  if (!categories || !categories.data || categories.data.length === 0) {
    return <div className="p-10 text-white">Không tìm thấy danh mục nào.</div>;
  }

  return (
    <div className="p-10 md:px-20 bg-gray-900 text-white">
      <h2 className="font-bold text-2xl mb-10">Tất cả sản phẩm</h2>

      <div className="space-y-16">
        {categories.data.map((cat) => (
          <CategoryBlock
            key={cat.id}
            categoryName={cat.attributes.title}
            categoryId={cat.id}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryBlock = ({ categoryName, categoryId }) => {
  const {
    data: products,
    isLoading,
    isSuccess,
    isError,
  } = useGetProductsByCategoryQuery(categoryId);

  if (isLoading) {
    return (
      <div className="w-full h-[200px] flex justify-center items-center">
        <BallTriangle height={60} width={60} color="#319795" visible />
      </div>
    );
  }

  if (isError || !products || !products.data || products.data.length === 0) {
    return (
      <div className="pb-6">
        <h3 className="font-semibold text-xl">{categoryName}</h3>
        <p className="mt-2 text-gray-400">Không có sản phẩm nào trong danh mục này.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-6 flex justify-between items-center">
        <h3 className="font-semibold text-xl">{categoryName}</h3>
        <Link href={`/products?categoryId=${categoryId}`}>
          <span className="text-sm text-primary flex items-center cursor-pointer hover:text-teal-600">
            Xem tất cả <ArrowRight className="h-4 ml-1" />
          </span>
        </Link>
      </div>
      <ProductsList products={products.data} />
    </div>
  );
};

export default CategorySection;