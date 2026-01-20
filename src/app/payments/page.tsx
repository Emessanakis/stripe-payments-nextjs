import { StrictMode } from "react";
import Checkout from "../components/CheckoutForm/CheckoutForm";
import { Typography, Box } from "@mui/material";

export default function PaymentsPage() {
  return (
    <StrictMode>
      <Box>
        <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                Payments
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Here you can make test payments using Stripe&apos;s test environment.
            </Typography>
        </Box>
        <Checkout />
      </Box>
    </StrictMode>
  );
}
