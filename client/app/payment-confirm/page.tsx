"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentConfirm() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col justify-center items-center text-center px-6">
      {/* Icon */}
      <CheckCircle className="w-20 h-20 text-teal-500 mb-6 animate-bounce" />

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Thank You for Your Purchase!
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-300 max-w-lg mb-8">
        Your payment was processed successfully. Our team is preparing your
        exquisite jewelry order and it will be shipped soon.
      </p>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md transition"
        >
          Continue Shopping
        </Link>
        <Link
          href="/my-orders"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-md transition"
        >
          View My Orders
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-gray-400">
        © {new Date().getFullYear()} Jewelry Store. All rights reserved.
      </p>
    </div>
  );
}
