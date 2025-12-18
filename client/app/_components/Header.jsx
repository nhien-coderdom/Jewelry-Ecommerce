"use client";
// CI//
// CD Test - Verifying deployment with secrets configured
// test cicd
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { useGetCartItemsQuery } from "../_state/_services/CartApi";
import Cart from "../_components/Cart";
import UserProfilePopup from "../_components/UserProfilePopup";


const Header = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress;
  const cartRef = useRef(null);
  const accountRef = useRef(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [strapiUser, setStrapiUser] = useState(null);
  useEffect(() => {
  const fetchUser = async () => {
    if (!email) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_REST_API_URL}/users?filters[email][$eq]=${email}`);
    const data = await res.json();

    if (data?.length > 0) {
      setStrapiUser(data[0]);
    }
  };

  fetchUser();
}, [email]);



  // ⚙️ Thêm skip để tránh gọi API khi user chưa load
  const { data, isSuccess, isFetching } = useGetCartItemsQuery(email, {
    skip: !email,
  });


  const [isSign, setIsSign] = useState(false);
  const pathName = usePathname();

  useEffect(() => {
    setIsSign(pathName === "/sign-in" || pathName === "/sign-up");
  }, [pathName]);

  // 👆 Click outside để đóng cart
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    if (cartOpen || accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartOpen, accountMenuOpen]);

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
                  <div className="relative" ref={cartRef}>
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
                          onClose={() => setCartOpen(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* User profile */}
                  <div className="relative" ref={accountRef}>
                    <button
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full border-2 border-teal-500"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold">
                          {user?.firstName?.[0] || user?.username?.[0] || "U"}
                        </div>
                      )}
                    </button>

                    {/* Account Dropdown Menu */}
                    {accountMenuOpen && (
                      <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {user?.fullName || user?.username || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              setOpenProfile(true);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            Manage Account
                          </button>

                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              window.location.href = "/my-orders";
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            My Orders
                          </button>
                          
                          <button
                            onClick={() => {
                              setAccountMenuOpen(false);
                              signOut({ redirectUrl: "/" });
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                {openProfile && (
                  <UserProfilePopup
                    userData={strapiUser}
                    onClose={() => setOpenProfile(false)}
                    onSave={async (updatedData) => {
                      try {
                        // Gọi API để lưu vào database
                        const apiUrl = process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:1337/api";
                        const res = await fetch(`${apiUrl}/sync-clerk`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            clerkUserID: user.id,
                            email: user.primaryEmailAddress?.emailAddress,
                            username: updatedData.username,
                            phone: updatedData.phone,
                            address: updatedData.address,
                          }),
                        });
                        const result = await res.json();
                        console.log("API Response:", result); // Debug log
                        
                        // Kiểm tra cả success và message
                        if (result.success || result.message?.includes("successfully")) {
                          setStrapiUser({ ...strapiUser, ...updatedData });
                          alert("✅ Updated successfully!");
                        } else {
                          alert("❌ Error: " + (result.error || result.message || "Unable to update"));
                        }
                      } catch (err) {
                        console.error("❌ Error saving:", err);
                        alert("❌ Server connection error!");
                      }
                      setOpenProfile(false);
                    }}
                  />
                )}

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
