"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useGetUserOrdersQuery } from "../_state/_services/OrderApi";
import Image from "next/image";

const MyOrdersPage = () => {
  const { user } = useUser();
  const clerkUserId = user?.id;

  const { data: orders, isLoading, error } = useGetUserOrdersQuery(clerkUserId, {
    skip: !clerkUserId,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-gray-400 mb-6">You need to login to view your orders</p>
          <a
            href="/sign-in"
            className="inline-block rounded-md bg-teal-600 px-8 py-3 text-sm font-medium text-white hover:bg-teal-500"
          >
            Login Now
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Error loading orders</p>
          <p className="text-gray-400 mt-2">{error?.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Orders</h1>
          <p className="mt-2 text-gray-400">
            Track and manage your jewelry orders
          </p>
        </div>

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-white">No orders yet</h3>
            <p className="mt-2 text-gray-400">Start shopping to see your orders here</p>
            <a
              href="/products"
              className="mt-6 inline-block rounded-md bg-teal-600 px-8 py-3 text-sm font-medium text-white hover:bg-teal-500"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700"
              >
                {/* Order Header */}
                <div className="bg-gray-750 px-6 py-4 border-b border-gray-700">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="text-lg font-semibold text-white">
                        #{order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Order Date</p>
                      <p className="text-white">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total Amount</p>
                      <p className="text-lg font-bold text-teal-400">
                        {formatCurrency(order.totalOrderAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status || "pending"
                        )}`}
                      >
                        {(order.status || "pending").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-4">
                    ORDER ITEMS
                  </h3>
                  <div className="space-y-4">
                    {order.order_items?.map((item) => {
                      const product = item.product;
                      const imageUrl = product?.image?.url || product?.banner?.url;
                      const fullImageUrl = imageUrl 
                        ? (imageUrl.startsWith('http') 
                            ? imageUrl 
                            : `${process.env.NEXT_PUBLIC_REST_API_URL?.replace('/api', '') || 'http://localhost:1337'}${imageUrl}`)
                        : null;
                      
                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 items-center bg-gray-900 rounded-lg p-4"
                        >
                          {/* Product Image */}
                          <div className="relative h-20 w-20 flex-shrink-0">
                            {fullImageUrl ? (
                              <Image
                                src={fullImageUrl}
                                alt={product?.title || "Product"}
                                fill
                                style={{ objectFit: "cover" }}
                                className="rounded-lg"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-700 rounded-lg flex items-center justify-center">
                                <svg
                                  className="h-8 w-8 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {product?.title || "Product"}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Quantity: {item.quantity || 1}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {formatCurrency(item.price_at_time || 0)}
                            </p>
                            <p className="text-sm text-gray-400">
                              Total: {formatCurrency((item.price_at_time || 0) * (item.quantity || 1))}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Info */}
                {(order.name || order.email || order.phone || order.address) && (
                  <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      SHIPPING INFORMATION
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {order.name && (
                        <div>
                          <span className="text-gray-400">Name: </span>
                          <span className="text-white">{order.name}</span>
                        </div>
                      )}
                      {order.email && (
                        <div>
                          <span className="text-gray-400">Email: </span>
                          <span className="text-white">{order.email}</span>
                        </div>
                      )}
                      {order.phone && (
                        <div>
                          <span className="text-gray-400">Phone: </span>
                          <span className="text-white">{order.phone}</span>
                        </div>
                      )}
                      {order.address && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Address: </span>
                          <span className="text-white">{order.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
