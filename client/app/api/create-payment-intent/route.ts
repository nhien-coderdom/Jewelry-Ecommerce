import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    const { data } = await req.json();
    const { amount } = data;

    console.log("Payment Intent Request:", { amount, data });

    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Amount must be at least 50 cents" }, { status: 400 });
    }

    // Ensure minimum amount (50 cents)
    const stripeAmount = Math.max(Number(amount), 50);
    
    console.log("Creating payment intent with amount:", stripeAmount);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // Simplified config
    });

    console.log("Payment intent created:", paymentIntent.id);
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe error details:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to create payment intent",
      details: error.type || "unknown_error"
    }, { status: 500 });
  }
}
