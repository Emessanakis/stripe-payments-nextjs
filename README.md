# 💳 Stripe Payments - Next.js

A modern, production-ready Stripe payment integration built with Next.js 15, TypeScript, and the Stripe Payment Element. This project demonstrates secure payment handling, checkout flows, and real-world billing implementation.

---

## ✨ Features

- 🔐 Secure server-side payment processing
- 💶 Euro (EUR) currency support
- 🎨 Modern, responsive checkout UI
- ⚡ Next.js 15 App Router
- 🔧 TypeScript for type safety
- 🧪 Test mode ready with Stripe test cards

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Stripe account ([Sign up here](https://dashboard.stripe.com/register))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stripe-payments-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add your Stripe keys:
   
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```
   
   > 💡 **How to get your Stripe keys:**
   > 1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
   > 2. Navigate to **Developers** → **API keys**
   > 3. Copy your **Publishable key** and **Secret key**
   > 4. Use the **test mode** keys for development (they start with `pk_test_` and `sk_test_`)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🧪 Testing Payments

Use these Stripe test cards to test the payment flow:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Payment declined |

- Use any future expiration date
- Use any 3-digit CVC
- Use any valid billing postal code

📚 [More test cards](https://stripe.com/docs/testing)

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Payment Processing:** Stripe API v2025-12-15
- **UI Components:** React 19
- **Styling:** Custom CSS

---

## 📂 Project Structure

```
stripe-payments-nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── checkout/
│   │   │       └── route.ts          # Payment Intent API
│   │   ├── components/
│   │   │   └── CheckoutForm/
│   │   │       ├── CheckoutForm.tsx  # Main checkout component
│   │   │       └── checkoutForm.css  # Styling
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   └── assets/
│       └── stripeIcon.png            # Favicon
├── public/                           # Static files
├── .env.local                        # Environment variables (create this!)
└── package.json
```

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (server-side) | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key (client-side) | `pk_test_...` |

⚠️ **Important:** Never commit your `.env.local` file to version control!

---

## 📝 Learn More

- [Stripe Documentation](https://stripe.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe API Reference](https://stripe.com/docs/api)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using Next.js and Stripe**
