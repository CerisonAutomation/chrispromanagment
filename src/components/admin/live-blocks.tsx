/**
 * LiveBlocks.jsx — Exact mirror renderers of every frontend section
 * Each block matches the actual page pixel-for-pixel, with InlineText editing.
 * Used exclusively by AdminPage.jsx canvas.
 */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ArrowRight, Star, Check, X, Users, TrendingUp, Sparkles, ClipboardList,
  Building, Home, ChevronRight, MessageCircle, Quote, HeartHandshake,
  Phone, Mail, MapPin, Camera, Shield, Award, Zap, BadgePercent,
  ChevronDown, Instagram, Facebook, Play, Calendar as CalendarIcon,
  Search, Wifi, ExternalLink, BedDouble, Bath, RefreshCw, AlertCircle,
  Plus, Minus, BarChart3, Wrench, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Icon registry for CMS-driven icons
const ICON_MAP = {
  TrendingUp, Users, Sparkles, ClipboardList, Shield, Award, Check, Star,
  MessageCircle, Camera, Building, Home, Phone, Mail, Zap, BadgePercent
};

// ─── Field resolvers — match PropertyCard.jsx exactly (zero hardcoding) ─────
const resolveImage = (l) => {
  if (l?.picture?.large)     return l.picture.large;
  if (l?.picture?.original)  return l.picture.original;
  if (l?.picture?.thumbnail) return l.picture.thumbnail;
  const p = l?.pictures;
  if (Array.isArray(p) && p.length) return p[0]?.original || p[0]?.large || p[0]?.thumbnail || "";
  return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
};
const resolvePrice = (l) => {
  const rates = l?.nightlyRates;
  if (rates && typeof rates === "object") {
    const vals = Object.values(rates).filter(v => Number.isFinite(v) && v > 0);
    if (vals.length) return Math.min(...vals);
  }
  return l?.prices?.basePrice || 0;
};
const resolveLocation = (l) => {
  const a = l?.address;
  return [a?.city || a?.neighborhood, a?.country].filter(Boolean).join(", ") || "Malta";
};
const resolveRating = (l) => {
  const r = l?.reviews;
  if (!r) return null;
  const avg = r.avg ?? r.averageRating ?? null;
  if (avg == null) return null;
  return avg > 5 ? +(avg / 2).toFixed(1) : +avg.toFixed(1);
};
const formatMoney = (amount, currency = "EUR") => {
  try { return new Intl.NumberFormat("en-EU", { style:"currency", currency, minimumFractionDigits:0, maximumFractionDigits:0 }).format(Number(amount)||0); }
  catch { return `€${Math.round(Number(amount)||0)}`; }
};

