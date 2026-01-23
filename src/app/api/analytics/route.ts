import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(request: Request) {
  try {
    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const sortBy = searchParams.get('sortBy') as 'created' | 'amount' | 'status' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    const searchField = searchParams.get('searchField') || '';
    const searchValue = searchParams.get('searchValue') || '';
    
    // Fetch actual Stripe balance
    const balance = await stripe.balance.retrieve();
    
    // Fetch payment intents from the last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    // Fetch all payment intents for analytics (we need the full set for totals)
    const allPaymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    // Get available balance in EUR (or primary currency)
    const eurBalance = balance.available.find(b => b.currency === 'eur') || balance.available[0];
    const pendingBalance = balance.pending.find(b => b.currency === 'eur') || balance.pending[0];

    // Aggregate data by payment method type
    const analytics = {
      total: 0,
      totalAmount: 0,
      byPaymentMethod: {} as Record<string, { count: number; amount: number }>,
      byStatus: {} as Record<string, number>,
    };

    // Full payment history for analytics
    const fullPaymentHistory = allPaymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      paymentMethod: pi.payment_method_types?.[0] || 'unknown',
      created: pi.created,
      description: pi.description || '',
    }));

    allPaymentIntents.data.forEach((pi) => {
      // Count all payments for total
      analytics.total++;
      
      // Only count succeeded payments for revenue
      if (pi.status === 'succeeded') {
        analytics.totalAmount += pi.amount;
      }

      // Group by payment method type (only succeeded)
      if (pi.status === 'succeeded') {
        const paymentMethod = pi.payment_method_types?.[0] || 'unknown';
        if (!analytics.byPaymentMethod[paymentMethod]) {
          analytics.byPaymentMethod[paymentMethod] = { count: 0, amount: 0 };
        }
        analytics.byPaymentMethod[paymentMethod].count++;
        analytics.byPaymentMethod[paymentMethod].amount += pi.amount;
      }

      // Group by status
      analytics.byStatus[pi.status] = (analytics.byStatus[pi.status] || 0) + 1;
    });

    // Apply search filter if provided
    let filteredPaymentHistory = fullPaymentHistory;
    if (searchValue && searchField) {
      filteredPaymentHistory = fullPaymentHistory.filter((payment) => {
        const fieldValue = payment[searchField as keyof typeof payment];
        if (fieldValue === undefined) return false;
        
        // Convert to string and do case-insensitive search
        const valueStr = String(fieldValue).toLowerCase();
        const searchStr = searchValue.toLowerCase();
        
        return valueStr.includes(searchStr);
      });
    }

    // Apply sorting if requested
    if (sortBy && sortOrder) {
      filteredPaymentHistory.sort((a, b) => {
        let compareValue = 0;
        
        if (sortBy === 'created') {
          compareValue = a.created - b.created;
        } else if (sortBy === 'amount') {
          compareValue = a.amount - b.amount;
        } else if (sortBy === 'status') {
          compareValue = a.status.localeCompare(b.status);
        }
        
        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
    }

    // Apply pagination to payment history
    const totalItems = filteredPaymentHistory.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPaymentHistory = filteredPaymentHistory.slice(startIndex, endIndex);

    return Response.json({
      success: true,
      analytics,
      paymentHistory: paginatedPaymentHistory,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      balance: {
        available: eurBalance?.amount || 0,
        pending: pendingBalance?.amount || 0,
        currency: eurBalance?.currency || 'eur',
      },
      currency: eurBalance?.currency || 'eur',
    });
  } catch (error: unknown) {
    console.error('Analytics error:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
