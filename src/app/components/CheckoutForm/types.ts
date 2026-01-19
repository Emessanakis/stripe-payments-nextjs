import type { PaymentRequest } from '@stripe/stripe-js';

export interface Country {
  name: string;
  code: string;
  flag: string;
  currencies: string[];
}

export interface CountryApiResponse {
  name: {
    common: string;
  };
  cca2: string;
  flags: {
    svg?: string;
    png?: string;
  };
  currencies?: Record<string, {
    name: string;
    symbol: string;
  }>;
}

export type { PaymentRequest };
