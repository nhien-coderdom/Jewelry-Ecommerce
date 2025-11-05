import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { cartApi } from "./_services/CartApi";
import { productApi } from "./_services/ProductApi";
import { orderApi } from "./_services/OrderApi"; // ✅ IMPORT
import { categoryApi } from "./_services/CategoryApi";

export const store = configureStore({
  reducer: {
    [cartApi.reducerPath]: cartApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer, // ✅ ADD REDUCER
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      cartApi.middleware,
      productApi.middleware,
      orderApi.middleware, // ✅ ADD MIDDLEWARE
      categoryApi.middleware,
    ),
});

setupListeners(store.dispatch);