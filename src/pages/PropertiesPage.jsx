import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  SlidersHorizontal, Grid, List, MapPin, Bed, Bath, Users, 
  ChevronDown, X, Loader2, AlertCircle, RefreshCw, Search,
  Wifi, Car, Snowflake, Utensils, Tv, WashingMachine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchWidget } from "@/components/SearchWidget";
import { guesty } from "@/lib/guesty";

// Malta locations for filtering
const MALTA_CITIES = [
  "All Locations",
  "Valletta",
  "St. Julian's",
  "Sliema",
  "Gzira",
  "Msida",
  "Pieta",
  "Swieqi",
  "San Gwann",
  "Pembroke",
  "Bahar ic-Caghaq",
  "Mellieha",
  "Madliena",
  "Gozo",
];

// Amenity filters
const AMENITY_FILTERS = [
  { key: "WIRELESS_INTERNET", label: "WiFi", icon: Wifi },
  { key: "AIR_CONDITIONING", label: "Air Conditioning", icon: Snowflake },
  { key: "FREE_PARKING_ON_PREMISES", label: "Free Parking", icon: Car },
  { key: "KITCHEN", label: "Kitchen", icon: Utensils },
  { key: "TV", label: "TV", icon: Tv },
  { key: "WASHER", label: "Washer", icon: WashingMachine },
];

