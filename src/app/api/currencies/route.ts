// src/app/api/currencies/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET() {
  try {
    // Fetch country specs to get supported currencies
    const countrySpecs = await stripe.countrySpecs.list({ limit: 100 });
    
    // Extract unique currencies with their details
    const currencyMap = new Map<string, { code: string; name: string }>();
    
    // Common currency symbols and names
    const currencyInfo: Record<string, { symbol: string; name: string }> = {
      usd: { symbol: '$', name: 'US Dollar' },
      eur: { symbol: '€', name: 'Euro' },
      gbp: { symbol: '£', name: 'British Pound' },
      jpy: { symbol: '¥', name: 'Japanese Yen' },
      cad: { symbol: 'C$', name: 'Canadian Dollar' },
      aud: { symbol: 'A$', name: 'Australian Dollar' },
      chf: { symbol: 'CHF', name: 'Swiss Franc' },
      cny: { symbol: '¥', name: 'Chinese Yuan' },
      inr: { symbol: '₹', name: 'Indian Rupee' },
      sgd: { symbol: 'S$', name: 'Singapore Dollar' },
      hkd: { symbol: 'HK$', name: 'Hong Kong Dollar' },
      nzd: { symbol: 'NZ$', name: 'New Zealand Dollar' },
      sek: { symbol: 'kr', name: 'Swedish Krona' },
      nok: { symbol: 'kr', name: 'Norwegian Krone' },
      dkk: { symbol: 'kr', name: 'Danish Krone' },
      pln: { symbol: 'zł', name: 'Polish Złoty' },
      mxn: { symbol: 'MX$', name: 'Mexican Peso' },
      brl: { symbol: 'R$', name: 'Brazilian Real' },
      krw: { symbol: '₩', name: 'South Korean Won' },
      zar: { symbol: 'R', name: 'South African Rand' },
    };

    // Collect unique currencies from country specs
    for (const spec of countrySpecs.data) {
      for (const currency of spec.supported_payment_currencies) {
        if (!currencyMap.has(currency)) {
          const info = currencyInfo[currency] || { 
            symbol: currency.toUpperCase(), 
            name: currency.toUpperCase() 
          };
          currencyMap.set(currency, {
            code: currency,
            name: info.name,
          });
        }
      }
    }

    // Convert to array and sort popular currencies first
    const popularCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny'];
    const currencies = Array.from(currencyMap.values()).sort((a, b) => {
      const aPopular = popularCurrencies.indexOf(a.code);
      const bPopular = popularCurrencies.indexOf(b.code);
      
      if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
      if (aPopular !== -1) return -1;
      if (bPopular !== -1) return 1;
      return a.code.localeCompare(b.code);
    });

    // Add symbols to currencies
    const currenciesWithSymbols = currencies.map(curr => ({
      ...curr,
      symbol: currencyInfo[curr.code]?.symbol || curr.code.toUpperCase(),
    }));

    return new Response(JSON.stringify({ currencies: currenciesWithSymbols }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    
    // Fallback to popular currencies
    const fallbackCurrencies = [
      { code: 'usd', symbol: '$', name: 'US Dollar' },
      { code: 'eur', symbol: '€', name: 'Euro' },
      { code: 'gbp', symbol: '£', name: 'British Pound' },
      { code: 'jpy', symbol: '¥', name: 'Japanese Yen' },
      { code: 'cad', symbol: 'C$', name: 'Canadian Dollar' },
      { code: 'aud', symbol: 'A$', name: 'Australian Dollar' },
      { code: 'chf', symbol: 'CHF', name: 'Swiss Franc' },
      { code: 'cny', symbol: '¥', name: 'Chinese Yuan' },
    ];
    
    return new Response(JSON.stringify({ currencies: fallbackCurrencies }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
