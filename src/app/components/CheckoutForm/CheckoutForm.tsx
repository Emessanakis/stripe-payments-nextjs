'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, CircularProgress, Typography } from '@mui/material';

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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        margin: '2rem auto',
        padding: '2rem',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: '#555555', mb: 1 }}>
          Payment Details
        </Typography>
        <Box sx={{ mt: 1 }}>
          <PaymentElement />
        </Box>
      </Box>

      <Button
        type="submit"
        disabled={!stripe || loading}
        variant="contained"
        fullWidth
        sx={{
          padding: '0.8rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          borderRadius: '8px',
          textTransform: 'none',
        }}
      >
        {loading ? 'Processing...' : `Pay ${amount.toFixed(2)} €`}
      </Button>

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
      
      <Box
        sx={{
          mt: 2,
          padding: '0.75rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          color: '#856404',
          fontSize: '0.875rem',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        ⓘ This is for test payments only.
      </Box>
    </Box>
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
      <Box
        sx={{
          maxWidth: 400,
          margin: '2rem auto',
          padding: '2rem',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          gap: '1.5rem',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ color: '#666' }}>
          Loading payment form...
        </Typography>
      </Box>
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
