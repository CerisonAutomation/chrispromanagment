import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  MapPin, List, Grid, X, Bed, Bath, Users, Star, 
  ChevronLeft, ChevronRight, Loader2, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const MapPage = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // split, map, list

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", "100");
        params.set("fields", "_id title address picture prices accommodates bedrooms bathrooms reviews propertyType");
        
        const city = searchParams.get("city");
        if (city) params.set("city", city);
        
        const response = await fetch(`${API_URL}/api/listings?${params.toString()}`);
        const data = await response.json();
        setListings(data.results || []);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [searchParams]);

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    if (!listings.length) return null;
    
    const lats = listings.filter(l => l.address?.lat).map(l => l.address.lat);
    const lngs = listings.filter(l => l.address?.lng).map(l => l.address.lng);
    
    if (!lats.length || !lngs.length) return null;
    
    return {
      north: Math.max(...lats) + 0.01,
      south: Math.min(...lats) - 0.01,
      east: Math.max(...lngs) + 0.01,
      west: Math.min(...lngs) - 0.01,
      center: {
        lat: (Math.max(...lats) + Math.min(...lats)) / 2,
        lng: (Math.max(...lngs) + Math.min(...lngs)) / 2,
      }
    };
  }, [listings]);

  // Generate static map URL with markers
  const staticMapUrl = useMemo(() => {
    if (!listings.length || !GOOGLE_MAPS_KEY) return null;
    
    const markers = listings
      .filter(l => l.address?.lat && l.address?.lng)
      .slice(0, 50) // Google Maps API limit
      .map(l => `markers=color:0xD4AF37|${l.address.lat},${l.address.lng}`)
      .join('&');
    
    const center = mapBounds?.center 
      ? `center=${mapBounds.center.lat},${mapBounds.center.lng}` 
      : "center=35.9,14.5";
    
    return `https://maps.googleapis.com/maps/api/staticmap?${center}&zoom=11&size=800x600&maptype=roadmap&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:water|element:geometry|color:0x17263c&${markers}&key=${GOOGLE_MAPS_KEY}`;
  }, [listings, mapBounds]);

  // Property card for sidebar
  const PropertyListItem = ({ listing, isSelected }) => {
    const price = listing.prices?.basePrice;
    const currency = listing.prices?.currency || "EUR";
    const imageUrl = listing.picture?.thumbnail || listing.picture?.regular;
    
    return (
      <Link
        to={`/property/${listing._id}`}
        className={`block bg-[#161618] border transition-all ${
          isSelected 
            ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/20" 
            : "border-white/5 hover:border-white/20"
        }`}
        onMouseEnter={() => setSelectedListing(listing._id)}
        onMouseLeave={() => setSelectedListing(null)}
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="w-24 h-24 flex-shrink-0 bg-[#27272A] overflow-hidden">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[#F5F5F0] font-medium text-sm line-clamp-1 mb-1">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-[#A1A1AA] text-xs mb-2">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{listing.address?.city || "Malta"}</span>
            </div>
            <div className="flex items-center gap-3 text-[#A1A1AA] text-xs mb-2">
              {listing.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  {listing.bathrooms}
                </span>
              )}
              {listing.accommodates && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {listing.accommodates}
                </span>
              )}
            </div>
            {price > 0 && (
              <div className="text-[#D4AF37] font-semibold text-sm">
                €{price} <span className="text-[#A1A1AA] font-normal text-xs">/night</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-20" data-testid="map-page">
      {/* Header */}
      <div className="sticky top-20 z-30 bg-[#0A0A0B] border-b border-white/5">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-[#F5F5F0] font-semibold">
              {loading ? "Loading..." : `${listings.length} properties in Malta`}
            </h1>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex border border-white/10">
              <button
                onClick={() => setViewMode("split")}
                className={`p-2 transition-colors ${viewMode === "split" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA] hover:text-[#F5F5F0]"}`}
                title="Split view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 transition-colors ${viewMode === "map" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA] hover:text-[#F5F5F0]"}`}
                title="Map view"
              >
                <MapPin className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA] hover:text-[#F5F5F0]"}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Property List */}
        {(viewMode === "split" || viewMode === "list") && (
          <div 
            className={`${
              viewMode === "split" ? "w-[400px]" : "w-full max-w-4xl mx-auto"
            } h-full overflow-y-auto bg-[#0A0A0B] border-r border-white/5`}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#A1A1AA]">
                <MapPin className="w-12 h-12 mb-4" />
                <p>No properties found</p>
              </div>
            ) : (
              <div className={viewMode === "list" ? "grid md:grid-cols-2 gap-4 p-4" : "space-y-2 p-2"}>
                {listings.map(listing => (
                  <PropertyListItem
                    key={listing._id}
                    listing={listing}
                    isSelected={selectedListing === listing._id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className="flex-1 relative bg-[#161618]">
            {GOOGLE_MAPS_KEY ? (
              <iframe
                title="Properties Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=holiday+rentals+malta&center=35.9,14.5&zoom=11`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#A1A1AA]">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Map View</p>
                  <p className="text-sm">Configure Google Maps API key to enable interactive map</p>
                </div>
              </div>
            )}

            {/* Property markers overlay info */}
            {selectedListing && (
              <div className="absolute top-4 left-4 right-4 max-w-sm bg-[#161618] border border-white/10 shadow-2xl">
                {listings.filter(l => l._id === selectedListing).map(listing => (
                  <Link 
                    key={listing._id}
                    to={`/property/${listing._id}`}
                    className="block p-4"
                  >
                    <div className="flex gap-4">
                      {listing.picture?.thumbnail && (
                        <img 
                          src={listing.picture.thumbnail}
                          alt={listing.title}
                          className="w-20 h-20 object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-[#F5F5F0] font-medium mb-1">{listing.title}</h3>
                        <p className="text-[#A1A1AA] text-sm mb-2">{listing.address?.city}</p>
                        {listing.prices?.basePrice && (
                          <p className="text-[#D4AF37] font-semibold">
                            €{listing.prices.basePrice}/night
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
