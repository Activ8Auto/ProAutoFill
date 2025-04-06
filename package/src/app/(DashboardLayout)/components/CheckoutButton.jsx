import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthStore } from "@/store/authStore"; // Adjust path as needed

// Load Stripe with your publishable key from environment variables.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);


export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const handleCheckout = async () => {
    setLoading(true);
    console.log(stripePromise)
    // Prepare headers including the authorization token from authStore
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Call the backend API to create a checkout session.
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Checkout session error:", errorText);
      setLoading(false);
      return;
    }

    const session = await response.json();
    window.location.href = session.checkout_url;

    // Get the Stripe object and redirect the user to the Stripe checkout
    // const stripe = await stripePromise;
    // const { error } = await stripe.redirectToCheckout({
    //   sessionId: session.checkout_url ? session.checkout_url : session.id,
    // });
    // if (error) {
    //   console.error("Stripe checkout error", error);
    // }
    setLoading(false);
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Processing…" : "Subscribe Now"}
    </button>
  );
}
