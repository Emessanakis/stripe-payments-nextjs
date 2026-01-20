'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  CircularProgress,
  Chip
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface Analytics {
  total: number;
  totalAmount: number;
  byPaymentMethod: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, number>;
}

const paymentMethodIcons: Record<string, JSX.Element> = {
  card: <CreditCardIcon />,
  paypal: <AccountBalanceIcon />,
  revolut_pay: <PaymentIcon />,
  google_pay: <PaymentIcon />,
  apple_pay: <PaymentIcon />,
};

const paymentMethodLabels: Record<string, string> = {
  card: 'Credit/Debit Cards',
  paypal: 'PayPal',
  revolut_pay: 'Revolut Pay',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay',
};

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('eur');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
          setCurrency(data.currency);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" color="error">Failed to load analytics</Typography>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    const value = amount / 100;
    return currency === 'eur' ? `€${value.toFixed(2)}` : `$${value.toFixed(2)}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Payment analytics for the last 30 days
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: '#635bff', mr: 1 }} />
                <Typography variant="h6">Total Payments</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {analytics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ color: '#00d924', mr: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {formatCurrency(analytics.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Successful</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#00d924' }}>
                {analytics.byStatus.succeeded || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Processing</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#ff9800' }}>
                {analytics.byStatus.processing || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Payment Methods
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(analytics.byPaymentMethod).map(([method, data]) => (
              <Grid item xs={12} sm={6} md={4} key={method}>
                <Card variant="outlined" sx={{ backgroundColor: '#f9f9f9' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {paymentMethodIcons[method] || <PaymentIcon />}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {paymentMethodLabels[method] || method}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Transactions:
                      </Typography>
                      <Chip label={data.count} size="small" color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(data.amount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {Object.keys(analytics.byPaymentMethod).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No payment data available yet. Make your first payment to see analytics!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
