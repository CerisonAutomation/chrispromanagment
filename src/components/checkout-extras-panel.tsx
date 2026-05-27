// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePaymentProvider, useGuestyQuote } from "@/hooks/use-guesty";
import { toast } from "sonner";
import { Tag, CreditCard, Loader2, Check } from "lucide-react";

/**
 * Drop-in panel for the checkout page.
 * - Lets the guest apply a coupon to their quote (Guesty applyCoupon)
 * - Shows the listing's configured payment provider (Stripe, Adyen, etc.)
 *
 * Sits above the Stripe Elements card. Calls `onQuoteUpdate(newQuote)` when
 * a coupon is applied so the parent can refresh totals.
 */
interface CheckoutExtrasPanelProps {
  quoteId: string | null;
  listingId: string;
  onQuoteUpdate?: (quote: Record<string, unknown>) => void;
}

export default function CheckoutExtrasPanel({ quoteId, listingId, onQuoteUpdate }: CheckoutExtrasPanelProps) {
  const { provider, loading: providerLoading, error: providerError } = usePaymentProvider(listingId);
  const { applyCoupon, loading: couponLoading } = useGuestyQuote();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);

  const onApply = async (e) => {
    e?.preventDefault?.();
    if (!quoteId || !code.trim()) {
return;
}
    try {
      const updated = await applyCoupon(quoteId, code.trim());
      setApplied(code.trim());
      toast.success(`Coupon "${code.trim()}" applied`);
      onQuoteUpdate?.(updated);
    } catch (err) {
      toast.error(err?.message || "That coupon is invalid or already used");
      setApplied(null);
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Coupon */}
      <div className="bg-[#161618] border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-[#C9A84C]" />
          <h3 className="text-sm font-semibold text-[#F5F5F0]">Have a promo code?</h3>
        </div>
        <form onSubmit={onApply} className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="bg-[#0F0F10] border-white/10 text-[#F5F5F0] placeholder:text-[#5a5a5e] uppercase"
            disabled={couponLoading || !quoteId}
          />
          <Button type="submit" disabled={couponLoading || !code.trim() || !quoteId} variant="secondary">
            {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </form>
        {applied ? (
          <div className="flex items-center gap-1.5 text-xs text-green-400 mt-2">
            <Check className="h-3.5 w-3.5" /> Code {applied} applied — totals updated
          </div>
        ) : null}
      </div>

      {/* Payment provider info */}
      <div className="bg-[#161618] border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#C9A84C]" />
            <h3 className="text-sm font-semibold text-[#F5F5F0]">Secure payment</h3>
          </div>
          {providerLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#5a5a5e]" />
          ) : provider?.name || provider?.provider ? (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {provider.name || provider.provider}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-[#A1A1AA]">
          Your card is processed end-to-end by the listing's configured payment provider. We never see your full card details.
        </p>
        {providerError ? (
          <p className="text-xs text-amber-400 mt-2">Payment provider info unavailable — checkout still works.</p>
        ) : null}
      </div>
    </div>
  );
}