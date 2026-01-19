'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Country, CountryApiResponse } from './types';
import './checkoutForm.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(10); // default $10
  const [currency, setCurrency] = useState('usd');
  const [country, setCountry] = useState('US');
  const [countries, setCountries] = useState<Country[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch countries and currencies from REST Countries API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,currencies');
        const data: CountryApiResponse[] = await response.json();
        
        // Process countries
        const countryList: Country[] = data.map((country) => ({
          name: country.name.common,
          code: country.cca2,
          flag: country.flags.svg || country.flags.png || '',
          currencies: country.currencies ? Object.keys(country.currencies) : []
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(countryList);
        setDataLoading(false);
      } catch (error) {
        console.error('Failed to fetch countries/currencies:', error);
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setSearchTerm('');
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  // Keyboard navigation for country dropdown
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isCountryDropdownOpen) return;

      if (event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
        setSearchTerm('');
        return;
      }

      // Handle letter/number keys for search
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        const newSearchTerm = searchTerm + event.key.toLowerCase();
        setSearchTerm(newSearchTerm);

        // Find first matching country
        const matchingCountry = countries.find(c => 
          c.name.toLowerCase().startsWith(newSearchTerm)
        );

        if (matchingCountry) {
          setCountry(matchingCountry.code);
        }

        // Clear search term after 1 second of inactivity
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
          setSearchTerm('');
        }, 1000);
      }
    };

    if (isCountryDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isCountryDropdownOpen, searchTerm, countries]);

  // Scroll selected country into view
  useEffect(() => {
    if (isCountryDropdownOpen && country) {
      const selectedElement = document.querySelector(`.dropdown-item[data-country-code="${country}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [country, isCountryDropdownOpen]);

  // Convert dollars to cents
  const convertToCents = (dollars: number) => Math.round(dollars * 100);

  // Handle country change and update currency accordingly
  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode);
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry?.currencies.length) {
      setCurrency(selectedCountry.currencies[0].toLowerCase());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Call your Next.js API route with amount in cents, currency, country
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: convertToCents(amount), currency, country }),
    });
    const data = await res.json();

    // Confirm payment
    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent?.status === 'succeeded') {
      alert('Payment successful!');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2>Checkout</h2>
      
      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          min={0.5}
          step={0.01}
        />
      </label>

      <label>
        Country:
        <div className="custom-dropdown" ref={dropdownRef}>
          <div 
            className="dropdown-header"
            onClick={() => !dataLoading && setIsCountryDropdownOpen(!isCountryDropdownOpen)}
          >
            {dataLoading ? (
              'Loading countries...'
            ) : (
              <>
                {countries.find(c => c.code === country)?.flag && (
                  <Image 
                    src={countries.find(c => c.code === country)?.flag || ''} 
                    alt=""
                    width={24}
                    height={16}
                    className="flag-icon"
                    unoptimized
                  />
                )}
                <span>{countries.find(c => c.code === country)?.name || 'Select a country'}</span>
                <span className="dropdown-arrow">{isCountryDropdownOpen ? '▲' : '▼'}</span>
              </>
            )}
          </div>
          {isCountryDropdownOpen && !dataLoading && (
            <div className="dropdown-list">
              {countries.map((c) => (
                <div
                  key={c.code}
                  data-country-code={c.code}
                  className={`dropdown-item ${c.code === country ? 'selected' : ''}`}
                  onClick={() => {
                    handleCountryChange(c.code);
                    setIsCountryDropdownOpen(false);
                  }}
                >
                  <Image 
                    src={c.flag} 
                    alt=""
                    width={24}
                    height={16}
                    className="flag-icon"
                    unoptimized
                  />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </label>

      <label>
        Card Details:
        <div className="card-element">
          <CardElement />
        </div>
      </label>

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay ${amount.toFixed(2)} ${currency.toUpperCase()}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
