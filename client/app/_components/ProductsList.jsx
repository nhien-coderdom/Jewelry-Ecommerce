"use client";
import React from "react";
import Image from "next/image"; // Use Next.js Image component for optimization
import Link from "next/link";
import { List } from "lucide-react";

const ProductsList = ({ products }) => {
  if (!products || products.length === 0) {
    return <div className="text-gray-500">Không có sản phẩm nào.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link key={product.id} href={`/product-details/${product.id}`}>
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="relative h-[170px]">
              {/* Hiển thị hình ảnh từ trường 'banner' */}
              {product.attributes.banner?.data?.attributes?.url && (
                <Image
                  src={product.attributes.banner.data.attributes.url}
                  alt={product.attributes.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <div className="p-3 text-center text-white">
              <div>
                {/* Hiển thị tiêu đề sản phẩm */}
                <h2 className="text-[14px] font-medium line-clamp-1">
                  {product.attributes.title}
                </h2>
                <div className="flex items-center justify-between mt-2">
                  {/* Hiển thị danh mục */}
                  <h2 className="text-[12px] text-gray-400 flex gap-1 items-center">
                    <List className="w-4 h-4" />
                    {product.attributes.category?.data?.attributes?.name || 'N/A'}
                  </h2>
                  {/* Hiển thị giá sản phẩm */}
                  <h2>${product.attributes.price}</h2>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductsList;