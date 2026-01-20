'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  created: number;
  description: string;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('eur');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
          setPaymentHistory(data.paymentHistory || []);
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'processing':
        return 'warning';
      case 'requires_payment_method':
      case 'requires_action':
        return 'info';
      case 'canceled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: 'Card',
      paypal: 'PayPal',
      revolut_pay: 'Revolut Pay',
      google_pay: 'Google Pay',
      apple_pay: 'Apple Pay',
    };
    return labels[method] || method;
  };

  // Filter payment history based on status
  const filteredPaymentHistory = statusFilter === 'all' 
    ? paymentHistory 
    : paymentHistory.filter(p => p.status === statusFilter);

  // Get unique statuses for filter buttons
  const availableStatuses = ['all', ...Array.from(new Set(paymentHistory.map(p => p.status)))];

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

      {/* Payment History Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Payment History
          </Typography>

          {/* Status Filter Chips */}
          {paymentHistory.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {availableStatuses.map((status) => (
                <Chip
                  key={status}
                  label={status === 'all' ? 'All' : status}
                  onClick={() => setStatusFilter(status)}
                  color={statusFilter === status ? 'primary' : 'default'}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Box>
          )}
          
          {filteredPaymentHistory.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ height:400 , overflow: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPaymentHistory.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {payment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(payment.created)}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          color={getStatusColor(payment.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {paymentHistory.length === 0 
                  ? 'No payment history available yet. Make your first payment to see transactions!'
                  : `No ${statusFilter} payments found.`
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
