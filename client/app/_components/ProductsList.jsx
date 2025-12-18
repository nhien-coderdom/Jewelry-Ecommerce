"use client";
import Image from "next/image";
import Link from "next/link";
import { List } from "lucide-react";
import PropTypes from "prop-types";

const ProductsList = ({ products, searchTerm }) => {
  const keyword = searchTerm?.toLowerCase() || "";

  const filteredProducts = products?.filter((product) => {
    const title = product?.attributes?.title || "";
    return title.toLowerCase().includes(keyword);
  }) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <Link key={product.id} href={`/product-details/${product.id}`}>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition">
              <div className="relative h-[170px]">
                <Image
                  src={
                    product?.attributes?.banner?.data?.attributes?.url ||
                    "/placeholder.png"
                  }
                  alt={product?.attributes?.title || "Product"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-3 text-center text-white">
                <h2 className="text-[14px] font-medium line-clamp-1">
                  {product?.attributes?.title || "Untitled Product"}
                </h2>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[12px] text-gray-400 flex gap-1 items-center">
                    <List className="w-4 h-4" />
                    {product?.attributes?.category?.data?.attributes?.name || "N/A"}
                  </p>
                  <p>{product?.attributes?.price || 0} $</p>
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-gray-400">No matching products found</p>
      )}
    </div>
  );
};

ProductsList.propTypes = {
  products: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default ProductsList;
