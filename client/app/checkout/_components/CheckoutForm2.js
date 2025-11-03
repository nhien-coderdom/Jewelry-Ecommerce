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
          clerkUserId: user.id, // ✅ FIX: Thêm clerkUserId theo yêu cầu của server
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
  event.preventDefault();
  
  if (!stripe || !elements) {
    console.error('❌ Stripe not loaded');
    return;
  }
  
  setLoading(true);
  setErrorMessage("");

  try {
    console.log('🚀 Starting payment process...');
    console.log('💵 Amount to charge:', amount);
    
    // Bước 1: Validate PaymentElement
    console.log('📝 Validating payment form...');
    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error('❌ Form validation error:', submitError);
      throw submitError;
    }
    console.log('✅ Form validated');

    // Bước 2: Tạo payment intent
    console.log('💳 Creating payment intent...');
    const response = await axios.post("/api/create-payment-intent", {
      data: { amount: Number(amount) * 100 },
    });
    
    // ✅ FIX: Lấy clientSecret string từ object
    const clientSecret = response.data.clientSecret;
    console.log('🔑 Client secret:', clientSecret);
    console.log('✅ Payment intent created');

    // Bước 3: Xác nhận thanh toán
    console.log('🔐 Confirming payment with Stripe...');
    const result = await stripe.confirmPayment({
      clientSecret, // ✅ Giờ đây là string
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-confirm`,
      },
      redirect: "if_required",
    });

    // Kiểm tra lỗi thanh toán
    if (result.error) {
      console.error('❌ Payment failed:', result.error);
      throw result.error;
    }

    console.log('💰 Payment result:', result);
    console.log('📊 Payment status:', result.paymentIntent?.status);

    // ✅ Bước 4: CHỈ TẠO ORDER KHI THANH TOÁN THÀNH CÔNG
    if (result.paymentIntent?.status === "succeeded") {
      console.log('🎉 Payment succeeded! Processing order...');
      
      try {
        await createOrderAndUpdateCart();
        console.log('✅ Order saved to database');
        
        await sendEmail();
        
        console.log('🔄 Redirecting to confirmation page...');
        window.location.href = "/payment-confirm";
      } catch (orderError) {
        console.error('❌ Error processing order after payment:', orderError);
        setErrorMessage('Payment succeeded but order processing failed. Please contact support.');
      }
    } else {
      console.warn('⚠️ Unexpected payment status:', result.paymentIntent?.status);
      throw new Error(`Payment status: ${result.paymentIntent?.status || 'unknown'}`);
    }

  } catch (err) {
    console.error("❌ Payment process error:", err);
    setErrorMessage(err.message || "Something went wrong. Please try again.");
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
