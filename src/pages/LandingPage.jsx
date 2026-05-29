import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Star, Shield, Clock, Phone, Mail, MapPin, Quote, ChevronRight, ChevronDown,
  Building, Check, Users, Home, Sparkles, Camera, ClipboardList, MessageCircle,
  Award, TrendingUp, HeartHandshake, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWidget } from "@/components/SearchWidget";
import { PropertyCard } from "@/components/PropertyCard";
import { useModal } from "@/context/ModalContext";
import { useCMS } from "@/context/CMSContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const LandingPage = () => {
  const navigate = useNavigate();
  const { openContactModal, openOwnerModal } = useModal();
  const { cms } = useCMS();
  
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    fetchListings();
    
    // Testimonial rotation
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % (cms.testimonials?.length || 1));
    }, 6000);

    // Parallax scroll handler
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [cms.testimonials?.length]);

  const fetchListings = async () => {
    try {
      const response = await fetch(`${API}/listings?limit=6`);
      const data = await response.json();
      setListings(data.results || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] overflow-x-hidden">
      {/* ============ HERO SECTION ============ */}
      <section 
        ref={heroRef}
        className="relative min-h-screen min-h-[100dvh] flex items-center overflow-hidden" 
        data-testid="hero-section"
      >
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <img 
            src={cms.hero?.backgroundImage || "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80"}
            alt="Luxury villa Malta" 
            className="w-full h-[120%] object-cover"
            loading="eager"
            fetchpriority="high"
          />
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F10]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-32 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-sm mb-6 animate-fade-in">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium">
                Malta's Premier Property Management
              </span>
            </div>
            
            {/* Headline */}
            <h1 className="font-['Playfair_Display'] text-[clamp(2.5rem,8vw,5rem)] text-[#F5F5F0] mb-6 leading-[1.05] animate-fade-in-up">
              Your Home in Malta,
              <br />
              <span className="text-gold-gradient italic">Looked After Like a Hotel</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-[#A1A1AA] mb-10 max-w-2xl animate-fade-in-up leading-relaxed opacity-0 stagger-2">
              {cms.hero?.subheadline || "Handpicked luxury accommodations across Malta's most sought-after locations. Experience exceptional stays with personal attention."}
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up opacity-0 stagger-3">
              <Button
                onClick={() => openOwnerModal()}
                className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6 font-semibold btn-gold-glow group"
                data-testid="hero-owner-btn"
              >
                <Building className="w-4 h-4 mr-2" />
                List Your Property
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate("/properties")}
                variant="outline"
                className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6"
                data-testid="hero-book-btn"
              >
                <Home className="w-4 h-4 mr-2" />
                Book a Stay
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-8 md:gap-12 animate-fade-in-up opacity-0 stagger-4">
              {[
                { value: "9+", label: "Years Superhost" },
                { value: "100%", label: "Response Rate" },
                { value: "4.9", label: "Average Rating" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-['Playfair_Display'] text-[clamp(1.75rem,4vw,2.5rem)] text-[#D4AF37]">{stat.value}</span>
                  <span className="text-sm text-[#A1A1AA] leading-tight">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={() => scrollToSection('owners')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-indicator hidden md:flex flex-col items-center gap-2 text-[#A1A1AA] hover:text-[#D4AF37] transition-colors cursor-pointer"
          aria-label="Scroll to next section"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* ============ PROPERTY OWNERS SECTION ============ */}
      <section 
        id="owners"
        className="relative py-24 md:py-32 bg-[#0A0A0B] overflow-hidden" 
        data-testid="owners-section"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
                For Property Owners
              </span>
              <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-6 leading-tight">
                Maximize Your Property's{" "}
                <span className="text-gold-gradient">Full Potential</span>
              </h2>
              <p className="text-[#A1A1AA] text-lg mb-8 leading-relaxed">
                With over 9 years of Superhost experience and a background in international luxury hotel management, 
                we specialize in making your property stand out in Malta's competitive market.
              </p>
              
              {/* Benefits List */}
              <ul className="space-y-4 mb-8">
                {[
                  "Tailored Property Management",
                  "Expertise You Can Trust",
                  "Selective Portfolio Approach",
                  "Comprehensive Services",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                      <Check className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-[#F5F5F0]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => openOwnerModal()}
                  className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-4 font-semibold btn-gold-glow"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/property-owners")}
                  variant="outline"
                  className="border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-widest px-8 py-4"
                >
                  View Pricing Plans
                </Button>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: "24/7 Guest Support", desc: "Always available" },
                { icon: TrendingUp, label: "Dynamic Pricing", desc: "Maximize revenue" },
                { icon: Sparkles, label: "Pro Cleaning", desc: "After every stay" },
                { icon: ClipboardList, label: "Monthly Reports", desc: "Full transparency" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all duration-300 group"
                >
                  <item.icon className="w-8 h-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-[#F5F5F0] font-semibold mb-1">{item.label}</p>
                  <p className="text-[#A1A1AA] text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section id="about" className="relative py-24 md:py-32 overflow-hidden" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
                About Us
              </span>
              <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-8 leading-tight">
                We Know What a Good{" "}
                <span className="italic">Stay Feels Like</span>
              </h2>
              <div className="space-y-6 text-[#A1A1AA] leading-relaxed">
                {(cms.about?.paragraphs || [
                  "At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations.",
                  "With over 9 years of hosting experience in Malta, we understand the unique appeal of the island and how to make your property stand out.",
                  "We believe in transparency and provide detailed monthly reports so property owners are always in the loop."
                ]).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => openContactModal()}
                  className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none uppercase text-sm tracking-widest px-6 py-4"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Get in Touch
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/3] overflow-hidden bg-[#161618]">
                <img
                  src={cms.about?.image || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg"}
                  alt="Christiano Property Management"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-[#D4AF37]/30 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROPERTIES SECTION ============ */}
      <section id="properties" className="relative py-24 md:py-32 bg-[#0A0A0B] overflow-hidden" data-testid="properties-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
                Featured Properties
              </span>
              <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] leading-tight">
                Explore Our Portfolio
              </h2>
            </div>
            <Button
              onClick={() => navigate("/properties")}
              variant="outline"
              className="border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-widest px-6 py-4 w-fit"
            >
              View All Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#161618] animate-pulse">
                  <div className="aspect-[4/3] bg-[#27272A]" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-[#27272A] rounded w-3/4" />
                    <div className="h-4 bg-[#27272A] rounded w-1/2" />
                    <div className="h-4 bg-[#27272A] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section className="relative py-24 md:py-32 overflow-hidden" data-testid="testimonials-section">
        <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium">
              Guest Reviews
            </span>
            <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0]">
              What Our Guests Say
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="relative bg-[#161618] border border-white/5 p-8 md:p-12">
            <Quote className="absolute top-8 left-8 w-12 h-12 text-[#D4AF37]/20" />
            
            {cms.testimonials && cms.testimonials.length > 0 && (
              <div className="relative z-10">
                <div className="flex gap-1 mb-6 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < (cms.testimonials[currentTestimonial]?.rating || 5) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A1A1AA]"}`} 
                    />
                  ))}
                </div>
                <blockquote className="text-lg md:text-xl text-[#F5F5F0] text-center mb-8 leading-relaxed max-w-3xl mx-auto">
                  "{cms.testimonials[currentTestimonial]?.text}"
                </blockquote>
                <div className="text-center">
                  <p className="text-[#F5F5F0] font-semibold">{cms.testimonials[currentTestimonial]?.name}</p>
                  <p className="text-[#A1A1AA] text-sm">{cms.testimonials[currentTestimonial]?.date}</p>
                </div>
              </div>
            )}

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {cms.testimonials?.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentTestimonial ? "bg-[#D4AF37] w-6" : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="relative py-24 md:py-32 bg-[#0A0A0B] overflow-hidden" data-testid="cta-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <HeartHandshake className="w-16 h-16 text-[#D4AF37] mx-auto mb-8" />
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-6 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you're a guest looking for the perfect stay or a property owner seeking professional management, 
            we're here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => openOwnerModal()}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold btn-gold-glow"
            >
              <Building className="w-4 h-4 mr-2" />
              List Your Property
            </Button>
            <Button
              onClick={() => navigate("/properties")}
              variant="outline"
              className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-widest px-8 py-6"
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Properties
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-[#A1A1AA] mb-4">Or reach us directly</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href={`tel:${cms.contact?.phone || '+35679790202'}`}
                className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37] transition-colors"
              >
                <Phone className="w-4 h-4" />
                {cms.contact?.phone || '+356 7979 0202'}
              </a>
              <a 
                href={`mailto:${cms.contact?.email || 'info@christianopropertymanagement.com'}`}
                className="flex items-center gap-2 text-[#F5F5F0] hover:text-[#D4AF37] transition-colors"
              >
                <Mail className="w-4 h-4" />
                {cms.contact?.email || 'info@christianopropertymanagement.com'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
