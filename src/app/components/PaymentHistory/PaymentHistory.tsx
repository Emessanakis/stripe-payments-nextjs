'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Skeleton,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  created: number;
  description: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaymentHistoryProps {
  availableStatuses: string[];
  currency: string;
}

type SortField = 'created' | 'amount' | 'status' | null;
type SortOrder = 'asc' | 'desc' | null;

export default function PaymentHistory({ availableStatuses, currency }: PaymentHistoryProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [searchField, setSearchField] = useState<string>('id');
  const [searchValue, setSearchValue] = useState<string>('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        let url = `/api/analytics?page=${currentPage}&limit=${itemsPerPage}`;
        if (sortField && sortOrder) {
          url += `&sortBy=${sortField}&sortOrder=${sortOrder}`;
        }
        if (debouncedSearchValue.trim()) {
          url += `&searchField=${searchField}&searchValue=${encodeURIComponent(debouncedSearchValue)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPaymentHistory(data.paymentHistory || []);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [currentPage, itemsPerPage, sortField, sortOrder, searchField, debouncedSearchValue]);

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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      // New field: start with ascending
      setSortField(field);
      setSortOrder('asc');
      setCurrentPage(1);
    } else if (sortOrder === 'asc') {
      // Same field, currently asc: change to desc
      setSortOrder('desc');
      setCurrentPage(1);
    } else {
      // Same field, currently desc: remove sorting
      setSortField(null);
      setSortOrder(null);
      setCurrentPage(1);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpwardIcon fontSize="small" sx={{ opacity: 0.3 }} />;
    }
    if (sortOrder === 'asc') {
      return <ArrowDownwardIcon fontSize="small" />;
    }
    return <UnfoldMoreIcon fontSize="small" />;
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.trim() !== searchValue.trim()) {
      setCurrentPage(1);
    }
  };

  const filteredPaymentHistory = statusFilter === 'all'
    ? paymentHistory
    : paymentHistory.filter(p => p.status === statusFilter);

  const TableSkeleton = () => (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ minHeight: 405, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, width: '60px' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(6)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton variant="text" width={30} height={24.5}/></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={24.5}/></TableCell>
                <TableCell><Skeleton variant="text" width={90} height={24.5}/></TableCell>
                <TableCell><Skeleton variant="text" width={80} height={24.5}/></TableCell>
                <TableCell><Skeleton variant="text" width={100} height={24.5}/></TableCell>
                <TableCell><Skeleton variant="text" width={100} height={24.5}/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Skeleton Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
        <Skeleton variant="rectangular" width={400} height={32} sx={{ borderRadius: 2 }} />
      </Box>
    </>
  );

  return (
    <Card  sx={{ minHeight: 660 }}>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Payment History
        </Typography>

        {/* Search Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Search By</InputLabel>
            <Select
              value={searchField}
              label="Search By"
              onChange={(e) => setSearchField(e.target.value)}
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="paymentMethod">Method</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={`Search by ${searchField}...`}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
        </Box>

        {/* Status Filter Chips */}
        {pagination && pagination.totalItems > 0 && (
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

        {loading ? (
          <TableSkeleton />
        ) : filteredPaymentHistory.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ minHeight: 405, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, width: '60px' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Date
                      <IconButton size="small" onClick={() => handleSort('created')} sx={{ p: 0.5 }}>
                        {getSortIcon('created')}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Amount
                      <IconButton size="small" onClick={() => handleSort('amount')} sx={{ p: 0.5 }}>
                        {getSortIcon('amount')}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Status
                      <IconButton size="small" onClick={() => handleSort('status')} sx={{ p: 0.5 }}>
                        {getSortIcon('status')}
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPaymentHistory.map((payment, index) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </Typography>
                    </TableCell>
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
              {pagination && pagination.totalItems === 0
                ? 'No payment history available yet. Make your first payment to see transactions!'
                : `No ${statusFilter} payments found.`
              }
            </Typography>
          </Box>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && !loading && filteredPaymentHistory.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {`${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, pagination.totalItems)} of ${pagination.totalItems}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
