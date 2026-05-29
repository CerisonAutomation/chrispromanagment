import { useNavigate } from "react-router-dom";
import { 
  Check, Star, Shield, ArrowRight, Phone, 
  Building, Users, Sparkles, Camera, ClipboardList, 
  TrendingUp, Award, HeartHandshake, BadgePercent, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useModal } from "@/context/ModalContext";
import { useCMS } from "@/context/CMSContext";

export const PropertyOwnersPage = () => {
  const navigate = useNavigate();
  const { openOwnerModal, openContactModal } = useModal();
  const { cms } = useCMS();

  // Access nested CMS data with fallbacks
  const propertyOwners = cms.propertyOwners || {};
  const whyChooseUs = propertyOwners.whyChooseUs || { title: "Why Choose Us?", items: [] };
  const services = propertyOwners.services || { title: "What We Offer", subtitle: "Our Services" };
  const faqs = propertyOwners.faqs || [];
  const pricing = cms.pricing || {};

  const serviceItems = [
    { icon: ClipboardList, title: "Property Assessment", desc: "Thorough evaluation to highlight your property's strengths" },
    { icon: TrendingUp, title: "Dynamic Pricing", desc: "Smart pricing strategies to maximize occupancy and returns" },
    { icon: Users, title: "24/7 Guest Communication", desc: "Seamless, professional interaction before, during, and after stays" },
    { icon: Sparkles, title: "Professional Cleaning", desc: "Immaculate presentation after every guest" },
    { icon: Shield, title: "Secure Payments", desc: "Hassle-free handling of payments and eco-tax requirements" },
    { icon: Camera, title: "Pro Photography", desc: "High-quality images that capture the best of your property" },
    { icon: Star, title: "Reviews Management", desc: "Responding to reviews and maintaining positive reputation" },
    { icon: Award, title: "Monthly Reports", desc: "Full transparency with data on bookings and earnings" },
  ];

  const extras = [
    "Home Makeover from A-Z",
    "Furniture Construction & Assembly",
    "Inventory Management",
    "Property Registration with MTA (€150)",
    "Welcome Amenities for Guests",
    "Transfer Arrangements for Guests",
  ];

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24" data-testid="property-owners-page">
      {/* Hero */}
      <section id="why-us" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block">
              For Property Owners
            </span>
            <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F0] mb-6 leading-tight">
              Maximize Your Property's
              <br />
              <span className="text-gold-gradient">Full Potential</span>
            </h1>
            <p className="text-lg md:text-xl text-[#A1A1AA] mb-8 max-w-2xl">
              With over 9 years of Superhost experience and a background in international luxury hotel management, 
              we specialize in making your property stand out in Malta's competitive market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openOwnerModal()}
                className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold btn-gold-glow"
                data-testid="owner-hero-cta"
              >
                <Building className="w-4 h-4 mr-2" />
                List Your Property
              </Button>
              <Button
                onClick={() => openContactModal()}
                variant="outline"
                className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-transparent rounded-none uppercase text-sm tracking-widest px-8 py-6"
              >
                <Phone className="w-4 h-4 mr-2" />
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-24 bg-[#0A0A0B]" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block">
              Management Plans
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-4">
              One fee. <span className="italic">No surprises.</span>
            </h2>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto">
              A single commission on net room revenue. All new properties launch with Superhost credibility from day one.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Essentials Plan */}
            <div className="bg-[#161618] border border-white/5 p-8 relative">
              <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-2">Essentials</h3>
              <p className="text-[#A1A1AA] text-sm mb-6">Core operations. Your property listed, managed, and maintained.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-['Playfair_Display'] text-5xl text-[#D4AF37]">15%</span>
                <span className="text-[#A1A1AA]">of Net Room Revenue + VAT</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Listing & Revenue
                  </h4>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Multi-channel listing creation & management</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Superhost status from day one</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Smart seasonal pricing optimization</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Reviews & reputation management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" /> Operations
                  </h4>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Guest communication & 24/7 concierge</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Check-in & check-out coordination</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Professional cleaning & laundry</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Maintenance coordination — at cost</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Payment collection & eco-tax compliance</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[#A1A1AA] text-sm">
                    <span className="text-[#F5F5F0]">Reporting fees:</span> €35 per monthly report<br />
                    <span className="text-[#F5F5F0]">Callout fees:</span> €20 + VAT per incident
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => openOwnerModal()}
                variant="outline"
                className="w-full mt-8 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none uppercase tracking-widest py-4"
              >
                Get Started
              </Button>
            </div>

            {/* Complete Plan */}
            <div className="bg-[#161618] border-2 border-[#D4AF37]/30 p-8 relative">
              <div className="absolute -top-3 left-8 bg-[#D4AF37] text-[#0F0F10] px-4 py-1 text-xs uppercase tracking-widest font-semibold">
                Most Popular
              </div>
              <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-2">Complete</h3>
              <p className="text-[#A1A1AA] text-sm mb-6">Full-service management. The guest experience that drives better returns.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-['Playfair_Display'] text-5xl text-[#D4AF37]">18%</span>
                <span className="text-[#A1A1AA]">of Net Room Revenue + VAT</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#D4AF37]" /> Everything in Essentials, plus:
                  </h4>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Welcome amenities — wine, coffee, toiletries included</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Guest property manual included</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Property assessment & readiness checklist</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
                    <BadgePercent className="w-4 h-4 text-[#D4AF37]" /> Included Fees (No Extra Charges)
                  </h4>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Monthly reporting included — saves €420/year</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> All callout fees included — saves €240+/year</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Annual photography refresh included — saves ~€300/year</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> €100 annual platform fee waived</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[#F5F5F0] font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#D4AF37]" /> Strategic Services
                  </h4>
                  <ul className="space-y-2 text-sm text-[#A1A1AA]">
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Quarterly performance reviews & optimization</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Priority 24-hour owner response time</li>
                    <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" /> Dedicated direct booking webpage</li>
                  </ul>
                </div>
              </div>
              
              <Button
                onClick={() => openOwnerModal()}
                className="w-full mt-8 bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest py-4 btn-gold-glow"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Additional Fees Note */}
          <div className="mt-12 bg-[#161618] border border-white/5 p-6">
            <h4 className="text-[#F5F5F0] font-semibold mb-4">Available on both plans — charged separately</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-[#A1A1AA]">
              <div><span className="text-[#F5F5F0]">Professional photoshoot</span> — On quotation</div>
              <div><span className="text-[#F5F5F0]">Annual deep clean</span> — On quotation</div>
              <div><span className="text-[#F5F5F0]">MTA licensing</span> — €150 one-time + fees</div>
              <div><span className="text-[#F5F5F0]">Setup works</span> — €25/hr + VAT</div>
              <div><span className="text-[#F5F5F0]">Mail & bills handling</span> — €10/month (free in Complete)</div>
              <div><span className="text-[#F5F5F0]">Interior design</span> — On quotation</div>
            </div>
            <p className="text-xs text-[#71717A] mt-4">
              Net Room Revenue is calculated on gross rental income, excluding platform commissions, VAT, cleaning fees, damage deposits, and optional extras.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block">
              Why Partner With Us
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]">
              {whyChooseUs.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseUs.items?.map((item, i) => (
              <div
                key={i}
                className="bg-[#161618] p-8 border border-white/5 hover:border-[#D4AF37]/20 transition-colors"
              >
                <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                  <Check className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block">
              {services.subtitle}
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]">
              {services.title}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceItems.map((service, i) => (
              <div
                key={i}
                className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all duration-300 group"
              >
                <service.icon className="w-8 h-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-[#F5F5F0] font-semibold mb-2">{service.title}</h3>
                <p className="text-[#A1A1AA] text-sm">{service.desc}</p>
              </div>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-16 bg-[#161618] p-8 border border-white/5">
            <h3 className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              Optional Extras
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {extras.map((extra, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-[#A1A1AA]">{extra}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block">
              Common Questions
            </span>
            <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-[#161618] border border-white/5 px-6"
              >
                <AccordionTrigger className="text-[#F5F5F0] text-left hover:text-[#D4AF37] hover:no-underline py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#A1A1AA] pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <HeartHandshake className="w-16 h-16 text-[#D4AF37] mx-auto mb-8" />
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-6">
            Ready to Partner With Us?
          </h2>
          <p className="text-[#A1A1AA] text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our competitive management fees and tailored service packages. 
            We'd love to discuss how we can help maximize your property investment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => openOwnerModal()}
              className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold btn-gold-glow"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <a
              href={`tel:${cms.contact?.phone || '+356 7979 0202'}`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors px-8 py-4 uppercase text-sm tracking-widest"
            >
              <Phone className="w-4 h-4" />
              {cms.contact?.phone || '+356 7979 0202'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
