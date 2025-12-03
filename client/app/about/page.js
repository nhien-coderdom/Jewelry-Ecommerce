"use client";

import React from "react";
import Image from "next/image";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/banner.jpg"
            alt="About Us"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              About Us
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Crafting timeless elegance, one piece at a time
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full">
            <Image
              src="/banner.jpg"
              alt="Jewelry crafting"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>

          <div className="lg:py-16">
            <h2 className="text-3xl font-bold text-teal-400 sm:text-4xl">
              Our Story
            </h2>
            <p className="mt-4 text-gray-300 leading-relaxed">
              Welcome to our jewelry store, where passion meets craftsmanship. 
              For over a decade, we have been dedicated to creating exquisite 
              jewelry pieces that tell your unique story. Each piece in our 
              collection is carefully designed and crafted with attention to 
              detail and quality.
            </p>
            <p className="mt-4 text-gray-300 leading-relaxed">
              Our journey began with a simple belief: that jewelry should be 
              more than just an accessory—it should be a reflection of your 
              personality, a celebration of life's precious moments, and a 
              treasure to be passed down through generations.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-800 py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-teal-400 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-gray-300">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Quality */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-teal-600 mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-300">
                We use only the finest materials and gemstones, ensuring every 
                piece meets our rigorous quality standards.
              </p>
            </div>

            {/* Craftsmanship */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-teal-600 mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Expert Craftsmanship
              </h3>
              <p className="text-gray-300">
                Our skilled artisans bring decades of experience, combining 
                traditional techniques with modern innovation.
              </p>
            </div>

            {/* Customer First */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-teal-600 mb-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Customer Satisfaction
              </h3>
              <p className="text-gray-300">
                Your happiness is our priority. We're committed to providing 
                exceptional service and support every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-400 sm:text-4xl">
            Why Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✓ Authentic Materials
            </h3>
            <p className="text-sm text-gray-300">
              100% genuine precious metals and gemstones
            </p>
          </div>

          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✓ Lifetime Warranty
            </h3>
            <p className="text-sm text-gray-300">
              Comprehensive warranty on all our jewelry
            </p>
          </div>

          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✓ Free Shipping
            </h3>
            <p className="text-sm text-gray-300">
              Fast and secure delivery worldwide
            </p>
          </div>

          <div className="text-center p-6 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✓ 30-Day Returns
            </h3>
            <p className="text-sm text-gray-300">
              Hassle-free returns within 30 days
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 py-16">
        <div className="mx-auto max-w-screen-xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="mt-4 text-white/90">
            Explore our collection and discover jewelry that speaks to you
          </p>
          <div className="mt-8">
            <a
              href="/products"
              className="inline-block rounded bg-white px-12 py-3 text-sm font-medium text-teal-600 transition hover:bg-gray-100 focus:outline-none focus:ring focus:ring-teal-300"
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
