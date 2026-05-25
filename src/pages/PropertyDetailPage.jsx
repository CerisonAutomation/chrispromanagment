import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Calendar,
  Info,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { getAmenityIcon, AMENITY_CATEGORIES, getAmenitiesByCategory, HIGHLIGHT_AMENITIES } from "@/lib/amenityIcons";
import { buildBreakdown, formatMoney, describeCancellationPolicy } from "@/lib/guestyPricing";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { guesty } from "@/lib/guesty";
import PropertyGallery from "@/components/media/PropertyGallery";

// Fix default marker icons for Leaflet under bundlers
const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [calendarData, setCalendarData] = useState(null);

  // Booking state
  const [checkIn, setCheckIn] = useState(() => {
    const param = searchParams.get("checkIn");
    return param ? new Date(param) : null;
  });
  const [checkOut, setCheckOut] = useState(() => {
    const param = searchParams.get("checkOut");
    return param ? new Date(param) : null;
  });
  const [guests, setGuests] = useState(2);
  const [selectedRatePlanIdx, setSelectedRatePlanIdx] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchListing();
    fetchCalendar();
  }, [id]);

  useEffect(() => {
    if (listing && checkIn && checkOut) {
      fetchQuote();
    }
  }, [listing, checkIn, checkOut, guests]);

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const data = await guesty.listing(id);
      setListing(data);
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load property details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      const data = await guesty.calendar(
        id,
        format(today, "yyyy-MM-dd"),
        format(futureDate, "yyyy-MM-dd")
      );
      setCalendarData(data);
    } catch (error) {
      console.warn("Calendar unavailable for this listing:", error?.message);
    }
  };

  // Get disabled/unavailable dates from calendar data
  const getDisabledDates = () => {
    // Guesty BEAPI returns days array directly or in a 'days' property
    const days = Array.isArray(calendarData) ? calendarData : calendarData?.days;
    if (!days) return [];
    return days
      .filter(day => day.status !== "available" || day.minNights > 30)
      .map(day => new Date(day.date));
  };

  const disabledDates = getDisabledDates();

  const fetchQuote = async () => {
    if (!listing || !checkIn || !checkOut) return;
    setIsQuoteLoading(true);
    try {
      const data = await guesty.createQuote({
        listingId: listing._id,
        checkInDateLocalized: format(checkIn, "yyyy-MM-dd"),
        checkOutDateLocalized: format(checkOut, "yyyy-MM-dd"),
        guestsCount: guests,
      });
      setQuote(data);
    } catch (error) {
      console.error("Error fetching quote:", error);
      const msg = error?.message || "";
      if (msg.toLowerCase().includes("unavail") || msg.includes("422") || msg.includes("400")) {
        toast.error("Selected dates are not available");
      } else {
        toast.error("Failed to get pricing. Please try different dates.");
      }
      setQuote(null);
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleDateSelect = (range) => {
    if (range?.from) {
      setCheckIn(range.from);
      if (range?.to) {
        setCheckOut(range.to);
      }
    }
  };

  const handleBookNow = () => {
    if (!quote) {
      toast.error("Please select dates to continue");
      return;
    }
    const ratePlanId = ratePlanMeta?._id || "";
    navigate(`/checkout/${quote._id}${ratePlanId ? `?ratePlanId=${ratePlanId}` : ""}`);
  };

  // ── Coupons (canonical Guesty BEAPI) ─────────────────────────
  const applyCoupon = async () => {
    if (!quote?._id || !couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const data = await guesty.applyCoupon(quote._id, couponInput.trim().toUpperCase());
      setQuote(data);
      setCouponInput("");
      toast.success("Coupon applied");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "This coupon code is invalid or has expired.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async (_code) => {
    // BEAPI coupon removal not exposed via canonical client — instruct guest to recreate quote.
    toast.info("Re-select dates to remove the coupon.");
  };

  const activeCoupons = quote?.coupons || quote?.rates?.coupons || [];

  // Gallery navigation
  const nextImage = () => {
    if (listing?.pictures) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.pictures.length);
    }
  };

  const prevImage = () => {
    if (listing?.pictures) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.pictures.length) % listing.pictures.length);
    }
  };

  // Format price
  const formatPrice = (price, currency = "EUR") => {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // All rate plans from Guesty quote (Non-refundable, Flexible, etc.)
  const ratePlans = quote?.rates?.ratePlans || [];
  // Reset selection when a brand new quote arrives
  useEffect(() => {
    setSelectedRatePlanIdx(0);
  }, [quote?._id]);

  const ratePlanWrapper = ratePlans[selectedRatePlanIdx] || ratePlans[0] || null;
  const ratePlanMeta = ratePlanWrapper?.ratePlan || ratePlanWrapper || null;
  const money = ratePlanMeta?.money || ratePlanWrapper?.money || null;
  const breakdown = ratePlanWrapper ? buildBreakdown(ratePlanWrapper) : null;
  const cancellation = describeCancellationPolicy(ratePlanMeta);
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-32 text-center">
        <h1 className="text-2xl text-[#F5F5F0]">Property not found</h1>
        <Button
          onClick={() => navigate("/properties")}
          className="mt-6 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  const images = listing.pictures || (listing.picture ? [listing.picture] : []);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-20 md:pt-24">
      {/* Gallery */}
      <section className="relative" data-testid="property-gallery">
        <div className="gallery-grid max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
          {images.slice(0, 5).map((img, index) => (
            <button
              key={index}
              onClick={() => { setCurrentImageIndex(index); setGalleryOpen(true); }}
              className={index === 0 ? "gallery-main" : ""}
              data-testid={`gallery-image-${index}`}
            >
              <img
                src={img.large || img.original || img.regular || img.thumbnail}
                alt={img.caption || `${listing.title} photo ${index + 1}`}
                onError={(e) => {
                  const srcs = [img.original, img.regular, img.thumbnail].filter(Boolean);
                  const i = srcs.indexOf(e.target.src);
                  if (i >= 0 && i < srcs.length - 1) e.target.src = srcs[i + 1];
                }}
              />
              {index === 4 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 pointer-events-none">
                  <span className="text-white font-semibold text-xl">+{images.length - 5} photos</span>
                </div>
              )}
            </button>
          ))}
        </div>
        {/* View all photos button */}
        {images.length > 1 && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-2">
            <button
              onClick={() => { setCurrentImageIndex(0); setGalleryOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#161618] border border-white/10 text-[#F5F5F0] text-sm hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all"
              data-testid="view-all-photos-btn"
            >
              <ChevronRight className="w-4 h-4" />
              View all {images.length} photos
            </button>
          </div>
        )}
      </section>

      {/* Lightbox — full-screen gallery viewer */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen bg-black border-none p-0 rounded-none">
          <div className="flex flex-col w-full h-full">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/80 shrink-0">
              <span className="text-white/60 text-sm font-medium">{listing.title}</span>
              <span className="text-white/60 text-sm">{currentImageIndex + 1} / {images.length}</span>
            </div>

            {/* Main image area */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden min-h-0">
              <img
                key={currentImageIndex}
                src={images[currentImageIndex]?.original || images[currentImageIndex]?.large || images[currentImageIndex]?.regular}
                alt={images[currentImageIndex]?.caption || `${listing.title} ${currentImageIndex + 1}`}
                style={{
                  maxWidth: "calc(100vw - 120px)",
                  maxHeight: "calc(100vh - 200px)",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              {/* Caption */}
              {images[currentImageIndex]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-8 py-4">
                  <p className="text-white/80 text-sm text-center italic">{images[currentImageIndex].caption}</p>
                </div>
              )}

              {/* Nav arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/10"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full border border-white/10"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Thumbnail strip */}
            <div className="shrink-0 bg-black/90 border-t border-white/10 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto justify-center" style={{ scrollbarWidth: "none" }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`flex-shrink-0 rounded overflow-hidden border-2 transition-all ${i === currentImageIndex ? "border-[#D4AF37] opacity-100" : "border-transparent opacity-50 hover:opacity-80"}`}
                    style={{ width: 56, height: 40 }}
                  >
                    <img
                      src={img.thumbnail || img.regular || img.original}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Main Content */}
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mb-3">
                <span className="uppercase tracking-widest">{listing.propertyType}</span>
                {listing.address?.city && (
                  <>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{listing.address.city}, Malta</span>
                  </>
                )}
              </div>
              <h1
                className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl text-[#F5F5F0] mb-6"
                data-testid="property-title"
              >
                {listing.title}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center gap-6 text-[#A1A1AA]">
                {listing.accommodates && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                    <span>{listing.accommodates} Guests</span>
                  </div>
                )}
                {listing.bedrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#D4AF37]" />
                    <span>{listing.bedrooms} Bedrooms</span>
                  </div>
                )}
                {listing.bathrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-[#D4AF37]" />
                    <span>{listing.bathrooms} Bathrooms</span>
                  </div>
                )}
              </div>

              {/* Reviews from Guesty */}
              {listing.reviews?.avg > 0 && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-[#D4AF37] fill-current" />
                    <span className="font-['Playfair_Display'] text-xl text-[#D4AF37]">
                      {listing.reviews.avg > 5 ? (listing.reviews.avg / 2).toFixed(1) : listing.reviews.avg.toFixed(1)}
                    </span>
                    <span className="text-[#A1A1AA] text-sm">/5</span>
                  </div>
                  {listing.reviews.total > 0 && (
                    <span className="text-[#A1A1AA] text-sm">
                      · {listing.reviews.total} {listing.reviews.total === 1 ? "review" : "reviews"}
                    </span>
                  )}
                </div>
              )}

              {/* Check-in / Check-out times from Guesty */}
              {(listing.defaultCheckInTime || listing.defaultCheckOutTime) && (
                <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-white/5">
                  {listing.defaultCheckInTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[#A1A1AA]">Check-in:</span>
                      <span className="text-[#F5F5F0] font-medium">{listing.defaultCheckInTime}</span>
                    </div>
                  )}
                  {listing.defaultCheckOutTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[#A1A1AA]">Check-out:</span>
                      <span className="text-[#F5F5F0] font-medium">{listing.defaultCheckOutTime}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.publicDescription?.summary && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  About This Property
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.summary}
                </p>
              </div>
            )}

            {/* Space */}
            {listing.publicDescription?.space && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  The Space
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.space}
                </p>
              </div>
            )}

            {/* Access */}
            {listing.publicDescription?.access && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  Guest Access
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.access}
                </p>
              </div>
            )}

            {/* Neighborhood */}
            {listing.publicDescription?.neighborhood && !listing.address && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  The Neighborhood
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.neighborhood}
                </p>
              </div>
            )}

            {/* Transit */}
            {listing.publicDescription?.transit && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  Getting Around
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.transit}
                </p>
              </div>
            )}

            {/* Notes */}
            {listing.publicDescription?.notes && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  Additional Notes
                </h2>
                <p className="text-[#A1A1AA] leading-relaxed whitespace-pre-line">
                  {listing.publicDescription.notes}
                </p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-6">
                  Amenities
                </h2>
                {(() => {
                  // Group amenities by category using the new library
                  const categorized = getAmenitiesByCategory(listing.amenities);
                  const sortedCategories = Object.entries(categorized).sort((a, b) => {
                    const orderA = AMENITY_CATEGORIES[a[0]]?.order || 99;
                    const orderB = AMENITY_CATEGORIES[b[0]]?.order || 99;
                    return orderA - orderB;
                  });
                  
                  return sortedCategories.map(([category, amenities]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-3">
                        {AMENITY_CATEGORIES[category]?.label || category}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenities.map((amenity, index) => {
                          const { icon: Icon, label } = getAmenityIcon(amenity);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-[#161618] border border-white/5 hover:border-[#D4AF37]/20 transition-colors"
                            >
                              <Icon className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                              <span className="text-[#F5F5F0] text-sm">
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {/* House Rules */}
            {(listing.publicDescription?.houseRules || listing.unitTypeHouseRules) && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-6">
                  House Rules
                </h2>
                <div className="space-y-4">
                  {listing.unitTypeHouseRules?.houseRules && (
                    <>
                      {listing.unitTypeHouseRules.houseRules.smokingAllowed !== undefined && (
                        <div className="flex items-center gap-3">
                          {listing.unitTypeHouseRules.houseRules.smokingAllowed?.enabled ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-[#A1A1AA]">
                            Smoking {listing.unitTypeHouseRules.houseRules.smokingAllowed?.enabled ? "allowed" : "not allowed"}
                          </span>
                        </div>
                      )}
                      {listing.unitTypeHouseRules.houseRules.petsAllowed !== undefined && (
                        <div className="flex items-center gap-3">
                          {listing.unitTypeHouseRules.houseRules.petsAllowed?.enabled ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-[#A1A1AA]">
                            Pets {listing.unitTypeHouseRules.houseRules.petsAllowed?.enabled ? "allowed" : "not allowed"}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {listing.publicDescription?.houseRules && (
                    <p className="text-[#A1A1AA] whitespace-pre-line mt-4">
                      {listing.publicDescription.houseRules}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {listing.address && (
              <div className="mb-12">
                <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
                  Location
                </h2>
                <div className="flex items-start gap-3 text-[#A1A1AA] mb-6">
                  <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{listing.address.full || `${listing.address.street || ""}, ${listing.address.city || ""}, Malta`}</p>
                    {listing.publicDescription?.neighborhood && (
                      <p className="mt-2">{listing.publicDescription.neighborhood}</p>
                    )}
                  </div>
                </div>
                
                {/* Leaflet Map (open-source, no Google) */}
                {listing.address?.lat && listing.address?.lng ? (
                  <div className="aspect-video w-full bg-[#161618] border border-white/5 overflow-hidden" data-testid="property-leaflet-map">
                    <MapContainer
                      center={[listing.address.lat, listing.address.lng]}
                      zoom={15}
                      scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[listing.address.lat, listing.address.lng]} icon={DEFAULT_ICON}>
                        <Popup>{listing.title}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Booking Widget */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-[#161618] border border-white/10 p-6 md:p-8" data-testid="booking-widget">
              {/* Price — from Guesty quote when available, else from listing.prices.basePrice */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-['Playfair_Display'] text-3xl text-[#D4AF37]" data-testid="nightly-price">
                    {breakdown && nights > 0
                      ? formatMoney(breakdown.subtotal / nights, breakdown.currency)
                      : formatPrice(listing.prices?.basePrice || 0, listing.prices?.currency)}
                  </span>
                  <span className="text-[#A1A1AA]">/night</span>
                </div>
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="form-label">Check-in / Check-out</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full flex items-center gap-3 p-4 bg-[#0F0F10] border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-left"
                      data-testid="booking-date-picker"
                    >
                      <Calendar className="w-5 h-5 text-[#D4AF37]" />
                      <span className="text-[#F5F5F0]">
                        {checkIn && checkOut
                          ? `${format(checkIn, "MMM d")} - ${format(checkOut, "MMM d, yyyy")}`
                          : "Select dates"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#161618] border-white/10" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: checkIn, to: checkOut }}
                      onSelect={handleDateSelect}
                      numberOfMonths={2}
                      disabled={[
                        { before: new Date() },
                        ...disabledDates.map(d => d)
                      ]}
                      className="bg-[#161618] text-[#F5F5F0]"
                      modifiers={{
                        unavailable: disabledDates
                      }}
                      modifiersStyles={{
                        unavailable: { 
                          textDecoration: 'line-through',
                          opacity: 0.3
                        }
                      }}
                    />
                    {calendarData && (
                      <div className="px-4 py-2 border-t border-white/10 text-[10px] text-[#A1A1AA]">
                        Strikethrough dates are unavailable
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests */}
              <div className="mb-6">
                <label className="form-label">Guests</label>
                <div className="flex items-center justify-between p-4 bg-[#0F0F10] border border-white/10">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-none border-white/20 hover:border-[#D4AF37] hover:bg-transparent"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      data-testid="guests-decrement"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-[#F5F5F0]">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-none border-white/20 hover:border-[#D4AF37] hover:bg-transparent"
                      onClick={() => setGuests(Math.min(listing.accommodates || 20, guests + 1))}
                      data-testid="guests-increment"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quote/Price Breakdown — pulled directly from Guesty invoiceItems */}
              {isQuoteLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                </div>
              ) : quote && breakdown ? (
                <div className="mb-6 space-y-4" data-testid="quote-breakdown">
                  {/* Rate-plan selector (Non-refundable / Flexible) */}
                  {ratePlans.length > 1 && (
                    <div className="space-y-2">
                      <label className="form-label">Select preferred package</label>
                      {ratePlans.map((rp, i) => {
                        const meta = rp.ratePlan || rp;
                        const m = meta.money || rp.money || {};
                        const selected = i === selectedRatePlanIdx;
                        return (
                          <button
                            type="button"
                            key={meta._id || i}
                            onClick={() => setSelectedRatePlanIdx(i)}
                            className={`w-full text-left p-3 border transition-all ${
                              selected
                                ? "bg-[#D4AF37]/10 border-[#D4AF37]"
                                : "bg-[#0F0F10] border-white/10 hover:border-white/30"
                            }`}
                            data-testid={`rate-plan-${i}`}
                          >
                            <div className="flex justify-between items-center gap-3">
                              <span className={`text-sm font-medium ${selected ? "text-[#D4AF37]" : "text-[#F5F5F0]"}`}>
                                {meta.name || "Standard rate"}
                              </span>
                              <span className={`text-sm font-semibold ${selected ? "text-[#D4AF37]" : "text-[#F5F5F0]"}`}>
                                {formatMoney(m.hostPayout || 0, m.currency || breakdown.currency)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Cancellation policy hint */}
                  {cancellation && (
                    <div className="flex items-start gap-2 text-xs text-[#A1A1AA] bg-[#0F0F10] border border-white/5 p-3">
                      <Info className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>{cancellation.label}</span>
                    </div>
                  )}

                  {/* Coupon — canonical Guesty BEAPI /coupons */}
                  <div className="border-t border-white/5 pt-3">
                    {activeCoupons.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {activeCoupons.map((c) => {
                          const code = c.code || c;
                          return (
                            <div key={code} className="flex justify-between items-center text-xs">
                              <span className="text-[#D4AF37]">Coupon · {code}</span>
                              <button
                                type="button"
                                onClick={() => removeCoupon(code)}
                                className="text-[#A1A1AA] hover:text-[#F5F5F0] underline underline-offset-2"
                                disabled={couponLoading}
                                data-testid="remove-coupon-btn"
                              >
                                remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!couponOpen ? (
                      <button
                        type="button"
                        onClick={() => setCouponOpen(true)}
                        className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] underline underline-offset-2"
                        data-testid="toggle-coupon-btn"
                      >
                        I have a coupon
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="ENTER CODE"
                          className="flex-1 bg-[#0F0F10] border border-white/10 px-3 py-2 text-xs text-[#F5F5F0] focus:border-[#D4AF37] focus:outline-none uppercase tracking-widest"
                          data-testid="coupon-input"
                          onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        />
                        <Button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-xs px-3 py-2 h-auto"
                          data-testid="apply-coupon-btn"
                        >
                          {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Subtotal (accommodation) */}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A1A1AA]">
                      Subtotal {nights ? `(${nights} night${nights > 1 ? "s" : ""})` : ""}
                    </span>
                    <span className="text-[#F5F5F0]">
                      {formatMoney(breakdown.subtotal, breakdown.currency)}
                    </span>
                  </div>

                  {/* Fees (cleaning, processing, additional) */}
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

                  {/* Subtotal before taxes */}
                  <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                    <span className="text-[#A1A1AA]">Subtotal before taxes</span>
                    <span className="text-[#F5F5F0]">
                      {formatMoney(breakdown.subtotalBeforeTaxes, breakdown.currency)}
                    </span>
                  </div>

                  {/* Taxes (VAT, Eco Tax, City Tax) */}
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

                  {/* Total */}
                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
                    <span className="text-[#F5F5F0] font-semibold">Total</span>
                    <span className="font-['Playfair_Display'] text-2xl text-[#D4AF37]" data-testid="quote-total">
                      {formatMoney(breakdown.total, breakdown.currency)}
                    </span>
                  </div>
                </div>
              ) : checkIn && checkOut ? (
                <div className="mb-6 p-4 bg-[#0F0F10] border border-white/10">
                  <div className="flex items-center gap-2 text-[#A1A1AA]">
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Unable to get pricing for selected dates</span>
                  </div>
                </div>
              ) : null}

              {/* Book Button — label adapts to listing.bookingType (instant vs inquiry) */}
              <Button
                onClick={handleBookNow}
                disabled={!quote || isQuoteLoading}
                className="w-full bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest py-6 text-sm font-semibold btn-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="book-now-btn"
              >
                {!checkIn || !checkOut
                  ? "Select Dates"
                  : isQuoteLoading
                  ? "Loading..."
                  : (listing?.bookingType || "").toLowerCase() === "inquiry"
                  ? "Request to Book"
                  : "Book Now"}
              </Button>

              {/* Info */}
              <p className="text-center text-[#A1A1AA] text-xs mt-4">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
