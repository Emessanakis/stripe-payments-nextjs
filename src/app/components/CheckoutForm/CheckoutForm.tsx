'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './checkoutForm.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Convert euros to cents
const convertToCents = (euros: number) => Math.round(euros * 100);

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Confirm payment with Payment Element
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      alert(result.error.message);
      setLoading(false);
    } else if (result.paymentIntent?.status === 'succeeded') {
      alert('Payment successful!');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2>Checkout</h2>
      
      <label>
        <h3>Payment Details</h3>
        <div className="payment-element">
          <PaymentElement />
        </div>
      </label>

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay €${amount.toFixed(2)}`}
      </button>
      
      <p className="test-mode-notice">
        ⓘ This is for test payments only.
      </p>
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('');
  const [amount] = useState(10);

  // Create PaymentIntent
  useEffect(() => {
    const createPaymentIntent = async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: convertToCents(amount)
        }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
    };

    createPaymentIntent();
  }, [amount]);

  if (!clientSecret) {
    return (
      <div className="checkout-form loading-container">
        <div className="loader"></div>
        <p className="loading-text">Loading payment form...</p>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <CheckoutForm amount={amount} />
    </Elements>
  );
}
