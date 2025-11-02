"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { List } from "lucide-react";

const ProductsList = ({ products, searchTerm = "" }) => {
  // ✅ Ensure safe lowercase
  const keyword = searchTerm?.toLowerCase() || "";

  // ✅ Filter products by title
  const filteredProducts = products?.filter((product) => {
    const title = product?.attributes?.title || "";
    return title.toLowerCase().includes(keyword);
  }) || [];

  if (!filteredProducts.length) {
    return <div className="text-gray-400 text-sm mt-4">No products found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredProducts.map((product) => (
        <Link key={product.id} href={`/product-details/${product.id}`}>
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="relative h-[170px]">
              <Image
                src={
                  product?.attributes?.banner?.data?.attributes?.url ||
                  "/placeholder.png"
                }
                alt={product?.attributes?.title || "Product"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="p-3 text-center text-white">
              <h2 className="text-[14px] font-medium line-clamp-1">
                {product?.attributes?.title}
              </h2>

              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <List className="w-4 h-4" />
                  {product?.attributes?.category?.data?.attributes?.name ?? "N/A"}
                </span>
                <span className="font-semibold">${product?.attributes?.price}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductsList;
