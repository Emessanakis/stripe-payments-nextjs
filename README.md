# Create NextJs application
npx create-next-app@latest .

# Install Stripe SDK for Node.js
npm install stripe

# (Recommended) Install TypeScript types
npm install -D @types/stripe

# Install client-side Stripe packages
npm install @stripe/stripe-js @stripe/react-stripe-js

# Make a .env file and add your stripe keys 


















# stripe-payments-nextjs
A production-level Stripe payments implementation with Next.js, created to practice real-world billing, checkout flows, and secure payment handling.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
