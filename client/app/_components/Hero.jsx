"use client";
import React from "react";
import Image from "next/image"; // Import the Next.js Image component
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Container của hình ảnh nền */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/banner.jpg"
          alt="Hình ảnh nền trang sức"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Lớp phủ để làm nổi bật văn bản */}
      <div className="absolute inset-0 bg-gray-900 opacity-75"></div>

      {/* Nội dung chính của Hero */}
      <div className="relative mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="bg-gradient-to-r from-teal-300 via-teal-500 to-teal-700 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            Your story, our sparkle.
          </h1>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="block w-full rounded border border-teal-600 bg-teal-600 px-12 py-3 text-sm font-medium transition-all text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
            >
              Explore now
            </Link>
            <Link
              href="/about"
              className="block w-full rounded border border-teal-600 px-12 py-3 text-sm font-medium text-white transition-all hover:text-white hover:bg-teal-600 focus:outline-none focus:ring active:bg-teal-500 sm:w-auto"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;