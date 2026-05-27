// TODO: Fix eslint issues and remove this blanket disable
import { memo, useMemo, useCallback } from 'react';
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useCMS } from "@/context/cmscontext";
import { useModal } from "@/context/modal-context";
import { useBlock } from "@/hooks/useBlock";
import { cn } from '@/lib/utils';

interface FooterProps {
  // No props needed - uses CMS context
}

/**
 * Footer - Site footer with brand info, navigation, contact, and social links
 * @param props - Component props
 * @returns React component
 */
export const Footer = memo(() => {
  const { cms } = useCMS();
  const { openContactModal, openOwnerModal } = useModal();
  const { content: footerCfg } = useBlock("footer");
  const { content: socialCfg } = useBlock("socialBar");

  const WHITE_LOGO = useMemo(() => 
    cms.brand?.logoWhite || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
    [cms.brand?.logoWhite]
  );

  const handleContactClick = useCallback(() => openContactModal(), [openContactModal]);
  const handleOwnerClick = useCallback(() => openOwnerModal(), [openOwnerModal]);

  return (
    <footer 
      className="bg-[#0F0F10] border-t border-white/5" 
      data-testid="footer"
      aria-label="Site footer"
    >
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src={WHITE_LOGO}
              alt={cms.brand?.name || "Christiano Property Management"}
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
            <nav className="flex flex-col gap-2" aria-label="Guest navigation">
              <Link to="/properties" className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors">
                Browse Properties
              </Link>
              <Link to="/properties" className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors">
                Book a Stay
              </Link>
              <button 
                onClick={handleContactClick} 
                className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors text-left"
                aria-label="Contact us"
              >
                Contact Us
              </button>
            </nav>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">
              For Owners
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Owner navigation">
              <Link to="/property-owners" className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors">
                Our Services
              </Link>
              <button 
                onClick={handleOwnerClick} 
                className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors text-left"
                aria-label="List your property"
              >
                List Your Property
              </button>
              <Link to="/property-owners#pricing" className="text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors">
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
              <a 
                href={`tel:${cms.contact?.phone || '+35679790202'}`} 
                className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors"
                aria-label={`Call ${cms.contact?.phone || '+356 7979 0202'}`}
              >
                <Phone className="w-3 h-3" />
                {cms.contact?.phone || '+356 7979 0202'}
              </a>
              <a 
                href={`mailto:${cms.contact?.email}`} 
                className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#C9A84C] transition-colors"
                aria-label={`Email ${cms.contact?.email}`}
              >
                <Mail className="w-3 h-3" />
                {cms.contact?.email}
              </a>
              <address className="not-italic flex items-start gap-2 text-xs text-[#71717A]">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>The Fives - Unit A7<br />Triq Charles Sciberras<br />San Ġiljan, Malta</span>
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Copyright */}
            <p className="text-xs text-[#71717A]">
              {footerCfg?.copyright || `© ${new Date().getFullYear()} ${cms.brand?.name || "Christiano Property Management"}. All rights reserved.`}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2" aria-label="Social media links">
              <a
                href="https://instagram.com/christianopropertymanagement"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all group"
                )}
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#C9A84C] transition-colors" />
              </a>
              <a
                href="https://facebook.com/christianopropertymanagement"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all group"
                )}
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#C9A84C] transition-colors" />
              </a>
              <a
                href="https://wa.me/35679790202"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all group"
                )}
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#C9A84C] transition-colors" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex gap-3 text-xs">
              <Link to="/privacy-policy" className="text-[#71717A] hover:text-[#C9A84C] transition-colors">
                Privacy Policy
              </Link>
              <span className="text-[#71717A]">·</span>
              <Link to="/terms" className="text-[#71717A] hover:text-[#C9A84C] transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
