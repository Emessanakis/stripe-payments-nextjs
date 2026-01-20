import { StrictMode } from "react";
import Checkout from "../components/CheckoutForm/CheckoutForm";
import { Typography, Box } from "@mui/material";

export default function PaymentsPage() {
  return (
    <StrictMode>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          Make a Payment
        </Typography>
        <Checkout />
      </Box>
    </StrictMode>
  );
}
