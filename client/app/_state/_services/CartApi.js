"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Cart"],

  endpoints: (builder) => ({
    // 🛒 Lấy giỏ hàng theo email user
    getCartItems: builder.query({
      query: (email) =>
        `carts?filters[email][$eq]=${encodeURIComponent(
          email
        )}&populate[cart_items][populate][product][populate][banner]=*`,
      providesTags: ["Cart"],
    }),

    // ➕ Thêm sản phẩm vào giỏ (với kiểm tra stock)
    addCartItem: builder.mutation({
      queryFn: async (
        { email, username, productId, quantity = 1 },
        _queryApi,
        _extra,
        fetchWithBQ
      ) => {
        try {
          console.log('🔍 Starting addCartItem:', { email, username, productId, quantity });

          // 1️⃣ Kiểm tra tồn kho trước khi thêm
          const productRes = await fetchWithBQ(
            `products/${productId}?populate=banner`
          );

          if (productRes.error) {
            console.error('❌ Product fetch error:', productRes.error);
            return { error: productRes.error };
          }

          const product = productRes.data?.data?.attributes;
          const stock = product?.stock ?? 0;

          console.log('📦 Stock check:', { productId, stock, requestedQty: quantity });

          if (stock < quantity) {
            console.warn('⚠️ Insufficient stock');
            return {
              error: {
                status: 400,
                data: { 
                  message: `Không đủ hàng. Chỉ còn ${stock} sản phẩm trong kho`,
                  availableStock: stock 
                },
              },
            };
          }

          // 2️⃣ Kiểm tra cart hiện có
          const cartRes = await fetchWithBQ(
            `carts?filters[email][$eq]=${encodeURIComponent(email)}&populate[cart_items][populate]=product`
          );

          if (cartRes.error) {
            console.error('❌ Cart fetch error:', cartRes.error);
            return { error: cartRes.error };
          }

          let cartId;
          const existingCart = cartRes.data?.data?.[0];

          if (existingCart) {
            cartId = existingCart.id;
            console.log('✅ Found existing cart:', cartId);

            // 3️⃣ Kiểm tra sản phẩm đã có trong giỏ chưa
            const cartItems = existingCart.attributes?.cart_items?.data || [];
            const existingItem = cartItems.find(
              item => item.attributes?.product?.data?.id === productId
            );

            if (existingItem) {
              const currentQty = existingItem.attributes.quantity;
              const newQty = currentQty + quantity;

              console.log('🔄 Product exists in cart:', { 
                currentQty, 
                addingQty: quantity, 
                newQty 
              });

              // Kiểm tra stock cho số lượng mới
              if (stock < newQty) {
                console.warn('⚠️ Not enough stock for update');
                return {
                  error: {
                    status: 400,
                    data: { 
                      message: `Không đủ hàng. Bạn đã có ${currentQty} trong giỏ, chỉ còn ${stock} trong kho`,
                      availableStock: stock,
                      currentInCart: currentQty
                    },
                  },
                };
              }

              // Cập nhật số lượng
              const updateRes = await fetchWithBQ({
                url: `cart-items/${existingItem.id}`,
                method: "PUT",
                body: { data: { quantity: newQty } },
              });

              if (updateRes.error) {
                console.error('❌ Update cart item error:', updateRes.error);
                return { error: updateRes.error };
              }

              console.log('✅ Updated cart item quantity');
              return { data: updateRes.data };
            }
          } else {
            // 🆕 Tạo cart mới nếu chưa có
            console.log('🆕 Creating new cart');
            const newCartRes = await fetchWithBQ({
              url: "carts",
              method: "POST",
              body: { data: { username, email } },
            });

            if (newCartRes.error) {
              console.error('❌ Create cart error:', newCartRes.error);
              return { error: newCartRes.error };
            }

            cartId = newCartRes.data.data.id;
            console.log('✅ Created new cart:', cartId);
          }

          // 4️⃣ Thêm sản phẩm mới vào cart_items
          console.log('➕ Adding new item to cart');
          const addItemRes = await fetchWithBQ({
            url: "cart-items",
            method: "POST",
            body: {
              data: {
                quantity,
                cart: { connect: [cartId] },
                product: { connect: [productId] },
              },
            },
          });

          if (addItemRes.error) {
            console.error('❌ Add cart item error:', addItemRes.error);
            return { error: addItemRes.error };
          }

          console.log('✅ Successfully added item to cart');
          return { data: addItemRes.data };

        } catch (err) {
          console.error('❌ Unexpected error in addCartItem:', err);
          return {
            error: {
              status: 500,
              data: { message: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng" },
            },
          };
        }
      },
      invalidatesTags: ["Cart"],
    }),

    // 🔁 Cập nhật số lượng sản phẩm trong giỏ (với kiểm tra stock)
    updateCartItem: builder.mutation({
      queryFn: async ({ id, quantity }, _queryApi, _extra, fetchWithBQ) => {
        try {
          console.log('🔄 Updating cart item:', { id, quantity });

          // 1️⃣ Lấy thông tin cart item hiện tại
          const cartItemRes = await fetchWithBQ(
            `cart-items/${id}?populate=product`
          );

          if (cartItemRes.error) {
            console.error('❌ Cart item fetch error:', cartItemRes.error);
            return { error: cartItemRes.error };
          }

          const productId = cartItemRes.data?.data?.attributes?.product?.data?.id;

          if (!productId) {
            console.error('❌ Product not found in cart item');
            return {
              error: {
                status: 400,
                data: { message: "Không tìm thấy sản phẩm" },
              },
            };
          }

          // 2️⃣ Kiểm tra stock
          const productRes = await fetchWithBQ(`products/${productId}`);

          if (productRes.error) {
            console.error('❌ Product fetch error:', productRes.error);
            return { error: productRes.error };
          }

          const stock = productRes.data?.data?.attributes?.stock ?? 0;

          console.log('📦 Stock check for update:', { productId, stock, requestedQty: quantity });

          if (stock < quantity) {
            console.warn('⚠️ Insufficient stock for update');
            return {
              error: {
                status: 400,
                data: { 
                  message: `Không đủ hàng. Chỉ còn ${stock} sản phẩm trong kho`,
                  availableStock: stock 
                },
              },
            };
          }

          // 3️⃣ Cập nhật số lượng
          const updateRes = await fetchWithBQ({
            url: `cart-items/${id}`,
            method: "PUT",
            body: { data: { quantity } },
          });

          if (updateRes.error) {
            console.error('❌ Update error:', updateRes.error);
            return { error: updateRes.error };
          }

          console.log('✅ Cart item updated successfully');
          // 🔄 Return dữ liệu đúng format để RTK Query cache
          return { 
            data: {
              data: {
                id,
                attributes: {
                  quantity,
                  ...(updateRes.data?.data?.attributes || {})
                }
              }
            }
          };
        } catch (err) {
          console.error('❌ Unexpected error in updateCartItem:', err);
          return {
            error: {
              status: 500,
              data: { message: "Đã xảy ra lỗi khi cập nhật giỏ hàng" },
            },
          };
        }
      },
      invalidatesTags: ["Cart"],
    }),

    // ❌ Xóa sản phẩm khỏi giỏ
    deleteCartItem: builder.mutation({
      query: (id) => ({
        url: `cart-items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Validate stock trước khi checkout (NEW)
    validateCheckout: builder.mutation({
      queryFn: async (cartItems, _queryApi, _extra, fetchWithBQ) => {
        try {
          console.log('🔍 Validating checkout for', cartItems.length, 'items');

          const validations = await Promise.all(
            cartItems.map(async (item) => {
              const productRes = await fetchWithBQ(`products/${item.productId}`);

              if (productRes.error) {
                return {
                  productId: item.productId,
                  productTitle: item.productTitle,
                  isValid: false,
                  error: 'Không thể kiểm tra tồn kho',
                };
              }

              const stock = productRes.data?.data?.attributes?.stock ?? 0;
              const isValid = stock >= item.quantity;

              console.log(`📦 ${item.productTitle}:`, { 
                stock, 
                requested: item.quantity, 
                isValid 
              });

              return {
                productId: item.productId,
                productTitle: item.productTitle,
                requested: item.quantity,
                available: stock,
                isValid,
                error: isValid ? null : `Chỉ còn ${stock} sản phẩm`,
              };
            })
          );

          const invalidItems = validations.filter(v => !v.isValid);

          if (invalidItems.length > 0) {
            console.error('❌ Checkout validation failed:', invalidItems);
            return {
              error: {
                status: 400,
                data: {
                  message: "Một số sản phẩm không đủ số lượng trong kho",
                  invalidItems,
                },
              },
            };
          }

          console.log('✅ Checkout validation passed');
          return { data: { valid: true, validations } };

        } catch (err) {
          console.error('❌ Unexpected error in validateCheckout:', err);
          return {
            error: {
              status: 500,
              data: { message: "Đã xảy ra lỗi khi kiểm tra tồn kho" },
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetCartItemsQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useValidateCheckoutMutation, // ✅ NEW
} = cartApi;