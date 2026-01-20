'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import './checkoutForm.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Convert euros to cents
const convertToCents = (euros: number) => Math.round(euros * 100);

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Confirm payment and redirect to success page
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
      redirect: 'always', // Always redirect to success page after payment
    });

    if (error) {
      // Only errors that occur before redirect will be caught here
      setErrorMessage(error.message || 'An error occurred during payment');
      setErrorDialogOpen(true);
      setLoading(false);
    }
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
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

      <Dialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Payment Error</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
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
