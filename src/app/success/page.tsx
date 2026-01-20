'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const stripe = await stripePromise;
      if (!stripe) return;

      // Get the payment_intent_client_secret from URL
      const clientSecret = searchParams.get('payment_intent_client_secret');

      if (!clientSecret) {
        setStatus('error');
        setMessage('No payment information found');
        return;
      }

      // Retrieve the PaymentIntent
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

      if (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred');
        return;
      }

      if (paymentIntent) {
        setPaymentDetails(paymentIntent);

        switch (paymentIntent.status) {
          case 'succeeded':
            setStatus('success');
            setMessage('Payment successful! Thank you for your purchase.');
            break;
          case 'processing':
            setStatus('loading');
            setMessage('Your payment is processing. This may take a few moments.');
            break;
          case 'requires_payment_method':
            setStatus('error');
            setMessage('Payment failed. Please try another payment method.');
            break;
          default:
            setStatus('error');
            setMessage('Something went wrong. Please contact support.');
            break;
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {status === 'loading' && (
        <>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #635bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2>Processing your payment...</h2>
          <p>{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#0a8f50' }}>Payment Successful!</h1>
          <p style={{ fontSize: '18px', color: '#6c757d' }}>{message}</p>
          
          {paymentDetails && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <h3 style={{ marginTop: 0 }}>Payment Details</h3>
              <p><strong>Payment ID:</strong> {paymentDetails.id}</p>
              <p><strong>Amount:</strong> {(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}</p>
              <p><strong>Payment Method:</strong> {paymentDetails.payment_method_types?.join(', ') || 'N/A'}</p>
              <p><strong>Status:</strong> {paymentDetails.status}</p>
            </div>
          )}

          <button 
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              backgroundColor: '#635bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Return to Home
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ color: '#dc3545' }}>Payment Failed</h1>
          <p style={{ fontSize: '18px', color: '#6c757d' }}>{message}</p>
          
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '30px',
              padding: '12px 24px',
              backgroundColor: '#635bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        maxWidth: '600px', 
        margin: '50px auto', 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #635bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h2>Loading...</h2>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
