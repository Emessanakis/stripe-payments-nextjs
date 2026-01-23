'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentHistory from '../components/PaymentHistory/PaymentHistory';

interface Analytics {
  total: number;
  totalAmount: number;
  byPaymentMethod: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, number>;
}

interface BalanceInfo {
  available: number;
  pending: number;
  currency: string;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('eur');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics?page=1&limit=10');
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
          setBalance(data.balance);
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

  // Get unique statuses for filter buttons (based on all data from analytics)
  const availableStatuses = ['all', ...Object.keys(analytics?.byStatus || {})];

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
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ color: '#00d924', mr: 1 }} />
                <Typography variant="h6">Stripe Balance</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {balance ? formatCurrency(balance.available) : '0.00 €'}
              </Typography>
              {balance && balance.pending > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Pending: {formatCurrency(balance.pending)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
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
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6">Period Revenue</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 600 }}>
                {formatCurrency(analytics.totalAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Successful</Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, color: '#00d924' }}>
                {analytics.byStatus.succeeded || 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Payment History Component */}
      <PaymentHistory availableStatuses={availableStatuses} currency={currency} />
    </Box>
  );
}
