import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Phone, Building, Home, MessageCircle, ChevronDown, 
  Users, TrendingUp, Sparkles, Award, DollarSign, Camera,
  Calendar, MapPin, Star, Shield, Clock, Bed, Bath, Map, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useCMS } from "@/context/cmscontext";
import { useBlock } from "@/hooks/useBlock";
import { cn } from '@/lib/utils';
import VoiceSearchButton from '@/components/voice/VoiceSearchButton';

interface DropdownItem {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  desc?: string;
  href?: string;
  action?: string;
  divider?: boolean;
}

/**
 * Header - Site header with navigation, dropdowns, and mobile menu
 * @param props - Component props
 * @returns React component
 */
export const Header = memo(function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { openContactModal, openOwnerModal } = useModal();
  const { cms } = useCMS();
  const { content: headerCfg } = useBlock("header");
  const { content: mobileCfg } = useBlock("mobileMenu");

  // Memoized dropdown items
  const ownerDropdownItems = useMemo<DropdownItem[]>(() => [
    { icon: Award, label: "Why Choose Us", desc: "9+ years Superhost experience", href: "/property-owners#why-us" },
    { icon: DollarSign, label: "Pricing Plans", desc: "15% Essentials / 18% Complete", href: "/property-owners#pricing" },
    { icon: Users, label: "Our Services", desc: "Full-service management", href: "/property-owners#services" },
    { icon: Camera, label: "Portfolio", desc: "View managed properties", href: "/properties" },
    { divider: true },
    { icon: Building, label: "List Your Property", desc: "Get started today", action: "openOwnerModal" },
  ], []);

  const bookingDropdownItems = useMemo<DropdownItem[]>(() => [
    { icon: Home, label: "Browse All Properties", desc: "21 luxury accommodations", href: "/properties" },
    { icon: Map, label: "Map View", desc: "Explore on map", href: "/map" },
    { icon: MapPin, label: "Valletta", desc: "Historic capital city", href: "/properties?city=Valletta" },
    { icon: MapPin, label: "St Julian's", desc: "Vibrant nightlife & dining", href: "/properties?city=St+Julian's" },
    { icon: MapPin, label: "Sliema", desc: "Seaside promenade", href: "/properties?city=Sliema" },
    { divider: true },
    { icon: Calendar, label: "Book Now", desc: "Check availability", href: "/properties" },
  ], []);

  // Memoized event handlers
  const openDropdown = useCallback((id: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(id);
  }, []);

  const closeDropdown = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const handleDropdownClick = useCallback((item: DropdownItem) => {
    setActiveDropdown(null);
    if (item.action === "openOwnerModal") {
      openOwnerModal();
    } else if (item.href) {
      navigate(item.href);
    }
  }, [openOwnerModal, navigate]);

  // Effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => { 
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); 
    };
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  // Memoized computed values
  const isOwnerPage = useMemo(() => 
    location.pathname.includes("owner") || location.pathname.includes("for-owners"),
    [location.pathname]
  );

  const isPropertiesPage = useMemo(() => 
    location.pathname.includes("propert") && !isOwnerPage,
    [location.pathname, isOwnerPage]
  );

  const isAdminPage = useMemo(() => 
    location.pathname.includes("admin"),
    [location.pathname]
  );

  const isHomePage = useMemo(() => 
    location.pathname === "/",
    [location.pathname]
  );

  const WHITE_LOGO = useMemo(() => 
    cms.brand?.logoWhite || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
    [cms.brand?.logoWhite]
  );

  // Memoized DropdownMenu component
  const DropdownMenu = memo(function DropdownMenu({ 
    items, 
    isOpen, 
    id 
  }: { 
    items: DropdownItem[]; 
    isOpen: boolean; 
    id: string;
  }) {
    if (!isOpen) return null;
    return (
      <div 
        className="absolute top-full left-0 w-72 z-50 pt-1"
        onMouseEnter={cancelClose}
        onMouseLeave={closeDropdown}
        aria-label={`${id} dropdown menu`}
      >
        <div className="bg-[#161618] border border-white/10 shadow-2xl">
          <div className="py-2">
            {items.map((item) => (
              item.divider ? (
                <div key={item.label || item.href} className="border-t border-white/10 my-2" />
              ) : (
                <button
                  key={item.href || item.label}
                  onClick={() => handleDropdownClick(item)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
                  aria-label={item.label}
                >
                  {item.icon && <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />}
                  <div>
                    <p className="text-sm font-medium text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">{item.label}</p>
                    <p className="text-xs text-[#71717A]">{item.desc}</p>
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    );
  });

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-[#0F0F10]/95 backdrop-blur-xl border-b border-white/5 py-2" 
          : "bg-gradient-to-b from-[#0F0F10]/80 to-transparent py-4"
      )}
      data-testid="header"
      aria-label="Site header"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" data-testid="header-logo" aria-label="Home">
            <img
              src={WHITE_LOGO}
              alt={cms.brand?.name || "Christiano Property Management"}
              className="h-10 md:h-14 w-auto object-contain brightness-0 invert"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png";
                target.className = "h-10 md:h-14 w-auto object-contain";
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef} aria-label="Main navigation">
            {/* For Owners Dropdown */}
            <div className="relative">
              <button
                onClick={() => activeDropdown === "owners" ? setActiveDropdown(null) : openDropdown("owners")}
                onMouseEnter={() => openDropdown("owners")}
                onMouseLeave={closeDropdown}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-200",
                  isOwnerPage ? "text-[#D4AF37]"
                    : activeDropdown === "owners" ? "text-[#F5F5F0] bg-white/5"
                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                )}
                aria-expanded={activeDropdown === "owners"}
                aria-haspopup="true"
              >
                <Building className="w-4 h-4" />
                For Owners
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeDropdown === "owners" && "rotate-180")} />
              </button>
              <DropdownMenu items={ownerDropdownItems} isOpen={activeDropdown === "owners"} id="owners" />
            </div>

            {/* Book a Stay Dropdown */}
            <div className="relative">
              <button
                onClick={() => activeDropdown === "booking" ? setActiveDropdown(null) : openDropdown("booking")}
                onMouseEnter={() => openDropdown("booking")}
                onMouseLeave={closeDropdown}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-200",
                  isPropertiesPage ? "text-[#D4AF37]"
                    : activeDropdown === "booking" ? "text-[#F5F5F0] bg-white/5"
                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                )}
                aria-expanded={activeDropdown === "booking"}
                aria-haspopup="true"
              >
                <Home className="w-4 h-4" />
                Book a Stay
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeDropdown === "booking" && "rotate-180")} />
              </button>
              <DropdownMenu items={bookingDropdownItems} isOpen={activeDropdown === "booking"} id="booking" />
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Voice Search - Game-changer! */}
            <VoiceSearchButton onTranscript={(text) => {
              if (text) {
                // Navigate to properties page with search query
                window.location.href = `/properties?search=${encodeURIComponent(text)}`;
              }
            }} />
            
            <a
              href={`tel:${cms.contact?.phone || '+35679790202'}`}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#F5F5F0] transition-colors"
              aria-label={`Call ${cms.contact?.phone || '+356 7979 0202'}`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">{cms.contact?.phone || '+356 7979 0202'}</span>
            </a>
            
            <Button
              onClick={() => openContactModal()}
              variant="ghost"
              size="sm"
              className="text-[#F5F5F0] hover:text-[#F5F5F0] hover:bg-white/10"
              aria-label="Contact us"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Button>
            
            <Button
              onClick={() => isOwnerPage ? openOwnerModal() : navigate("/properties")}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-xs tracking-widest px-6 py-3 font-semibold btn-gold-glow"
              aria-label={isOwnerPage ? "List your property" : (headerCfg?.ctaText || "Book Now")}
            >
              {isOwnerPage ? "List Property" : (headerCfg?.ctaText || "Book Now")}
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-[#F5F5F0]" aria-label="Open mobile menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0F0F10] border-l border-white/10 w-full sm:max-w-sm p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/5">
                  <OptimizedImage src={WHITE_LOGO} alt={cms.brand?.name} className="h-12 w-auto" objectFit="contain" />
                </div>

                <nav className="flex-1 p-6 overflow-y-auto" aria-label="Mobile navigation">
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 px-4">{mobileCfg?.ownersTitle || "For Property Owners"}</p>
                    <div className="space-y-1">
                      {ownerDropdownItems.filter(i => !i.divider).map((item) => (
                        <button
                          key={item.href || item.label}
                          onClick={() => { handleDropdownClick(item); setIsMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors rounded"
                          aria-label={item.label}
                        >
                          {item.icon && <item.icon className="w-5 h-5 text-[#A1A1AA]" />}
                          <span className="text-[#F5F5F0]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 px-4">{mobileCfg?.bookingTitle || "Book a Stay"}</p>
                    <div className="space-y-1">
                      {bookingDropdownItems.filter(i => !i.divider).map((item) => (
                        <button
                          key={item.href || item.label}
                          onClick={() => { handleDropdownClick(item); setIsMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors rounded"
                          aria-label={item.label}
                        >
                          {item.icon && <item.icon className="w-5 h-5 text-[#A1A1AA]" />}
                          <span className="text-[#F5F5F0]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                  <a href={`tel:${cms.contact?.phone}`} className="flex items-center gap-3 text-[#A1A1AA]" aria-label={`Call ${cms.contact?.phone || '+356 7979 0202'}`}>
                    <Phone className="w-5 h-5" />
                    {cms.contact?.phone || '+356 7979 0202'}
                  </a>
                   
                  <Button
                    onClick={() => { openContactModal(); setIsMobileMenuOpen(false); }}
                    variant="outline"
                    className="w-full border-white/10 text-[#F5F5F0] rounded-none py-4"
                    aria-label={mobileCfg?.contactLabel || "Contact Us"}
                  >
                    {mobileCfg?.contactLabel || "Contact Us"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
});

export default Header;
