"use client";

import React, { useEffect, useState } from "react";
import {
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
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
    skip: !user,
  });

  const [updateCartItem, { isLoading: isUpdating }] =
    useUpdateCartItemMutation();
  const [deleteCartItem, { isLoading: isDeleting }] =
    useDeleteCartItemMutation();

  // 🧮 Tính tổng tiền
  useEffect(() => {
    if (isSuccess && data?.data?.length > 0) {
      const cart = data.data[0];
      const items = cart?.attributes?.cart_items?.data || [];
      const totalPrice = items.reduce((sum, item) => {
        const product = item?.attributes?.product?.data?.attributes;
        const price = product?.price || 0;
        const quantity = item?.attributes?.quantity || 1;
        return sum + price * quantity;
      }, 0);
      setTotal(totalPrice);
    } else {
      setTotal(0);
    }
  }, [data, isSuccess]);

  // ❌ Xóa item khỏi giỏ
  const handleDelete = async (itemId) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteCartItem(itemId).unwrap();
        await refetch();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  // 🔁 Cập nhật số lượng (có kiểm tra tồn kho)
  const handleUpdateQuantity = async (itemId, newQty, productId) => {
    if (newQty < 1) return;

    try {
      // ⚙️ Gọi API lấy thông tin sản phẩm để kiểm tra stock
      const API_URL = process.env.NEXT_PUBLIC_REST_API_URL;
      const productRes = await fetch(`${API_URL}/products/${productId}`);
      const productJson = await productRes.json();
      const stock = productJson?.data?.attributes?.stock ?? 0;

      if (newQty > stock) {
        alert(`⚠️ Không đủ hàng trong kho! (Còn lại ${stock})`);
        return;
      }

      await updateCartItem({
        id: itemId,
        quantity: newQty,
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error("Update quantity failed:", error);
      alert("Cập nhật số lượng thất bại. Vui lòng thử lại!");
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
            <header className="text-center mb-8">
              <h1 className="text-xl font-bold text-white sm:text-3xl">
                Your Cart
              </h1>
            </header>

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
              <div>
                <ul className="space-y-4">
                  {(() => {
                    const cart = data?.data?.[0];
                    const items = cart?.attributes?.cart_items?.data || [];

                    return items.map((item) => {
                      const { id, attributes } = item;
                      const product = attributes?.product?.data?.attributes;
                      const imageUrl =
                        product?.banner?.data?.attributes?.url || "/no-image.png";

                      const productId = attributes?.product?.data?.id;

                      return (
                        <li
                          key={id}
                          className="flex items-center gap-4 border-b border-gray-700 pb-4"
                        >
                          <img
                            src={imageUrl}
                            alt={product?.title || "Product"}
                            className="h-16 w-[6rem] rounded object-cover"
                          />

                          <div className="flex flex-col items-start flex-1">
                            <h3 className="text-sm font-medium text-white line-clamp-1">
                              {product?.title || "Untitled"}
                            </h3>
                            <dl className="mt-0.5 space-y-px text-xs text-gray-300">
                              <dd className="capitalize">
                                {product?.category || "Other"}
                              </dd>
                              <dd>${(product?.price || 0).toLocaleString('en-US').replace(/,/g, '.')}</dd>
                            </dl>
                          </div>

                          {/* Số lượng */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  id,
                                  attributes.quantity - 1,
                                  productId
                                )
                              }
                              disabled={isUpdating || isDeleting}
                              className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 transition"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">
                              {attributes.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  id,
                                  attributes.quantity + 1,
                                  productId
                                )
                              }
                              disabled={isUpdating || isDeleting}
                              className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Xóa */}
                          <button
                            disabled={isDeleting}
                            onClick={() => handleDelete(id)}
                            className="text-gray-300 hover:text-red-500 transition disabled:opacity-50 ml-4"
                          >
                            ✕
                          </button>
                        </li>
                      );
                    });
                  })()}
                </ul>

                {/* Tổng tiền */}
                <div className="mt-8 flex justify-end border-t border-gray-700 pt-8">
                  <div className="w-full max-w-lg space-y-4">
                    <dl className="space-y-0.5 text-sm text-gray-200">
                      <div className="flex justify-between text-base font-medium">
                        <dt>Total</dt>
                        <dd>${total.toLocaleString('en-US').replace(/,/g, '.')}</dd>
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
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
