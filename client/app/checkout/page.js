"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useGetCartItemsQuery } from "../_state/_services/CartApi";
import { useUser } from "@clerk/nextjs";
import { BallTriangle } from "react-loader-spinner";
import CheckoutForm from "./_components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY);

export default function Checkout() {
  const { user } = useUser();
  const [total, setTotal] = useState(0);
  const [clientSecret, setClientSecret] = useState(null);
  const { data, isSuccess } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress
  );

  // ✅ 1) Tính total
  useEffect(() => {
    if (!isSuccess || !data?.data?.[0]) return;

    const cartItems = data.data[0].attributes?.cart_items?.data || [];
    const t = cartItems.reduce((acc, item) => {
      const price = item.attributes?.product?.data?.attributes?.price || 0;
      const qty = item.attributes?.quantity || 1;
      return acc + price * qty;
    }, 0);

    setTotal(t);
  }, [data, isSuccess]);

  // ✅ 2) Tạo PaymentIntent **chỉ khi vào trang checkout**
  useEffect(() => {
    if (!total) return;

    (async () => {
      const stripeAmount = Math.max(total * 100, 50);
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { amount: stripeAmount } }),
      });
      const json = await res.json();
      setClientSecret(json.clientSecret);
    })();
  }, [total]);

  if (!total || !clientSecret) {
    return (
      <div className="w-full h-[300px] flex justify-center items-center">
        <BallTriangle height={50} width={50} color="#d4af37" visible />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
          <p className="text-gray-400">Complete your order safely</p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <CheckoutForm amount={total} clientSecret={clientSecret} />
        </Elements>
      </div>
    </div>
  );
}
