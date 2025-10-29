"use client";

import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useCreateOrderMutation } from "../../_state/_services/OrderApi";
import { useDeleteCartItemMutation, useGetCartItemsQuery } from "../../_state/_services/CartApi";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe(); // Stripe.js instance
  const elements = useElements(); // Stripe Elements instance
  const { user } = useUser();  // Lấy thông tin user từ Clerk
 

  const [orderItems, setOrderItems] = useState([]); // FIX: đổi tên state cho nhất quán
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [errorMessage, setErrorMessage] = useState(""); // Trạng thái lỗi

  // FIX: sử dụng primaryEmailAddress để nhất quán 
  const { data: cartData, refetch: refetchCart } = useGetCartItemsQuery(user?.primaryEmailAddress?.emailAddress, { skip: !user?.primaryEmailAddress?.emailAddress });
  const [deleteCartItem] = useDeleteCartItemMutation(); // Mutation để xóa cart item
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

      // Xóa từng cart item sau khi tạo order thành công
      const cartItems = cart.attributes?.cart_items?.data || [];
      await Promise.all(cartItems.map(item => deleteCartItem(item.id)));
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
      
      console.log('🔍 Cart Data Debug:', {
        cartData,
        cartItems,
        firstItem: cartItems[0]
      });

      // Tạo order items với đầy đủ thông tin và hình ảnh (GIỐNG CART)
      const items = cartItems.map(item => {
        const product = item.attributes?.product?.data?.attributes;
        if (!product) return null;

        // Xử lý URL hình ảnh GIỐNG Cart component
        const rawUrl = product?.banner?.data?.attributes?.url;
        const imageUrl = rawUrl
          ? rawUrl.startsWith("http")
            ? rawUrl
            : `${process.env.NEXT_PUBLIC_REST_API_URL.replace("/api", "")}${rawUrl}`
          : null;
        
        console.log('🖼️ Image URL:', {
          productId: item.attributes?.product?.data?.id,
          title: product?.title,
          rawUrl,
          finalUrl: imageUrl
        });
        
        return {
          productId: item.attributes?.product?.data?.id,
          productTitle: product?.title,
          quantity: item.attributes?.quantity || 1,
          price: product?.price || 0,
          image: imageUrl,
          instantDelivery: product?.instantDelivery || false,
        };
      }).filter(item => item);
      
      setOrderItems(items);
    }
  }, [cartData]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Order Summary */}
      <div className="mb-8 p-6 border-2 border-gray-200 rounded-xl bg-white shadow-lg">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Order Summary</h3>
          <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {orderItems.length > 0 ? (
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                {/* Product Image - GIỐNG Cart component */}
                <div className="flex-shrink-0">
                  <img
                    src={item.image || "https://placehold.co/100x100/d1d5db/9ca3af?text=No+Image"}
                    alt={item.productTitle || "Product"}
                    className="w-16 h-16 rounded object-cover bg-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/100x100/d1d5db/9ca3af?text=No+Image';
                      e.target.onerror = null;
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{item.productTitle}</h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">${item.price.toLocaleString()}</span>
                    {/* {item.instantDelivery && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                          ⚡ Instant Delivery
                        </span>
                      </>
                    )} */}
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Total Section */}
            <div className="border-t-2 border-gray-200 pt-4 mt-6">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                <div>
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <p className="text-xs text-gray-600 mt-1">Including all taxes</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-teal-700">${Number(amount).toLocaleString()}</span>
                  {/* <p className="text-xs text-gray-600">USD</p> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🛒</div>
            <p className="text-gray-500 font-medium">Loading your beautiful jewelry...</p>
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Form */}
      <div className="bg-white p-6 border-2 border-gray-200 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Payment Details</h3>
          <div className="ml-auto flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Secure Payment
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stripe Payment Element */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <PaymentElement />
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            </div>
          )}
          
          {/* Payment Button */}
          <button
            type="submit"
            disabled={loading || !stripe || !elements || orderItems.length === 0}
            className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              loading || !stripe || !elements || orderItems.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Processing Payment...</span>
              </div>
            ) : orderItems.length === 0 ? (
              <span>Loading Products...</span>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">💳</span>
                <span>Pay ${Number(amount).toLocaleString()} Securely</span>
              </div>
            )}
          </button>
          
          {/* Security Notice */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔐 Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;