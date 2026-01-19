// src/app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
  const { amount, currency, country } = await req.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method_types: ['card'],
    // Optional: you can pass country info in shipping or metadata
    metadata: { country },
  });

  return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }));
}
