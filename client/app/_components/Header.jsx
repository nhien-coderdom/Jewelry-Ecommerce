"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useGetCartItemsQuery } from "../_state/_services/CartApi";
import Cart from "../_components/Cart";

const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // ⚙️ Thêm skip để tránh gọi API khi user chưa load
  const { data, isSuccess, isFetching } = useGetCartItemsQuery(email, {
    skip: !email,
  });


  const [isSign, setIsSign] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setIsSign(pathName === "/sign-in" || pathName === "/sign-up");
  }, [pathName]);

  // 🧮 Lấy số lượng sản phẩm trong giỏ (nếu có)
  const cartCount =
  data?.data?.[0]?.attributes?.cart_items?.data?.reduce(
    (total, item) => total + (item?.attributes?.quantity || 1),
    0
  ) || 0;
  return (
    !isSign && (
      <header className="bg-gray-800 relative z-50">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="md:flex md:items-center md:gap-12">
              <a className="block text-teal-600" href="/">
                <span className="sr-only">Home</span>
                <svg
                  className="h-8"
                  viewBox="0 0 28 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.41 10.3847C1.14777 7.4194 2.85643 4.7861 5.2639 2.90424C7.6714 1.02234 10.6393 0 13.695 0C16.7507 0 19.7186 1.02234 22.1261 2.90424C24.5336 4.7861 26.2422 7.4194 26.98 10.3847H25.78C23.7557 10.3549 21.7729 10.9599 20.11 12.1147C20.014 12.1842 19.9138 12.2477 19.81 12.3047H19.67C19.5662 12.2477 19.466 12.1842 19.37 12.1147C17.6924 10.9866 15.7166 10.3841 13.695 10.3841C11.6734 10.3841 9.6976 10.9866 8.02 12.1147C7.924 12.1842 7.8238 12.2477 7.72 12.3047H7.58C7.4762 12.2477 7.376 12.1842 7.28 12.1147C5.6171 10.9599 3.6343 10.3549 1.61 10.3847H0.41Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {!user ? (
                <div className="sm:flex sm:gap-4">
                  <a
                    className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow transition-all hover:bg-teal-500"
                    href="/sign-in"
                  >
                    Login
                  </a>

                  <div className="hidden sm:flex">
                    <a
                      className="rounded-md px-5 py-2.5 text-sm font-medium transition-all bg-gray-700 text-white hover:bg-gray-600"
                      href="/sign-up"
                    >
                      Register
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6 relative">
                  {/* Cart Icon */}
                  <div className="relative">
                    <button
                      className="relative"
                      onClick={() => setCartOpen(!cartOpen)}
                      disabled={isFetching}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-7 h-7 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 
                          1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 
                          1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 
                          0 1 5.513 7.5h12.974c.576 0 1.059.435 
                          1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 
                          0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 
                          1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>

                      {/* 🔢 Số lượng sản phẩm */}
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex justify-center items-center w-5 h-5 rounded-full text-[10px] font-semibold bg-teal-600 text-white">
                          {cartCount}
                        </span>
                      )}
                    </button>

                    {/* 🧺 Cart Dropdown */}
                    {isSuccess && cartOpen && (
                      <div className="absolute top-12 right-0 z-50">
                        <Cart
                          data={
                            data?.data?.[0]?.attributes?.cart_items?.data || []
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* User profile */}
                  <UserButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    )
  );
};

export default Header;
