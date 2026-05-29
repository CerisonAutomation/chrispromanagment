// ============================================================
// CVPM BLOCKS — Optimized & Consolidated Block System
// Single source of truth for ALL block types, themes, and templates
// ============================================================

import {
  LayoutTemplate,
  PanelBottom,
  Search,
  Star,
  Building2,
  Type,
  TextCursorInput,
  Info,
  Quote,
  BarChart3,
  LayoutGrid,
  BadgeEuro,
  HelpCircle,
  MessageSquareQuote,
  Users,
  Store,
  Home,
  Building,
  CalendarDays,
  ArrowRight,
  Mail,
  ClipboardList,
  AtSign,
  MessageCircle,
  Eye,
  Image as ImageIcon,
  Images,
  Play,
  Code,
  MapPin,
  MoveVertical,
  Minus,
} from "lucide-react";

export const THEME = {
  bg:"#0F0F10", surface:"#161618", dark:"#0A0A0B",
  accent:"#D4AF37", accentHover:"#E5C158",
  text:"#F5F5F0", muted:"#A1A1AA", border:"rgba(255,255,255,0.06)",
  fontHeading:"'Playfair Display', Georgia, serif",
  fontBody:"'Manrope', system-ui, sans-serif",
};

export const FONT_PAIRS = [
  { id:"playfair-manrope", name:"Playfair + Manrope", heading:"'Playfair Display',serif", body:"'Manrope',sans-serif" },
  { id:"cormorant-dm", name:"Cormorant + DM Sans", heading:"'Cormorant Garamond',serif", body:"'DM Sans',sans-serif" },
  { id:"libre-raleway", name:"Baskerville + Raleway", heading:"'Libre Baskerville',serif", body:"'Raleway',sans-serif" },
  { id:"syne-outfit", name:"Syne + Outfit", heading:"'Syne',sans-serif", body:"'Outfit',sans-serif" },
  { id:"cinzel-lato", name:"Cinzel + Lato", heading:"'Cinzel',serif", body:"'Lato',sans-serif" },
];

export const COLOR_PRESETS = [
  { id:"gold-noir", name:"Gold Noir", accent:"#D4AF37", bg:"#0F0F10", surface:"#161618", text:"#F5F5F0" },
  { id:"sapphire", name:"Sapphire", accent:"#3B82F6", bg:"#0F172A", surface:"#1E293B", text:"#F8FAFC" },
  { id:"emerald", name:"Emerald", accent:"#10B981", bg:"#0A1612", surface:"#122820", text:"#ECFDF5" },
  { id:"rose", name:"Rose Quartz", accent:"#F43F5E", bg:"#18181B", surface:"#27272A", text:"#FAFAFA" },
  { id:"amber", name:"Amber", accent:"#F59E0B", bg:"#1C1917", surface:"#292524", text:"#FAFAF9" },
  { id:"violet", name:"Violet", accent:"#8B5CF6", bg:"#0F0A1A", surface:"#1A1028", text:"#F5F0FF" },
  { id:"teal", name:"Teal", accent:"#0D9488", bg:"#060C0C", surface:"#0C1616", text:"#D0F0EC" },
  { id:"light", name:"Light Mode", accent:"#D4AF37", bg:"#FFFFFF", surface:"#F9FAFB", text:"#111827" },
];

