"use client";

import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useCreateOrderMutation } from "../../_state/_services/OrderApi";
import { useDeleteCartMutation, useGetCartItemsQuery } from "../../_state/_services/CartApi";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: cartData, refetch } = useGetCartItemsQuery(user?.primaryEmailAddress?.emailAddress);
  const [createOrder] = useCreateOrderMutation();
  const [deleteCart] = useDeleteCartMutation();

  // Create order and clear cart
  const createOrderAndUpdateCart = async () => {
    if (!user) return;
    await createOrder({
      data: {
        email: user.primaryEmailAddress?.emailAddress,
        username: user.fullName,
        amount,
        products,
        clerkUserId: user.id,
      },
    }).unwrap();

    await Promise.all(cartData?.data?.map(item => deleteCart(item.id)));
    await refetch();
  };

  // Send confirmation email
  const sendEmail = async () => {
    if (!user) return;
    try {
      await axios.post("/api/send", { email: user.primaryEmailAddress?.emailAddress });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  // Handle payment submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // Step 1: Create order & clear cart
      await createOrderAndUpdateCart();

      // Step 2: Send email
      await sendEmail();

      // Step 3: Validate PaymentElement
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      // Step 4: Create payment intent
      const { data: clientSecret } = await axios.post("/api/create-payment-intent", {
        data: { amount: Number(amount) },
      });

      // Step 5: Confirm payment
      const result = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirm`,
        },
      });

      if (result.error) throw result.error;
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Load products from cart
  useEffect(() => {
    if (cartData?.data) {
      const productIds = cartData.data.map(item => item?.attributes?.products?.data[0]?.id);
      setProducts(productIds);
    }
  }, [cartData]);

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <PaymentElement />
      {errorMessage && <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full p-2 mt-4 text-white rounded-md bg-teal-600 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
};

export default CheckoutForm;
