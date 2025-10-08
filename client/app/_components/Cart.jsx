"use client";
import { useRouter } from "next/navigation";
import React from "react";

const Cart = ({ data = [] }) => {
  const router = useRouter();

  // 🧮 Tổng tiền
  const total = data.reduce((sum, item) => {
    const product = item?.attributes?.product?.data?.attributes;
    const price = product?.price || 0;
    const qty = item?.attributes?.quantity || 1;
    return sum + price * qty;
  }, 0);

  return (
    <div
      className="absolute top-14 right-1 w-screen h-[300px] z-10 overflow-y-auto max-w-sm shadow-lg rounded-lg bg-gray-800 border border-gray-900 text-white px-4 py-6 sm:px-6 lg:px-8"
      aria-modal="true"
      role="dialog"
      tabIndex="-1"
    >
      <div className="mt-2 space-y-5">
        <ul className="space-y-4">
          {data.map((item) => {
            const product = item?.attributes?.product?.data?.attributes;
            if (!product) return null;

            const qty = item?.attributes?.quantity || 1;
            const rawUrl = product?.banner?.data?.attributes?.url;
            const imageUrl = rawUrl
              ? rawUrl.startsWith("http")
                ? rawUrl
                : `${process.env.NEXT_PUBLIC_REST_API_URL.replace("/api", "")}${rawUrl}`
              : "/placeholder.png";

            return (
              <li key={item.id} className="flex items-center gap-4 border-b border-gray-700 pb-3">
                <img
                  src={imageUrl}
                  alt={product?.title || "Product"}
                  className="h-14 w-14 rounded object-cover bg-gray-700"
                />

                <div className="flex flex-col items-start flex-1">
                  <h3 className="text-sm font-medium text-white line-clamp-1">
                    {product?.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {qty} × ${product?.price?.toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Tổng tiền */}
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Total:</span>
            <span className="font-semibold">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="space-y-3 text-center mt-4">
          <a
            href="/cart"
            className="block rounded border border-gray-600 px-5 py-2 text-sm text-gray-300 transition hover:ring-1 hover:ring-gray-400"
          >
            View my cart ({data?.length})
          </a>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full rounded bg-teal-600 px-5 py-2 text-sm text-white transition hover:bg-teal-500"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
