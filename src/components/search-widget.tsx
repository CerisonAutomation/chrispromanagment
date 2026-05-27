import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Search, MapPin, Loader2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useFormPersist } from "@/hooks/use-form-persist";
import { useForm } from "react-hook-form";
import { format, parseISO, isValid } from "date-fns";

// Static fallback — shown when DB has no cities yet
const FALLBACK_LOCATIONS = [
  { city: "All Malta",    region: "All Locations",    popular: true },
  { city: "Valletta",     region: "South Eastern",    popular: true },
  { city: "Sliema",       region: "Northern Harbour", popular: true },
  { city: "St. Julian's", region: "Northern Harbour", popular: true },
  { city: "Paceville",    region: "Northern Harbour", popular: true },
  { city: "Gzira",        region: "Northern Harbour", popular: false },
  { city: "Mellieħa",     region: "Northern",         popular: true },
  { city: "Bugibba",      region: "Northern",         popular: false },
  { city: "Qawra",        region: "Northern",         popular: false },
  { city: "Mdina",        region: "Western",          popular: true },
  { city: "Gozo",         region: "Gozo",             popular: true },
];

type SearchForm = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

type Location = { city: string; region: string; popular: boolean };

function useLiveLocations() {
  const [locations, setLocations] = useState<Location[]>(FALLBACK_LOCATIONS);

  useEffect(() => {
    supabase
      .from("guesty_properties_cache")
      .select("city")
      .eq("active", true)
      .not("city", "is", null)
      .then(({ data }) => {
        if (!data?.length) {
return;
}
        const unique = [...new Set(data.map(r => r.city as string))].sort();
        const live: Location[] = [
          { city: "All Malta", region: "All Locations", popular: true },
          ...unique.map(c => ({
            city: c,
            region: "Malta",
            popular: FALLBACK_LOCATIONS.some(f => f.city === c && f.popular),
          })),
        ];
        setLocations(live);
      });
  }, []);

  return locations;
}

interface SearchWidgetProps {
  variant?: "hero" | "compact";
  initialFilters?: Partial<SearchForm>;
  className?: string;
}

