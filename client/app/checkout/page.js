"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useGetCartItemsQuery } from "../_state/_services/CartApi";
import { useUser } from "@clerk/nextjs";
import { BallTriangle } from "react-loader-spinner";
import CheckoutForm from "./_components/CheckoutForm";

// Load Stripe with public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY);

export default function Checkout() {
  const { user } = useUser();
  const [total, setTotal] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const { data, isSuccess } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress
  );

  // Calculate total price from cart items and create payment intent
  useEffect(() => {
    if (isSuccess && data?.data?.[0]) {
      const cart = data.data[0];
      const cartItems = cart.attributes?.cart_items?.data || [];
      
      const totalAmount = cartItems.reduce(
        (accumulator, item) => {
          const price = item.attributes?.product?.data?.attributes?.price || 0;
          const quantity = item.attributes?.quantity || 1;
          return Number(accumulator) + (Number(price) * Number(quantity));
        },
        0
      );
      setTotal(totalAmount);
      
      // Create payment intent
      if (totalAmount > 0) {
        createPaymentIntent(totalAmount);
      }
    }
  }, [data, isSuccess]);

  // Create payment intent
  const createPaymentIntent = async (amount) => {
    try {
      const stripeAmount = Math.max(amount * 100, 50);
      
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { amount: stripeAmount } }),
      });

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };

  // Stripe options - FIXED: Moved outside useEffect to avoid mutation
  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#d4af37",
        colorBackground: "#1a1a1a", 
        colorText: "#ffffff",
      },
    },
  } : null;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-400">
            Complete your purchase safely and securely
          </p>
        </div>

        {clientSecret && total > 0 ? (
          // FIXED: Added key prop to force re-render when clientSecret changes
          <Elements key={clientSecret} stripe={stripePromise} options={options}>
            <CheckoutForm amount={Number(total)} />
          </Elements>
        ) : total > 0 && total < 0.5 ? (
          <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <span className="text-red-500 text-2xl mb-2 block">⚠️</span>
              <h3 className="text-red-800 font-semibold mb-2">Invalid Amount</h3>
              <p className="text-red-600 text-sm">
                Minimum order amount is $0.50. Current total: ${(total).toFixed(2)}
              </p>
              <button 
                onClick={() => window.location.href = '/products'}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-[300px] flex justify-center items-center">
            <BallTriangle
              height={50}
              width={50}
              radius={5}
              color="#d4af37"
              ariaLabel="ball-triangle-loading"
              visible={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}