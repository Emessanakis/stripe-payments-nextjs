import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET() {
  try {
    // Fetch payment intents from the last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
      created: { gte: thirtyDaysAgo },
    });

    // Aggregate data by payment method type
    const analytics = {
      total: 0,
      totalAmount: 0,
      byPaymentMethod: {} as Record<string, { count: number; amount: number }>,
      byStatus: {} as Record<string, number>,
    };

    paymentIntents.data.forEach((pi) => {
      analytics.total++;
      analytics.totalAmount += pi.amount;

      // Group by payment method type
      const paymentMethod = pi.payment_method_types?.[0] || 'unknown';
      if (!analytics.byPaymentMethod[paymentMethod]) {
        analytics.byPaymentMethod[paymentMethod] = { count: 0, amount: 0 };
      }
      analytics.byPaymentMethod[paymentMethod].count++;
      analytics.byPaymentMethod[paymentMethod].amount += pi.amount;

      // Group by status
      analytics.byStatus[pi.status] = (analytics.byStatus[pi.status] || 0) + 1;
    });

    return Response.json({
      success: true,
      analytics,
      currency: 'eur', // Assuming EUR based on your setup
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
