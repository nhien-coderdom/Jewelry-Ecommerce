"use client";

import { useState, useEffect } from "react";
import ProductsList from "../_components/ProductsList";
import SearchBox from "../_components/SearchBox";
import { useGetCategoriesQuery } from "../_state/_services/CategoryApi";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("");

  const { data: categories, isLoading: catLoading } = useGetCategoriesQuery();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("http://localhost:1337/api/products?populate=*");
      const data = await res.json();
      setProducts(data.data);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    ?.filter((p) => {
      const title = p?.attributes?.title?.toLowerCase() || "";
      const category = p?.attributes?.category?.data?.attributes?.title?.toLowerCase() || "";

      return (
        title.includes(searchTerm.toLowerCase()) &&
        (categoryFilter === "all" || category === categoryFilter.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOption === "low-high") return a.attributes.price - b.attributes.price;
      if (sortOption === "high-low") return b.attributes.price - a.attributes.price;
      return 0;
    });

  return (
    <div className="px-6 py-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* ✅ LEFT SIDEBAR */}
        <div className="bg-gray-900 p-4 rounded-lg space-y-6 h-fit">

          <h2 className="font-bold text-lg mb-2">Filter</h2>

          {/* 🔎 Search */}
          <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* 🏷️ Category Filter */}
          <div>
            <p className="font-semibold mb-2">Category</p>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="all">All</option>
              {!catLoading &&
                categories?.data?.map((cat) => (
                  <option key={cat.id} value={cat.attributes.title.toLowerCase()}>
                    {cat.attributes.title}
                  </option>
                ))}
            </select>
          </div>

          {/* ⬆⬇ Sort */}
          <div>
            <p className="font-semibold mb-2">Sort by Price</p>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            >
              <option value="">Default</option>
              <option value="low-high">Low to High</option>
              <option value="high-low">High to Low</option>
            </select>
          </div>

        </div>

        {/* ✅ RIGHT CONTENT */}
        <div className="md:col-span-3">
          <h2 className="text-xl font-bold mb-4">
            {categoryFilter === "all"
              ? "All Products"
              : `All Products: ${categories?.data?.find(
                (cat) => cat.attributes.title.toLowerCase() === categoryFilter
              )?.attributes?.title || ""
              }`}
          </h2>

          <ProductsList products={filteredProducts} searchTerm={searchTerm} />
        </div>

      </div>
    </div>
  );
}
