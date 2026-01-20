import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET() {
  try {
    // Fetch actual Stripe balance
    const balance = await stripe.balance.retrieve();
    
    // Fetch payment intents from the last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    const paymentIntents = await stripe.paymentIntents.list({
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

    // Payment history for table
    const paymentHistory = paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      paymentMethod: pi.payment_method_types?.[0] || 'unknown',
      created: pi.created,
      description: pi.description || '',
    }));

    paymentIntents.data.forEach((pi) => {
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

    return Response.json({
      success: true,
      analytics,
      paymentHistory,
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
