/**
 * RESPONSIVE HORIZONTAL SEARCH BAR - 10000x Better
 * Ultra-responsive, mobile-first, enterprise-grade
 */

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MALTA_LOCATIONS = [
  { city: "All Malta", region: "All Locations", popular: true },
  { city: "Valletta", region: "South Eastern", popular: true },
  { city: "Sliema", region: "Northern Harbour", popular: true },
  { city: "St. Julian's", region: "Northern Harbour", popular: true },
  { city: "St Julian's", region: "Northern Harbour", popular: true },
  { city: "Mdina", region: "Northern", popular: true },
  { city: "Mellieħa", region: "Northern", popular: false },
  { city: "Qawra", region: "Northern", popular: false },
  { city: "Bugibba", region: "Northern", popular: false },
  { city: "Marsaskala", region: "South Eastern", popular: false },
  { city: "Birgu", region: "South Eastern", popular: false },
  { city: "Gozo", region: "Gozo", popular: true },
];

export const HorizontalSearchBar = ({ 
  className = "",
  initialFilters = {},
  onSearch = () => {},
  compact = false 
}) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialFilters.city || "");
  const [locationInput, setLocationInput] = useState(initialFilters.city || "All Malta");
  const [checkIn, setCheckIn] = useState(initialFilters.checkIn || "");
  const [checkOut, setCheckOut] = useState(initialFilters.checkOut || "");
  const [guests, setGuests] = useState(initialFilters.guests || 2);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const locationRef = useRef(null);
  const guestRef = useRef(null);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setShowGuestPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (loc) => {
    if (loc.city === "All Malta") {
      setLocation("");
      setLocationInput("All Malta");
    } else {
      setLocation(loc.city);
      setLocationInput(loc.city);
    }
    setShowLocationDropdown(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('city', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());

    onSearch({ city: location, checkIn, checkOut, guests });
    navigate(`/properties?${params.toString()}`);
  };

  const filteredLocations = MALTA_LOCATIONS.filter(loc =>
    loc.city.toLowerCase().includes(locationInput.toLowerCase()) ||
    loc.region.toLowerCase().includes(locationInput.toLowerCase())
  );

  // Compact mobile view - NOW HORIZONTAL TOO
  if (isMobile && !compact) {
    return (
      <div className={`bg-[#161618] border border-white/10 ${className}`}>
        {/* Mobile Horizontal Layout */}
        <div className="p-3">
          {/* Location - Full Width */}
          <div className="relative mb-2" ref={locationRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#0F0F10] border border-white/10"
            >
              <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="All Malta"
                className="flex-1 bg-transparent text-[#F5F5F0] text-sm placeholder:text-[#71717A] outline-none"
              />
            </button>
            
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#161618] border border-white/10 max-h-48 overflow-y-auto z-50 shadow-2xl">
                {filteredLocations.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <MapPin className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#F5F5F0] truncate">{loc.city}</p>
                    </div>
                    {loc.popular && <span className="text-xs text-[#D4AF37]">★</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates + Guests - Horizontal Row */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#0F0F10] border border-white/10">
              <Calendar className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="flex-1 bg-transparent text-[#F5F5F0] text-xs outline-none"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#0F0F10] border border-white/10">
              <Calendar className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="flex-1 bg-transparent text-[#F5F5F0] text-xs outline-none"
              />
            </div>
          </div>

          {/* Guests + Search - Horizontal Row */}
          <div className="flex gap-2">
            <div className="relative flex-1" ref={guestRef}>
              <button
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-[#0F0F10] border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-sm text-[#F5F5F0]">{guests}</span>
                </div>
              </button>
              
              {showGuestPicker && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#161618] border border-white/10 p-3 z-50 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#F5F5F0]">Guests</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-7 h-7 flex items-center justify-center bg-[#0F0F10] hover:bg-[#D4AF37] text-[#F5F5F0] transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-[#F5F5F0] w-6 text-center">{guests}</span>
                      <button
                        onClick={() => setGuests(Math.min(20, guests + 1))}
                        className="w-7 h-7 flex items-center justify-center bg-[#0F0F10] hover:bg-[#D4AF37] text-[#F5F5F0] transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="flex-1 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              <Search className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop horizontal bar
  return (
    <div className={`bg-[#161618] border border-white/10 shadow-2xl ${className}`}>
      <div className="flex items-stretch divide-x divide-white/10">
        {/* Location */}
        <div className="relative flex-1" ref={locationRef}>
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors h-full"
          >
            <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-0.5">Location</p>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowLocationDropdown(true);
                }}
                onFocus={() => setShowLocationDropdown(true)}
                placeholder="All Malta"
                className="bg-transparent text-[#F5F5F0] font-medium outline-none w-full"
              />
            </div>
          </button>

          {showLocationDropdown && (
            <div className="absolute top-full left-0 w-96 mt-2 bg-[#161618] border border-white/10 max-h-96 overflow-y-auto z-50 shadow-2xl">
              {filteredLocations.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <MapPin className="w-4 h-4 mt-0.5 text-[#D4AF37] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#F5F5F0]">{loc.city}</p>
                    <p className="text-xs text-[#71717A]">{loc.region}</p>
                  </div>
                  {loc.popular && (
                    <span className="text-xs text-[#D4AF37] font-medium">Popular</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Check-in */}
        <div className="flex-1">
          <div className="px-6 py-4 flex items-center gap-3 h-full">
            <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1">
              <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-0.5">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-[#F5F5F0] font-medium outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Check-out */}
        <div className="flex-1">
          <div className="px-6 py-4 flex items-center gap-3 h-full">
            <Calendar className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1">
              <label className="text-xs text-[#71717A] uppercase tracking-wider block mb-0.5">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-[#F5F5F0] font-medium outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="flex-1 relative" ref={guestRef}>
          <button
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors h-full"
          >
            <Users className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-0.5">Guests</p>
              <p className="text-[#F5F5F0] font-medium">{guests} Guest{guests !== 1 ? 's' : ''}</p>
            </div>
          </button>

          {showGuestPicker && (
            <div className="absolute top-full left-0 w-64 mt-2 bg-[#161618] border border-white/10 p-4 z-50 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#F5F5F0]">Number of Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-[#0F0F10] hover:bg-[#D4AF37] text-[#F5F5F0] transition-colors"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-[#F5F5F0] w-8 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="w-8 h-8 flex items-center justify-center bg-[#0F0F10] hover:bg-[#D4AF37] text-[#F5F5F0] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleSearch}
            className="h-full px-8 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] font-semibold uppercase tracking-widest rounded-none"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HorizontalSearchBar;
