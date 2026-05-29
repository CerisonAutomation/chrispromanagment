import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, Phone, Building, Home, MessageCircle, ChevronDown, 
  Users, TrendingUp, Sparkles, Award, DollarSign, Camera,
  Calendar, MapPin, Star, Shield, Clock, Bed, Bath, Map, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useModal } from "@/context/ModalContext";
import { useCMS } from "@/context/CMSContext";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const closeTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { openContactModal, openOwnerModal } = useModal();
  const { cms } = useCMS();

  const openDropdown = (id) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setActiveDropdown(id);
  };

  const closeDropdown = () => {
    closeTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const cancelClose = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); };
  }, []);

  const isOwnerPage = location.pathname.includes("owner") || location.pathname.includes("for-owners");
  const isPropertiesPage = location.pathname.includes("propert") && !isOwnerPage;
  const isAdminPage = location.pathname.includes("admin");
  const isHomePage = location.pathname === "/";

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const ownerDropdownItems = [
    { icon: Award, label: "Why Choose Us", desc: "9+ years Superhost experience", href: "/property-owners#why-us" },
    { icon: DollarSign, label: "Pricing Plans", desc: "15% Essentials / 18% Complete", href: "/property-owners#pricing" },
    { icon: Users, label: "Our Services", desc: "Full-service management", href: "/property-owners#services" },
    { icon: Camera, label: "Portfolio", desc: "View managed properties", href: "/properties" },
    { divider: true },
    { icon: Building, label: "List Your Property", desc: "Get started today", action: "openOwnerModal" },
  ];

  const bookingDropdownItems = [
    { icon: Home, label: "Browse All Properties", desc: "21 luxury accommodations", href: "/properties" },
    { icon: Map, label: "Map View", desc: "Explore on map", href: "/map" },
    { icon: MapPin, label: "Valletta", desc: "Historic capital city", href: "/properties?city=Valletta" },
    { icon: MapPin, label: "St Julian's", desc: "Vibrant nightlife & dining", href: "/properties?city=St+Julian's" },
    { icon: MapPin, label: "Sliema", desc: "Seaside promenade", href: "/properties?city=Sliema" },
    { divider: true },
    { icon: Calendar, label: "Book Now", desc: "Check availability", href: "/properties" },
  ];

  const handleDropdownClick = (item) => {
    setActiveDropdown(null);
    if (item.action === "openOwnerModal") {
      openOwnerModal();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const DropdownMenu = ({ items, isOpen, id }) => {
    if (!isOpen) return null;
    return (
      <div 
        className="absolute top-full left-0 w-72 z-50 pt-1"
        onMouseEnter={cancelClose}
        onMouseLeave={closeDropdown}
      >
        <div className="bg-[#161618] border border-white/10 shadow-2xl">
          <div className="py-2">
            {items.map((item, i) => (
              item.divider ? (
                <div key={i} className="border-t border-white/10 my-2" />
              ) : (
                <button
                  key={i}
                  onClick={() => handleDropdownClick(item)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
                >
                  <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
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
  };

  // WHITE LOGO - Use actual white logo image
  const WHITE_LOGO = cms.brand?.logoWhite || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-[#0F0F10]/95 backdrop-blur-xl border-b border-white/5 py-2" 
          : "bg-gradient-to-b from-[#0F0F10]/80 to-transparent py-4"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - WHITE */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80" data-testid="header-logo">
            <img
              src={WHITE_LOGO}
              alt={cms.brand?.name || "Christiano Property Management"}
              className="h-10 md:h-14 w-auto object-contain brightness-0 invert"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png";
                e.target.className = "h-10 md:h-14 w-auto object-contain";
              }}
            />
          </Link>

          {/* Desktop Navigation with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {/* For Owners Dropdown */}
            <div className="relative">
              <button
                onClick={() => activeDropdown === "owners" ? setActiveDropdown(null) : openDropdown("owners")}
                onMouseEnter={() => openDropdown("owners")}
                onMouseLeave={closeDropdown}
                className={`flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-200 ${
                  isOwnerPage ? "text-[#D4AF37]"
                    : activeDropdown === "owners" ? "text-[#F5F5F0] bg-white/5"
                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                }`}
              >
                <Building className="w-4 h-4" />
                For Owners
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "owners" ? "rotate-180" : ""}`} />
              </button>
              <DropdownMenu items={ownerDropdownItems} isOpen={activeDropdown === "owners"} id="owners" />
            </div>

            {/* Book a Stay Dropdown */}
            <div className="relative">
              <button
                onClick={() => activeDropdown === "booking" ? setActiveDropdown(null) : openDropdown("booking")}
                onMouseEnter={() => openDropdown("booking")}
                onMouseLeave={closeDropdown}
                className={`flex items-center gap-2 px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-200 ${
                  isPropertiesPage ? "text-[#D4AF37]"
                    : activeDropdown === "booking" ? "text-[#F5F5F0] bg-white/5"
                    : "text-[#A1A1AA] hover:text-[#F5F5F0]"
                }`}
              >
                <Home className="w-4 h-4" />
                Book a Stay
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === "booking" ? "rotate-180" : ""}`} />
              </button>
              <DropdownMenu items={bookingDropdownItems} isOpen={activeDropdown === "booking"} id="booking" />
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`tel:${cms.contact?.phone || '+35679790202'}`}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#F5F5F0] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden xl:inline">{cms.contact?.phone || '+356 7979 0202'}</span>
            </a>
            
            <Button
              onClick={() => openContactModal()}
              variant="ghost"
              size="sm"
              className="text-[#F5F5F0] hover:text-[#F5F5F0] hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Button>
            
            <Button
              onClick={() => isOwnerPage ? openOwnerModal() : navigate("/properties")}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-xs tracking-widest px-6 py-3 font-semibold btn-gold-glow"
            >
              {isOwnerPage ? "List Property" : "Book Now"}
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-[#F5F5F0]">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0F0F10] border-l border-white/10 w-full sm:max-w-sm p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-6 border-b border-white/5">
                  <img src={WHITE_LOGO} alt={cms.brand?.name} className="h-12 w-auto" />
                </div>

                {/* Mobile Nav */}
                <nav className="flex-1 p-6 overflow-y-auto">
                  {/* For Owners Section */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 px-4">For Property Owners</p>
                    <div className="space-y-1">
                      {ownerDropdownItems.filter(i => !i.divider).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { handleDropdownClick(item); setIsMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors rounded"
                        >
                          <item.icon className="w-5 h-5 text-[#A1A1AA]" />
                          <span className="text-[#F5F5F0]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Book a Stay Section */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-3 px-4">Book a Stay</p>
                    <div className="space-y-1">
                      {bookingDropdownItems.filter(i => !i.divider).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => { handleDropdownClick(item); setIsMobileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors rounded"
                        >
                          <item.icon className="w-5 h-5 text-[#A1A1AA]" />
                          <span className="text-[#F5F5F0]">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* Mobile Footer */}
                <div className="p-6 border-t border-white/5 space-y-4">
                  <a href={`tel:${cms.contact?.phone}`} className="flex items-center gap-3 text-[#A1A1AA]">
                    <Phone className="w-5 h-5" />
                    {cms.contact?.phone || '+356 7979 0202'}
                  </a>
                  
                  <Button
                    onClick={() => { openContactModal(); setIsMobileMenuOpen(false); }}
                    variant="outline"
                    className="w-full border-white/10 text-[#F5F5F0] rounded-none py-4"
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
