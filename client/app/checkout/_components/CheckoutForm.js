"use client";

import { useEffect, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useCreateOrderMutation } from "../../_state/_services/OrderApi";
import { 
  useDeleteCartItemMutation, 
  useGetCartItemsQuery,
  useValidateCheckoutMutation // ✅ NEW
} from "../../_state/_services/CartApi";

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();

  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validatingStock, setValidatingStock] = useState(false);

  const { data: cartData, refetch: refetchCart } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress, 
    { skip: !user?.primaryEmailAddress?.emailAddress }
  );
  const [deleteCartItem] = useDeleteCartItemMutation();
  const [createOrder] = useCreateOrderMutation();
  const [validateCheckout] = useValidateCheckoutMutation(); // ✅ NEW

  // ✅ VALIDATE STOCK BEFORE PAYMENT
  const validateStockBeforePayment = async () => {
    if (orderItems.length === 0) {
      throw new Error('Giỏ hàng trống');
    }

    console.log('🔍 Validating stock before payment...');
    setValidatingStock(true);

    try {
      const result = await validateCheckout(orderItems).unwrap();
      console.log('✅ Stock validation passed:', result);
      return true;
    } catch (error) {
      console.error('❌ Stock validation failed:', error);
      
      if (error.data?.invalidItems) {
        const errorMessages = error.data.invalidItems.map(
          item => `• ${item.productTitle}: ${item.error}`
        ).join('\n');
        
        throw new Error(`Không đủ hàng trong kho:\n${errorMessages}`);
      }
      
      throw new Error(error.data?.message || 'Không thể xác thực tồn kho');
    } finally {
      setValidatingStock(false);
    }
  };

  // ✅ CREATE ORDER AND CLEAR CART
  const createOrderAndUpdateCart = async () => {
    if (!user || !cartData?.data?.[0] || orderItems.length === 0) {
      console.error('❌ Missing required data:', {
        hasUser: !!user,
        hasCartData: !!cartData?.data?.[0],
        orderItemsLength: orderItems.length
      });
      throw new Error('Thiếu dữ liệu cần thiết để tạo đơn hàng');
    }

    const cart = cartData.data[0];

    try {
      const orderData = {
        data: {
          clerkUserId: user.id,
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
      };
      
      console.log('📦 Creating order with data:', JSON.stringify(orderData, null, 2));
      
      const result = await createOrder(orderData).unwrap();
      console.log('✅ Order created successfully:', result);

      // Xóa cart items
      const cartItems = cart.attributes?.cart_items?.data || [];
      console.log('🗑️ Deleting', cartItems.length, 'cart items...');
      
      await Promise.all(cartItems.map(item => deleteCartItem(item.id)));
      console.log('✅ Cart cleared');
      
      await refetchCart();
      
      return result;
    } catch (error) {
      console.error('❌ Error creating order - Full details:', {
        error,
        errorMessage: error.message,
        errorData: error.data,
        errorStatus: error.status,
      });
      throw error;
    }
  };

  // ✅ SEND CONFIRMATION EMAIL
  const sendEmail = async () => {
    if (!user) return;
    try {
      console.log('📧 Sending confirmation email...');
      await axios.post("/api/send", { 
        email: user.primaryEmailAddress?.emailAddress 
      });
      console.log('✅ Email sent successfully');
    } catch (err) {
      console.error("❌ Error sending email:", err);
      // Không throw error vì email không quan trọng bằng order
    }
  };

  // ✅ HANDLE SUBMIT - IMPROVED FLOW
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error('❌ Stripe not loaded');
      return;
    }
    
    if (orderItems.length === 0) {
      setErrorMessage("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }
    
    setLoading(true);
    setErrorMessage("");

    try {
      console.log('🚀 Starting payment process...');
      console.log('💵 Amount to charge:', amount);
      console.log('📦 Order items:', orderItems);
      
      // ✅ Bước 1: VALIDATE STOCK TRƯỚC KHI PAYMENT
      console.log('🔍 Step 1: Validating stock...');
      await validateStockBeforePayment();
      console.log('✅ Stock validation passed');

      // Bước 2: Validate PaymentElement
      console.log('📝 Step 2: Validating payment form...');
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('❌ Form validation error:', submitError);
        throw submitError;
      }
      console.log('✅ Form validated');

      // Bước 3: Tạo payment intent
      console.log('💳 Step 3: Creating payment intent...');
      const response = await axios.post("/api/create-payment-intent", {
        data: { amount: Number(amount) * 100 }, // Stripe cần cents
      });
      
      const clientSecret = response.data.clientSecret;
      if (!clientSecret) {
        throw new Error('Không nhận được client secret từ server');
      }
      console.log('🔑 Client secret received');
      console.log('✅ Payment intent created');

      // Bước 4: Xác nhận thanh toán
      console.log('🔐 Step 4: Confirming payment with Stripe...');
      const result = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirm`,
        },
        redirect: "if_required", // ✅ Không redirect ngay
      });

      // Kiểm tra lỗi thanh toán
      if (result.error) {
        console.error('❌ Payment failed:', result.error);
        throw result.error;
      }

      console.log('💰 Payment result:', result);
      console.log('📊 Payment status:', result.paymentIntent?.status);

      // ✅ Bước 5: CHỈ TẠO ORDER KHI THANH TOÁN THÀNH CÔNG
      if (result.paymentIntent?.status === "succeeded") {
        console.log('🎉 Payment succeeded! Processing order...');
        
        try {
          // Tạo order
          await createOrderAndUpdateCart();
          console.log('✅ Order saved to database');
          
          // Gửi email (không chặn flow nếu fail)
          sendEmail().catch(err => {
            console.warn('⚠️ Email sending failed but continuing:', err);
          });
          
          // Redirect sau khi hoàn tất
          console.log('🔄 Redirecting to confirmation page...');
          setTimeout(() => {
            window.location.href = "/payment-confirm";
          }, 500);
          
        } catch (orderError) {
          console.error('❌ Error processing order after payment:', orderError);
          setErrorMessage(
            'Thanh toán thành công nhưng có lỗi khi xử lý đơn hàng. ' +
            'Vui lòng liên hệ bộ phận hỗ trợ với mã giao dịch: ' + 
            result.paymentIntent.id
          );
          setLoading(false);
          return; // Không throw để user thấy error message
        }
      } else {
        console.warn('⚠️ Unexpected payment status:', result.paymentIntent?.status);
        throw new Error(`Trạng thái thanh toán: ${result.paymentIntent?.status || 'không xác định'}`);
      }

    } catch (err) {
      console.error("❌ Payment process error:", err);
      
      let errorMsg = "Đã xảy ra lỗi. Vui lòng thử lại.";
      
      if (err.message?.includes('Không đủ hàng')) {
        errorMsg = err.message;
      } else if (err.type === 'card_error' || err.type === 'validation_error') {
        errorMsg = err.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ORDER ITEMS FROM CART
  useEffect(() => {
    if (cartData?.data?.[0]) {
      const cart = cartData.data[0];
      const cartItems = cart.attributes?.cart_items?.data || [];
      
      console.log('🔍 Cart Data Debug:', {
        cartData,
        cartItemsCount: cartItems.length,
        firstItem: cartItems[0]
      });

      const items = cartItems.map(item => {
        const product = item.attributes?.product?.data?.attributes;
        if (!product) {
          console.warn('⚠️ Product data missing for cart item:', item.id);
          return null;
        }

        const rawUrl = product?.banner?.data?.attributes?.url;
        const imageUrl = rawUrl
          ? rawUrl.startsWith("http")
            ? rawUrl
            : `${process.env.NEXT_PUBLIC_REST_API_URL.replace("/api", "")}${rawUrl}`
          : null;
        
        return {
          productId: item.attributes?.product?.data?.id,
          productTitle: product?.title || 'Sản phẩm không có tên',
          quantity: item.attributes?.quantity || 1,
          price: product?.price || 0,
          image: imageUrl,
          instantDelivery: product?.instantDelivery || false,
        };
      }).filter(item => item !== null);
      
      console.log('✅ Processed order items:', items);
      setOrderItems(items);
    }
  }, [cartData]);

  // ✅ CLEAR ERROR WHEN USER CHANGES SOMETHING
  useEffect(() => {
    if (errorMessage && orderItems.length > 0) {
      setErrorMessage("");
    }
  }, [orderItems]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Order Summary */}
      <div className="mb-8 p-6 border-2 border-gray-200 rounded-xl bg-white shadow-lg">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Tóm tắt đơn hàng</h3>
          <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {orderItems.length} sản phẩm
          </span>
        </div>
        
        {orderItems.length > 0 ? (
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
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
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{item.productTitle}</h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-600">SL: {item.quantity}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">${item.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    ${(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="border-t-2 border-gray-200 pt-4 mt-6">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                <div>
                  <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                  <p className="text-xs text-gray-600 mt-1">Đã bao gồm thuế</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-teal-700">${Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🛒</div>
            <p className="text-gray-500 font-medium">Đang tải giỏ hàng...</p>
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Form */}
      <div className="bg-white p-6 border-2 border-gray-200 rounded-xl shadow-lg">
        <div className="flex items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Thông tin thanh toán</h3>
          <div className="ml-auto flex items-center text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Bảo mật
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <PaymentElement />
          </div>
          
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 mr-2 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium whitespace-pre-line">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {validatingStock && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-blue-700 text-sm font-medium">Đang kiểm tra tồn kho...</p>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || validatingStock || !stripe || !elements || orderItems.length === 0}
            className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-200 ${
              loading || validatingStock || !stripe || !elements || orderItems.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Đang xử lý thanh toán...</span>
              </div>
            ) : validatingStock ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Đang kiểm tra...</span>
              </div>
            ) : orderItems.length === 0 ? (
              <span>Đang tải sản phẩm...</span>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">💳</span>
                <span>Thanh toán ${Number(amount).toLocaleString()}</span>
              </div>
            )}
          </button>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔐 Thông tin thanh toán được mã hóa và bảo mật. Chúng tôi không lưu trữ thông tin thẻ của bạn.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;