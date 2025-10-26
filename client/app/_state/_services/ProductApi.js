"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;
export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
    // Bỏ Authorization header vì đang dùng public access
    // headers: {
    //   Authorization: `Bearer ${apiKey}`,
    // },
  }),
  endpoints: (builder) => ({
    getLatestProducts: builder.query({
      query: () => 'products?populate=*&pagination[limit]=4',
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}?populate=*`,
      invalidatesTags: ["Product"],
    }),
    getProductsByCategory: builder.query({
      // Sửa lại endpoint này
      query: (categoryId) => `products?filters[category][id][$eq]=${categoryId}&populate=*`,
    }),

  }),
});

export const {
  useGetLatestProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
} = productApi;
