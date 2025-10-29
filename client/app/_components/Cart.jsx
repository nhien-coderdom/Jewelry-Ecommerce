"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { 
  useUpdateCartItemMutation, 
  useDeleteCartItemMutation 
} from "../_state/_services/CartApi";

const Cart = ({ data = [], onClose }) => {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [deleteCartItem, { isLoading: isDeleting }] = useDeleteCartItemMutation();

  // 🧮 Tổng tiền
  const total = data.reduce((sum, item) => {
    const product = item?.attributes?.product?.data?.attributes;
    const price = product?.price || 0;
    const qty = item?.attributes?.quantity || 1;
    return sum + price * qty;
  }, 0);

  // 🔄 Cập nhật số lượng
  const handleUpdateQuantity = async (cartItemId, newQuantity, productId) => {
    if (newQuantity <= 0) {
      setShowDeleteConfirm(cartItemId);
      return;
    }

    try {
      await updateCartItem({
        id: cartItemId,
        data: { quantity: newQuantity, product: productId },
      }).unwrap();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Không thể cập nhật số lượng. Vui lòng thử lại!");
    }
  };

  // ❌ Xóa sản phẩm
  const handleDelete = async (cartItemId) => {
    try {
      await deleteCartItem(cartItemId).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

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
              <li key={item.id} className="flex items-center gap-3 border-b border-gray-700 pb-3">
                <img
                  src={imageUrl}
                  alt={product?.title || "Product"}
                  className="h-12 w-12 rounded object-cover bg-gray-700"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />

                <div className="flex flex-col items-start flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white line-clamp-1">
                    {product?.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    ${product?.price?.toLocaleString()}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.id,
                        qty - 1,
                        item?.attributes?.product?.data?.id
                      )
                    }
                    disabled={isUpdating || isDeleting}
                    className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm text-white">{qty}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.id,
                        qty + 1,
                        item?.attributes?.product?.data?.id
                      )
                    }
                    disabled={isUpdating || isDeleting}
                    className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-red-400 transition disabled:opacity-50 text-sm"
                >
                  ✕
                </button>
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
            onClick={onClose}
            className="block rounded border border-gray-600 px-5 py-2 text-sm text-gray-300 transition hover:ring-1 hover:ring-gray-400"
          >
            View my cart ({data?.length})
          </a>
          <button
            onClick={() => {
              router.push("/checkout");
              onClose?.();
            }}
            className="w-full rounded bg-teal-600 px-5 py-2 text-sm text-white transition hover:bg-teal-500"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* 🚨 Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Xác nhận xóa
            </h3>
            <p className="text-gray-300 mb-6">
              Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
