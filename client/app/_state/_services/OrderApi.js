"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiKey = process.env.NEXT_PUBLIC_REST_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL;
export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: apiUrl,
    // Bỏ Authorization header vì đang dùng public access
    // headers: {
    //   Authorization: `Bearer ${apiKey}`,
    // },
  }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data) => ({
        url: `orders`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    getUserOrders: builder.query({
      query: (clerkUserId) => `orders?clerkUserId=${clerkUserId}`,
      providesTags: ["Orders"],
    }),
  }),
});

export const { useCreateOrderMutation, useGetUserOrdersQuery } = orderApi;
