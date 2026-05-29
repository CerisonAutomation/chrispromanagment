import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, Bed, Bath, MapPin, Star } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

export const PropertyCard = ({ listing, checkIn, checkOut, guests, viewMode = "grid" }) => {
  const {
    _id,
    title,
    propertyType,
    accommodates,
    bedrooms,
    bathrooms,
    picture,
    pictures,
    prices,
    address,
    nightlyRates,
    reviews,
    publicDescription,
  } = listing;

  // Compute display price — MINIMUM nightlyRate for "From X" label (mirror Guesty)
  const displayPrice = useMemo(() => {
    if (nightlyRates && Object.keys(nightlyRates).length) {
      const rates = Object.values(nightlyRates).filter((v) => Number.isFinite(v) && v > 0);
      if (rates.length) return Math.min(...rates);
    }
    return Number.isFinite(prices?.basePrice) ? prices.basePrice : 0;
  }, [nightlyRates, prices?.basePrice]);

  const currency = useMemo(() => {
    const curr = prices?.currency;
    return typeof curr === "string" && curr.length === 3 ? curr : "EUR";
  }, [prices?.currency]);

  const formatPrice = (price, curr) => {
    const validCurrency = typeof curr === "string" && curr.length === 3 ? curr : "EUR";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: validCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price || 0);
    } catch {
      return `€${(price || 0).toFixed(2)}`;
    }
  };

  const locationText = useMemo(() => {
    return [address?.city || address?.neighborhood, address?.country]
      .filter(Boolean)
      .join(", ");
  }, [address]);

  // Description preview — mirror Guesty's long card descriptions
  const descriptionPreview = useMemo(() => {
    return (
      publicDescription?.summary ||
      publicDescription?.space ||
      publicDescription?.neighborhood ||
      ""
    );
  }, [publicDescription]);

  // Build link with all search context
  const buildLink = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    const queryString = params.toString();
    return `/property/${_id}${queryString ? `?${queryString}` : ""}`;
  };

  // Image sources
  const mainImage =
    picture?.large ||
    picture?.original ||
    pictures?.[0]?.large ||
    pictures?.[0]?.original;
  const imageSrcSet = useMemo(() => {
    const sources = [
      picture?.thumbnail && `${picture.thumbnail} 240w`,
      picture?.regular && `${picture.regular} 480w`,
      picture?.large && `${picture.large} 1024w`,
      picture?.original && `${picture.original} 1600w`,
    ].filter(Boolean);
    return sources.length > 0 ? sources.join(", ") : undefined;
  }, [picture]);

  const formatCount = (n, singular, plural) => {
    if (!Number.isFinite(n)) return null;
    if (n === 1) return `1 ${singular}`;
    return `${n} ${plural}`;
  };

  const handleImageError = (e) => {
    e.currentTarget.src = PLACEHOLDER_IMAGE;
    e.currentTarget.srcset = "";
  };

  const ariaLabel = useMemo(() => {
    const parts = [title];
    if (locationText) parts.push(locationText);
    if (displayPrice > 0) parts.push(`From ${formatPrice(displayPrice, currency)} per night`);
    return parts.join(". ");
  }, [title, locationText, displayPrice, currency]);

  // ─── Shared rating chip (mirrors Guesty's "4.85 (13 reviews)" — /5 scale) ───
  // Guesty BEAPI returns reviews.avg on a 10-point scale; display on /5 like the canonical Guesty booking site.
  const ratingOutOfFive = useMemo(() => {
    const avg = reviews?.avg;
    if (!Number.isFinite(avg) || avg <= 0) return null;
    // If value is already <=5 treat as /5, else convert from /10
    const scaled = avg > 5 ? avg / 2 : avg;
    // Round to nearest 0.05 to match Guesty's display (4.85, 4.65, etc.)
    return Math.round(scaled * 20) / 20;
  }, [reviews?.avg]);

  const RatingChip = () =>
    ratingOutOfFive ? (
      <div className="flex items-center gap-1 text-sm" data-testid="rating-chip">
        <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
        <span className="text-[#F5F5F0] font-medium">
          {ratingOutOfFive.toFixed(ratingOutOfFive % 1 === 0 ? 0 : 2)}
        </span>
        {reviews.total > 0 && (
          <span className="text-[#A1A1AA]">
            ({reviews.total} {reviews.total === 1 ? "review" : "reviews"})
          </span>
        )}
      </div>
    ) : null;

  // ─── Price & CTA block (mirrors Guesty "From €X Per night" + Book now) ───
  const PriceCTA = () => (
    <div className="flex items-end justify-between gap-4 pt-5 mt-5 border-t border-white/5">
      <div>
        {displayPrice > 0 ? (
          <>
            <span className="text-xs uppercase tracking-widest text-[#A1A1AA] block">
              From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]">
                {formatPrice(displayPrice, currency)}
              </span>
            </div>
            <span className="text-xs text-[#A1A1AA] block">Per night</span>
            <span className="text-[10px] text-[#71717A] block mt-0.5">
              Additional charges may apply
            </span>
          </>
        ) : (
          <span className="text-sm text-[#A1A1AA]">Price on request</span>
        )}
      </div>
      <span
        className="bg-[#D4AF37] text-[#0F0F10] text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-[#E5C158] transition-colors whitespace-nowrap"
        data-testid="book-now-card-btn"
      >
        Book now
      </span>
    </div>
  );

  // ════════ LIST VIEW ════════
  if (viewMode === "list") {
    return (
      <Link
        to={buildLink()}
        className="property-card group flex flex-col md:flex-row bg-[#161618] overflow-hidden card-gold-border"
        data-testid={`property-card-${_id}`}
        aria-label={ariaLabel}
      >
        <div className="relative w-full md:w-72 flex-shrink-0 overflow-hidden bg-[#27272A] aspect-[4/3] md:aspect-auto">
          <OptimizedImage
            src={mainImage || PLACEHOLDER_IMAGE}
            srcSet={imageSrcSet}
            sizes="(max-width: 768px) 100vw, 288px"
            alt={title || "Property"}
            className="property-image"
            onError={handleImageError}
          />
          {propertyType && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-xs uppercase tracking-widest bg-[#0F0F10]/80 backdrop-blur-sm text-[#F5F5F0] px-3 py-1.5">
                {propertyType}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">
                {title || "Untitled Property"}
              </h3>
              <RatingChip />
            </div>
            {locationText && (
              <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{locationText}</span>
              </div>
            )}
            {descriptionPreview && (
              <p className="text-[#A1A1AA] text-sm line-clamp-3 mb-4">
                {descriptionPreview}
              </p>
            )}
            <div className="flex items-center gap-6 text-[#A1A1AA] text-sm">
              {Number.isFinite(accommodates) && accommodates > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{accommodates} Guests</span>
                </div>
              )}
              {Number.isFinite(bedrooms) && (
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span>{formatCount(bedrooms, "Bedroom", "Bedrooms")}</span>
                </div>
              )}
              {Number.isFinite(bathrooms) && (
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  <span>{formatCount(bathrooms, "Bathroom", "Bathrooms")}</span>
                </div>
              )}
            </div>
          </div>
          <PriceCTA />
        </div>
      </Link>
    );
  }

  // ════════ GRID VIEW (default) — mirror Guesty exactly ════════
  return (
    <Link
      to={buildLink()}
      className="property-card group block bg-[#161618] overflow-hidden card-gold-border"
      data-testid={`property-card-${_id}`}
      aria-label={ariaLabel}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#27272A]">
        <OptimizedImage
          src={mainImage || PLACEHOLDER_IMAGE}
          srcSet={imageSrcSet}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={title || "Property"}
          className="property-image"
          onError={handleImageError}
        />
        {propertyType && (
          <div className="absolute top-4 left-4 z-10">
            <span className="text-xs uppercase tracking-widest bg-[#0F0F10]/80 backdrop-blur-sm text-[#F5F5F0] px-3 py-1.5">
              {propertyType}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col h-[calc(100%-300px)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-['Playfair_Display'] text-lg md:text-xl text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors line-clamp-2 flex-1">
            {title || "Untitled Property"}
          </h3>
        </div>

        <RatingChip />

        {locationText && (
          <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mt-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {descriptionPreview && (
          <p className="text-[#A1A1AA] text-sm line-clamp-3 mt-3" data-testid="card-description">
            {descriptionPreview}
          </p>
        )}

        <div className="flex items-center gap-4 text-[#A1A1AA] text-sm mt-4">
          {Number.isFinite(accommodates) && accommodates > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{accommodates} Guests</span>
            </div>
          )}
          {Number.isFinite(bedrooms) && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{formatCount(bedrooms, "Bedroom", "Bedrooms")}</span>
            </div>
          )}
          {Number.isFinite(bathrooms) && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{formatCount(bathrooms, "Bathroom", "Bathrooms")}</span>
            </div>
          )}
        </div>

        <PriceCTA />
      </div>
    </Link>
  );
};
