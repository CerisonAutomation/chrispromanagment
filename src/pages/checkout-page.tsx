// TODO: Fix eslint issues and remove this blanket disable
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Loader2, AlertCircle, CreditCard, User, Mail, Phone, Shield, Clock, 
  Check, ChevronRight, Calendar, MapPin, Users, Info, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { buildBreakdown, formatMoney, describeCancellationPolicy } from "@/lib/guestyPricing";
import { StripeInlinePayment } from "@/components/stripe-inline-payment";
import CheckoutExtrasPanel from "@/components/checkout-extras-panel";
import { guesty } from "@/lib/guesty";

export const CheckoutPage = () => {
  const { quoteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Refs for auto-focus
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const [quote, setQuote] = useState(null);
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: details, 2: review, 3: payment
  const [quoteExpiry, setQuoteExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  // Fetch quote and listing
  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  // Quote expiry countdown
  useEffect(() => {
    if (!quoteExpiry) {
return;
}
    
    const interval = setInterval(() => {
      const now = new Date();
      const expiry = new Date(quoteExpiry);
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      
      if (diff <= 0) {
        setError("Your quote has expired. Please select dates again.");
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [quoteExpiry]);

  // Auto-focus first empty field
  useEffect(() => {
    if (step === 1 && !isLoading) {
      setTimeout(() => {
        if (!guestInfo.firstName && firstNameRef.current) {
          firstNameRef.current.focus();
        }
      }, 100);
    }
  }, [step, isLoading]);

  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const quoteData = await guesty.getQuote(quoteId);
      setQuote(quoteData);
      setQuoteExpiry(quoteData?.expiresAt);

      if (quoteData?.listingId) {
        try {
          const listingData = await guesty.listing(quoteData.listingId);
          setListing(listingData);
        } catch (e) {
          
        }
      }
    } catch (err) {
      
      setError("Unable to load booking details. The quote may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validation
  const validateField = useCallback((field, value) => {
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim().length >= 2 ? "" : "At least 2 characters required";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Invalid email address";
      case "phone":
        return /^\+?[\d\s-()]{8,}$/.test(value) ? "" : "Invalid phone number";
      default:
        return "";
    }
  }, []);

  const validateAllFields = () => {
    const newErrors = {};
    Object.entries(guestInfo).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
newErrors[field] = error;
}
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setGuestInfo(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, guestInfo[field]) }));
  };

  // Auto-advance to next field
  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter" && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleContinue = () => {
    if (!validateAllFields()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    // The canonical inline Stripe Elements flow is handled by <StripeInlinePayment>.
    // We keep this stub so the legacy <form onSubmit> in step 2 doesn't trigger a
    // navigation; the actual confirm happens inside StripeInlinePayment.
    e?.preventDefault?.();
  };

  const formatPrice = (price, currency = "EUR") => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) {
return "";
}
    return format(new Date(dateStr), "EEE, MMM d, yyyy");
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1AA]">Loading your booking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-32 text-center px-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
          {error || "Quote not found"}
        </h1>
        <p className="text-[#A1A1AA] mb-8 max-w-md mx-auto">
          Please try selecting your dates again on the property page.
        </p>
        <Button
          onClick={() => navigate(listing ? `/property/${listing._id}` : "/properties")}
          className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Pick rate plan: honor URL param (?ratePlanId=...) else default to first
  const ratePlans = quote.rates?.ratePlans || [];
  const urlRatePlanId = searchParams.get("ratePlanId");
  const ratePlanWrapper =
    (urlRatePlanId &&
      ratePlans.find(
        (rp) => (rp.ratePlan?._id || rp._id) === urlRatePlanId
      )) ||
    ratePlans[0] ||
    null;
  const ratePlanMeta = ratePlanWrapper?.ratePlan || ratePlanWrapper || null;
  // Money can be at ratePlan.money OR ratePlan.ratePlan.money depending on BEAPI version
  const money = ratePlanMeta?.money || ratePlanWrapper?.money;
  const days = ratePlanWrapper?.days || [];
  const nights = days.length || differenceInDays(new Date(quote.checkOutDateLocalized), new Date(quote.checkInDateLocalized));
  const breakdown = ratePlanWrapper ? buildBreakdown(ratePlanWrapper) : null;
  const cancellation = describeCancellationPolicy(ratePlanMeta);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-16" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#C9A84C] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]">
              Complete Your Booking
            </h1>
          </div>
          
          {/* Timer */}
          {timeLeft && timeLeft < 900 && (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Quote expires in {formatTimeLeft(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { num: 1, label: "Your Details" },
            { num: 2, label: "Review & Pay" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s.num
                    ? "bg-[#C9A84C] text-[#0F0F10]"
                    : "bg-white/10 text-[#A1A1AA]"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`ml-2 text-sm ${step >= s.num ? "text-[#F5F5F0]" : "text-[#A1A1AA]"}`}>
                {s.label}
              </span>
              {i < 1 && <ChevronRight className="w-4 h-4 mx-4 text-[#A1A1AA]" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          {/* Main Content */}
          <div>
            {step === 1 && (
              <div className="space-y-6">
                {/* Guest Information */}
                <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
                  <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-6 flex items-center gap-3">
                    <User className="w-5 h-5 text-[#C9A84C]" />
                    Guest Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">First Name *</label>
                      <Input
                        ref={firstNameRef}
                        type="text"
                        value={guestInfo.firstName}
                        onChange={(e) => handleFieldChange("firstName", e.target.value)}
                        onBlur={() => handleFieldBlur("firstName")}
                        onKeyDown={(e) => handleKeyDown(e, lastNameRef)}
                        className={`bg-[#0F0F10] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#C9A84C] ${
                          errors.firstName && touched.firstName ? "border-red-500" : ""
                        }`}
                        placeholder="John"
                        data-testid="guest-firstname"
                        autoComplete="given-name"
                      />
                      {errors.firstName && touched.firstName && (
                        <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Last Name *</label>
                      <Input
                        ref={lastNameRef}
                        type="text"
                        value={guestInfo.lastName}
                        onChange={(e) => handleFieldChange("lastName", e.target.value)}
                        onBlur={() => handleFieldBlur("lastName")}
                        onKeyDown={(e) => handleKeyDown(e, emailRef)}
                        className={`bg-[#0F0F10] border-white/10 rounded-none text-[#F5F5F0] focus-visible:ring-[#C9A84C] ${
                          errors.lastName && touched.lastName ? "border-red-500" : ""
                        }`}
                        placeholder="Doe"
                        data-testid="guest-lastname"
                        autoComplete="family-name"
                      />
                      {errors.lastName && touched.lastName && (
                        <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                        <Input
                          ref={emailRef}
                          type="email"
                          value={guestInfo.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          onBlur={() => handleFieldBlur("email")}
                          onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                          className={`bg-[#0F0F10] border-white/10 rounded-none text-[#F5F5F0] pl-10 focus-visible:ring-[#C9A84C] ${
                            errors.email && touched.email ? "border-red-500" : ""
                          }`}
                          placeholder="john@example.com"
                          data-testid="guest-email"
                          autoComplete="email"
                        />
                      </div>
                      {errors.email && touched.email && (
                        <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                        <Input
                          ref={phoneRef}
                          type="tel"
                          value={guestInfo.phone}
                          onChange={(e) => handleFieldChange("phone", e.target.value)}
                          onBlur={() => handleFieldBlur("phone")}
                          className={`bg-[#0F0F10] border-white/10 rounded-none text-[#F5F5F0] pl-10 focus-visible:ring-[#C9A84C] ${
                            errors.phone && touched.phone ? "border-red-500" : ""
                          }`}
                          placeholder="+356 1234 5678"
                          data-testid="guest-phone"
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone && touched.phone && (
                        <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
                  <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-4">
                    Special Requests
                  </h2>
                  <p className="text-[#A1A1AA] text-sm mb-4">
                    Let us know if you have any special requests (subject to availability).
                  </p>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0F0F10] border border-white/10 rounded-none text-[#F5F5F0] p-4 focus:border-[#C9A84C] focus:outline-none resize-none"
                    placeholder="E.g., dietary requirements, accessibility needs..."
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none uppercase tracking-widest py-6 text-sm font-semibold btn-gold-glow"
                >
                  Continue to Review
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Review Details */}
                <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] flex items-center gap-3">
                      <User className="w-5 h-5 text-[#C9A84C]" />
                      Your Details
                    </h2>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[#C9A84C] text-sm hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#A1A1AA]">Name:</span>
                      <span className="text-[#F5F5F0] ml-2">{guestInfo.firstName} {guestInfo.lastName}</span>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Email:</span>
                      <span className="text-[#F5F5F0] ml-2">{guestInfo.email}</span>
                    </div>
                    <div>
                      <span className="text-[#A1A1AA]">Phone:</span>
                      <span className="text-[#F5F5F0] ml-2">{guestInfo.phone}</span>
                    </div>
                    {specialRequests && (
                      <div className="md:col-span-2">
                        <span className="text-[#A1A1AA]">Special Requests:</span>
                        <span className="text-[#F5F5F0] ml-2">{specialRequests}</span>
                      </div>
                    )}
                    {ratePlanMeta?.name && (
                      <div className="md:col-span-2">
                        <span className="text-[#A1A1AA]">Rate plan:</span>
                        <span className="text-[#C9A84C] ml-2">{ratePlanMeta.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Policies */}
                <div className="bg-[#161618] border border-white/10 p-6 md:p-8">
                  <h2 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-4">
                    Important Information
                  </h2>
                  <ul className="space-y-3 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      <span>Check-in: 4:00 PM • Check-out: 11:00 AM</span>
                    </li>
                    {cancellation && (
                      <li className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                        <span>Cancellation: {cancellation.label}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      <span>A valid ID or passport is required upon check-in</span>
                    </li>
                  </ul>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-1 border-white/20 data-[state=checked]:bg-[#C9A84C] data-[state=checked]:border-[#C9A84C]"
                    data-testid="accept-terms"
                  />
                  <label htmlFor="terms" className="text-[#A1A1AA] text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" className="text-[#C9A84C] hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy-policy" className="text-[#C9A84C] hover:underline">
                      Privacy Policy
                    </a>
                    . I understand my booking is subject to the property's cancellation policy.
                  </label>
                </div>

                {/* Coupon + payment provider info (uses canonical Guesty hooks) */}
                <CheckoutExtrasPanel
                  quoteId={quoteId}
                  listingId={quote?.listingId}
                  onQuoteUpdate={(q) => {
 setQuote(q); setQuoteExpiry(q?.expiresAt); 
}}
                />

                {/* Canonical Stripe Elements payment — inline, no redirect */}
                {acceptTerms ? (
                  <StripeInlinePayment
                    quoteId={quoteId}
                    ratePlanId={
                      searchParams.get("ratePlanId") ||
                      ratePlanMeta?._id ||
                      null
                    }
                    guest={guestInfo}
                    specialRequests={specialRequests}
                    onSuccess={(data) => {
                      const code = data?.confirmationCode || data?.reservationId;
                      navigate(
                        `/confirmation?reservation_id=${encodeURIComponent(
                          data?.reservationId || ""
                        )}&code=${encodeURIComponent(code || "")}`
                      );
                    }}
                  />
                ) : (
                  <div className="bg-[#161618] border border-dashed border-white/15 p-6 text-center text-[#A1A1AA] text-sm" data-testid="terms-required-notice">
                    Accept the terms above to load the secure payment form.
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Booking Summary - Sticky */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-[#161618] border border-white/10 overflow-hidden" data-testid="booking-summary">
              {/* Property Image */}
              {listing?.picture && (
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={listing.picture.large || listing.picture.original}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0F0F10] to-transparent p-4">
                    <h3 className="font-['Playfair_Display'] text-lg text-[#F5F5F0]">
                      {listing.title}
                    </h3>
                    {listing.address?.city && (
                      <p className="text-[#A1A1AA] text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.address.city}, Malta
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Dates & Guests */}
                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#C9A84C]" />
                    <div>
                      <span className="text-[#F5F5F0]">{formatDate(quote.checkInDateLocalized)}</span>
                      <span className="text-[#A1A1AA] mx-2">→</span>
                      <span className="text-[#F5F5F0]">{formatDate(quote.checkOutDateLocalized)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-[#C9A84C]" />
                    <span className="text-[#F5F5F0]">{quote.guestsCount} guest{quote.guestsCount > 1 ? "s" : ""}</span>
                    <span className="text-[#A1A1AA]">• {nights} night{nights > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Price Breakdown — pulled directly from Guesty invoiceItems */}
                {breakdown && (
                  <div className="space-y-3 mb-6" data-testid="checkout-breakdown">
                    {ratePlanMeta?.name && (
                      <p className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-medium">
                        {ratePlanMeta.name}
                      </p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A1A1AA]">
                        Subtotal {nights ? `(${nights} night${nights > 1 ? "s" : ""})` : ""}
                      </span>
                      <span className="text-[#F5F5F0]">
                        {formatMoney(breakdown.subtotal, breakdown.currency)}
                      </span>
                    </div>

                    {breakdown.fees.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                          <span className="text-[#F5F5F0]">Fees</span>
                          <span className="text-[#F5F5F0]">
                            {formatMoney(breakdown.feesTotal, breakdown.currency)}
                          </span>
                        </div>
                        {breakdown.fees.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs pl-3">
                            <span className="text-[#A1A1AA]">{item.title}</span>
                            <span className="text-[#A1A1AA]">
                              {formatMoney(item.amount, item.currency || breakdown.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                      <span className="text-[#A1A1AA]">Subtotal before taxes</span>
                      <span className="text-[#F5F5F0]">
                        {formatMoney(breakdown.subtotalBeforeTaxes, breakdown.currency)}
                      </span>
                    </div>

                    {breakdown.taxes.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                          <span className="text-[#F5F5F0]">Taxes</span>
                          <span className="text-[#F5F5F0]">
                            {formatMoney(breakdown.taxesTotal, breakdown.currency)}
                          </span>
                        </div>
                        {breakdown.taxes.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs pl-3">
                            <span className="text-[#A1A1AA]">{item.title}</span>
                            <span className="text-[#A1A1AA]">
                              {formatMoney(item.amount, item.currency || breakdown.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                {breakdown && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[#F5F5F0] font-semibold">Total</span>
                      <span className="font-['Playfair_Display'] text-2xl text-[#C9A84C]" data-testid="checkout-total">
                        {formatMoney(breakdown.total, breakdown.currency)}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717A] mt-2">
                      Includes all fees & taxes from Guesty
                    </p>
                  </div>
                )}

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-[#A1A1AA] text-xs">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