// ─── BLOCK SCHEMAS (Consolidated from all sources) ───────────────────────────────────────────
export const SCHEMAS = {
  // GLOBAL STRUCTURE
  header: {
    label:"Header & Nav", category:"global", icon: LayoutTemplate,
    fields: {
      logoUrl:{ type:"image", label:"Logo URL" },
      brandName:{ type:"text", label:"Brand Name" },
      phone:{ type:"text", label:"Phone" },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
      navItems:{ type:"array", label:"Nav Links", itemFields:["label","href"] },
      sticky:{ type:"boolean", label:"Sticky Header" },
    },
    defaults: {
      logoUrl:"https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png",
      brandName:"Christiano Vincenti PM",
      phone:"+356 7979 0202",
      ctaText:"Book Now",
      ctaHref:"/book",
      sticky: true,
      navItems:[
        { label:"For Owners", href:"/property-owners" },
        { label:"Properties", href:"/properties" },
        { label:"Pricing", href:"/property-owners#pricing" },
        { label:"Contact", href:"#contact" },
      ],
    },
  },

  footer: {
    label:"Footer", category:"global", icon: PanelBottom,
    fields: {
      companyName:{ type:"text", label:"Company Name" },
      tagline:{ type:"text", label:"Tagline" },
      address:{ type:"textarea", label:"Address" },
      phone:{ type:"text", label:"Phone" },
      email:{ type:"text", label:"Email" },
      copyright:{ type:"text", label:"Copyright" },
      social:{ type:"array", label:"Social Links", itemFields:["platform","url"] },
      columns:{ type:"array", label:"Link Columns", itemFields:["title","links"] },
    },
    defaults: {
      companyName:"Christiano Vincenti Property Management",
      tagline:"Malta's Premier Property Management",
      address:"The Fives A7, Triq Charles Sciberras, St Julian's, Malta",
      phone:"+356 7979 0202",
      email:"info@cvpm.mt",
      copyright:"© 2025 Christiano Vincenti PM. All rights reserved.",
      social:[
        { platform:"instagram", url:"https://instagram.com/christianopropertymanagement" },
        { platform:"facebook", url:"https://facebook.com/christianopropertymanagement" },
      ],
      columns:[
        { title:"For Guests", links:[
          { label:"Browse Properties", href:"/properties" },
          { label:"Book a Stay", href:"/properties" },
          { label:"How It Works", href:"/#how-it-works" },
        ]},
        { title:"For Owners", links:[
          { label:"List Your Property", href:"/property-owners" },
          { label:"Pricing Plans", href:"/property-owners#pricing" },
          { label:"Owner Portal", href:"/property-owners" },
        ]},
        { title:"Company", links:[
          { label:"About Us", href:"/property-owners#why-us" },
          { label:"Contact", href:"#contact" },
          { label:"Privacy Policy", href:"/privacy" },
          { label:"Terms", href:"/terms" },
        ]},
      ],
    },
  },

  seo: {
    label:"SEO Meta", category:"global", icon: Search,
    fields: {
      title:{ type:"text", label:"Page Title (60 chars)" },
      description:{ type:"textarea", label:"Meta Description (160 chars)" },
      keywords:{ type:"text", label:"Keywords" },
      ogImage:{ type:"image", label:"OG Image URL" },
      canonical:{ type:"text", label:"Canonical URL" },
    },
    defaults: {
      title:"Christiano Vincenti PM | Luxury Property Management Malta",
      description:"Luxury short-term rental and property management across Malta. Transparent fees, full-service operations, Superhost status from day one.",
      keywords:"Malta property management, Airbnb Malta, short-term rental Malta, vacation rental Malta",
      ogImage:"",
      canonical:"",
    },
  },

  // HERO VARIANTS
  hero: {
    label:"Hero Section", category:"layout", icon: Star,
    aiFields:["eyebrow","title","subtitle"],
    fields: {
      eyebrow:{ type:"text", label:"Eyebrow Label" },
      title:{ type:"richtext", label:"Headline (use <em> for gold italic)" },
      subtitle:{ type:"textarea", label:"Subheadline" },
      backgroundImage:{ type:"image", label:"Background Image" },
      overlayOpacity:{ type:"number", label:"Overlay Opacity (0-100)", min:0, max:100 },
      cta1:{ type:"text", label:"Primary CTA" },
      cta1Href:{ type:"text", label:"Primary CTA Link" },
      cta2:{ type:"text", label:"Secondary CTA" },
      cta2Href:{ type:"text", label:"Secondary CTA Link" },
      stats:{ type:"array", label:"Stats Bar", itemFields:["value","label"] },
      showStats:{ type:"boolean", label:"Show Stats" },
      height:{ type:"select", label:"Hero Height", options:["auto","full","large","medium"] },
    },
    defaults: {
      eyebrow:"Malta's Premier Property Partner",
      title:"Maximise your rental income, <em>effortlessly.</em>",
      subtitle:"Full-service short-let management across Malta & Gozo. We handle everything — you earn more.",
      backgroundImage:"https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80",
      overlayOpacity:55,
      cta1:"Get Your Free Assessment", cta1Href:"/property-owners",
      cta2:"Browse Properties", cta2Href:"/properties",
      showStats:true,
      height:"full",
      stats:[
        { value:"€2.4M+", label:"Revenue Generated" },
        { value:"45+", label:"Properties Managed" },
        { value:"4.97★", label:"Average Rating" },
        { value:"94%", label:"Occupancy Rate" },
      ],
    },
  },

  owners_hero: {
    label:"Owners Hero", category:"layout", icon: Building2,
    aiFields:["title","subtitle","description"],
    fields: {
      badge:{ type:"text", label:"Badge" },
      title:{ type:"text", label:"Title" },
      titleAccent:{ type:"text", label:"Title Accent (gold)" },
      description:{ type:"textarea", label:"Description" },
      cta1:{ type:"text", label:"Primary CTA" },
      cta2:{ type:"text", label:"Secondary CTA" },
      services:{ type:"array", label:"Services Grid", itemFields:["icon","label","desc"] },
      benefits:{ type:"array", label:"Benefits List", itemFields:["text"] },
    },
    defaults: {
      badge:"For Property Owners",
      title:"Maximize Your Property's",
      titleAccent:"Full Potential",
      description:"With over 9 years of Superhost experience and a background in international luxury hotel management, we specialize in making your property stand out in Malta's competitive market.",
      cta1:"Get Started",
      cta2:"View Pricing Plans",
      benefits:[
        { text:"Tailored Property Management" },
        { text:"Expertise You Can Trust" },
        { text:"Selective Portfolio Approach" },
        { text:"Comprehensive Services" },
      ],
      services:[
        { icon:"Users", label:"24/7 Guest Support", desc:"Always available" },
        { icon:"TrendingUp", label:"Dynamic Pricing", desc:"Maximize revenue" },
        { icon:"Sparkles", label:"Pro Cleaning", desc:"After every stay" },
        { icon:"ClipboardList", label:"Monthly Reports", desc:"Full transparency" },
      ],
    },
  },

  // CONTENT SECTIONS
  text: {
    label:"Text Block", category:"content", icon: Type,
    aiFields:["title","body"],
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Heading" },
      body:{ type:"textarea", label:"Body Text" },
      align:{ type:"select", label:"Alignment", options:["left","center","right"] },
      size:{ type:"select", label:"Size", options:["sm","base","lg","xl"] },
      maxWidth:{ type:"select", label:"Max Width", options:["sm","md","lg","xl","full"] },
    },
    defaults: {
      label:"",
      title:"Our Approach to Property Management",
      body:"We combine deep local knowledge with global hospitality standards to deliver outcomes that consistently exceed expectations.",
      align:"left", size:"base", maxWidth:"lg",
    },
  },

  richtext: {
    label:"Rich Text", category:"content", icon: TextCursorInput,
    fields: { html:{ type:"code", label:"HTML Content" } },
    defaults: { html:"<h2>Section Heading</h2><p>Rich text with full HTML support.</p>" },
  },

  about: {
    label:"About / Split Section", category:"content", icon: Info,
    aiFields:["title","titleAccent","paragraphs"],
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      titleAccent:{ type:"text", label:"Title Accent (italic)" },
      paragraphs:{ type:"array", label:"Paragraphs", itemFields:["text"] },
      image:{ type:"image", label:"Image" },
      imagePosition:{ type:"select", label:"Image Position", options:["left","right"] },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
    },
    defaults: {
      label:"About Us",
      title:"We Know What a Good",
      titleAccent:"Stay Feels Like",
      imagePosition:"right",
      paragraphs:[
        { text:"At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations." },
        { text:"With over 9 years of Superhost experience, we understand the unique appeal of the island and how to make your property stand out." },
        { text:"We believe in transparency and provide detailed monthly reports so property owners are always in the loop." },
      ],
      image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg",
      ctaText:"Get in Touch",
      ctaHref:"#contact",
    },
  },

  quote: {
    label:"Pull Quote", category:"content", icon: Quote,
    fields: {
      quote:{ type:"textarea", label:"Quote Text" },
      cite:{ type:"text", label:"Citation" },
      style:{ type:"select", label:"Style", options:["centered","left","card"] },
    },
    defaults: {
      quote:"The most professional property management team we have ever worked with. Revenue up 40% in year one.",
      cite:"— Maria C., Property Owner, Sliema",
      style:"centered",
    },
  },

  // DATA BLOCKS
  stats: {
    label:"Stats Bar", category:"data", icon: BarChart3,
    fields: {
      items:{ type:"array", label:"Stats", itemFields:["value","label"] },
      style:{ type:"select", label:"Style", options:["bar","grid","centered","large"] },
      background:{ type:"select", label:"Background", options:["surface","dark","accent","transparent"] },
    },
    defaults: {
      style:"bar", background:"surface",
      items:[
        { value:"9+", label:"Years Superhost" },
        { value:"100%", label:"Response Rate" },
        { value:"4.9★", label:"Avg Rating" },
        { value:"40%", label:"Revenue Boost" },
      ],
    },
  },

  features: {
    label:"Features Grid", category:"data", icon: LayoutGrid,
    aiFields:["title","items"],
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      items:{ type:"array", label:"Features", itemFields:["icon","title","body"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
      style:{ type:"select", label:"Card Style", options:["card","minimal","bordered","icon-top"] },
    },
    defaults: {
      label:"What We Do",
      title:"Full-service property care",
      columns:"3",
      style:"card",
      items:[
        { icon:"Sparkles", title:"Listing & Marketing", body:"Professional photography, multi-channel listings, and smart pricing optimisation." },
        { icon:"Calendar", title:"Booking Management", body:"24/7 guest communication, dynamic pricing, and seamless check-in coordination." },
        { icon:"Wrench", title:"Maintenance", body:"Vetted local contractors, cleaning coordination, and linen service after every stay." },
        { icon:"BarChart3", title:"Reporting", body:"Transparent monthly statements with occupancy, revenue, and guest review analysis." },
        { icon:"Shield", title:"Guest Screening", body:"Verified guest profiles, security deposits, and damage protection protocols." },
        { icon:"Clock", title:"24/7 Support", body:"Always available — real people, real solutions, any hour." },
      ],
    },
  },

  pricing: {
    label:"Pricing Table", category:"data", icon: BadgeEuro,
    aiFields:["title","plans"],
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      note:{ type:"textarea", label:"Note / Disclaimer" },
      plans:{ type:"array", label:"Plans", itemFields:["tier","amount","unit","desc","popular","cta","features"] },
      showAddOns:{ type:"boolean", label:"Show Add-ons" },
      addOns:{ type:"array", label:"Add-ons", itemFields:["name","price"] },
    },
    defaults: {
      label:"Pricing",
      title:"Simple, transparent plans",
      note:"No setup fees. No hidden costs. You only pay when you earn.",
      showAddOns:true,
      plans:[
        {
          tier:"Essentials", amount:"15%", unit:"of revenue",
          desc:"Core operations. Your property listed, managed, and maintained.",
          popular:false, cta:"Get Started",
          features:["Professional photography","Multi-platform listing","Dynamic pricing","Guest communication","Monthly reporting","MTA licence guidance"],
        },
        {
          tier:"Complete", amount:"20%", unit:"of revenue",
          desc:"Full hands-off management. We handle everything.",
          popular:true, cta:"Get Started",
          features:["Everything in Essentials","Cleaning coordination","Maintenance at cost","Linen & amenities","Direct booking website","Owner dashboard","Priority 24hr support","Quarterly review"],
        },
      ],
      addOns:[
        { name:"Professional photoshoot", price:"On quotation" },
        { name:"Annual deep clean", price:"On quotation" },
        { name:"MTA licensing", price:"€150 one-time + fees" },
        { name:"Interior design consultation", price:"On quotation" },
      ],
    },
  },

  faq: {
    label:"FAQ Accordion", category:"data", icon: HelpCircle,
    aiFields:["title","items"],
    fields: {
      title:{ type:"text", label:"Section Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      items:{ type:"array", label:"Questions", itemFields:["q","a"] },
      style:{ type:"select", label:"Style", options:["accordion","cards","two-col"] },
    },
    defaults: {
      title:"Common questions",
      style:"accordion",
      items:[
        { q:"Do I need an MTA licence to rent short-term in Malta?", a:"Yes. All short-let properties in Malta require a Malta Tourism Authority licence. We guide you through the entire application as part of our service." },
        { q:"What areas do you cover?", a:"We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa." },
        { q:"How quickly can my property go live?", a:"Most properties are listed within 2–3 weeks of onboarding, including professional photography, listing creation, and pricing setup." },
        { q:"What commission do you charge?", a:"Essentials at 15% and Complete at 18% of Net Room Revenue. Both include 24/7 guest support with no hidden fees." },
        { q:"Can I block dates for personal use?", a:"Absolutely. You have full calendar control through our owner dashboard — block dates anytime with no penalties." },
        { q:"What happens with maintenance issues?", a:"We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever." },
      ],
    },
  },

  // SOCIAL PROOF
  testimonials: {
    label:"Testimonials", category:"social", icon: MessageSquareQuote,
    aiFields:["title","items"],
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      items:{ type:"array", label:"Testimonials", itemFields:["name","date","rating","text"] },
      style:{ type:"select", label:"Style", options:["grid","carousel","masonry","single"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
    },
    defaults: {
      label:"Guest Reviews",
      title:"What our guests say",
      style:"grid", columns:"3",
      items:[
        { name:"Katie", date:"October 2024", rating:5, text:"Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine, everything was spot on." },
        { name:"Eric", date:"October 2024", rating:5, text:"Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent." },
        { name:"Sheldon", date:"September 2024", rating:5, text:"Always on hand to help with any queries and extremely responsive. I'd definitely recommend to anyone." },
        { name:"Anna", date:"September 2024", rating:5, text:"The host is nice and helpful! The apartment is modern, clean, cozy, and fully equipped. Perfect location." },
        { name:"Miranda", date:"August 2024", rating:5, text:"We loved the apartment—spacious, clean, and felt like home. Perfect size for our family of four." },
        { name:"Kate", date:"April 2024", rating:5, text:"Christiano is extremely personable and supremely helpful. We'll be back. Full of thoughtful touches." },
      ],
    },
  },

  team: {
    label:"Team", category:"social", icon: Users,
    fields: {
      title:{ type:"text", label:"Section Title" },
      items:{ type:"array", label:"Team Members", itemFields:["initials","name","role","bio","image"] },
      style:{ type:"select", label:"Style", options:["cards","list","centered"] },
    },
    defaults: {
      title:"The team",
      style:"cards",
      items:[
        { initials:"CV", name:"Christiano Vincenti", role:"Founder & Director", bio:"Twenty years in Maltese hospitality. Superhost since 2015.", image:"" },
        { initials:"AM", name:"Anna Mizzi", role:"Operations Manager", bio:"Ensures every guest stay is flawless — always.", image:"" },
      ],
    },
  },

  logos: {
    label:"Logo / Trust Bar", category:"social", icon: Store,
    fields: {
      label:{ type:"text", label:"Label Text" },
      items:{ type:"array", label:"Logos / Platforms", itemFields:["name","logo"] },
      style:{ type:"select", label:"Style", options:["strip","grid","justified"] },
    },
    defaults: {
      label:"Trusted by leading platforms",
      style:"strip",
      items:[
        { name:"Airbnb", logo:"" },
        { name:"Booking.com", logo:"" },
        { name:"Vrbo", logo:"" },
        { name:"Expedia", logo:"" },
        { name:"Malta Tourism Authority", logo:"" },
      ],
    },
  },

  // PROPERTY BLOCKS
  properties: {
    label:"Property Grid", category:"properties", icon: Home,
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
      items:{ type:"array", label:"Properties", itemFields:["name","location","image","price","beds","baths","guests","link"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
      showPrice:{ type:"boolean", label:"Show Price" },
    },
    defaults: {
      label:"Featured Properties",
      title:"Currently managed",
      ctaText:"View all properties",
      ctaHref:"/properties",
      columns:"3", showPrice:true,
      items:[
        { name:"The Fives Apartments", location:"St Julian's, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg", price:"€180", beds:"3 Bed", baths:"3 Bath", guests:"6 Guests", link:"https://malta.guestybookings.com/en/properties/6878a53283f1c400114b71e8" },
        { name:"123 St Ursula Street", location:"Valletta, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg", price:"€150", beds:"1 Bed", baths:"2 Bath", guests:"4 Guests", link:"https://malta.guestybookings.com/en/properties/6878a5365a563c0013969391" },
        { name:"St Julian's Penthouse", location:"San Ġiljan, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg", price:"€155", beds:"2 Bed", baths:"2 Bath", guests:"4 Guests", link:"https://malta.guestybookings.com/en/properties/6878a53de8249000105817f8" },
      ],
    },
  },

  guesty_listings: {
    label:"Live Listings (Guesty)", category:"properties", icon: Building,
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      limit:{ type:"number", label:"Max Properties to Show", min:1, max:20 },
      apiUrl:{ type:"text", label:"Guesty Booking API URL" },
    },
    defaults: {
      label:"Available now",
      title:"Featured properties",
      limit:6,
      apiUrl:"https://malta.guestybookings.com/en",
    },
  },

  guesty_book: {
    label:"Direct Booking Widget", category:"properties", icon: CalendarDays,
    fields: {
      title:{ type:"text", label:"Section Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      url:{ type:"text", label:"Booking URL" },
      height:{ type:"number", label:"Widget Height (px)", min:400, max:1200 },
    },
    defaults: {
      title:"Book direct & save",
      subtitle:"Real-time rates and availability. No booking fees.",
      url:"https://malta.guestybookings.com/en",
      height:760,
    },
  },

  // CONVERSION
  cta: {
    label:"Call to Action", category:"conversion", icon: ArrowRight,
    aiFields:["title","body"],
    fields: {
      title:{ type:"text", label:"Headline" },
      body:{ type:"textarea", label:"Body Text" },
      cta1:{ type:"text", label:"Primary CTA" },
      cta1Href:{ type:"text", label:"Primary CTA Link" },
      cta2:{ type:"text", label:"Secondary CTA" },
      cta2Href:{ type:"text", label:"Secondary CTA Link" },
      showContact:{ type:"boolean", label:"Show Contact Info" },
      style:{ type:"select", label:"Style", options:["centered","banner","split","minimal"] },
      background:{ type:"select", label:"Background", options:["dark","surface","accent","gradient","image"] },
      bgImage:{ type:"image", label:"BG Image (if image)" },
    },
    defaults: {
      title:"Ready to maximise your property?",
      body:"A short call is all it takes. No commitment, just clarity.",
      cta1:"Book a Discovery Call", cta1Href:"/property-owners",
      cta2:"Browse Properties", cta2Href:"/properties",
      showContact:true,
      style:"centered", background:"surface",
    },
  },

  contact: {
    label:"Contact Section", category:"conversion", icon: Mail,
    fields: {
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      items:{ type:"array", label:"Contact Methods", itemFields:["icon","label","value","href"] },
      showMap:{ type:"boolean", label:"Show Map" },
      mapLat:{ type:"number", label:"Map Latitude" },
      mapLng:{ type:"number", label:"Map Longitude" },
      showForm:{ type:"boolean", label:"Show Inline Form" },
    },
    defaults: {
      title:"Get in touch",
      subtitle:"We respond to every enquiry within 4 hours.",
      showMap:true, mapLat:35.9180, mapLng:14.4890,
      showForm:true,
      items:[
        { icon:"Mail", label:"Email", value:"info@cvpm.mt", href:"mailto:info@cvpm.mt" },
        { icon:"Phone", label:"Phone / WhatsApp", value:"+356 7979 0202", href:"tel:+35679790202" },
        { icon:"MapPin", label:"Office", value:"St Julian's, Malta", href:"#" },
      ],
    },
  },

  form: {
    label:"Contact Form", category:"conversion", icon: ClipboardList,
    fields: {
      title:{ type:"text", label:"Form Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      fields:{ type:"array", label:"Form Fields", itemFields:["name","label","type","required","placeholder"] },
      submitText:{ type:"text", label:"Submit Button Text" },
      successMessage:{ type:"text", label:"Success Message" },
      webhookUrl:{ type:"text", label:"Webhook URL (optional)" },
    },
    defaults: {
      title:"Send us a message",
      subtitle:"We'll reply within 24 hours.",
      submitText:"Send Message",
      successMessage:"Thank you! We'll be in touch shortly.",
      fields:[
        { name:"name", label:"Full Name", type:"text", required:true, placeholder:"Your name" },
        { name:"email", label:"Email", type:"email", required:true, placeholder:"your@email.com" },
        { name:"phone", label:"Phone", type:"tel", required:false, placeholder:"+356..." },
        { name:"type", label:"I'm a...", type:"select", required:true, options:["Property Owner","Guest / Traveller","Other"] },
        { name:"message", label:"Message", type:"textarea", required:true, placeholder:"Tell us about your property or enquiry..." },
      ],
    },
  },

  newsletter: {
    label:"Newsletter Signup", category:"conversion", icon: AtSign,
    fields: {
      title:{ type:"text", label:"Title" },
      body:{ type:"textarea", label:"Body" },
      placeholder:{ type:"text", label:"Email Placeholder" },
      cta:{ type:"text", label:"Button Text" },
      disclaimer:{ type:"text", label:"Disclaimer Text" },
    },
    defaults: {
      title:"Stay in the loop",
      body:"Monthly insights for Malta property owners — market trends, tips, and updates.",
      placeholder:"your@email.com",
      cta:"Subscribe",
      disclaimer:"No spam. Unsubscribe anytime.",
    },
  },

  // AI-POWERED BLOCKS
  agent_chat: {
    label:"AI Chat Assistant", category:"ai", icon: MessageCircle,
    fields: {
      label:{ type:"text", label:"Block Label" },
      title:{ type:"text", label:"Widget Title" },
      greeting:{ type:"textarea", label:"Initial Greeting" },
      placeholder:{ type:"text", label:"Input Placeholder" },
      height:{ type:"number", label:"Widget Height (px)" },
      systemPrompt:{ type:"textarea", label:"System Prompt (optional override)" },
    },
    defaults: {
      label:"AI assistant",
      title:"Ask the concierge",
      greeting:"Hi! I can help you find a stay in Malta or Gozo, or answer questions about our property management services. What can I help with?",
      placeholder:"e.g. 2 bedroom in Sliema for 4 nights in June...",
      height:520,
      systemPrompt:"",
    },
  },

  vision_qa: {
    label:"Vision Q&A (Image AI)", category:"ai", icon: Eye,
    fields: {
      label:{ type:"text", label:"Block Label" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      defaultQuestion:{ type:"text", label:"Default Question" },
    },
    defaults: {
      label:"Image insight",
      title:"Upload a photo, ask anything",
      subtitle:"Our AI will describe and answer questions about any property image.",
      defaultQuestion:"What style and features stand out in this property?",
    },
  },

  // MEDIA
  image: {
    label:"Image", category:"media", icon: ImageIcon,
    fields: {
      src:{ type:"image", label:"Image URL" },
      alt:{ type:"text", label:"Alt Text" },
      caption:{ type:"text", label:"Caption" },
      aspectRatio:{ type:"select", label:"Aspect Ratio", options:["auto","16:9","4:3","3:2","1:1","2:3"] },
      width:{ type:"select", label:"Width", options:["full","3/4","1/2","1/3"] },
      rounded:{ type:"boolean", label:"Rounded Corners" },
    },
    defaults: { src:"", alt:"", caption:"", aspectRatio:"16:9", width:"full", rounded:false },
  },

  gallery: {
    label:"Image Gallery", category:"media", icon: Images,
    fields: {
      items:{ type:"array", label:"Images", itemFields:["src","alt","caption"] },
      style:{ type:"select", label:"Gallery Style", options:["grid","masonry","carousel","lightbox"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
    },
    defaults: {
      style:"grid", columns:"3",
      items:[
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg", alt:"", caption:"" },
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg", alt:"", caption:"" },
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg", alt:"", caption:"" },
      ],
    },
  },

  video: {
    label:"Video Embed", category:"media", icon: Play,
    fields: {
      url:{ type:"text", label:"YouTube or Vimeo URL" },
      title:{ type:"text", label:"Section Title" },
      caption:{ type:"text", label:"Caption" },
      autoplay:{ type:"boolean", label:"Autoplay (muted)" },
    },
    defaults: { url:"", title:"", caption:"", autoplay:false },
  },

  embed: {
    label:"Custom Embed", category:"media", icon: Code,
    fields: {
      html:{ type:"code", label:"Embed HTML" },
      height:{ type:"number", label:"Height (px)", min:100, max:1200 },
      title:{ type:"text", label:"Section Title" },
    },
    defaults: { html:"", height:400, title:"" },
  },

  map: {
    label:"Map / Location", category:"media", icon: MapPin,
    fields: {
      title:{ type:"text", label:"Section Title" },
      lat:{ type:"number", label:"Latitude" },
      lng:{ type:"number", label:"Longitude" },
      zoom:{ type:"number", label:"Zoom (1-18)", min:1, max:18 },
      height:{ type:"number", label:"Map Height (px)", min:200, max:800 },
      caption:{ type:"text", label:"Caption" },
    },
    defaults: { title:"Find us", lat:35.9180, lng:14.4890, zoom:13, height:420, caption:"Malta & Gozo" },
  },

  // UTILITY
  spacer: {
    label:"Spacer", category:"utility", icon: MoveVertical,
    fields: {
      height:{ type:"number", label:"Height (px)", min:8, max:400 },
      showLine:{ type:"boolean", label:"Show Divider Line" },
    },
    defaults: { height:80, showLine:false },
  },

  divider: {
    label:"Divider", category:"utility", icon: Minus,
    fields: {
      style:{ type:"select", label:"Style", options:["solid","dashed","gradient","dots","double"] },
      color:{ type:"color", label:"Color" },
    },
    defaults: { style:"gradient", color:"rgba(212,175,55,0.3)" },
  },
};

// ─── BLOCK CATEGORIES ─────────────────────────────────────────
export const CATEGORIES = [
  { id:"global",     name:"Global" },
  { id:"layout",     name:"Page Sections" },
  { id:"content",    name:"Content" },
  { id:"data",       name:"Data & Business" },
  { id:"social",     name:"Social Proof" },
  { id:"properties", name:"Properties" },
  { id:"conversion", name:"Conversion" },
  { id:"ai",         name:"AI-Powered" },
  { id:"media",      name:"Media" },
  { id:"utility",    name:"Utility" },
];

// ─── PAGE TEMPLATES ───────────────────────────────────────────
export const PAGE_TEMPLATES = {
  home: {
    name:"Home Page",
    blocks:[
      { type:"header" },
      { type:"hero" },
      { type:"stats" },
      { type:"features" },
      { type:"properties" },
      { type:"owners_hero" },
      { type:"testimonials" },
      { type:"pricing" },
      { type:"about" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
  owners: {
    name:"For Owners",
    blocks:[
      { type:"header" },
      { type:"owners_hero" },
      { type:"features" },
      { type:"pricing" },
      { type:"testimonials" },
      { type:"faq" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
  properties: {
    name:"Properties",
    blocks:[
      { type:"header" },
      { type:"hero" },
      { type:"properties" },
      { type:"guesty_listings" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
  about: {
    name:"About Us",
    blocks:[
      { type:"header" },
      { type:"hero" },
      { type:"about" },
      { type:"stats" },
      { type:"team" },
      { type:"logos" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
  contact: {
    name:"Contact",
    blocks:[
      { type:"header" },
      { type:"contact" },
      { type:"map" },
      { type:"footer" },
    ],
  },
  pricing: {
    name:"Pricing",
    blocks:[
      { type:"header" },
      { type:"pricing" },
      { type:"faq" },
      { type:"testimonials" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
  landing: {
    name:"Minimal Landing",
    blocks:[
      { type:"hero" },
      { type:"stats" },
      { type:"features" },
      { type:"cta" },
      { type:"footer" },
    ],
  },
};

// Auto-expand PAGE_TEMPLATES to include data defaults for every block
Object.keys(PAGE_TEMPLATES).forEach(pageKey => {
  PAGE_TEMPLATES[pageKey].blocks = PAGE_TEMPLATES[pageKey].blocks.map((b, i) => ({
    id: b.id || `${b.type}_${pageKey}_${i}`,
    type: b.type,
    data: b.data || { ...(SCHEMAS[b.type]?.defaults || {}) },
    visible: b.visible !== false,
  }));
});

// ─── DEFAULT SITE CONTENT ─────────────────────────────────────
export const DEFAULT_PAGES = [
  { id:"p_home", name:"Home", slug:"/", published:true, blocks:[
    { id:"b_header", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_hero", type:"hero", data:SCHEMAS.hero.defaults },
    { id:"b_stats", type:"stats", data:SCHEMAS.stats.defaults },
    { id:"b_features", type:"features", data:SCHEMAS.features.defaults },
    { id:"b_properties", type:"properties", data:SCHEMAS.properties.defaults },
    { id:"b_testi", type:"testimonials", data:SCHEMAS.testimonials.defaults },
    { id:"b_cta", type:"cta", data:SCHEMAS.cta.defaults },
    { id:"b_footer", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_owners", name:"Owners", slug:"/property-owners", published:true, blocks:[
    { id:"b_header2", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_ohero", type:"owners_hero", data:SCHEMAS.owners_hero.defaults },
    { id:"b_feats", type:"features", data:SCHEMAS.features.defaults },
    { id:"b_price", type:"pricing", data:SCHEMAS.pricing.defaults },
    { id:"b_faq", type:"faq", data:SCHEMAS.faq.defaults },
    { id:"b_cta2", type:"cta", data:SCHEMAS.cta.defaults },
    { id:"b_footer2", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_properties", name:"Properties", slug:"/properties", published:true, blocks:[
    { id:"b_header3", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_props", type:"properties", data:SCHEMAS.properties.defaults },
    { id:"b_footer3", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_contact", name:"Contact", slug:"/contact", published:false, blocks:[
    { id:"b_header4", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_contact", type:"contact", data:SCHEMAS.contact.defaults },
    { id:"b_footer4", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────
export const uid = () => `b${Date.now()}${Math.random().toString(36).slice(2,8)}`;
export const deepClone = (x) => JSON.parse(JSON.stringify(x));

// ─── PAGE CONFIGS (for compatibility) ─────────────────────────
export const PAGE_CONFIGS = {
  home: { name: "Home", slug: "/" },
  owners: { name: "For Owners", slug: "/property-owners" },
  properties: { name: "Properties", slug: "/properties" },
  about: { name: "About", slug: "/about" },
  contact: { name:"Contact", slug:"/contact" },
  pricing: { name:"Pricing", slug:"/pricing" },
};

export default { SCHEMAS, CATEGORIES, PAGE_TEMPLATES, DEFAULT_PAGES, THEME, FONT_PAIRS, COLOR_PRESETS, uid, deepClone, PAGE_CONFIGS };
