"use client";

import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useCreateOrderMutation } from "../../_state/_services/OrderApi";
import { useDeleteCartMutation, useGetCartItemsQuery } from "../../_state/_services/CartApi";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe(); // Stripe.js instance
  const elements = useElements(); // Stripe Elements instance
  const { user } = useUser();  // Lấy thông tin user từ Clerk
 

  const [orderItems, setOrderItems] = useState([]); // FIX: đổi tên state cho nhất quán
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [errorMessage, setErrorMessage] = useState(""); // Trạng thái lỗi

  // FIX: sử dụng primaryEmailAddress để nhất quán 
  const { data: cartData, refetch: refetchCart } = useGetCartItemsQuery(user?.primaryEmailAddress?.emailAddress, { skip: !user?.primaryEmailAddress?.emailAddress });
  const [deleteCart] = useDeleteCartMutation(); // Mutation để xóa giỏ hàng
 const [createOrder] = useCreateOrderMutation(); // Mutation để tạo đơn hàng

   // Create order and clear cart after successful payment
   const createOrderAndUpdateCart = async () => {
    if (!user || !cartData?.data?.[0] || orderItems.length === 0) return;

    const cart = cartData.data[0];

    try {
      // Tạo order với OrderItem relationship
      await createOrder({
        data: {
          email: user.primaryEmailAddress?.emailAddress,
          Username: user.fullName,
          amount: Number(amount),
          products: orderItems.map(item => item.productId).filter(Boolean), 
          order_items: orderItems.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price_at_time: item.price,
          })),
        }
      }).unwrap(); // unwrap để lấy kết quả hoặc lỗi

      // Xóa cart sau khi tạo order thành công
      if (cart.id) {
        await deleteCart(cart.id);
      }
      await refetchCart(); // Làm mới giỏ hàng gọi refetchCart
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Gửi email xác nhận đơn hàng
  const sendEmail = async () => {
    if (!user) return;
    try {
      await axios.post("/api/send", { email: user.primaryEmailAddress?.emailAddress });
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  //xử lý submit form thanh toán
  const handleSubmit = async (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form
    if (!stripe || !elements) return; // Kiểm tra Stripe và Elements đã sẵn sàng chưa
    setLoading(true);
    setErrorMessage("");

    try {
      // Bước 1: Tạo đơn hàng và xóa giỏ hàng
      await createOrderAndUpdateCart();

      // Bước 2: Gửi email xác nhận
      await sendEmail();

      // Bước 3: Xác thực PaymentElement
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      // Bước 4: Tạo payment intent
      const { data: clientSecret } = await axios.post("/api/create-payment-intent", {
        data: { amount: Number(amount) },
      });

      // Bước 5: Xác nhận thanh toán
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

  // Lấy danh sách sản phẩm trong đơn hàng từ cartData
  useEffect(() => {
    if (cartData?.data?.[0]) {
      const cart = cartData.data[0];
      const cartItems = cart.attributes?.cart_items?.data || [];

      // Tạo order items với đầy đủ thông tin
      const items = cartItems.map(item => ({
        productId: item.attributes?.product?.data?.id,
        productTitle: item.attributes?.product?.data?.attributes?.title,
        quantity: item.attributes?.quantity || 1,
        price: item.attributes?.product?.data?.attributes?.price || 0,
      })).filter(item => item.productId);
      setOrderItems(items); // FIX: sử dụng đúng setter
    }
  }, [cartData]);
  return (
    <div className="mt-8">
      {/* Order Summary */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
        {orderItems.length > 0 ? (
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productTitle}</p>
                  <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${amount}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading order items...</p>
        )}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        {errorMessage && <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>}
        <button
          type="submit"
          disabled={loading || !stripe || !elements || orderItems.length === 0}
          className="w-full p-2 mt-4 text-white rounded-md bg-teal-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay $${amount} now`}
        </button>
      </form>
    </div>
  );
};


export default CheckoutForm;
