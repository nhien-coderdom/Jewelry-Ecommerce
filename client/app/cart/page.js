"use client";
import React, { useEffect, useState } from "react";
import {
  useDeleteCartMutation,
  useGetCartItemsQuery,
} from "../_state/_services/CartApi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { BallTriangle } from "react-loader-spinner";

const Page = () => {
  const { user } = useUser();
  const router = useRouter();

  const [total, setTotal] = useState(0);

  const {
    data,
    isSuccess,
    isLoading,
    isError,
    refetch,
  } = useGetCartItemsQuery(user?.primaryEmailAddress?.emailAddress, {
    skip: !user, // không call API khi chưa đăng nhập
  });

  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();

  // Tính tổng khi có dữ liệu
  useEffect(() => {
    if (isSuccess && data?.data?.length > 0) {
      const totalPrice = data.data.reduce((sum, item) => {
        const price =
          item?.attributes?.products?.data?.[0]?.attributes?.price || 0;
        return sum + Number(price);
      }, 0);
      setTotal(totalPrice);
    } else {
      setTotal(0);
    }
  }, [data, isSuccess]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteCart(id).unwrap();
        await refetch();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Please log in to view your cart.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <header className="text-center">
              <h1 className="text-xl font-bold text-white sm:text-3xl">
                Your Cart
              </h1>
            </header>

            <div className="mt-8">
              {isLoading ? (
                <div className="w-full h-[400px] flex justify-center items-center">
                  <BallTriangle height={80} width={80} color="#319795" visible />
                </div>
              ) : isError ? (
                <p className="text-center text-red-400">
                  Failed to load cart. Try again later.
                </p>
              ) : isSuccess && data?.data?.length === 0 ? (
                <p className="text-center text-gray-400">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {data?.data?.map((item) => {
                    const product = item?.attributes?.products?.data?.[0];
                    const { title, price, category, banner } =
                      product?.attributes || {};

                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 border-b border-gray-700 pb-4"
                      >
                        <img
                          src={banner?.data?.attributes?.url || "/no-image.png"}
                          alt={title || "Product"}
                          className="h-16 w-[6rem] rounded object-cover"
                        />

                        <div className="flex flex-col items-start flex-1">
                          <h3 className="text-sm font-medium text-white line-clamp-1">
                            {title || "Untitled"}
                          </h3>
                          <dl className="mt-0.5 space-y-px text-xs text-gray-300">
                            <dd className="capitalize">{category || "Other"}</dd>
                            <dd>${price || 0}</dd>
                          </dl>
                        </div>

                        <button
                          disabled={isDeleting}
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-300 hover:text-red-500 transition disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Tổng tiền + Checkout */}
              {isSuccess && data?.data?.length > 0 && (
                <div className="mt-8 flex justify-end border-t border-gray-700 pt-8">
                  <div className="w-full max-w-lg space-y-4">
                    <dl className="space-y-0.5 text-sm text-gray-200">
                      <div className="flex justify-between text-base font-medium">
                        <dt>Total</dt>
                        <dd>${total}</dd>
                      </div>
                    </dl>

                    <div className="flex justify-end">
                      <button
                        onClick={() => router.push("/checkout")}
                        className="block rounded bg-teal-600 px-5 py-3 text-sm text-white transition hover:bg-teal-700"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
