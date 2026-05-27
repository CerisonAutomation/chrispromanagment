// @ts-nocheck
import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, CreditCard, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatMoney } from "@/lib/guestyPricing";
import { supabase } from "@/integrations/supabase/client";
import { tracing, metrics, logger } from "@/lib/otel-observability";

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Cache Stripe instance across renders (canonical pattern)
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

/**
 * Inner form that actually mounts Stripe PaymentElement.
 * Must live inside <Elements> to access useStripe/useElements.
 */
function PaymentForm({
  quoteId,
  ratePlanId,
  guest,
  specialRequests,
  amount,
  currency,
  paymentIntentId,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Payment is still loading, please wait a moment");
      return;
    }
    setIsProcessing(true);
    setErrMessage(null);

    // Confirm the PaymentIntent without redirect
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: `${guest.firstName} ${guest.lastName}`,
            email: guest.email,
            phone: guest.phone,
          },
        },
      },
    });

    if (error) {
      setErrMessage(error.message);
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      try {
        const { data, error } = await supabase.functions.invoke("payments-finalize", {
          body: {
            quoteId,
            paymentIntentId: paymentIntent.id,
            paymentMethodId:
              typeof paymentIntent.payment_method === "string"
                ? paymentIntent.payment_method
                : paymentIntent.payment_method?.id,
            ratePlanId,
            guest,
            specialRequests,
          },
        });
        if (error) {
          toast.error("Payment captured but booking confirmation failed. We'll email you shortly.");
          setIsProcessing(false);
          return;
        }
        toast.success("Booking confirmed!");
        onSuccess?.(data);
      } catch {
        toast.error("Payment captured but booking confirmation failed. Please contact support.");
        setIsProcessing(false);
      }
    } else {
      toast.error(`Payment status: ${paymentIntent?.status || "unknown"}`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="stripe-elements-form">
      <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
        <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-4 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-[#C9A84C]" />
          Pay Securely
        </h2>
        <p className="text-[#A1A1AA] text-sm mb-6">
          Your card is processed directly by Stripe and never touches our servers.
        </p>

        <div className="bg-[#0F0F10] border border-white/10 p-4">
          {/* Stripe-hosted Element renders here */}
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: `${guest.firstName} ${guest.lastName}`,
                  email: guest.email,
                  phone: guest.phone,
                },
              },
            }}
          />
        </div>

        {errMessage && (
          <p className="text-red-400 text-sm mt-3" data-testid="stripe-error">
            {errMessage}
          </p>
        )}

        <div className="flex items-center gap-6 text-[#A1A1AA] text-xs mt-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>PCI DSS via Stripe</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none uppercase tracking-widest py-6 text-sm font-semibold btn-gold-glow disabled:opacity-50"
        data-testid="stripe-pay-btn"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing payment…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay {formatMoney(amount, currency)}
          </>
        )}
      </Button>

      <p className="text-[10px] text-[#71717A] text-center">
        Card details are tokenised by Stripe and passed to your Guesty reservation as
        ccToken — canonical BEAPI flow. We never store your card number.
      </p>
    </form>
  );
}

/**
 * StripeInlinePayment — wraps PaymentForm with <Elements provider>.
 * Lazily fetches a PaymentIntent from /api/payments/create-intent.
 */
export const StripeInlinePayment = ({
  quoteId,
  ratePlanId,
  guest,
  specialRequests,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!PUBLISHABLE_KEY) {
      setLoadError("Stripe is not configured (REACT_APP_STRIPE_PUBLISHABLE_KEY missing).");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("payments-create-intent", {
          body: { quoteId, ratePlanId, guest, specialRequests },
        });
        if (cancelled) {
return;
}
        if (error || !data?.clientSecret) {
          setLoadError("Could not initialise payment. Please try again or contact support.");
          return;
        }
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setAmount(data.amount);
        setCurrency(data.currency || "EUR");
      } catch {
        if (!cancelled) {
setLoadError("Network error while initialising payment.");
}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quoteId, ratePlanId, guest, specialRequests]);

  if (loadError) {
    return (
      <div className="bg-[#161618] border border-red-500/30 p-6 text-sm text-red-300" data-testid="stripe-load-error">
        {loadError}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-[#161618] border border-white/10 p-6 flex items-center gap-3 text-[#A1A1AA]" data-testid="stripe-loading">
        <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
        Preparing secure payment…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#C9A84C",
            colorBackground: "#0F0F10",
            colorText: "#F5F5F0",
            colorTextSecondary: "#A1A1AA",
            colorDanger: "#EF4444",
            fontFamily: "'Manrope', system-ui, sans-serif",
            borderRadius: "0px",
            spacingUnit: "4px",
          },
        },
      }}
    >
      <PaymentForm
        quoteId={quoteId}
        ratePlanId={ratePlanId}
        guest={guest}
        specialRequests={specialRequests}
        amount={amount}
        currency={currency}
        paymentIntentId={paymentIntentId}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

export default StripeInlinePayment;
