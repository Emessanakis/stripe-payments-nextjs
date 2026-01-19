import { StrictMode } from "react";
import StripeContainer from "./components/CheckoutForm/CheckoutForm";

export default function Homepage() {
  return (
    <StrictMode>
      < StripeContainer />
    </StrictMode>
  );
}
