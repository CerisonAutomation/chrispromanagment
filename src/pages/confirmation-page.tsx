import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, Calendar, Users, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  // New inline-Elements flow passes reservation_id + code directly (no polling needed)
  const directReservationId = searchParams.get("reservation_id");
  const directCode = searchParams.get("code");

  const [status, setStatus] = useState("loading"); // loading, success, failed, error
  const [transaction, setTransaction] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const maxAttempts = 10;

  const checkPaymentStatus = useCallback(async () => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    try {
      const response = await axios.get(`${API}/checkout/status/${sessionId}`);
      const data = response.data;

      if (data.payment_status === "paid") {
        setStatus("success");
        setTransaction(data);
        return true; // Stop polling
      } else if (data.status === "expired" || data.payment_status === "expired") {
        setStatus("failed");
        return true; // Stop polling
      }
      
      return false; // Continue polling
    } catch (error) {
      console.error("Error checking payment status:", error);
      // Try to get transaction details even if status check fails
      try {
        const txResponse = await axios.get(`${API}/transaction/${sessionId}`);
        if (txResponse.data) {
          setTransaction(txResponse.data);
          if (txResponse.data.payment_status === "paid") {
            setStatus("success");
            return true;
          }
        }
      } catch (txError) {
        console.error("Error fetching transaction:", txError);
      }
      return false;
    }
  }, [sessionId]);

  useEffect(() => {
    // Canonical inline-Elements path: reservation already created, jump straight to success
    if (directReservationId || directCode) {
      setTransaction({
        reservation_id: directReservationId,
        confirmation_code: directCode,
        payment_status: "paid",
      });
      setStatus("success");
      return;
    }

    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Legacy Stripe Checkout polling path
    const pollStatus = async () => {
      const shouldStop = await checkPaymentStatus();
      if (!shouldStop && pollAttempts < maxAttempts) {
        setPollAttempts((prev) => prev + 1);
      } else if (!shouldStop && pollAttempts >= maxAttempts) {
        const finalCheck = await checkPaymentStatus();
        if (!finalCheck) {
          setStatus("pending");
        }
      }
    };

    pollStatus();
  }, [pollAttempts, checkPaymentStatus, sessionId, directReservationId, directCode]);

  useEffect(() => {
    if (pollAttempts > 0 && pollAttempts < maxAttempts && status === "loading") {
      const timer = setTimeout(() => {
        setPollAttempts((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pollAttempts, status]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price, currency = "EUR") => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mx-auto mb-6" />
          <h1 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-2">
            Confirming Your Booking
          </h1>
          <p className="text-[#A1A1AA]">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  // Pending state (payment processing taking longer)
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-32 px-6 text-center">
        <Loader2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-6 animate-spin" />
        <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-4">
          Payment Processing
        </h1>
        <p className="text-[#A1A1AA] max-w-md mx-auto mb-8">
          Your payment is being processed. This may take a few moments. 
          You will receive a confirmation email once complete.
        </p>
        <Button
          onClick={() => {
            setStatus("loading");
            setPollAttempts(0);
          }}
          className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
        >
          Check Again
        </Button>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-32 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-4">
          Something Went Wrong
        </h1>
        <p className="text-[#A1A1AA] max-w-md mx-auto mb-8">
          We couldn't find your booking confirmation. Please check your email or contact us for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/properties")}
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none"
          >
            Browse Properties
          </Button>
          <Button
            onClick={() => navigate("/#contact")}
            className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
          >
            Contact Us
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-32 px-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-4">
          Payment Failed
        </h1>
        <p className="text-[#A1A1AA] max-w-md mx-auto mb-8">
          Your payment could not be processed. Please try again or contact us for assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/properties")}
            variant="outline"
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/#contact")}
            className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
          >
            Contact Us
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 md:pt-32 pb-16" data-testid="confirmation-page">
      <div className="max-w-3xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-12">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-[#A1A1AA] text-lg">
            Thank you for your reservation. A confirmation email has been sent to your inbox.
          </p>
          {transaction?.confirmation_code && (
            <div className="mt-6 inline-block bg-[#161618] border border-[#D4AF37]/30 px-6 py-3">
              <span className="text-[#A1A1AA] text-sm block mb-1">Confirmation Code</span>
              <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                {transaction.confirmation_code}
              </span>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="bg-[#161618] border border-white/10 p-6 md:p-8 mb-8">
          <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-6">
            Booking Details
          </h2>

          <div className="space-y-4">
            {transaction?.check_in && (
              <div className="flex items-start gap-4 p-4 bg-[#0F0F10] border border-white/5">
                <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#A1A1AA] text-sm block mb-1">Dates</span>
                  <span className="text-[#F5F5F0]">
                    {formatDate(transaction.check_in)} - {formatDate(transaction.check_out)}
                  </span>
                </div>
              </div>
            )}

            {transaction?.guests_count && (
              <div className="flex items-start gap-4 p-4 bg-[#0F0F10] border border-white/5">
                <Users className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#A1A1AA] text-sm block mb-1">Guests</span>
                  <span className="text-[#F5F5F0]">
                    {transaction.guests_count} {transaction.guests_count === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              </div>
            )}

            {transaction?.guest_name && (
              <div className="flex items-start gap-4 p-4 bg-[#0F0F10] border border-white/5">
                <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#A1A1AA] text-sm block mb-1">Guest</span>
                  <span className="text-[#F5F5F0]">{transaction.guest_name}</span>
                  <span className="text-[#A1A1AA] text-sm block">{transaction.guest_email}</span>
                </div>
              </div>
            )}

            {transaction?.amount && (
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-[#F5F5F0] font-semibold">Total Paid</span>
                <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                  {formatPrice(transaction.amount, transaction.currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-[#161618] border border-white/10 p-6 md:p-8 mb-8">
          <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-6">
            What's Next?
          </h2>
          <div className="space-y-4 text-[#A1A1AA]">
            <p className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0F10] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                1
              </span>
              You'll receive a confirmation email with all the details of your booking.
            </p>
            <p className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0F10] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                2
              </span>
              A few days before your arrival, we'll send you check-in instructions and access details.
            </p>
            <p className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0F10] flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                3
              </span>
              Our team is available if you have any questions before or during your stay.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
          <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-6">
            Need Assistance?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:+35679790202"
              className="flex items-center gap-3 p-4 bg-[#0F0F10] border border-white/5 hover:border-[#D4AF37]/30 transition-colors"
            >
              <Phone className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#F5F5F0]">+356 7979 0202</span>
            </a>
            <a
              href="mailto:info@christianopropertymanagement.com"
              className="flex items-center gap-3 p-4 bg-[#0F0F10] border border-white/5 hover:border-[#D4AF37]/30 transition-colors"
            >
              <Mail className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[#F5F5F0]">info@christianopropertymanagement.com</span>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/")}
            className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest px-8 py-4"
            data-testid="back-home-btn"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
