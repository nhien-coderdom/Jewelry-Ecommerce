"use client";
import { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

import {
  useGetCartItemsQuery,
  useValidateCheckoutMutation,
  useDeleteCartItemMutation
} from "../../_state/_services/CartApi";
import { useCreateOrderMutation } from "../../_state/_services/OrderApi";

export default function CheckoutForm({ amount, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: cartData, refetch } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress,
    { skip: !user }
  );

  const [validateCheckout] = useValidateCheckoutMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();
  const [createOrder] = useCreateOrderMutation();

  /** ✅ Load cart items */
  useEffect(() => {
    if (!cartData?.data?.[0]) return;

    const items = cartData.data[0].attributes.cart_items.data.map(i => {
      const product = i.attributes.product.data.attributes;
      const img = product.banner?.data?.attributes?.url;

      return {
        id: i.id,
        productId: i.attributes.product.data.id,
        title: product.title,
        price: product.price,
        quantity: i.attributes.quantity,
        image: img
          ? (img.startsWith("http")
            ? img
            : `${process.env.NEXT_PUBLIC_REST_API_URL.replace("/api", "")}${img}`)
          : "https://placehold.co/100x100?text=No+Image"
      };
    });

    setOrderItems(items);
  }, [cartData]);

  /** ✅ Handle payment — KHÔNG tạo PI ở đây nữa */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setErrorMsg("");

    try {
      await validateCheckout(orderItems).unwrap();

      const { error: formError } = await elements.submit();
      if (formError) throw formError;

      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirm`
        },
        redirect: "if_required"
      });

      if (error) throw error;
      if (paymentIntent.status !== "succeeded") {
        throw new Error("Thanh toán chưa hoàn tất.");
      }

      // ✅ Save Order to Strapi
      await createOrder({
        data: {
          clerkUserId: user.id,
          username: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
          email: user.primaryEmailAddress.emailAddress,
          amount,
          products: orderItems.map(i => i.productId),
          order_items: orderItems.map(i => ({
            product: i.productId,
            quantity: i.quantity,
            price_at_time: i.price
          }))
        }
      });

      await Promise.all(orderItems.map(i => deleteCartItem(i.id)));
      await refetch();

      window.location.href = "/payment-confirm";
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">

      {/* 🛒 CART SUMMARY — giữ nguyên UI */}
      <div className="rounded-lg border p-4 bg-white shadow">
        <h3 className="font-bold text-lg mb-4">Tóm tắt đơn hàng</h3>

        {orderItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Giỏ hàng trống...</p>
        ) : (
          orderItems.map((item, i) => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <img
                src={item.image}
                className="w-16 h-16 rounded object-cover bg-gray-200"
                onError={e => { e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
              />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">SL: {item.quantity}</p>
              </div>
              <span className="font-bold">
                ${(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))
        )}

        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span>${Number(amount).toLocaleString()}</span>
        </div>
      </div>

      {/* 💳 PAYMENT FORM — giữ nguyên UI */}
      <div className="rounded-lg border p-4 bg-white shadow">
        <form onSubmit={handleSubmit}>
          <PaymentElement />

          {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}

          <button
            disabled={!stripe || !elements || loading}
            className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {loading ? "Đang xử lý..." : `Thanh toán $${Number(amount).toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
}
