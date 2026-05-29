import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, MessageCircle, X, ChevronUp, Building, Calendar, Home, Users, ArrowRight, Star } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { Button } from "@/components/ui/button";

export const StickyCallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openContactModal, openOwnerModal } = useModal();

  // Determine context based on current page
  const isPropertyPage = location.pathname.includes("/properties/") || location.pathname.includes("/listing/");
  const isOwnerPage = location.pathname.includes("/for-owners") || location.pathname.includes("/property-owners");
  const isHomePage = location.pathname === "/" || location.pathname === "/en";
  const isCheckoutPage = location.pathname.includes("/checkout");

  // Extract property ID if on property page
  const propertyId = isPropertyPage ? location.pathname.split("/").pop() : null;

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't show on checkout or admin pages
  if (isCheckoutPage || location.pathname.startsWith("/admin")) return null;
  if (!isVisible) return null;

  // Context-aware actions
  const getActions = () => {
    if (isPropertyPage && propertyId) {
      return [
        {
          icon: Calendar,
          label: "Book This Property",
          primary: true,
          action: () => {
            // Scroll to booking widget or open booking modal
            const bookingWidget = document.querySelector('[data-testid="search-widget"]');
            if (bookingWidget) {
              bookingWidget.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate(`/checkout/${propertyId}`);
            }
          }
        },
        {
          icon: MessageCircle,
          label: "Ask About This Property",
          action: openContactModal
        },
        {
          icon: Phone,
          label: "Call Us",
          action: () => window.open("tel:+35679790202")
        },
      ];
    }

    if (isOwnerPage) {
      return [
        {
          icon: Building,
          label: "List Your Property",
          primary: true,
          action: openOwnerModal
        },
        {
          icon: MessageCircle,
          label: "Get Free Consultation",
          action: openContactModal
        },
        {
          icon: Phone,
          label: "Call Us",
          action: () => window.open("tel:+35679790202")
        },
      ];
    }

    // Default (home and other pages)
    return [
      {
        icon: Home,
        label: "Book a Stay",
        primary: true,
        action: () => navigate("/properties")
      },
      {
        icon: Building,
        label: "List Your Property",
        action: openOwnerModal
      },
      {
        icon: MessageCircle,
        label: "Contact Us",
        action: openContactModal
      },
    ];
  };

  const actions = getActions();

  // Get primary action for the main button
  const primaryAction = actions.find(a => a.primary) || actions[0];
  const PrimaryIcon = primaryAction.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" data-testid="sticky-cta">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  action.action();
                  setIsExpanded(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg font-medium text-sm transition-all ${
                  action.primary
                    ? "bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]"
                    : "bg-[#161618] text-[#F5F5F0] border border-white/10 hover:border-[#D4AF37]/50"
                }`}
                data-testid={`sticky-action-${i}`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 bg-[#161618] text-[#F5F5F0] px-4 py-3 rounded-full shadow-lg border border-white/10 hover:border-[#D4AF37]/50 transition-all font-medium text-sm"
          >
            <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
            Back to Top
          </button>
        </div>
      )}

      {/* Context Label */}
      {!isExpanded && (
        <div className="bg-[#0F0F10]/90 text-[#D4AF37] text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/30 backdrop-blur-sm">
          {isPropertyPage && "Ready to book?"}
          {isOwnerPage && "List your property"}
          {isHomePage && "How can we help?"}
          {!isPropertyPage && !isOwnerPage && !isHomePage && "Contact us"}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 group ${
          isExpanded
            ? "bg-[#161618] text-[#F5F5F0] border border-white/10 rotate-45"
            : "bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158]"
        }`}
        data-testid="sticky-cta-toggle"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <PrimaryIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};