// ─── useGuestyListings — shared data hook, ALL property blocks use this ──────
function useGuestyListings({ limit = 6, filters = {} } = {}) {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const filterKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const p = new URLSearchParams({ limit: String(Math.min(limit, 50)) });
      if (filters.checkIn)  p.set("checkIn",            filters.checkIn);
      if (filters.checkOut) p.set("checkOut",           filters.checkOut);
      if (filters.guests)   p.set("minOccupancy",       String(filters.guests));
      if (filters.bedrooms) p.set("numberOfBedrooms",   String(filters.bedrooms));
      const res  = await fetch(`${API}/listings?${p}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setListings(data.results || data.data || []);
    } catch (e) { setError(e.message || "Failed to load from Guesty"); }
    finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, filterKey]);

  useEffect(() => { load(); }, [load]);
  return { listings, loading, error, reload: load };
}

// ─── Shared ListingCard — ALL data from Guesty, zero hardcoded fields ────────
const PropSkeleton = () => (
  <div className="bg-[#161618] border border-white/5 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-[#27272A]" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-[#27272A] rounded w-3/4" /><div className="h-3 bg-[#27272A] rounded w-1/2" />
    </div>
  </div>
);
const ListingCard = ({ listing }) => {
  const image    = resolveImage(listing);
  const price    = resolvePrice(listing);
  const currency = listing?.prices?.currency || "EUR";
  const location = resolveLocation(listing);
  const rating   = resolveRating(listing);
  return (
    <a href={`/property/${listing._id}`} className="group bg-[#161618] border border-white/5 hover:border-[#D4AF37]/30 transition-all overflow-hidden block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={listing.title || listing.nickname || "Property"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={e => { e.target.src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"; }} />
        {price > 0 && <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#0F0F10] text-[11px] font-bold px-3 py-1 leading-none">from {formatMoney(price, currency)}/night</span>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-['Playfair_Display'] text-base text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors leading-tight">{listing.title || listing.nickname || "Property"}</h3>
          <ExternalLink className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0 mt-0.5" />
        </div>
        <p className="text-[11px] text-[#A1A1AA] uppercase tracking-wider mb-3">{location}</p>
        <div className="flex flex-wrap gap-3 text-[11px] text-[#A1A1AA]">
          {listing.accommodates > 0 && <span className="flex items-center gap-1"><Users size={11}/>{listing.accommodates} guests</span>}
          {listing.bedrooms > 0     && <span className="flex items-center gap-1"><BedDouble size={11}/>{listing.bedrooms} bed</span>}
          {listing.bathrooms > 0    && <span className="flex items-center gap-1"><Bath size={11}/>{listing.bathrooms} bath</span>}
          {rating                   && <span className="flex items-center gap-1 ml-auto"><Star size={11} className="text-[#D4AF37]"/>{rating}</span>}
        </div>
      </div>
    </a>
  );
};

// ─── InlineText: click-to-edit with proper useRef ──────────────────────────
export const InlineText = memo(({ value, onChange, tag: Tag = "span", className = "", style = {}, multiline = false }) => {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);

  const handleBlur = () => {
    setEditing(false);
    if (ref.current && onChange) {
      const next = ref.current.innerText;
      if (next !== value) onChange(next);
    }
  };

  return (
    <Tag
      ref={ref}
      contentEditable={!!onChange}
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onKeyDown={e => {
        if (e.key === "Enter" && !multiline) { e.preventDefault(); ref.current?.blur(); }
        if (e.key === "Escape") { if (ref.current) ref.current.innerText = value || ""; ref.current?.blur(); }
      }}
      className={`${className} ${onChange ? `outline-none transition-all ${editing ? "ring-2 ring-[#D4AF37] ring-offset-1 ring-offset-black/20 rounded bg-black/10 px-0.5" : "hover:ring-1 hover:ring-[#D4AF37]/40 hover:bg-black/5 hover:rounded cursor-text"}` : ""}`}
      style={style}
    >
      {value}
    </Tag>
  );
});

// ─── 1. HERO — exact match of LandingPage hero ──────────────────────────────
export const LiveHero = memo(({ d, onEdit }) => (
  <section className="relative min-h-[540px] flex items-center overflow-hidden bg-[#0F0F10]">
    <div className="absolute inset-0">
      <img
        src={d.backgroundImage || "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80"}
        alt=""
        className="w-full h-[120%] object-cover"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/50 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F10]/60 to-transparent" />
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-3xl">
        <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-6">
          <InlineText
            value={d.badge || "Malta's Premier Property Management"}
            onChange={onEdit && (v => onEdit("badge", v))}
            className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium"
          />
        </div>
        <h1 className="font-['Playfair_Display'] text-[clamp(2.5rem,6vw,5rem)] text-[#F5F5F0] mb-6 leading-[1.05]">
          <InlineText value={d.headline || "Your Home in Malta,"} onChange={onEdit && (v => onEdit("headline", v))} tag="span" />
          <br />
          <InlineText
            value={d.headlineAccent || "Looked After Like a Hotel"}
            onChange={onEdit && (v => onEdit("headlineAccent", v))}
            tag="span"
            className="italic"
            style={{ background: "linear-gradient(135deg,#D4AF37,#E5C158)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          />
        </h1>
        <InlineText
          value={d.subheadline || "Handpicked luxury accommodations across Malta's most sought-after locations."}
          onChange={onEdit && (v => onEdit("subheadline", v))}
          tag="p"
          multiline
          className="text-lg text-[#A1A1AA] mb-10 max-w-2xl leading-relaxed"
        />
        <div className="flex flex-wrap gap-4 mb-12">
          <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6 font-semibold">
            <Building className="w-4 h-4 mr-2" />
            <InlineText value={d.cta1Text || "List Your Property"} onChange={onEdit && (v => onEdit("cta1Text", v))} />
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6">
            <Home className="w-4 h-4 mr-2" />
            <InlineText value={d.cta2Text || "Book a Stay"} onChange={onEdit && (v => onEdit("cta2Text", v))} />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          {(d.stats || [{ value: "9+", label: "Years Superhost" }, { value: "100%", label: "Response Rate" }, { value: "4.9", label: "Average Rating" }]).map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <InlineText
                value={s.value}
                onChange={onEdit && (v => { const stats = [...(d.stats||[])]; stats[i]={...stats[i],value:v}; onEdit("stats",stats); })}
                tag="span"
                className="font-['Playfair_Display'] text-3xl text-[#D4AF37]"
              />
              <InlineText
                value={s.label}
                onChange={onEdit && (v => { const stats = [...(d.stats||[])]; stats[i]={...stats[i],label:v}; onEdit("stats",stats); })}
                tag="span"
                className="text-sm text-[#A1A1AA] leading-tight"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));

// ─── 2. OWNERS SECTION — exact match of LandingPage owners section ──────────
export const LiveOwnersSection = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <InlineText value={d.badge || "For Property Owners"} onChange={onEdit && (v => onEdit("badge",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-6 leading-tight">
            <InlineText value={d.title || "Maximize Your Property's"} onChange={onEdit && (v => onEdit("title",v))} tag="span" />{" "}
            <span style={{ background: "linear-gradient(135deg,#D4AF37,#E5C158)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              <InlineText value={d.titleAccent || "Full Potential"} onChange={onEdit && (v => onEdit("titleAccent",v))} tag="span" />
            </span>
          </h2>
          <InlineText
            value={d.description || "With over 9 years of Superhost experience and a background in international luxury hotel management, we specialize in making your property stand out in Malta's competitive market."}
            onChange={onEdit && (v => onEdit("description",v))}
            tag="p" multiline
            className="text-[#A1A1AA] text-lg mb-8 leading-relaxed"
          />
          <ul className="space-y-4 mb-8">
            {(d.benefits || [
              {text:"Tailored Property Management"},{text:"Expertise You Can Trust"},
              {text:"Selective Portfolio Approach"},{text:"Comprehensive Services"}
            ]).map((item, i) => (
              <li key={i} className="flex items-center gap-3 group">
                <div className="w-6 h-6 bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <InlineText
                  value={item.text}
                  onChange={onEdit && (v => { const b=[...(d.benefits||[])]; b[i]={...b[i],text:v}; onEdit("benefits",b); })}
                  tag="span" className="text-[#F5F5F0]"
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-4 font-semibold">
              <InlineText value={d.cta1 || "Get Started"} onChange={onEdit && (v => onEdit("cta1",v))} />
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-8 py-4">
              <InlineText value={d.cta2 || "View Pricing Plans"} onChange={onEdit && (v => onEdit("cta2",v))} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(d.services || [
            {icon:"Users",label:"24/7 Guest Support",desc:"Always available"},
            {icon:"TrendingUp",label:"Dynamic Pricing",desc:"Maximize revenue"},
            {icon:"Sparkles",label:"Pro Cleaning",desc:"After every stay"},
            {icon:"ClipboardList",label:"Monthly Reports",desc:"Full transparency"},
          ]).map((item, i) => {
            const Icon = ICON_MAP[item.icon] || Star;
            return (
              <div key={i} className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all duration-300 group">
                <Icon className="w-8 h-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-[#F5F5F0] font-semibold mb-1">{item.label}</p>
                <p className="text-[#A1A1AA] text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
));

// ─── 3. ABOUT SECTION ────────────────────────────────────────────────────────
export const LiveAbout = memo(({ d, onEdit }) => (
  <section id="about" className="relative py-24 overflow-hidden bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <InlineText value={d.label || "About Us"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-8 leading-tight">
            <InlineText value={d.title || "We Know What a Good"} onChange={onEdit && (v => onEdit("title",v))} tag="span" />{" "}
            <InlineText value={d.titleAccent || "Stay Feels Like"} onChange={onEdit && (v => onEdit("titleAccent",v))} tag="span" className="italic" />
          </h2>
          <div className="space-y-6 text-[#A1A1AA] leading-relaxed">
            {(d.paragraphs || [
              {text:"At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations."},
              {text:"With over 9 years of Superhost experience, we understand the unique appeal of the island and how to make your property stand out."},
              {text:"We believe in transparency and provide detailed monthly reports so property owners are always in the loop."},
            ]).map((p, i) => (
              <InlineText
                key={i}
                value={p.text}
                onChange={onEdit && (v => { const ps=[...(d.paragraphs||[])]; ps[i]={...ps[i],text:v}; onEdit("paragraphs",ps); })}
                tag="p" multiline
              />
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <Button className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none uppercase text-sm tracking-widest px-6 py-4">
              <MessageCircle className="w-4 h-4 mr-2" />
              <InlineText value={d.ctaText || "Get in Touch"} onChange={onEdit && (v => onEdit("ctaText",v))} />
            </Button>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="aspect-[4/3] overflow-hidden bg-[#161618]">
            <img
              src={d.image || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-[#D4AF37]/30 hidden lg:block" />
        </div>
      </div>
    </div>
  </section>
));

// ─── 4. PROPERTIES SECTION — fetches REAL Guesty data ───────────────────────
// ─── 4. PROPERTIES — ALL DATA LIVE FROM GUESTY (no hardcoded fields) ─────────
// Block props: label, title, ctaText, limit, checkIn, checkOut, minGuests, minBedrooms
export const LiveProperties = memo(({ d, onEdit }) => {
  const { listings, loading, error, reload } = useGuestyListings({
    limit: d.limit || d.showCount || 6,
    filters: { checkIn: d.checkIn||"", checkOut: d.checkOut||"", guests: d.minGuests||0, bedrooms: d.minBedrooms||0 }
  });
  return (
    <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <InlineText value={d.label || "Featured Properties"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
            <InlineText value={d.title || "Explore Our Portfolio"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] leading-tight" />
          </div>
          {d.ctaText && (
            <a href="/properties" className="flex items-center gap-2 border border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] text-sm uppercase tracking-widest px-6 py-3 transition-all self-start">
              <InlineText value={d.ctaText} onChange={onEdit && (v => onEdit("ctaText",v))} />
              <ArrowRight className="w-4 h-4 shrink-0" />
            </a>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({length: d.limit||d.showCount||6}).map((_,i) => <PropSkeleton key={i} />)}
          {!loading && error && (
            <div className="col-span-3 py-12 text-center">
              <AlertCircle className="w-10 h-10 text-[#A1A1AA] opacity-30 mx-auto mb-3" />
              <p className="text-sm text-[#A1A1AA] mb-3">{error}</p>
              <button onClick={reload} className="text-xs text-[#D4AF37] flex items-center gap-1.5 mx-auto"><RefreshCw size={12}/>Retry</button>
            </div>
          )}
          {!loading && !error && listings.slice(0, d.limit||d.showCount||6).map(l => <ListingCard key={l._id} listing={l} />)}
        </div>
        {!loading && <div className="mt-4 flex justify-end"><button onClick={reload} className="text-[11px] text-[#D4AF37]/40 hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"><RefreshCw size={10}/>Refresh from Guesty</button></div>}
      </div>
    </section>
  );
});

// ─── 5. STATS BAR ────────────────────────────────────────────────────────────
export const LiveStats = memo(({ d, onEdit }) => (
  <section className="py-8 bg-[#0F0F10] border-y border-white/5">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {(d.items || [
          {value:"9+",label:"Years Superhost"},
          {value:"100%",label:"Response Rate"},
          {value:"4.9★",label:"Avg Rating"},
          {value:"40%",label:"Revenue Boost"},
        ]).map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <InlineText
              value={s.value}
              onChange={onEdit && (v => { const items=[...(d.items||[])]; items[i]={...items[i],value:v}; onEdit("items",items); })}
              tag="span" className="font-['Playfair_Display'] text-3xl text-[#D4AF37]"
            />
            <InlineText
              value={s.label}
              onChange={onEdit && (v => { const items=[...(d.items||[])]; items[i]={...items[i],label:v}; onEdit("items",items); })}
              tag="span" className="text-sm text-[#A1A1AA] leading-tight"
            />
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── 6. FEATURES GRID ────────────────────────────────────────────────────────
export const LiveFeatures = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-12">
        <InlineText value={d.label || "What We Do"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
        <InlineText value={d.title || "Full-service property care"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className={`grid md:grid-cols-2 ${d.columns === "4" ? "lg:grid-cols-4" : d.columns === "2" ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-6`}>
        {(d.items || [
          {icon:"Sparkles",title:"Listing & Marketing",desc:"Professional photography, multi-channel listings, and smart pricing."},
          {icon:"ClipboardList",title:"Booking Management",desc:"24/7 guest communication and seamless check-in coordination."},
          {icon:"Shield",title:"Maintenance",desc:"Vetted local contractors, cleaning and linen service after every stay."},
        ]).map((f, i) => {
          const Icon = ICON_MAP[f.icon] || Star;
          return (
            <div key={i} className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all">
              <Icon className="w-10 h-10 text-[#D4AF37] mb-4" />
              <InlineText value={f.title} onChange={onEdit && (v => { const items=[...(d.items||[])]; items[i]={...items[i],title:v}; onEdit("items",items); })} tag="h3" className="text-[#F5F5F0] font-semibold mb-2" />
              <InlineText value={f.desc} onChange={onEdit && (v => { const items=[...(d.items||[])]; items[i]={...items[i],desc:v}; onEdit("items",items); })} tag="p" multiline className="text-[#A1A1AA] text-sm leading-relaxed" />
            </div>
          );
        })}
      </div>
    </div>
  </section>
));

// ─── 7. TESTIMONIALS — exact match ──────────────────────────────────────────
export const LiveTestimonials = memo(({ d, onEdit }) => {
  const [current, setCurrent] = useState(0);
  const items = d.items || [];
  const item = items[current] || items[0] || {};
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <InlineText value={d.label || "Guest Reviews"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <InlineText value={d.title || "What Our Guests Say"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
        </div>
        {items.length > 0 && (
          <div className="relative bg-[#161618] border border-white/5 p-8 md:p-12">
            <Quote className="absolute top-8 left-8 w-12 h-12 text-[#D4AF37]/20" />
            <div className="relative z-10">
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-5 h-5 ${j < (item.rating || 5) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A1A1AA]"}`} />
                ))}
              </div>
              <blockquote className="text-lg md:text-xl text-[#F5F5F0] text-center mb-8 leading-relaxed max-w-3xl mx-auto">
                "{item.text}"
              </blockquote>
              <div className="text-center">
                <p className="text-[#F5F5F0] font-semibold">{item.name}</p>
                <p className="text-[#A1A1AA] text-sm">{item.date}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {items.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? "bg-[#D4AF37] w-6" : "bg-white/20 hover:bg-white/40 w-2"}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

