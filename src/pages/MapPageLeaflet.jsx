import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, List, Grid, X, Bed, Bath, Users, Star, 
  ChevronLeft, ChevronRight, Loader2, Filter, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom gold marker icon
const goldIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path fill="#D4AF37" stroke="#0F0F10" stroke-width="2" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8z"/>
      <circle cx="12" cy="8" r="3" fill="#0F0F10"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45]
});

// Component to fit bounds when listings change
function MapBoundsUpdater({ listings }) {
  const map = useMap();
  
  useEffect(() => {
    if (listings && listings.length > 0) {
      const validListings = listings.filter(l => l.address?.lat && l.address?.lng);
      if (validListings.length > 0) {
        const bounds = L.latLngBounds(
          validListings.map(l => [l.address.lat, l.address.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [listings, map]);
  
  return null;
}

export const MapPage = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
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

  // Calculate default center
  const defaultCenter = useMemo(() => {
    if (!listings.length) return [35.9, 14.5]; // Malta center
    
    const validListings = listings.filter(l => l.address?.lat && l.address?.lng);
    if (!validListings.length) return [35.9, 14.5];
    
    const avgLat = validListings.reduce((sum, l) => sum + l.address.lat, 0) / validListings.length;
    const avgLng = validListings.reduce((sum, l) => sum + l.address.lng, 0) / validListings.length;
    
    return [avgLat, avgLng];
  }, [listings]);

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
          <div className="w-32 h-24 flex-shrink-0">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0F0F10] flex items-center justify-center">
                <Home className="w-8 h-8 text-[#71717A]" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-['Playfair_Display'] text-[#F5F5F0] font-semibold mb-1 truncate">
              {listing.title}
            </h3>
            
            {listing.address?.city && (
              <p className="text-xs text-[#71717A] mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.address.city}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA] mb-2">
              {listing.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {listing.bedrooms}
                </span>
              )}
              {listing.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  {listing.bathrooms}
                </span>
              )}
              {listing.accommodates > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {listing.accommodates}
                </span>
              )}
            </div>
            
            {price && (
              <div className="flex items-baseline gap-1">
                <span className="text-[#D4AF37] font-semibold">
                  {currency === "EUR" ? "€" : "$"}{price}
                </span>
                <span className="text-xs text-[#71717A]">/ night</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] font-semibold mb-2">
              Map View
            </h1>
            <p className="text-[#A1A1AA]">
              {listings.length} propert{listings.length === 1 ? "y" : "ies"} found
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#161618] border border-white/10 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-none ${viewMode === "list" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA]"}`}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("split")}
              className={`rounded-none ${viewMode === "split" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA]"}`}
            >
              <Grid className="w-4 h-4 mr-2" />
              Split
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("map")}
              className={`rounded-none ${viewMode === "map" ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA]"}`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>
      </div>

      {/* Map + Listings Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-6">
        <div className="flex gap-6 h-[calc(100vh-240px)]">
          {/* Listings Sidebar */}
          {(viewMode === "split" || viewMode === "list") && (
            <div className={`${viewMode === "split" ? "w-1/3" : "w-full"} overflow-y-auto space-y-4`}>
              {listings.map((listing) => (
                <PropertyListItem
                  key={listing._id}
                  listing={listing}
                  isSelected={selectedListing === listing._id}
                />
              ))}
              
              {listings.length === 0 && (
                <div className="text-center py-12 text-[#71717A]">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No properties found</p>
                </div>
              )}
            </div>
          )}

          {/* Map */}
          {(viewMode === "split" || viewMode === "map") && (
            <div className={`${viewMode === "split" ? "flex-1" : "w-full"} border border-white/10 overflow-hidden`}>
              <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                className="leaflet-dark-mode"
              >
                {/* OpenStreetMap Tile Layer */}
                <TileLayer
                  attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles-dark"
                />
                
                {/* Auto-fit bounds */}
                <MapBoundsUpdater listings={listings} />

                {/* Markers */}
                {listings
                  .filter(l => l.address?.lat && l.address?.lng)
                  .map((listing) => (
                    <Marker
                      key={listing._id}
                      position={[listing.address.lat, listing.address.lng]}
                      icon={goldIcon}
                      eventHandlers={{
                        mouseover: () => setSelectedListing(listing._id),
                        mouseout: () => setSelectedListing(null),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="min-w-[200px]">
                          {listing.picture?.thumbnail && (
                            <img 
                              src={listing.picture.thumbnail} 
                              alt={listing.title}
                              className="w-full h-32 object-cover mb-2"
                            />
                          )}
                          <h4 className="font-semibold text-sm mb-1">{listing.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {listing.address.city}
                          </p>
                          <div className="flex items-center gap-2 text-xs mb-2">
                            {listing.bedrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <Bed className="w-3 h-3" /> {listing.bedrooms}
                              </span>
                            )}
                            {listing.bathrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <Bath className="w-3 h-3" /> {listing.bathrooms}
                              </span>
                            )}
                          </div>
                          {listing.prices?.basePrice && (
                            <p className="font-semibold">
                              €{listing.prices.basePrice} <span className="text-xs font-normal">/ night</span>
                            </p>
                          )}
                          <Link
                            to={`/property/${listing._id}`}
                            className="block mt-2 text-xs text-blue-600 hover:underline"
                          >
                            View Details →
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .leaflet-dark-mode .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-popup-content-wrapper {
          background: #F5F5F0;
          color: #0F0F10;
        }
        .leaflet-popup-tip {
          background: #F5F5F0;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #0F0F10;
        }
      `}</style>
    </div>
  );
};
