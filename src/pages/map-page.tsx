import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MapPin, List, Grid, Bed, Bath, Users, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const MapPage = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("split"); // split, map, list

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const city = searchParams.get("city");
        let query = supabase
          .from("guesty_properties_cache")
          .select("id, guesty_id, title, city, accommodates, bedrooms, bathrooms, base_price, currency, thumbnail, lat, lng")
          .eq("active", true)
          .limit(100);
        if (city) query = query.ilike("city", `%${city}%`);
        const { data } = await query;
        setListings(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchParams]);

  const mapBounds = useMemo(() => {
    const withCoords = listings.filter(l => l.lat && l.lng);
    if (!withCoords.length) return null;
    const lats = withCoords.map(l => l.lat);
    const lngs = withCoords.map(l => l.lng);
    return {
      center: { lat: (Math.max(...lats) + Math.min(...lats)) / 2, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2 }
    };
  }, [listings]);

  const PropertyListItem = ({ listing, isSelected }) => (
    <Link
      to={`/property/${listing.guesty_id || listing.id}`}
      className={`block bg-[#161618] border transition-all ${
        isSelected ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/20" : "border-white/5 hover:border-white/20"
      }`}
      onMouseEnter={() => setSelectedListing(listing.id)}
      onMouseLeave={() => setSelectedListing(null)}
    >
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 flex-shrink-0 bg-[#27272A] overflow-hidden rounded">
          {listing.thumbnail && <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#F5F5F0] font-medium text-sm line-clamp-1 mb-1">{listing.title}</h3>
          <div className="flex items-center gap-1 text-[#A1A1AA] text-xs mb-2">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{listing.city || "Malta"}</span>
          </div>
          <div className="flex items-center gap-3 text-[#A1A1AA] text-xs mb-2">
            {listing.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{listing.bedrooms}</span>}
            {listing.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{listing.bathrooms}</span>}
            {listing.accommodates && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{listing.accommodates}</span>}
          </div>
          {listing.base_price > 0 && (
            <div className="text-[#D4AF37] font-semibold text-sm">
              {listing.currency || "€"}{listing.base_price} <span className="text-[#A1A1AA] font-normal text-xs">/night</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

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

            {selectedListing && (() => {
              const l = listings.find(x => x.id === selectedListing);
              if (!l) return null;
              return (
                <div className="absolute top-4 left-4 right-4 max-w-sm bg-[#161618] border border-white/10 shadow-2xl">
                  <Link to={`/property/${l.guesty_id || l.id}`} className="block p-4">
                    <div className="flex gap-4">
                      {l.thumbnail && <img src={l.thumbnail} alt={l.title} className="w-16 h-16 object-cover rounded" />}
                      <div>
                        <h3 className="text-[#F5F5F0] font-medium mb-1">{l.title}</h3>
                        <p className="text-[#A1A1AA] text-sm mb-2">{l.city}</p>
                        {l.base_price && <p className="text-[#D4AF37] font-semibold">{l.currency || "€"}{l.base_price}/night</p>}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
