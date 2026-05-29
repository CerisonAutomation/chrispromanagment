import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useCMS } from "@/context/CMSContext";
import { useModal } from "@/context/ModalContext";

export const Footer = () => {
  const { cms } = useCMS();
  const { openContactModal, openOwnerModal } = useModal();

  // WHITE LOGO - Same as Header
  const WHITE_LOGO = cms.brand?.logoWhite || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png";

  return (
    <footer className="bg-[#0F0F10] border-t border-white/5" data-testid="footer">
      {/* Main Footer - COMPACT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand - WHITE LOGO */}
          <div className="lg:col-span-1">
            <img
              src={WHITE_LOGO}
              alt={cms.brand.name}
              className="h-10 w-auto mb-3"
            />
            <p className="text-[#A1A1AA] text-xs leading-relaxed mb-2">
              {cms.brand.tagline}
            </p>
            <p className="text-[#71717A] text-xs">
              Luxury short-term rentals across Malta.
            </p>
          </div>

          {/* For Guests */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">
              For Guests
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/properties" className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                Browse Properties
              </Link>
              <Link to="/properties" className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                Book a Stay
              </Link>
              <button onClick={() => openContactModal()} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors text-left">
                Contact Us
              </button>
            </nav>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">
              For Owners
            </h4>
            <nav className="flex flex-col gap-2">
              <Link to="/property-owners" className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                Our Services
              </Link>
              <button onClick={() => openOwnerModal()} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors text-left">
                List Your Property
              </button>
              <Link to="/property-owners#pricing" className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                Pricing Plans
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">
              Contact
            </h4>
            <div className="flex flex-col gap-2">
              <a href={`tel:${cms.contact.phone}`} className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                <Phone className="w-3 h-3" />
                {cms.contact.phone}
              </a>
              <a href={`mailto:${cms.contact.email}`} className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                <Mail className="w-3 h-3" />
                {cms.contact.email}
              </a>
              <p className="flex items-start gap-2 text-xs text-[#71717A]">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>St Julian's, Malta</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - COMPACT */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Copyright */}
            <p className="text-xs text-[#71717A]">
              © {new Date().getFullYear()} {cms.brand.name}. All rights reserved.
            </p>

            {/* Social Links - COMPACT */}
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/christianopropertymanagement"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
              <a
                href="https://facebook.com/christianopropertymanagement"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
              <a
                href="https://wa.me/35679790202"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all group"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex gap-3 text-xs">
              <Link to="/privacy-policy" className="text-[#71717A] hover:text-[#D4AF37] transition-colors">
                Privacy
              </Link>
              <span className="text-[#71717A]">·</span>
              <Link to="/terms" className="text-[#71717A] hover:text-[#D4AF37] transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
