'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import './checkoutForm.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Convert dollars to cents
const convertToCents = (dollars: number) => Math.round(dollars * 100);

function CheckoutForm({ 
  amount, 
  currencySymbol, 
  onAmountChange, 
  onCurrencyChange, 
  currencies 
}: { 
  amount: number; 
  currency: string; 
  currencySymbol: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
  currencies: { code: string; symbol: string; name: string }[];
}) {
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
      
      <div className="amount-currency-row">
        <label className="amount-label">
          Amount
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(parseFloat(e.target.value))}
            min={0.5}
            step={0.01}
            className="amount-input"
          />
        </label>

        <label className="currency-label">
          Currency
          <select 
            value={currencies.find(c => c.symbol === currencySymbol)?.code || 'usd'} 
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="currency-select"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Payment Details
        <div className="payment-element">
          <PaymentElement />
        </div>
      </label>

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay ${currencySymbol}${amount.toFixed(2)}`}
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
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState('usd');
  const [currencies, setCurrencies] = useState<{ code: string; symbol: string; name: string }[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  // Fetch available currencies from Stripe
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch('/api/currencies');
        const data = await res.json();
        setCurrencies(data.currencies);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to popular currencies
        setCurrencies([
          { code: 'usd', symbol: '$', name: 'US Dollar' },
          { code: 'eur', symbol: '€', name: 'Euro' },
          { code: 'gbp', symbol: '£', name: 'British Pound' },
          { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
        ]);
      } finally {
        setCurrenciesLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Create PaymentIntent when amount or currency changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: convertToCents(amount), 
          currency
        }),
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency]);

  if (currenciesLoading || !clientSecret) {
    return (
      <div className="checkout-form loading-container">
        <div className="loader"></div>
        <p className="loading-text">Loading payment form...</p>
      </div>
    );
  }

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <Elements 
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <CheckoutForm 
        amount={amount} 
        currency={currency} 
        currencySymbol={currentCurrency?.symbol || '$'}
        onAmountChange={setAmount}
        onCurrencyChange={setCurrency}
        currencies={currencies}
      />
    </Elements>
  );
}