export const SearchWidget = ({ variant = "hero", initialFilters = {}, className }: SearchWidgetProps) => {
  const navigate = useNavigate();
  const locations = useLiveLocations();
  const [isSearching, setIsSearching] = useState(false);
  const [locationInput, setLocationInput] = useState(initialFilters.city || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  const { register, watch, reset, setValue, getValues } = useForm<SearchForm>({
    defaultValues: {
      city: initialFilters.city || "",
      checkIn: initialFilters.checkIn || "",
      checkOut: initialFilters.checkOut || "",
      guests: initialFilters.guests || 2,
    },
  });

  useFormPersist("search", { watch, reset, exclude: [] });

  const guests = watch("guests");
  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");

  // Sync locationInput from form restore
  useEffect(() => {
    const saved = watch("city");
    if (saved && !locationInput) {
setLocationInput(saved);
}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click-outside to close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
setShowDropdown(false);
}
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
setShowGuestPicker(false);
}
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredLocations = locationInput
    ? locations.filter(
        l =>
          l.city.toLowerCase().includes(locationInput.toLowerCase()) ||
          l.region.toLowerCase().includes(locationInput.toLowerCase()),
      )
    : locations.filter(l => l.popular);

  const handleLocationSelect = useCallback((loc: Location) => {
    const val = loc.city === "All Malta" ? "" : loc.city;
    setValue("city", val);
    setLocationInput(loc.city === "All Malta" ? "" : loc.city);
    setShowDropdown(false);
  }, [setValue]);

  const clearLocation = () => {
    setValue("city", "");
    setLocationInput("");
    setShowDropdown(false);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const v = getValues();
    const params = new URLSearchParams();
    if (v.city) {
params.set("city", v.city);
}
    if (v.checkIn) {
params.set("checkIn", v.checkIn);
}
    if (v.checkOut) {
params.set("checkOut", v.checkOut);
}
    if (v.guests) {
params.set("guests", String(v.guests));
}
    await new Promise(r => setTimeout(r, 200));
    setIsSearching(false);
    navigate(`/properties?${params.toString()}`);
  };

  const formatDateDisplay = (d: string) => {
    if (!d) {
return null;
}
    const parsed = parseISO(d);
    return isValid(parsed) ? format(parsed, "MMM d") : null;
  };

  const isCompact = variant === "compact";

  // ─── COMPACT (horizontal bar) ─────────────────────────────────────────────
  if (isCompact) {
    return (
      <div className={cn("flex items-stretch bg-[#161618] border border-white/10 divide-x divide-white/10", className)}>
        {/* Check-in */}
        <div className="flex items-center gap-2 px-4 py-3 flex-1">
          <Calendar className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
          <div>
            <label className="block text-[10px] text-[#71717A] uppercase tracking-widest mb-0.5">Check-in</label>
            <input
              type="date"
              {...register("checkIn")}
              min={format(new Date(), "yyyy-MM-dd")}
              className="bg-transparent text-sm text-[#F5F5F0] outline-none w-full"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="flex items-center gap-2 px-4 py-3 flex-1">
          <Calendar className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
          <div>
            <label className="block text-[10px] text-[#71717A] uppercase tracking-widest mb-0.5">Check-out</label>
            <input
              type="date"
              {...register("checkOut")}
              min={checkIn || format(new Date(), "yyyy-MM-dd")}
              className="bg-transparent text-sm text-[#F5F5F0] outline-none w-full"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Users className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
          <div>
            <p className="text-[10px] text-[#71717A] uppercase tracking-widest mb-0.5">Guests</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setValue("guests", Math.max(1, guests - 1))}
                className="w-6 h-6 flex items-center justify-center border border-white/10 text-[#F5F5F0] hover:border-[#C9A84C] transition-colors text-sm leading-none"
              >−</button>
              <span className="text-sm text-[#F5F5F0] w-4 text-center font-medium">{guests}</span>
              <button
                type="button"
                onClick={() => setValue("guests", Math.min(20, guests + 1))}
                className="w-6 h-6 flex items-center justify-center border border-white/10 text-[#F5F5F0] hover:border-[#C9A84C] transition-colors text-sm leading-none"
              >+</button>
            </div>
          </div>
        </div>

        {/* Search */}
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none uppercase text-xs tracking-widest px-6 font-semibold self-stretch"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />Search</>}
        </Button>
      </div>
    );
  }

  // ─── HERO (horizontal bar — mobile + desktop) ─────────────────────────────
  return (
    <div
      className={cn(
        "bg-[#161618]/95 backdrop-blur-md border border-white/10 shadow-2xl",
        className,
      )}
      data-testid="search-widget"
    >
      <div className="flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-white/10">

        {/* Location */}
        <div className="relative flex-[1.4]" ref={locationRef}>
          <button
            className="w-full h-full px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            onClick={() => setShowDropdown(v => !v)}
            type="button"
          >
            <MapPin className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-[#71717A] mb-0.5">Location</p>
              <input
                type="text"
                value={locationInput}
                onChange={e => {
 setLocationInput(e.target.value); setShowDropdown(true); 
}}
                onFocus={() => setShowDropdown(true)}
                placeholder="All Malta"
                className="w-full bg-transparent text-[#F5F5F0] font-medium placeholder:text-[#A1A1AA] outline-none"
                data-testid="location-input"
              />
            </div>
            {locationInput ? (
              <button
                onClick={e => {
 e.stopPropagation(); clearLocation(); 
}}
                className="text-[#71717A] hover:text-[#F5F5F0] flex-shrink-0"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <ChevronDown className="w-4 h-4 text-[#71717A] flex-shrink-0" />
            )}
          </button>

          {showDropdown && (
            <LocationDropdown
              locations={filteredLocations}
              onSelect={handleLocationSelect}
              input={locationInput}
            />
          )}
        </div>

        {/* Check-in */}
        <div className="flex-1 px-5 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-0.5">Check-in</label>
            <input
              type="date"
              {...register("checkIn")}
              min={format(new Date(), "yyyy-MM-dd")}
              className="w-full bg-transparent text-[#F5F5F0] font-medium outline-none"
              data-testid="checkin-input"
            />
            {checkIn && (
              <p className="text-xs text-[#C9A84C] mt-0.5">{formatDateDisplay(checkIn)}</p>
            )}
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1 px-5 py-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-[#71717A] mb-0.5">Check-out</label>
            <input
              type="date"
              {...register("checkOut")}
              min={checkIn || format(new Date(), "yyyy-MM-dd")}
              className="w-full bg-transparent text-[#F5F5F0] font-medium outline-none"
              data-testid="checkout-input"
            />
            {checkOut && (
              <p className="text-xs text-[#C9A84C] mt-0.5">{formatDateDisplay(checkOut)}</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div className="relative flex-1" ref={guestRef}>
          <button
            onClick={() => setShowGuestPicker(v => !v)}
            className="w-full h-full px-5 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            type="button"
            data-testid="guests-trigger"
          >
            <Users className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-[#71717A] mb-0.5">Guests</p>
              <p className="text-[#F5F5F0] font-medium">{guests} {guests === 1 ? "Guest" : "Guests"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#71717A] flex-shrink-0" />
          </button>

          {showGuestPicker && (
            <div className="absolute top-full left-0 w-64 mt-1 bg-[#161618] border border-white/10 p-4 z-50 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#F5F5F0] font-medium">Guests</p>
                  <p className="text-xs text-[#71717A]">Eco-tax: €0.50/adult/night</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setValue("guests", Math.max(1, guests - 1))}
                    className="w-8 h-8 flex items-center justify-center border border-white/10 text-[#F5F5F0] hover:border-[#C9A84C] transition-colors"
                    disabled={guests <= 1}
                    data-testid="guests-minus"
                  >-</button>
                  <span className="w-8 text-center text-[#F5F5F0] font-semibold" data-testid="guests-count">{guests}</span>
                  <button
                    onClick={() => setValue("guests", Math.min(20, guests + 1))}
                    className="w-8 h-8 flex items-center justify-center border border-white/10 text-[#F5F5F0] hover:border-[#C9A84C] transition-colors"
                    data-testid="guests-plus"
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:h-full px-8 py-4 bg-[#C9A84C] text-[#0F0F10] hover:bg-[#D4B85C] rounded-none uppercase text-sm tracking-widest font-semibold disabled:opacity-50"
            data-testid="search-btn"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Search className="w-5 h-5 mr-2" />Search</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Shared dropdown ──────────────────────────────────────────────────────────
function LocationDropdown({
  locations,
  onSelect,
  input,
}: {
  locations: Location[];
  onSelect: (l: Location) => void;
  input: string;
}) {
  return (
    <div className="absolute top-full left-0 right-0 md:min-w-72 mt-1 bg-[#161618] border border-white/10 max-h-72 overflow-y-auto z-50 shadow-2xl">
      {!input && (
        <p className="px-4 py-2 text-xs uppercase tracking-widest text-[#71717A] border-b border-white/5">
          Popular
        </p>
      )}
      {locations.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-[#71717A]">No locations found</p>
      ) : (
        locations.map((loc, i) => (
          <button
            key={i}
            onClick={() => onSelect(loc)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#C9A84C]/10 border-b border-white/5 last:border-0 transition-colors"
            type="button"
          >
            <MapPin className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F5F5F0]">{loc.city}</p>
              <p className="text-xs text-[#71717A]">{loc.region}</p>
            </div>
            {loc.popular && !input && (
              <span className="text-xs text-[#C9A84C]">Popular</span>
            )}
          </button>
        ))
      )}
    </div>
  );
}
