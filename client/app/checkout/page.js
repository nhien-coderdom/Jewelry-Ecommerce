"use client";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useGetCartItemsQuery } from "../_state/_services/CartApi";
import { useUser } from "@clerk/nextjs";
import { BallTriangle } from "react-loader-spinner";
import CheckoutForm from "./_components/CheckoutForm";

// Load Stripe with public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHER_KEY);

export default function Checkout() {
  const { user } = useUser();
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState({});
  const { data, isSuccess } = useGetCartItemsQuery(
    user?.primaryEmailAddress?.emailAddress
  );

  // Calculate total price
  useEffect(() => {
    if (isSuccess) {
      const totalAmount = data?.data.reduce(
        (accumulator, currentValue) =>
          Number(accumulator) +
          Number(
            currentValue?.attributes?.products?.data[0]?.attributes?.price
          ),
        0
      );
      setTotal(totalAmount);
      setOptions({
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#d4af37", // gold accent
            colorBackground: "#1a1a1a",
            colorText: "#ffffff",
          },
        },
        mode: "payment",
        currency: "usd",
        amount: totalAmount * 100,
      });
    }
  }, [data, isSuccess]);

  return (
    <div className="App">
      <div className="relative mx-auto w-full bg-gray-950 text-white">
        <div className="grid min-h-screen grid-cols-10">
          {/* Checkout Form */}
          <div className="col-span-full py-6 px-4 sm:py-12 lg:col-span-6 lg:py-24">
            <div className="mx-auto w-full max-w-lg">
              <h1 className="relative text-2xl font-semibold tracking-wide text-gray-100 sm:text-3xl">
                Secure Checkout
                <span className="mt-2 block h-1 w-16 bg-gradient-to-r from-teal-500 to-teal-300 sm:w-24"></span>
              </h1>
              <p className="mt-3 text-sm text-gray-400">
                Complete your purchase and let your elegance shine with our
                premium jewelry.
              </p>

              {total > 0 ? (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm amount={Number(total)} />
                </Elements>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center">
                  <BallTriangle
                    height={50}
                    width={50}
                    radius={5}
                    color="#d4af37"
                    ariaLabel="ball-triangle-loading"
                    visible={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="relative col-span-full flex flex-col py-6 pl-8 pr-4 sm:py-12 lg:col-span-4 lg:py-24">
            <h2 className="sr-only">Order summary</h2>
            <div>
              <img
                src="/banner.jpg"
                alt="Jewelry background"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/90 via-black/70 to-black/50"></div>
            </div>

            <div className="relative">
              {isSuccess ? (
                <ul className="space-y-5">
                  {data?.data?.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <div className="inline-flex">
                        <img
                          src={
                            item?.attributes?.products?.data[0]?.attributes
                              ?.banner?.data?.attributes?.url
                          }
                          alt=""
                          className="h-16 w-[6rem] rounded object-cover border border-teal-600/30"
                        />
                        <div className="ml-3 flex flex-col items-start">
                          <h3 className="text-sm font-medium text-start text-white line-clamp-1">
                            {
                              item?.attributes?.products?.data[0]?.attributes
                                ?.title
                            }
                          </h3>
                          <dl className="mt-0.5 space-y-px text-[12px] text-gray-300">
                            <dd className="capitalize">
                              {
                                item?.attributes?.products?.data[0]?.attributes
                                  ?.category
                              }
                            </dd>
                            <dd className="text-teal-600 font-medium">
                              $
                              {
                                item?.attributes?.products?.data[0]?.attributes
                                  ?.price
                              }
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-teal-600">
                        $
                        {item?.attributes?.products?.data[0]?.attributes?.price}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="w-full h-[300px] flex justify-center items-center">
                  <BallTriangle
                    height={80}
                    width={80}
                    radius={5}
                    color="#d4af37"
                    ariaLabel="ball-triangle-loading"
                    visible={true}
                  />
                </div>
              )}

              {/* Total */}
              <div className="my-5 h-0.5 w-full bg-teal-900"></div>
              <div className="space-y-2">
                <p className="flex justify-between text-lg font-bold text-teal-600">
                  <span>Total price:</span>
                  <span>${total}</span>
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="relative mt-10 text-gray-200">
              <h3 className="mb-5 text-lg font-bold text-white">
                Customer Care
              </h3>
              <p className="text-sm">
                +01 653 235 211{" "}
                <span className="font-light">(International)</span>
              </p>
              <p className="mt-1 text-sm">
                support@luxjewel.com{" "}
                <span className="font-light">(Email)</span>
              </p>
              <p className="mt-3 text-xs font-medium text-gray-400">
                Our team is here to assist you with any payment questions.
              </p>
            </div>

            {/* Guarantee */}
            <div className="relative mt-10 flex">
              <p className="flex flex-col">
                <span className="text-sm font-bold text-teal-600">
                  30-Day Money Back Guarantee
                </span>
                <span className="text-xs font-medium text-gray-300">
                  Shop with confidence for your timeless jewelry pieces.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
