// ============================================================
// Guesty Pricing Helper — derives the FULL guest-facing breakdown
// directly from a Guesty quote's `rates.ratePlans[].money.invoiceItems`.
// Nothing is hardcoded: every line item, fee and tax visible to the
// guest comes straight from Guesty BEAPI.
// ============================================================

/**
 * Group all invoiceItems into the same buckets Guesty shows in its
 * native booking flow: Subtotal (accommodation), Fees, Taxes.
 *
 * Guesty `invoiceItems[]` shape:
 *   { title, amount, currency, type, normalType }
 *
 * Known `type` values: ACCOMMODATION_FARE, CLEANING_FEE, ADDITIONAL_FEE,
 * CITY_TAX, TAX, ADDITIONAL, CUSTOM, ADDITIONAL_INVOICE_ITEM ...
 *
 * Known `normalType` codes: AF (accommodation), CF (cleaning),
 * AFD (discount), TT (tourist tax), VAT, OF (other fee), PMC (PM commission), ...
 */
export function buildBreakdown(ratePlanWrapper) {
  if (!ratePlanWrapper) return null;
  const ratePlan = ratePlanWrapper.ratePlan || ratePlanWrapper;
  const money = ratePlanWrapper.money || ratePlan.money || {};
  const items = Array.isArray(money.invoiceItems) ? money.invoiceItems : [];

  const accommodation = [];
  const fees = [];
  const taxes = [];

  for (const item of items) {
    if (!item || typeof item.amount !== "number") continue;
    const t = (item.type || "").toUpperCase();
    const isTax = t === "TAX" || t === "CITY_TAX" || t === "TOURIST_TAX";
    const isAccommodation =
      t === "ACCOMMODATION_FARE" || item.normalType === "AF";
    if (isAccommodation) {
      accommodation.push(item);
    } else if (isTax) {
      taxes.push(item);
    } else {
      fees.push(item);
    }
  }

  // Fallbacks: if invoiceItems is empty (older Guesty payload), synthesise
  // the minimum breakdown from money.* numeric fields so we always show data.
  if (!items.length) {
    if (money.fareAccommodation) {
      accommodation.push({
        title: "Accommodation fare",
        amount: money.fareAccommodation,
        currency: money.currency,
      });
    }
    if (money.fareCleaning) {
      fees.push({
        title: "Cleaning fee",
        amount: money.fareCleaning,
        currency: money.currency,
      });
    }
    if (money.totalTaxes) {
      taxes.push({
        title: "Taxes",
        amount: money.totalTaxes,
        currency: money.currency,
      });
    }
  }

  const sum = (arr) => arr.reduce((s, i) => s + (i.amount || 0), 0);
  const subtotal = sum(accommodation);
  const feesTotal = sum(fees);
  const taxesTotal = sum(taxes);
  const subtotalBeforeTaxes =
    money.subTotalPrice ?? subtotal + feesTotal;
  // Guesty's hostPayout already includes accommodation + fees + taxes
  const total =
    money.hostPayout ??
    subtotal + feesTotal + taxesTotal;

  return {
    currency: money.currency || "EUR",
    accommodation,
    fees,
    taxes,
    subtotal,
    feesTotal,
    subtotalBeforeTaxes,
    taxesTotal,
    total,
    raw: money,
  };
}

/**
 * Format an amount as currency using Intl.
 */
export function formatMoney(amount, currency = "EUR") {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Pretty name for a Guesty cancellation policy.
 */
export function describeCancellationPolicy(ratePlan) {
  if (!ratePlan) return null;
  const policy = (ratePlan.cancellationPolicy || "").toLowerCase();
  if (!policy || policy === "non_refundable" || policy === "nonrefundable") {
    return { label: "Non-refundable", tone: "warn" };
  }
  if (policy === "flexible") {
    return { label: "Flexible cancellation", tone: "good" };
  }
  if (policy === "moderate") {
    return { label: "Moderate cancellation", tone: "good" };
  }
  if (policy === "strict") {
    return { label: "Strict cancellation", tone: "warn" };
  }
  return { label: ratePlan.cancellationPolicy, tone: "neutral" };
}