export const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters from URL
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    guests: searchParams.get("guests") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    propertyType: searchParams.get("propertyType") || "",
  });

  // Fetch listings with retry logic
  const fetchListings = useCallback(async (currentFilters, attempt = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      
      if (currentFilters.city && currentFilters.city !== "All Locations") {
        params.set("city", currentFilters.city);
      }
      if (currentFilters.checkIn) params.set("checkIn", currentFilters.checkIn);
      if (currentFilters.checkOut) params.set("checkOut", currentFilters.checkOut);
      if (currentFilters.guests) params.set("minOccupancy", currentFilters.guests);
      if (currentFilters.bedrooms) params.set("numberOfBedrooms", currentFilters.bedrooms);
      if (currentFilters.bathrooms) params.set("numberOfBathrooms", currentFilters.bathrooms);
      if (currentFilters.minPrice) params.set("minPrice", currentFilters.minPrice);
      if (currentFilters.maxPrice) params.set("maxPrice", currentFilters.maxPrice);
      if (currentFilters.propertyType) params.set("propertyType", currentFilters.propertyType);
      if (currentFilters.amenities?.length > 0) {
        params.set("includeAmenities", currentFilters.amenities.join(","));
      }

      const response = await fetch(`${API_URL}/api/listings?${params.toString()}`, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to load properties (${response.status})`);
      }

      const data = await response.json();
      setListings(data.results || []);
      setTotalCount(data.pagination?.total || data.results?.length || 0);
      setRetryCount(0);
    } catch (err) {
      console.error("Error fetching listings:", err);
      
      // Retry logic with exponential backoff
      if (attempt < 3 && !err.name?.includes("Abort")) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms (attempt ${attempt + 1})...`);
        setTimeout(() => fetchListings(currentFilters, attempt + 1), delay);
        setRetryCount(attempt);
        return;
      }
      
      setError(err.message || "Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchListings(filters);
  }, []);

  // Update URL when filters change
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "" && (Array.isArray(value) ? value.length > 0 : true)) {
        params.set(key, Array.isArray(value) ? value.join(",") : value);
      }
    });
    setSearchParams(params);
    fetchListings(newFilters);
    setIsFilterOpen(false);
  }, [setSearchParams, fetchListings]);

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      city: "",
      checkIn: "",
      checkOut: "",
      guests: "",
      bedrooms: "",
      bathrooms: "",
      minPrice: "",
      maxPrice: "",
      amenities: [],
      propertyType: "",
    };
    applyFilters(clearedFilters);
  };

  // Sort listings
  const sortedListings = useMemo(() => {
    const sorted = [...listings];
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => (a.prices?.basePrice || 0) - (b.prices?.basePrice || 0));
      case "price-high":
        return sorted.sort((a, b) => (b.prices?.basePrice || 0) - (a.prices?.basePrice || 0));
      case "rating":
        return sorted.sort((a, b) => (b.reviews?.avg || 0) - (a.reviews?.avg || 0));
      case "bedrooms":
        return sorted.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
      default:
        return sorted;
    }
  }, [listings, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.amenities?.length > 0) count += filters.amenities.length;
    if (filters.propertyType) count++;
    return count;
  }, [filters]);

  const handleAmenityToggle = (amenityKey) => {
    const newAmenities = filters.amenities.includes(amenityKey)
      ? filters.amenities.filter(a => a !== amenityKey)
      : [...filters.amenities, amenityKey];
    setFilters({ ...filters, amenities: newAmenities });
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-16" data-testid="properties-page">
      {/* Header */}
      <div className="bg-[#0A0A0B] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-2">
                {filters.city && filters.city !== "All Locations" 
                  ? `Properties in ${filters.city}` 
                  : "All Properties in Malta"
                }
              </h1>
              <p className="text-[#A1A1AA]">
                {loading ? "Loading..." : `${totalCount} properties available`}
                {filters.checkIn && filters.checkOut && (
                  <span className="ml-2 text-[#D4AF37]">
                    • {filters.checkIn} to {filters.checkOut}
                  </span>
                )}
              </p>
            </div>
            
            {/* Quick Search */}
            <div className="flex items-center gap-4">
              <SearchWidget variant="compact" initialFilters={filters} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-[#0F0F10]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden border-white/10 text-[#F5F5F0] rounded-none"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 bg-[#D4AF37] text-[#0F0F10] text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[#0F0F10] border-r border-white/10 w-full sm:max-w-md p-0">
                  <SheetHeader className="p-6 border-b border-white/5">
                    <SheetTitle className="text-[#F5F5F0] text-left">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {/* Location Filter */}
                    <div>
                      <label className="form-label">Location</label>
                      <Select
                        value={filters.city || "All Locations"}
                        onValueChange={(v) => setFilters({ ...filters, city: v === "All Locations" ? "" : v })}
                      >
                        <SelectTrigger className="w-full bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161618] border-white/10">
                          {MALTA_CITIES.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bedrooms */}
                    <div>
                      <label className="form-label">Bedrooms</label>
                      <Select
                        value={filters.bedrooms || "any"}
                        onValueChange={(v) => setFilters({ ...filters, bedrooms: v === "any" ? "" : v })}
                      >
                        <SelectTrigger className="w-full bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161618] border-white/10">
                          <SelectItem value="any">Any</SelectItem>
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bathrooms */}
                    <div>
                      <label className="form-label">Bathrooms</label>
                      <Select
                        value={filters.bathrooms || "any"}
                        onValueChange={(v) => setFilters({ ...filters, bathrooms: v === "any" ? "" : v })}
                      >
                        <SelectTrigger className="w-full bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161618] border-white/10">
                          <SelectItem value="any">Any</SelectItem>
                          {[1, 2, 3, 4].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="form-label">Price Range (€/night)</label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                          className="w-full bg-transparent border border-white/10 px-3 py-2 text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                          className="w-full bg-transparent border border-white/10 px-3 py-2 text-[#F5F5F0] placeholder:text-[#71717A] focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="form-label">Property Type</label>
                      <Select
                        value={filters.propertyType || "any"}
                        onValueChange={(v) => setFilters({ ...filters, propertyType: v === "any" ? "" : v })}
                      >
                        <SelectTrigger className="w-full bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                          <SelectValue placeholder="Any Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#161618] border-white/10">
                          <SelectItem value="any">Any Type</SelectItem>
                          <SelectItem value="APARTMENT">Apartment</SelectItem>
                          <SelectItem value="HOUSE">House</SelectItem>
                          <SelectItem value="VILLA">Villa</SelectItem>
                          <SelectItem value="CONDOMINIUM">Condominium</SelectItem>
                          <SelectItem value="LOFT">Loft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="form-label">Amenities</label>
                      <div className="grid grid-cols-2 gap-3">
                        {AMENITY_FILTERS.map(amenity => (
                          <label
                            key={amenity.key}
                            className={`flex items-center gap-3 p-3 border transition-colors cursor-pointer ${
                              filters.amenities.includes(amenity.key)
                                ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <Checkbox
                              checked={filters.amenities.includes(amenity.key)}
                              onCheckedChange={() => handleAmenityToggle(amenity.key)}
                              className="border-white/30 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                            />
                            <amenity.icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span className="text-sm text-[#F5F5F0]">{amenity.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="p-6 border-t border-white/5 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 border-white/10 text-[#F5F5F0] rounded-none"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => applyFilters(filters)}
                      className="flex-1 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Inline Filters */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Location */}
                <Select
                  value={filters.city || "All Locations"}
                  onValueChange={(v) => applyFilters({ ...filters, city: v === "All Locations" ? "" : v })}
                >
                  <SelectTrigger className="w-40 bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                    <MapPin className="w-4 h-4 mr-2 text-[#A1A1AA]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161618] border-white/10">
                    {MALTA_CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bedrooms */}
                <Select
                  value={filters.bedrooms || "any"}
                  onValueChange={(v) => applyFilters({ ...filters, bedrooms: v === "any" ? "" : v })}
                >
                  <SelectTrigger className="w-32 bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                    <Bed className="w-4 h-4 mr-2 text-[#A1A1AA]" />
                    <SelectValue placeholder="Beds" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161618] border-white/10">
                    <SelectItem value="any">Any Beds</SelectItem>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}+ Beds</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Bathrooms */}
                <Select
                  value={filters.bathrooms || "any"}
                  onValueChange={(v) => applyFilters({ ...filters, bathrooms: v === "any" ? "" : v })}
                >
                  <SelectTrigger className="w-32 bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                    <Bath className="w-4 h-4 mr-2 text-[#A1A1AA]" />
                    <SelectValue placeholder="Baths" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161618] border-white/10">
                    <SelectItem value="any">Any Baths</SelectItem>
                    {[1, 2, 3, 4].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}+ Baths</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* More Filters Button */}
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  className="border-white/10 text-[#F5F5F0] rounded-none"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  More
                  {activeFilterCount > 3 && (
                    <span className="ml-2 bg-[#D4AF37] text-[#0F0F10] text-xs px-2 py-0.5 rounded-full">
                      +{activeFilterCount - 3}
                    </span>
                  )}
                </Button>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-[#A1A1AA] hover:text-[#D4AF37]"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Sort & View */}
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 bg-transparent border-white/10 text-[#F5F5F0] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161618] border-white/10">
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="bedrooms">Most Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex border border-white/10">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-white/10 text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#F5F5F0]"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-white/10 text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#F5F5F0]"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8">
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl text-[#F5F5F0] mb-2">Unable to Load Properties</h3>
            <p className="text-[#A1A1AA] mb-6 max-w-md">{error}</p>
            <Button
              onClick={() => fetchListings(filters)}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <p className="text-[#A1A1AA]">
              {retryCount > 0 ? `Retrying... (attempt ${retryCount + 1})` : "Loading properties..."}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-[#A1A1AA] mb-4" />
            <h3 className="text-xl text-[#F5F5F0] mb-2">No Properties Found</h3>
            <p className="text-[#A1A1AA] mb-6 max-w-md">
              Try adjusting your filters or search criteria to find available properties.
            </p>
            <Button
              onClick={clearFilters}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && sortedListings.length > 0 && (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }`}
            data-testid="properties-grid"
          >
            {sortedListings.map((listing) => (
              <PropertyCard
                key={listing._id}
                listing={listing}
                viewMode={viewMode}
                checkIn={filters.checkIn}
                checkOut={filters.checkOut}
              />
            ))}
          </div>
        )}
      </div>

      {/* Explore Map CTA (mirror Guesty native bookings) */}
      {!loading && !error && sortedListings.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-12">
          <div className="bg-[#161618] border border-white/5 p-8 md:p-12 text-center">
            <MapPin className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl text-[#F5F5F0] mb-3">
              Explore Map
            </h2>
            <p className="text-[#A1A1AA] mb-6 max-w-xl mx-auto">
              See every property's exact location across Malta and Gozo — pick the neighbourhood that fits your trip.
            </p>
            <Button
              onClick={() => navigate("/map")}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest px-6 py-3 text-xs"
              data-testid="explore-map-btn"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Open Map View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
