"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL; // ví dụ: http://localhost:1337/api

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

    // ➕ Thêm sản phẩm vào giỏ (nếu chưa có cart thì tạo mới)
    addCartItem: builder.mutation({
      queryFn: async (
        { email, username, productId, quantity = 1 },
        _queryApi,
        _extra,
        fetchWithBQ
      ) => {
        try {
          // 0️⃣ Kiểm tra tồn kho trước khi thêm
          const productRes = await fetchWithBQ(
            `products/${productId}?populate=banner`
          );

          if (productRes.error) return { error: productRes.error };

          const product = productRes.data?.data?.attributes;
          const stock = product?.stock ?? 0;

          if (stock < quantity) {
            return {
              error: {
                status: 400,
                data: { message: "Sản phẩm không đủ số lượng trong kho" },
              },
            };
          }

          // 1️⃣ Kiểm tra cart hiện có
          const cartRes = await fetchWithBQ(
            `carts?filters[email][$eq]=${encodeURIComponent(email)}`
          );

          if (cartRes.error) return { error: cartRes.error };

          let cartId;
          if (cartRes.data?.data?.length > 0) {
            cartId = cartRes.data.data[0].id;
          } else {
            // 🆕 Tạo cart mới nếu chưa có
            const newCartRes = await fetchWithBQ({
              url: "carts",
              method: "POST",
              body: { data: { username, email } },
            });

            if (newCartRes.error) return { error: newCartRes.error };
            cartId = newCartRes.data.data.id;
          }

          // 2️⃣ Thêm sản phẩm vào cart_items
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

          if (addItemRes.error) return { error: addItemRes.error };
          return { data: addItemRes.data };
        } catch (err) {
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

    // 🔁 Cập nhật số lượng sản phẩm trong giỏ
    updateCartItem: builder.mutation({
      query: ({ id, data }) => ({
        url: `cart-items/${id}`,
        method: "PUT",
        body: { data },
      }),
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
  }),
});

export const {
  useGetCartItemsQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
} = cartApi;