// ─── 8. CTA SECTION ──────────────────────────────────────────────────────────
export const LiveCTA = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`, backgroundSize: "40px 40px" }} />
    </div>
    <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
      <HeartHandshake className="w-16 h-16 text-[#D4AF37] mx-auto mb-8" />
      <InlineText value={d.title || "Ready to Get Started?"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-6 leading-tight" />
      <InlineText value={d.subtitle || "Whether you're a guest looking for the perfect stay or a property owner seeking professional management, we're here to help."} onChange={onEdit && (v => onEdit("subtitle",v))} tag="p" multiline className="text-[#A1A1AA] text-lg mb-10 max-w-2xl mx-auto leading-relaxed" />
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold">
          <Building className="w-4 h-4 mr-2" />
          <InlineText value={d.cta1Text || "List Your Property"} onChange={onEdit && (v => onEdit("cta1Text",v))} />
        </Button>
        <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-8 py-6">
          <Home className="w-4 h-4 mr-2" />
          <InlineText value={d.cta2Text || "Browse Properties"} onChange={onEdit && (v => onEdit("cta2Text",v))} />
        </Button>
      </div>
      <div className="pt-8 border-t border-white/5">
        <p className="text-[#A1A1AA] mb-4 text-sm">Or reach us directly</p>
        <div className="flex flex-wrap justify-center gap-6">
          <span className="flex items-center gap-2 text-[#F5F5F0] text-sm"><Phone className="w-4 h-4" />+356 7979 0202</span>
          <span className="flex items-center gap-2 text-[#F5F5F0] text-sm"><Mail className="w-4 h-4" />info@christianopropertymanagement.com</span>
        </div>
      </div>
    </div>
  </section>
));

// ─── 9. OWNERS HERO (for Owners page) ───────────────────────────────────────
export const LiveOwnersHero = memo(({ d, onEdit }) => (
  <section className="py-16 md:py-24 relative overflow-hidden bg-[#0F0F10]">
    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent" />
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative">
      <div className="max-w-3xl">
        <InlineText value={d.badge || "For Property Owners"} onChange={onEdit && (v => onEdit("badge",v))} tag="span" className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block" />
        <h1 className="font-['Playfair_Display'] text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F0] mb-6 leading-tight">
          <InlineText value={d.title || "Maximize Your Property's"} onChange={onEdit && (v => onEdit("title",v))} tag="span" />
          <br />
          <span style={{ background: "linear-gradient(135deg,#D4AF37,#E5C158)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            <InlineText value={d.titleAccent || "Full Potential"} onChange={onEdit && (v => onEdit("titleAccent",v))} tag="span" />
          </span>
        </h1>
        <InlineText
          value={d.description || "With over 9 years of Superhost experience and a background in international luxury hotel management, we specialize in making your property stand out in Malta's competitive market."}
          onChange={onEdit && (v => onEdit("description",v))}
          tag="p" multiline
          className="text-lg md:text-xl text-[#A1A1AA] mb-8 max-w-2xl"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold">
            <Building className="w-4 h-4 mr-2" />
            <InlineText value={d.cta1 || "List Your Property"} onChange={onEdit && (v => onEdit("cta1",v))} />
          </Button>
          <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-8 py-6">
            <Phone className="w-4 h-4 mr-2" />
            <InlineText value={d.cta2 || "Schedule a Call"} onChange={onEdit && (v => onEdit("cta2",v))} />
          </Button>
        </div>
      </div>
    </div>
  </section>
));

// ─── 10. PRICING TABLE — exact match of PropertyOwnersPage ──────────────────
export const LivePricing = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0A0A0B]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16">
        <InlineText value={d.label || "Management Plans"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block" />
        <InlineText value={d.title || "One fee. No surprises."} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-4" />
        <InlineText value={d.note || "A single commission on net room revenue. All new properties launch with Superhost credibility from day one."} onChange={onEdit && (v => onEdit("note",v))} tag="p" multiline className="text-[#A1A1AA] max-w-2xl mx-auto" />
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Essentials */}
        <div className="bg-[#161618] border border-white/5 p-8">
          <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-2">Essentials</h3>
          <p className="text-[#A1A1AA] text-sm mb-6">Core operations. Your property listed, managed, and maintained.</p>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-['Playfair_Display'] text-5xl text-[#D4AF37]">15%</span>
            <span className="text-[#A1A1AA]">of Net Room Revenue + VAT</span>
          </div>
          <ul className="space-y-2 text-sm text-[#A1A1AA] mb-8">
            {["Multi-channel listing creation & management","Superhost status from day one","Smart seasonal pricing optimization","Reviews & reputation management","Guest communication & 24/7 concierge","Professional cleaning & laundry"].map((f,i) => (
              <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Button variant="outline" className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none uppercase tracking-widest py-4">Get Started</Button>
        </div>
        {/* Complete */}
        <div className="bg-[#161618] border-2 border-[#D4AF37]/30 p-8 relative">
          <div className="absolute -top-3 left-8 bg-[#D4AF37] text-[#0F0F10] px-4 py-1 text-xs uppercase tracking-widest font-semibold">Most Popular</div>
          <h3 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-2">Complete</h3>
          <p className="text-[#A1A1AA] text-sm mb-6">Full-service management. The guest experience that drives better returns.</p>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-['Playfair_Display'] text-5xl text-[#D4AF37]">18%</span>
            <span className="text-[#A1A1AA]">of Net Room Revenue + VAT</span>
          </div>
          <ul className="space-y-2 text-sm text-[#A1A1AA] mb-8">
            {["Everything in Essentials","Welcome amenities — wine, coffee, toiletries","Monthly reporting included","All callout fees included","Annual photography refresh included","Quarterly performance reviews","Priority 24-hour owner response time"].map((f,i) => (
              <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />{f}</li>
            ))}
          </ul>
          <Button className="w-full bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest py-4">Get Started</Button>
        </div>
      </div>
    </div>
  </section>
));

// ─── 11. WHY US SECTION ──────────────────────────────────────────────────────
export const LiveWhyUs = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16">
        <InlineText value={d.label || "Why Partner With Us"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block" />
        <InlineText value={d.title || "Expertise You Can Trust"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {(d.items || [
          {title:"9+ Years Superhost",description:"Consistent Superhost recognition across all our managed properties since 2015."},
          {title:"International Expertise",description:"Background in luxury hotel management brings world-class standards to every property."},
          {title:"Transparent Reporting",description:"Detailed monthly statements with no hidden fees or surprise deductions."},
          {title:"Full Legal Compliance",description:"We handle MTA licensing, eco-tax, and all regulatory requirements."},
        ]).map((item, i) => (
          <div key={i} className="bg-[#161618] p-8 border border-white/5 hover:border-[#D4AF37]/20 transition-colors">
            <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center mb-6">
              <Check className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <InlineText value={item.title} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],title:v}; onEdit("items",its); })} tag="h3" className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-3" />
            <InlineText value={item.description} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],description:v}; onEdit("items",its); })} tag="p" multiline className="text-[#A1A1AA] leading-relaxed" />
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── 12. SERVICES SECTION ────────────────────────────────────────────────────
export const LiveServices = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0A0A0B]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16">
        <InlineText value={d.subtitle || "What We Offer"} onChange={onEdit && (v => onEdit("subtitle",v))} tag="span" className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block" />
        <InlineText value={d.title || "Our Services"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(d.items || [
          {icon:"ClipboardList",title:"Property Assessment",desc:"Thorough evaluation to highlight your property's strengths"},
          {icon:"TrendingUp",title:"Dynamic Pricing",desc:"Smart pricing strategies to maximize occupancy"},
          {icon:"Users",title:"24/7 Guest Communication",desc:"Seamless, professional interaction at all times"},
          {icon:"Sparkles",title:"Professional Cleaning",desc:"Immaculate presentation after every guest"},
          {icon:"Shield",title:"Secure Payments",desc:"Hassle-free handling of payments and eco-tax"},
          {icon:"Camera",title:"Pro Photography",desc:"High-quality images that capture your property best"},
          {icon:"Star",title:"Reviews Management",desc:"Responding to reviews and maintaining reputation"},
          {icon:"Award",title:"Monthly Reports",desc:"Full transparency with data on bookings and earnings"},
        ]).map((s, i) => {
          const Icon = ICON_MAP[s.icon] || Star;
          return (
            <div key={i} className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all group">
              <Icon className="w-8 h-8 text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-[#F5F5F0] font-semibold mb-2">{s.title}</h3>
              <p className="text-[#A1A1AA] text-sm">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
));

// ─── 13. FAQ SECTION ─────────────────────────────────────────────────────────
export const LiveFAQ = memo(({ d, onEdit }) => {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-12">
          <InlineText value={d.label || "Common Questions"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-widest text-[#D4AF37] mb-4 block" />
          <InlineText value={d.title || "Frequently Asked Questions"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
        </div>
        <div className="space-y-4">
          {(d.items || [
            {q:"Do I need an MTA licence?",a:"Yes. All short-let properties in Malta require a Malta Tourism Authority licence. We guide you through the entire application."},
            {q:"What areas do you cover?",a:"We manage properties across all of Malta and Gozo, with expertise in Sliema, St Julian's, Valletta, and Mellieħa."},
            {q:"How quickly can my property go live?",a:"Most properties are listed within 2–3 weeks of onboarding, including professional photography and listing setup."},
            {q:"Can I block dates for personal use?",a:"Absolutely. You have full calendar control — block dates anytime with no penalties."},
          ]).map((item, i) => (
            <div key={i} className="bg-[#161618] border border-white/5">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <InlineText value={item.q} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],q:v}; onEdit("items",its); })} tag="span" className="text-[#F5F5F0] font-medium" />
                <ChevronDown className={`w-5 h-5 text-[#D4AF37] flex-shrink-0 transition-transform ${open===i?"rotate-180":""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <InlineText value={item.a} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],a:v}; onEdit("items",its); })} tag="p" multiline className="text-[#A1A1AA] leading-relaxed" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─── 14. FOOTER — exact match of Footer.jsx ──────────────────────────────────
export const LiveFooter = memo(({ d, onEdit }) => (
  <footer className="bg-[#0F0F10] border-t border-white/5">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 md:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="h-10 w-32 bg-[#D4AF37]/10 flex items-center justify-center mb-3 rounded">
            <span className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">LOGO</span>
          </div>
          <InlineText value={d.tagline || "Luxury short-term rentals across Malta."} onChange={onEdit && (v => onEdit("tagline",v))} tag="p" multiline className="text-[#A1A1AA] text-xs leading-relaxed mb-2" />
        </div>
        <div>
          <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">For Guests</h4>
          <nav className="flex flex-col gap-2">
            {["Browse Properties","Book a Stay","Contact Us"].map((l,i) => (
              <span key={i} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors cursor-pointer">{l}</span>
            ))}
          </nav>
        </div>
        <div>
          <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">For Owners</h4>
          <nav className="flex flex-col gap-2">
            {["Our Services","List Your Property","Pricing Plans"].map((l,i) => (
              <span key={i} className="text-xs text-[#A1A1AA] hover:text-[#D4AF37] transition-colors cursor-pointer">{l}</span>
            ))}
          </nav>
        </div>
        <div>
          <h4 className="font-['Playfair_Display'] text-sm text-[#F5F5F0] mb-3 font-semibold">Contact</h4>
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xs text-[#A1A1AA]"><Phone className="w-3 h-3" /><InlineText value={d.phone||"+356 7979 0202"} onChange={onEdit && (v => onEdit("phone",v))} /></span>
            <span className="flex items-center gap-2 text-xs text-[#A1A1AA]"><Mail className="w-3 h-3" /><InlineText value={d.email||"info@christianopropertymanagement.com"} onChange={onEdit && (v => onEdit("email",v))} /></span>
            <span className="flex items-start gap-2 text-xs text-[#71717A]"><MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />St Julian's, Malta</span>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#71717A]">© {new Date().getFullYear()} Christiano Vincenti PM. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
              <div key={i} className="w-7 h-7 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all cursor-pointer">
                <Icon className="w-3.5 h-3.5 text-[#A1A1AA]" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-[#71717A] hover:text-[#D4AF37] cursor-pointer">Privacy</span>
            <span className="text-[#71717A]">·</span>
            <span className="text-[#71717A] hover:text-[#D4AF37] cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
));

// ─── 15. HEADER PREVIEW ──────────────────────────────────────────────────────
export const LiveHeader = memo(({ d }) => (
  <header className="bg-[#0F0F10]/95 border-b border-white/5 py-3 px-6 flex items-center justify-between">
    <div className="h-10 w-32 bg-[#D4AF37]/10 flex items-center justify-center rounded">
      <span className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase">LOGO</span>
    </div>
    <nav className="hidden md:flex items-center gap-6">
      {["For Owners","Book a Stay","Contact"].map((l,i) => (
        <span key={i} className="text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#F5F5F0] cursor-pointer transition-colors">{l}</span>
      ))}
    </nav>
    <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-xs tracking-widest px-4 py-2 font-semibold">Book Now</Button>
  </header>
));

// ─── 16. SPACER / DIVIDER ────────────────────────────────────────────────────
export const LiveSpacer = memo(({ d }) => <div style={{ height: d.height || 80, background: "#0F0F10" }} />);
export const LiveDivider = memo(({ d }) => (
  <div className="py-4 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6" style={
      d.style === "gradient" ? { background: `linear-gradient(to right, transparent, #D4AF37, transparent)`, height: 1 }
      : d.style === "dots" ? { backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px)`, backgroundSize: "8px 8px", height: 4 }
      : { borderTop: `1px solid rgba(255,255,255,0.1)` }
    } />
  </div>
));

// ─── 17. LOGOS / TRUST BAR ───────────────────────────────────────────────────
export const LiveLogos = memo(({ d, onEdit }) => (
  <section className="py-12 bg-[#0A0A0B] border-y border-white/5">
    <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
      {d.label && <p className="text-center text-xs uppercase tracking-widest text-[#71717A] mb-8">{d.label}</p>}
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {(d.items || [{name:"Airbnb"},{name:"Booking.com"},{name:"Vrbo"},{name:"MTA"}]).map((item, i) => (
          <div key={i} className="flex items-center justify-center">
            {item.logo
              ? <img src={item.logo} alt={item.name} className="h-8 object-contain opacity-40 grayscale hover:opacity-70 transition-opacity" />
              : <span className="text-[#A1A1AA] font-semibold text-sm uppercase tracking-widest opacity-50">{item.name}</span>
            }
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── 18. TEAM ────────────────────────────────────────────────────────────────
export const LiveTeam = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-12">
        <InlineText value={d.title || "The Team"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0]" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(d.items || [{initials:"CV",name:"Christiano Vincenti",role:"Founder & Director",bio:"Twenty years in Maltese hospitality."}]).map((m, i) => (
          <div key={i} className="bg-[#161618] border border-white/5 p-6 text-center hover:border-[#D4AF37]/20 transition-all">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-[#D4AF37]">
              {m.image ? <img src={m.image} alt={m.name} className="w-full h-full rounded-full object-cover" /> : (m.initials || "?")}
            </div>
            <h3 className="text-[#F5F5F0] font-semibold mb-1">{m.name}</h3>
            <p className="text-[#D4AF37] text-xs uppercase tracking-wider mb-3">{m.role}</p>
            <p className="text-[#A1A1AA] text-sm">{m.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── Block map: type → component ─────────────────────────────────────────────
// ─── 19. SEARCH WIDGET ───────────────────────────────────────────────────────
export const LiveSearch = memo(({ d, onEdit }) => (
  <section className="py-8 bg-[#0F0F10]">
    <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
      {d.label && (
        <div className="text-center mb-6">
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label",v))} tag="p" className="text-xs uppercase tracking-widest text-[#D4AF37]" />
        </div>
      )}
      <div className="bg-[#161618] border border-white/10 p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5 min-w-0">
          <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#71717A]">Location</p>
            <p className="text-sm text-[#F5F5F0] truncate">Valletta, Malta</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5 min-w-0">
          <CalendarIcon className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#71717A]">Check-in</p>
            <p className="text-sm text-[#F5F5F0]">Select date</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5 min-w-0">
          <CalendarIcon className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#71717A]">Check-out</p>
            <p className="text-sm text-[#F5F5F0]">Select date</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5">
          <Users className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#71717A]">Guests</p>
            <p className="text-sm text-[#F5F5F0]">2 guests</p>
          </div>
        </div>
        <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-4 font-semibold shrink-0 h-auto">
          Search
        </Button>
      </div>
    </div>
  </section>
));

// ─── 20. CONTACT FORM ────────────────────────────────────────────────────────
export const LiveContact = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <InlineText value={d.label || "Get in Touch"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <InlineText value={d.title || "We'd love to hear from you"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-6" />
          <InlineText value={d.description || "Whether you're a guest looking for your perfect stay, or a property owner interested in our management services, our team is here to help."} onChange={onEdit && (v => onEdit("description",v))} tag="p" multiline className="text-[#A1A1AA] leading-relaxed mb-8" />
          <div className="space-y-4">
            {[
              { icon: Phone, text: "+356 7979 0202", label: "Phone" },
              { icon: Mail, text: "info@christianopropertymanagement.com", label: "Email" },
              { icon: MapPin, text: "The Fives A7, St Julian's, Malta", label: "Address" },
            ].map(({ icon: Icon, text, label }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-[#F5F5F0]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#161618] border border-white/5 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] block mb-2">First Name</label>
                <div className="bg-[#0F0F10] border border-white/10 h-10 px-3 flex items-center"><span className="text-[#71717A] text-sm">Your name</span></div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] block mb-2">Last Name</label>
                <div className="bg-[#0F0F10] border border-white/10 h-10 px-3 flex items-center"><span className="text-[#71717A] text-sm">Your surname</span></div>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] block mb-2">Email</label>
              <div className="bg-[#0F0F10] border border-white/10 h-10 px-3 flex items-center"><span className="text-[#71717A] text-sm">your@email.com</span></div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#D4AF37] block mb-2">Message</label>
              <div className="bg-[#0F0F10] border border-white/10 h-24 px-3 py-3"><span className="text-[#71717A] text-sm">How can we help you?</span></div>
            </div>
            <Button className="w-full bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase tracking-widest py-4 font-semibold">
              <InlineText value={d.ctaText || "Send Message"} onChange={onEdit && (v => onEdit("ctaText",v))} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
));

// ─── 21. TEXT + IMAGE (flexible) ─────────────────────────────────────────────
export const LiveTextImage = memo(({ d, onEdit }) => {
  const imageRight = d.imagePosition !== "left";
  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${imageRight ? "" : "lg:grid-flow-dense"}`}>
          <div className={imageRight ? "lg:order-1" : "lg:order-2"}>
            <InlineText value={d.label || ""} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
            <InlineText value={d.title || "Your Section Title Here"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0] mb-6 leading-tight" />
            <InlineText value={d.description || "Add your section description here. This flexible block lets you pair any text with an image on either side."} onChange={onEdit && (v => onEdit("description",v))} tag="p" multiline className="text-[#A1A1AA] text-lg mb-8 leading-relaxed" />
            {d.ctaText && (
              <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-4 font-semibold">
                <InlineText value={d.ctaText} onChange={onEdit && (v => onEdit("ctaText",v))} />
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
          <div className={imageRight ? "lg:order-2" : "lg:order-1"}>
            <div className="aspect-[4/3] overflow-hidden bg-[#161618]">
              {d.image
                ? <img src={d.image} alt={d.imageAlt || ""} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]"><span className="text-sm">Add image URL in editor →</span></div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// ─── 22. PULL QUOTE ──────────────────────────────────────────────────────────
export const LivePullQuote = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0A0A0B]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
      <Quote className="w-12 h-12 text-[#D4AF37]/30 mx-auto mb-6" />
      <InlineText
        value={d.quote || "The most professional property management team we have ever worked with. Revenue up 40% in year one."}
        onChange={onEdit && (v => onEdit("quote",v))}
        tag="blockquote" multiline
        className="font-['Playfair_Display'] text-2xl md:text-3xl text-[#F5F5F0] leading-relaxed mb-8 italic"
      />
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-px bg-[#D4AF37]/30" />
        <InlineText value={d.author || "— Maria C., Property Owner"} onChange={onEdit && (v => onEdit("author",v))} tag="cite" className="text-[#A1A1AA] not-italic text-sm" />
        <div className="w-12 h-px bg-[#D4AF37]/30" />
      </div>
    </div>
  </section>
));

// ─── 23. LIVE REVIEWS (from Guesty) ──────────────────────────────────────────
export function LiveReviewsLive({ d, onEdit }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminKey = localStorage.getItem("cvpm_admin_key") || "";
    fetch(`${API}/admin/reviews?limit=${d.limit || 6}`, { headers: { "X-Admin-Key": adminKey } })
      .then(r => r.json())
      .then(data => { setReviews(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [d.limit]);

  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-12">
          <InlineText value={d.label || "Guest Reviews"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <InlineText value={d.title || "What Our Guests Are Saying"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-[#161618] h-36 animate-pulse rounded" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, d.limit || 6).map((r, i) => {
              const raw = r.rawReview || {};
              const score = raw.overall_rating || raw.scoring?.review_score;
              const text = raw.public_review || raw.content?.positive || "Wonderful stay!";
              const reviewer = raw.reviewer?.name || raw.from?.first_name || "Guest";
              return (
                <div key={i} className="bg-[#161618] border border-white/5 p-6 hover:border-[#D4AF37]/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                      {reviewer[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F5F5F0]">{reviewer}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-[#D4AF37] fill-current" />)}
                      </div>
                    </div>
                    {score && <span className="ml-auto text-[#D4AF37] font-bold text-sm">{score}</span>}
                  </div>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed line-clamp-3">{text}</p>
                  <p className="text-xs text-[#5a5a5e] mt-3 capitalize">{r.channelId}</p>
                </div>
              );
            })}
            {reviews.length === 0 && (
              <div className="col-span-3 text-center py-8 text-[#5a5a5e]">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Reviews will appear here from Guesty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 24. PROPERTY SLIDER ─────────────────────────────────────────────────────
export const LivePropertySlider = memo(({ d, onEdit }) => {
  const { listings, loading } = useGuestyListings({ limit: d.count || 6 });
  return (
    <section className="py-24 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-12">
          <InlineText value={d.label || "Featured"} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3 block" />
          <InlineText value={d.title || "Featured Properties"} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
        </div>
        {loading ? (
          <div className="text-center text-[#9A9A92]">Loading…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(listings || []).slice(0, d.count || 6).map((p, i) => (
              <div key={p?._id || i} className="rounded-xl overflow-hidden bg-[#1A1A1B] border border-white/5">
                {p?.picture?.regular && <img src={p.picture.regular} alt={p.title || ""} className="w-full h-48 object-cover" loading="lazy" />}
                <div className="p-4">
                  <div className="font-semibold text-[#F5F5F0]">{p?.title || p?.nickname || "Property"}</div>
                  <div className="text-xs text-[#9A9A92] mt-1">{p?.address?.city || ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});


// ─── 25. NUMBERS / BIG STATS ─────────────────────────────────────────────────
export const LiveNumbers = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0A0A0B]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16">
        <InlineText value={d.label || "By the Numbers"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
        <InlineText value={d.title || "Our Impact in Malta"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {(d.items || [
          { value: "€2.4M+", label: "Revenue Generated", desc: "For our property owners" },
          { value: "45+", label: "Properties Managed", desc: "Across Malta & Gozo" },
          { value: "4.97★", label: "Average Rating", desc: "Across all platforms" },
          { value: "94%", label: "Occupancy Rate", desc: "Annual average" },
        ]).map((s, i) => (
          <div key={i} className="text-center">
            <InlineText value={s.value} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],value:v}; onEdit("items",its); })} tag="div" className="font-['Playfair_Display'] text-5xl md:text-6xl text-[#D4AF37] mb-2" />
            <InlineText value={s.label} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],label:v}; onEdit("items",its); })} tag="p" className="text-[#F5F5F0] font-semibold mb-1" />
            <InlineText value={s.desc} onChange={onEdit && (v => { const its=[...(d.items||[])]; its[i]={...its[i],desc:v}; onEdit("items",its); })} tag="p" className="text-[#A1A1AA] text-sm" />
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── 26. BANNER / ANNOUNCEMENT ───────────────────────────────────────────────
export const LiveBanner = memo(({ d, onEdit }) => (
  <div className={`py-3 px-6 flex items-center justify-center gap-4 ${d.style === "gold" ? "bg-[#D4AF37]" : d.style === "dark" ? "bg-[#0A0A0B] border-y border-white/10" : "bg-[#161618] border-y border-white/5"}`}>
    <InlineText
      value={d.text || "🏖️ Summer 2026 bookings now open — book early for the best rates!"}
      onChange={onEdit && (v => onEdit("text",v))}
      tag="p"
      className={`text-sm font-medium ${d.style === "gold" ? "text-[#0F0F10]" : "text-[#F5F5F0]"}`}
    />
    {d.ctaText && (
      <span className={`text-xs uppercase tracking-widest underline cursor-pointer font-semibold ${d.style === "gold" ? "text-[#0F0F10]" : "text-[#D4AF37]"}`}>
        <InlineText value={d.ctaText} onChange={onEdit && (v => onEdit("ctaText",v))} />
      </span>
    )}
  </div>
));

// ─── 27. RICH TEXT ───────────────────────────────────────────────────────────
export const LiveRichText = memo(({ d, onEdit }) => (
  <section className="py-12 bg-[#0F0F10]">
    <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-20 prose prose-invert">
      <InlineText
        value={d.content || "Add your rich text content here. This block supports full HTML and multi-paragraph text with proper formatting."}
        onChange={onEdit && (v => onEdit("content",v))}
        tag="div" multiline
        className="text-[#A1A1AA] leading-relaxed whitespace-pre-wrap"
      />
    </div>
  </section>
));

// ─── 28. MAP ─────────────────────────────────────────────────────────────────
export const LiveMap = memo(({ d, onEdit }) => (
  <section className="py-12 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      {d.title && (
        <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-6 text-center">
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title",v))} tag="span" />
        </h2>
      )}
      <div className="bg-[#161618] border border-white/5 overflow-hidden" style={{ height: d.height || 400 }}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#161618] to-[#0F0F10]">
          <MapPin className="w-12 h-12 text-[#D4AF37] mb-3" />
          <p className="text-[#A1A1AA] text-sm">Interactive Leaflet Map</p>
          <p className="text-[#71717A] text-xs mt-1">Malta, {d.lat || 35.9}, {d.lng || 14.5}</p>
        </div>
      </div>
    </div>
  </section>
));

// ─── 29. IMAGE GALLERY ───────────────────────────────────────────────────────
export const LiveImageGallery = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      {d.title && (
        <div className="text-center mb-8">
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0]" />
        </div>
      )}
      <div className={`grid gap-3 ${d.columns === "3" ? "grid-cols-3" : d.columns === "4" ? "grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
        {(d.images || []).slice(0, parseInt(d.columns || "3") * 2).map((img, i) => (
          <div key={i} className="aspect-video overflow-hidden bg-[#161618] group cursor-pointer">
            <img src={img.url || img} alt={img.alt || `Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
        {(!d.images || d.images.length === 0) && [...Array(6)].map((_, i) => (
          <div key={i} className="aspect-video bg-[#161618] border border-white/5 flex items-center justify-center text-[#A1A1AA]">
            <span className="text-xs">Add images in editor</span>
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── 30. VIDEO BLOCK ─────────────────────────────────────────────────────────
export const LiveVideo = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0A0A0B]">
    <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
      {d.title && (
        <div className="text-center mb-8">
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-2xl text-[#F5F5F0]" />
        </div>
      )}
      <div className="relative aspect-video bg-[#161618] border border-white/5 overflow-hidden group cursor-pointer">
        {d.thumbnail && <img src={d.thumbnail} alt="Video" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37] flex items-center justify-center group-hover:bg-[#E5C158] transition-colors shadow-lg">
            <Play className="w-6 h-6 text-[#0F0F10] ml-1" fill="currentColor" />
          </div>
        </div>
        {!d.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#A1A1AA] text-sm mt-20">Add YouTube/Vimeo URL in editor</p>
          </div>
        )}
      </div>
    </div>
  </section>
));

// ─── 31. TIMELINE / PROCESS STEPS ────────────────────────────────────────────
export const LiveTimeline = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-16">
        <InlineText value={d.label || "How It Works"} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
        <InlineText value={d.title || "Getting Started is Simple"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[#D4AF37]/20 hidden md:block" style={{ left: "1.25rem" }} />
        <div className="space-y-8">
          {(d.steps || [
            { number: "01", title: "Get in Touch", desc: "Contact us to discuss your property and management needs." },
            { number: "02", title: "Property Assessment", desc: "We visit, photograph, and evaluate your property's potential." },
            { number: "03", title: "Go Live", desc: "We list your property on Airbnb, Booking.com, and our direct site." },
            { number: "04", title: "Earn More", desc: "We handle everything while you enjoy passive income." },
          ]).map((step, i) => (
            <div key={i} className="flex items-start gap-6 relative">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0F0F10] font-bold text-sm z-10 flex-shrink-0">
                {step.number}
              </div>
              <div className="flex-1 bg-[#161618] border border-white/5 p-5 hover:border-[#D4AF37]/20 transition-all">
                <InlineText value={step.title} onChange={onEdit && (v => { const s=[...(d.steps||[])]; s[i]={...s[i],title:v}; onEdit("steps",s); })} tag="h3" className="text-[#F5F5F0] font-semibold mb-2" />
                <InlineText value={step.desc} onChange={onEdit && (v => { const s=[...(d.steps||[])]; s[i]={...s[i],desc:v}; onEdit("steps",s); })} tag="p" multiline className="text-[#A1A1AA] text-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));

// ─── 32. NEWSLETTER ──────────────────────────────────────────────────────────
export const LiveNewsletter = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#161618] border-y border-white/5">
    <div className="max-w-2xl mx-auto px-6 text-center">
      <InlineText value={d.title || "Stay Updated"} onChange={onEdit && (v => onEdit("title",v))} tag="h3" className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-3" />
      <InlineText value={d.subtitle || "Get notified of new properties, exclusive deals, and travel tips for Malta."} onChange={onEdit && (v => onEdit("subtitle",v))} tag="p" multiline className="text-[#A1A1AA] mb-6" />
      <div className="flex gap-2">
        <div className="flex-1 bg-[#0F0F10] border border-white/10 h-12 px-4 flex items-center">
          <span className="text-[#71717A] text-sm">your@email.com</span>
        </div>
        <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-xs tracking-widest px-6 h-12 font-semibold shrink-0">
          <InlineText value={d.ctaText || "Subscribe"} onChange={onEdit && (v => onEdit("ctaText",v))} />
        </Button>
      </div>
    </div>
  </section>
));

// ─── 33. TWO COLUMN ──────────────────────────────────────────────────────────
export const LiveTwoCol = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className={`grid lg:grid-cols-2 gap-8 ${d.gap === "lg" ? "lg:gap-16" : ""}`}>
        <div className="bg-[#161618] border border-white/5 p-8">
          <InlineText value={d.col1Title || "Column One"} onChange={onEdit && (v => onEdit("col1Title",v))} tag="h3" className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-4" />
          <InlineText value={d.col1Text || "Add your content for the left column here."} onChange={onEdit && (v => onEdit("col1Text",v))} tag="p" multiline className="text-[#A1A1AA] leading-relaxed" />
        </div>
        <div className="bg-[#161618] border border-white/5 p-8">
          <InlineText value={d.col2Title || "Column Two"} onChange={onEdit && (v => onEdit("col2Title",v))} tag="h3" className="font-['Playfair_Display'] text-xl text-[#F5F5F0] mb-4" />
          <InlineText value={d.col2Text || "Add your content for the right column here."} onChange={onEdit && (v => onEdit("col2Text",v))} tag="p" multiline className="text-[#A1A1AA] leading-relaxed" />
        </div>
      </div>
    </div>
  </section>
));

// ─── 34. ICON ROW ────────────────────────────────────────────────────────────
export const LiveIconRow = memo(({ d, onEdit }) => (
  <section className="py-12 bg-[#0A0A0B] border-y border-white/5">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {(d.items || [
          { icon: "Shield", label: "Insured & Licensed" },
          { icon: "Award", label: "Superhost Status" },
          { icon: "Star", label: "5-Star Service" },
          { icon: "Users", label: "24/7 Support" },
          { icon: "TrendingUp", label: "Dynamic Pricing" },
        ]).map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Star;
          return (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <Icon className="w-7 h-7 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-widest text-[#A1A1AA] font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  </section>
));

// ─── 35. COMPARISON TABLE ────────────────────────────────────────────────────
export const LiveComparison = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-10">
        <InlineText value={d.title || "Compare Our Plans"} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-3" />
        <InlineText value={d.subtitle || "Choose the plan that works best for your property."} onChange={onEdit && (v => onEdit("subtitle",v))} tag="p" className="text-[#A1A1AA]" />
      </div>
      <div className="border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0A0A0B]">
            <tr>
              <th className="px-6 py-4 text-left text-[#A1A1AA] font-medium">Feature</th>
              <th className="px-6 py-4 text-center text-[#F5F5F0] font-semibold">Essentials (15%)</th>
              <th className="px-6 py-4 text-center text-[#D4AF37] font-semibold border-l border-[#D4AF37]/20">Complete (18%)</th>
            </tr>
          </thead>
          <tbody>
            {(d.rows || [
              { feature: "Professional photography", essentials: true, complete: true },
              { feature: "Multi-platform listing", essentials: true, complete: true },
              { feature: "24/7 guest communication", essentials: true, complete: true },
              { feature: "Monthly reporting", essentials: false, complete: true },
              { feature: "Welcome amenities", essentials: false, complete: true },
              { feature: "Annual photography refresh", essentials: false, complete: true },
            ]).map((row, i) => (
              <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-[#0F0F10]" : "bg-[#161618]/50"}`}>
                <td className="px-6 py-3 text-[#A1A1AA]">{row.feature}</td>
                <td className="px-6 py-3 text-center">{row.essentials ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-[#5a5a5e] mx-auto" />}</td>
                <td className="px-6 py-3 text-center border-l border-[#D4AF37]/10">{row.complete ? <Check className="w-4 h-4 text-[#D4AF37] mx-auto" /> : <X className="w-4 h-4 text-[#5a5a5e] mx-auto" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
));

// ─── 39. GUESTY LISTINGS — full search + live results ────────────────────────
export const LiveGuestyListings = memo(({ d, onEdit }) => {
  const [checkIn,  setCheckIn]  = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests,   setGuests]   = useState(2);
  const [applied,  setApplied]  = useState({});
  const { listings, loading, error, reload } = useGuestyListings({
    limit: d.limit || 9,
    filters: applied,
  });
  const handleSearch = () => setApplied({ checkIn, checkOut, guests });
  return (
    <section className="py-16 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {(d.label || d.title) && (
          <div className="text-center mb-10">
            {d.label && <InlineText value={d.label} onChange={onEdit && (v => onEdit("label",v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />}
            {d.title && <InlineText value={d.title} onChange={onEdit && (v => onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0]" />}
          </div>
        )}
        {d.showSearch !== false && (
          <div className="bg-[#161618] border border-white/5 p-2 flex flex-col md:flex-row gap-2 mb-8">
            {[
              {icon:CalendarIcon,label:"Check-in",  el:<input type="date" value={checkIn}  onChange={e=>setCheckIn(e.target.value)}  className="bg-transparent text-sm text-[#F5F5F0] outline-none" />},
              {icon:CalendarIcon,label:"Check-out", el:<input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="bg-transparent text-sm text-[#F5F5F0] outline-none" />},
            ].map(({icon:Ic,label,el},i) => (
              <div key={i} className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5">
                <Ic className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div><p className="text-[10px] uppercase tracking-widest text-[#71717A]">{label}</p>{el}</div>
              </div>
            ))}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#0F0F10] border border-white/5">
              <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#71717A]">Guests</p>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setGuests(g=>Math.max(1,g-1))} className="w-5 h-5 border border-white/20 flex items-center justify-center text-[#A1A1AA] hover:text-[#D4AF37]"><Minus size={10}/></button>
                  <span className="text-sm text-[#F5F5F0] w-4 text-center">{guests}</span>
                  <button onClick={()=>setGuests(g=>g+1)} className="w-5 h-5 border border-white/20 flex items-center justify-center text-[#A1A1AA] hover:text-[#D4AF37]"><Plus size={10}/></button>
                </div>
              </div>
            </div>
            <Button onClick={handleSearch} className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 font-semibold h-auto">
              <Search className="w-4 h-4 mr-2"/>Search
            </Button>
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && Array.from({length:d.limit||9}).map((_,i)=><PropSkeleton key={i}/>)}
          {!loading && error && <GuestyError error={error} onRetry={reload}/>}
          {!loading && !error && listings.slice(0,d.limit||9).map(l=><ListingCard key={l._id} listing={l}/>)}
        </div>
        {!loading && listings.length > 0 && d.ctaText && (
          <div className="text-center mt-8">
            <a href="/properties" className="inline-flex items-center gap-2 border border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] text-sm uppercase tracking-widest px-8 py-3 transition-all">
              <InlineText value={d.ctaText} onChange={onEdit&&(v=>onEdit("ctaText",v))}/><ArrowRight className="w-4 h-4"/>
            </a>
          </div>
        )}
      </div>
    </section>
  );
});

// ─── 40. GUESTY BOOKING WIDGET — iframe embed ──────────────────────────────
export const LiveGuestyBook = memo(({ d, onEdit }) => (
  <section className="py-16 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      {d.title && (
        <div className="text-center mb-6">
          <InlineText value={d.title} onChange={onEdit&&(v=>onEdit("title",v))} tag="h2" className="font-['Playfair_Display'] text-3xl text-[#F5F5F0] mb-2"/>
          {d.subtitle && <InlineText value={d.subtitle} onChange={onEdit&&(v=>onEdit("subtitle",v))} tag="p" className="text-[#A1A1AA]"/>}
        </div>
      )}
      <div className="bg-[#161618] border border-white/5 overflow-hidden">
        {d.url
          ? <iframe src={d.url} className="w-full border-none" style={{height:d.height||760}} title="Book direct" loading="lazy"/>
          : <div className="flex items-center justify-center" style={{height:d.height||760}}>
              <div className="text-center">
                <p className="text-[#A1A1AA] text-sm mb-2 font-['Playfair_Display']">Guesty Booking Engine</p>
                <p className="text-[11px] text-[#5a5a5e]">Add Guesty booking URL in Props panel</p>
                <p className="text-[10px] text-[#3a3a3e] mt-1">e.g. https://malta.guestybookings.com/en</p>
              </div>
            </div>
        }
      </div>
    </div>
  </section>
));

// ─── Additional imports needed ─────────────────────────────────────────────

export const LIVE_BLOCKS = {
  hero: LiveHero,
  owners: LiveOwnersSection,
  owners_hero: LiveOwnersHero,
  about: LiveAbout,
  properties: LiveProperties,
  guesty_listings: LiveGuestyListings,
  guesty_book: LiveGuestyBook,
  booking_inline: LiveGuestyBook,
  stats: LiveStats,
  features: LiveFeatures,
  testimonials: LiveTestimonials,
  cta: LiveCTA,
  pricing: LivePricing,
  why_us: LiveWhyUs,
  services: LiveServices,
  faq: LiveFAQ,
  footer: LiveFooter,
  header: LiveHeader,
  spacer: LiveSpacer,
  divider: LiveDivider,
  logos: LiveLogos,
  team: LiveTeam,
  search: LiveSearch,
  contact: LiveContact,
  text_image: LiveTextImage,
  pull_quote: LivePullQuote,
  reviews_live: LiveReviewsLive,
  property_slider: LivePropertySlider,
  numbers: LiveNumbers,
  banner: LiveBanner,
  rich_text: LiveRichText,
  map: LiveMap,
  image_gallery: LiveImageGallery,
  video: LiveVideo,
  timeline: LiveTimeline,
  newsletter: LiveNewsletter,
  two_col: LiveTwoCol,
  icon_row: LiveIconRow,
  comparison: LiveComparison,
};

// ─── BLOCK CATEGORIES for the Add Panel ──────────────────────────────────────
export const BLOCK_CATEGORIES = [
  {
    id: "page",
    label: "Page Sections",
    icon: "Layout",
    blocks: [
      { type: "header", label: "Header / Nav", desc: "Site navigation" },
      { type: "hero", label: "Hero Section", desc: "Full-screen hero with bg image" },
      { type: "footer", label: "Footer", desc: "Site footer with links" },
    ]
  },
  {
    id: "content",
    label: "Content",
    icon: "Type",
    blocks: [
      { type: "about", label: "About Split", desc: "Text + image split" },
      { type: "text_image", label: "Text + Image", desc: "Flexible 2-col layout" },
      { type: "two_col", label: "Two Column", desc: "Generic 2-column" },
      { type: "rich_text", label: "Rich Text", desc: "HTML content block" },
      { type: "pull_quote", label: "Pull Quote", desc: "Featured testimonial" },
      { type: "banner", label: "Banner", desc: "Full-width announcement" },
      { type: "timeline", label: "Timeline", desc: "Process steps" },
    ]
  },
  {
    id: "properties",
    label: "Properties",
    icon: "Building",
    blocks: [
      { type: "properties", label: "Property Grid", desc: "Live Guesty listings" },
      { type: "property_slider", label: "Property Slider", desc: "Horizontal carousel" },
      { type: "search", label: "Search Widget", desc: "Location + date search" },
      { type: "map", label: "Map", desc: "Leaflet property map" },
    ]
  },
  {
    id: "social",
    label: "Social Proof",
    icon: "Star",
    blocks: [
      { type: "testimonials", label: "Testimonials", desc: "Guest reviews carousel" },
      { type: "reviews_live", label: "Live Reviews", desc: "Guesty reviews feed" },
      { type: "logos", label: "Trust Bar", desc: "Platform logos" },
      { type: "team", label: "Team", desc: "Team members" },
      { type: "numbers", label: "Numbers", desc: "Big stat counters" },
    ]
  },
  {
    id: "owners",
    label: "For Owners",
    icon: "Home",
    blocks: [
      { type: "owners", label: "Owners Section", desc: "Benefits for owners" },
      { type: "owners_hero", label: "Owners Hero", desc: "Hero for owners page" },
      { type: "pricing", label: "Pricing Table", desc: "Management plans" },
      { type: "why_us", label: "Why Us", desc: "Value proposition" },
      { type: "services", label: "Services Grid", desc: "What we offer" },
      { type: "comparison", label: "Comparison", desc: "Plan comparison table" },
    ]
  },
  {
    id: "data",
    label: "Data & Features",
    icon: "BarChart",
    blocks: [
      { type: "stats", label: "Stats Bar", desc: "Key statistics" },
      { type: "features", label: "Features Grid", desc: "Icon feature cards" },
      { type: "icon_row", label: "Icon Row", desc: "Horizontal icons" },
      { type: "faq", label: "FAQ", desc: "Accordion Q&A" },
    ]
  },
  {
    id: "media",
    label: "Media",
    icon: "Image",
    blocks: [
      { type: "image_gallery", label: "Image Gallery", desc: "Photo grid with lightbox" },
      { type: "video", label: "Video", desc: "YouTube/Vimeo embed" },
    ]
  },
  {
    id: "conversion",
    label: "Conversion",
    icon: "Zap",
    blocks: [
      { type: "cta", label: "CTA Section", desc: "Call to action" },
      { type: "contact", label: "Contact Form", desc: "Inquiry form" },
      { type: "newsletter", label: "Newsletter", desc: "Email signup" },
    ]
  },
  {
    id: "utility",
    label: "Utility",
    icon: "Settings",
    blocks: [
      { type: "divider", label: "Divider", desc: "Section separator" },
      { type: "spacer", label: "Spacer", desc: "Vertical space" },
    ]
  },
];

// ─── Page templates matching EXACT frontend pages ────────────────────────────
export const LIVE_PAGE_TEMPLATES = {
  home: [
    { type: "hero", data: {
      badge: "Malta's Premier Property Management",
      headline: "Your Home in Malta,",
      headlineAccent: "Looked After Like a Hotel",
      subheadline: "Handpicked luxury accommodations across Malta's most sought-after locations. Experience exceptional stays with personal attention.",
      cta1Text: "List Your Property",
      cta2Text: "Book a Stay",
      stats: [{ value: "9+", label: "Years Superhost" }, { value: "100%", label: "Response Rate" }, { value: "4.9", label: "Average Rating" }]
    }},
    { type: "search", data: { label: "Find Your Perfect Stay", showLocation: true, showDates: true, showGuests: true } },
    { type: "owners", data: {} },
    { type: "about", data: {} },
    { type: "properties", data: { label: "Featured Properties", title: "Explore Our Portfolio", ctaText: "View All Properties", showCount: 6 } },
    { type: "stats", data: { items: [{ value: "9+", label: "Years Superhost" }, { value: "100%", label: "Response Rate" }, { value: "4.9★", label: "Avg Rating" }, { value: "40%", label: "Revenue Boost" }] } },
    { type: "testimonials", data: {} },
    { type: "cta", data: {} },
    { type: "footer", data: {} },
  ],
  owners: [
    { type: "owners_hero", data: {} },
    { type: "pricing", data: {} },
    { type: "why_us", data: {} },
    { type: "services", data: {} },
    { type: "faq", data: {} },
    { type: "cta", data: { title: "Ready to Partner With Us?", subtitle: "Contact us today to discuss how we can maximize your property investment.", cta1Text: "Get Started", cta2Text: "Schedule a Call" } },
    { type: "footer", data: {} },
  ],
  properties: [
    { type: "hero", data: { headline: "Explore Our Portfolio", headlineAccent: "Luxury Stays in Malta", cta1Text: "Browse All", cta2Text: "View on Map", backgroundImage: "https://images.unsplash.com/photo-1548625361-58a9d86b3b4e?w=1920&q=80" } },
    { type: "search", data: {} },
    { type: "properties", data: { showCount: 12 } },
    { type: "cta", data: {} },
    { type: "footer", data: {} },
  ],
  about: [
    { type: "hero", data: { headline: "Malta's Finest Property", headlineAccent: "Management Company" } },
    { type: "about", data: {} },
    { type: "numbers", data: {} },
    { type: "team", data: {} },
    { type: "logos", data: {} },
    { type: "cta", data: {} },
    { type: "footer", data: {} },
  ],
  contact: [
    { type: "hero", data: { headline: "Get in Touch", headlineAccent: "We'd Love to Hear From You", subheadline: "Whether you're a guest or a property owner, our team is here to help." } },
    { type: "contact", data: {} },
    { type: "map", data: {} },
    { type: "footer", data: {} },
  ],
};
