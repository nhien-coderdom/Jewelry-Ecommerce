import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:1337/api' }), // Đổi URL này nếu server Strapi của bạn ở một nơi khác
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "categories?populate=*",
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;