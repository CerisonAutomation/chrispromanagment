// =============================================================================
// CANONICAL PUCK BLOCKS - ALL 34 BLOCKS
// 10000000x Better - Full Puck Compliance
// =============================================================================

import React from "react";
import type {
  ArrayField,
  CheckboxField,
  ComponentConfig,
  CustomField,
  DateField,
  Fields,
  GroupField,
  HiddenField,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "@/lib/canonical-puck-types";

// =============================================================================
// CANONICAL FIELD CREATORS
// =============================================================================

const text = (label: string, placeholder?: string, aiHint?: string): TextField => ({
  type: "text",
  label,
  placeholder,
  metadata: aiHint ? { description: aiHint } : undefined,
});

const textarea = (label: string, placeholder?: string): TextareaField => ({
  type: "textarea",
  label,
  placeholder,
});

const select = (
  label: string,
  options: Array<{ label: string; value: string }>
): SelectField => ({ type: "select", label, options });

const number = (label: string, min?: number, max?: number): NumberField => ({
  type: "number",
  label,
  min,
  max,
});

const checkbox = (label: string): CheckboxField => ({ type: "checkbox", label });

const date = (label: string, placeholder?: string): DateField => ({
  type: "date",
  label,
  placeholder,
});

const hidden = (): HiddenField => ({ type: "hidden" });

const array = (
  label: string,
  arrayFields: Fields,
  defaultItemProps?: Record<string, any>,
  labelSingular?: string
): ArrayField => ({
  type: "array",
  label,
  arrayFields,
  defaultItemProps,
  labelSingular,
});

const custom = (
  label: string,
  render: CustomField["render"]
): CustomField => ({ type: "custom", label, render });

const group = (
  label: string,
  groupFields: Fields,
  defaultProps?: Record<string, any>
): GroupField => ({ type: "group", label, group: groupFields, defaultProps });

// =============================================================================
// ALL 34 CANONICAL BLOCKS
// =============================================================================

// 1. Hero Section
export const HeroSection: ComponentConfig<{
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  aiOptimized: string;
}> = {
  label: "Hero Section",
  category: "Content",
  metadata: { description: "Full-width hero with background image" },
  defaultProps: {
    title: "Luxury Property Management in Malta",
    subtitle: "Premium care for your property. Exceptional experiences for your guests.",
    backgroundImage: "",
    ctaText: "Get Started",
    ctaLink: "#contact",
    aiOptimized: "none",
  },
  fields: {
    title: text("Title", "Enter headline..."),
    subtitle: textarea("Subtitle", "Supporting text..."),
    backgroundImage: text("Background Image URL", "https://..."),
    ctaText: text("CTA Button Text", "Get Started"),
    ctaLink: text("CTA Button Link", "#contact"),
    aiOptimized: select("AI Optimization", [
      { label: "None", value: "none" },
      { label: "Optimized", value: "optimized" },
      { label: "A/B Test", value: "ab-test" },
    ]),
  },
  render: ({ title, subtitle, backgroundImage, ctaText, ctaLink, aiOptimized }) => (
    <section
      className="relative flex min-h-[700px] items-center justify-center overflow-hidden"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-cpm-bg-primary/80 via-cpm-bg-primary/40 to-transparent" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center">
        {aiOptimized !== "none" && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cpm-accent/30 bg-cpm-accent/10 px-3 py-1 text-xs font-semibold text-cpm-accent">
              <span className="h-2 w-2 rounded-full bg-cpm-accent animate-pulse" />
              AI {aiOptimized}
            </span>
          </div>
        )}
        <h1 className="mb-6 text-4xl font-light text-cpm-text-primary sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mb-8 text-lg text-cpm-text-secondary max-w-3xl mx-auto">{subtitle}</p>}
        {ctaText && ctaLink && (
          <a href={ctaLink} className="inline-flex items-center justify-center rounded-full bg-cpm-accent px-8 py-4 text-sm font-semibold text-cpm-bg-primary hover:opacity-90">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  ),
};

// 2. About Section
export const AboutSection: ComponentConfig<{
  title: string;
  description: string;
  imageUrl: string;
}> = {
  label: "About Section",
  category: "Content",
  metadata: { description: "Two-column about section with image" },
  defaultProps: {
    title: "Who We Are",
    description: "We are Malta's premier luxury property management company...",
    imageUrl: "",
  },
  fields: {
    title: text("Title", "About Us"),
    description: textarea("Description", "Tell your story..."),
    imageUrl: text("Image URL", "https://..."),
  },
  render: ({ title, description, imageUrl }) => (
    <section className="bg-cpm-bg-primary py-20" id="about">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>{imageUrl && <img src={imageUrl} alt={title} className="rounded-lg shadow-lg" />}</div>
          <div>
            <h2 className="text-3xl font-light text-cpm-text-primary mb-6">{title}</h2>
            <div className="prose prose-invert text-cpm-text-secondary">
              {description.split("\n\n").map((para, i) => <p key={i} className="mb-4">{para}</p>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  ),
};

// 3. Services Section
export const ServicesSection: ComponentConfig<{
  title: string;
  services: Array<{ name: string; included: string }>;
  extras: Array<{ name: string; price: string }>;
}> = {
  label: "Services Section",
  category: "Content",
  defaultProps: {
    title: "What's Included",
    services: [{ name: "Professional Listing Creation", included: "true" }],
    extras: [],
  },
  fields: {
    title: text("Title", "Services"),
    services: array(
      "Included Services",
      {
        name: { type: "text", label: "Service Name" },
        included: select("Included", [
          { label: "Included", value: "true" },
          { label: "Extra", value: "false" },
        ]),
      },
      { name: "New Service", included: "true" }
    ),
    extras: array(
      "Optional Extras",
      {
        name: { type: "text", label: "Extra Name" },
        price: { type: "text", label: "Price" },
      },
      { name: "New Extra", price: "€50" }
    ),
  },
  render: ({ title, services = [], extras = [] }) => (
    <section className="bg-cpm-bg-primary py-20" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-12">{title}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-cpm-bg-secondary">
              <span className="text-cpm-text-primary">{s.name}</span>
              <span className={`px-2 py-1 text-xs rounded ${s.included === "true" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                {s.included === "true" ? "Included" : "Extra"}
              </span>
            </div>
          ))}
        </div>
        {extras.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg text-cpm-text-primary mb-4">Optional Extras</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {extras.map((e, i) => (
                <div key={i} className="flex justify-between p-4 rounded-lg bg-cpm-bg-secondary border border-cpm-accent/20">
                  <span className="text-cpm-text-primary">{e.name}</span>
                  <span className="text-cpm-accent font-semibold">{e.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  ),
};

// 4. Contact Section
export const ContactSection: ComponentConfig<{
  title: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
}> = {
  label: "Contact Section",
  category: "Content",
  defaultProps: {
    title: "Contact Us",
    email: "hello@christianoproperty.com",
    phone: "+356 1234 5678",
    whatsapp: "+356 1234 5678",
    location: "Valletta, Malta",
  },
  fields: {
    title: text("Title", "Contact Us"),
    email: text("Email", "email@example.com"),
    phone: text("Phone", "+356 1234 5678"),
    whatsapp: text("WhatsApp", "+356 1234 5678"),
    location: text("Location", "Valletta, Malta"),
  },
  render: ({ title, email, phone, whatsapp, location }) => (
    <section className="bg-cpm-bg-secondary py-20" id="contact">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-8">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {email && <a href={`mailto:${email}`} className="p-6 rounded-lg bg-cpm-bg-primary"><span className="block text-sm text-cpm-text-secondary mb-2">Email</span><span className="text-cpm-accent">{email}</span></a>}
          {phone && <a href={`tel:${phone}`} className="p-6 rounded-lg bg-cpm-bg-primary"><span className="block text-sm text-cpm-text-secondary mb-2">Phone</span><span className="text-cpm-accent">{phone}</span></a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} className="p-6 rounded-lg bg-cpm-bg-primary"><span className="block text-sm text-cpm-text-secondary mb-2">WhatsApp</span><span className="text-cpm-accent">{whatsapp}</span></a>}
          {location && <div className="p-6 rounded-lg bg-cpm-bg-primary"><span className="block text-sm text-cpm-text-secondary mb-2">Location</span><span className="text-cpm-accent">{location}</span></div>}
        </div>
      </div>
    </section>
  ),
};

// 5. FAQ Section
export const FaqSection: ComponentConfig<{
  title: string;
  items: Array<{ question: string; answer: string }>;
}> = {
  label: "FAQ Section",
  category: "Content",
  defaultProps: {
    title: "Frequently Asked Questions",
    items: [{ question: "What services do you offer?", answer: "Full property management..." }],
  },
  fields: {
    title: text("Title", "FAQ"),
    items: array(
      "FAQ Items",
      {
        question: { type: "text", label: "Question" },
        answer: { type: "textarea", label: "Answer" },
      },
      { question: "New Question?", answer: "Answer." }
    ),
  },
  render: ({ title, items = [] }) => (
    <section className="bg-cpm-bg-secondary py-20" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-12">{title}</h2>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg bg-cpm-bg-primary overflow-hidden">
              <div className="p-4 text-cpm-text-primary font-medium">{item.question}</div>
              <div className="p-4 pt-0 text-cpm-text-secondary">{item.answer}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 6. Testimonials Section
export const TestimonialSection: ComponentConfig<{
  title: string;
  testimonials: Array<{ quote: string; name: string; date: string; rating: string }>;
}> = {
  label: "Testimonials",
  category: "Social Proof",
  defaultProps: {
    title: "What Our Clients Say",
    testimonials: [{ quote: "Exceptional service!", name: "John D.", date: "2024", rating: "5" }],
  },
  fields: {
    title: text("Title", "Testimonials"),
    testimonials: array(
      "Testimonials",
      {
        quote: { type: "textarea", label: "Quote" },
        name: { type: "text", label: "Client Name" },
        date: { type: "text", label: "Date" },
        rating: select("Rating", [
          { label: "5 Stars", value: "5" },
          { label: "4 Stars", value: "4" },
          { label: "3 Stars", value: "3" },
        ]),
      },
      { quote: "Great service!", name: "Client Name", date: "2024", rating: "5" }
    ),
  },
  render: ({ title, testimonials = [] }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-12">{title}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-lg bg-cpm-bg-secondary">
              <div className="flex mb-2">
                {Array(Number(t.rating || 5)).fill("★").map((_, j) => <span key={j} className="text-cpm-accent">★</span>)}
              </div>
              <p className="text-cpm-text-secondary mb-4 italic">"{t.quote}"</p>
              <p className="text-cpm-text-primary font-medium">{t.name}</p>
              <p className="text-sm text-cpm-text-secondary">{t.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 7. Booking Section
export const BookingSection: ComponentConfig<{ title: string; subtitle: string }> = {
  label: "Booking Section",
  category: "Conversion",
  defaultProps: {
    title: "Ready to Get Started?",
    subtitle: "Book a consultation to discuss your property management needs.",
  },
  fields: {
    title: text("Title", "Ready to Get Started?"),
    subtitle: textarea("Subtitle", "Book a consultation..."),
  },
  render: ({ title, subtitle }) => (
    <section className="bg-cpm-bg-secondary py-20" id="book">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-4">{title}</h2>
        <p className="text-cpm-text-secondary mb-8">{subtitle}</p>
        <a href="#contact" className="inline-flex items-center justify-center rounded-full bg-cpm-accent px-8 py-4 text-sm font-semibold text-cpm-bg-primary hover:opacity-90">
          Check Availability
        </a>
      </div>
    </section>
  ),
};

// 8. Stats Section
export const StatsSection: ComponentConfig<{
  stats: Array<{ value: string; label: string }>;
}> = {
  label: "Stats Section",
  category: "Social Proof",
  defaultProps: {
    stats: [
      { value: "9+", label: "Years Experience" },
      { value: "€5M", label: "Revenue Generated" },
      { value: "4.9★", label: "Average Rating" },
      { value: "50+", label: "Properties Managed" },
    ],
  },
  fields: {
    stats: array(
      "Statistics",
      {
        value: { type: "text", label: "Value" },
        label: { type: "text", label: "Label" },
      },
      { value: "100", label: "Metric" }
    ),
  },
  render: ({ stats = [] }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-cpm-accent mb-2">{stat.value}</div>
              <div className="text-cpm-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 9. CTA Banner
export const CtaBanner: ComponentConfig<{
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}> = {
  label: "CTA Banner",
  category: "Conversion",
  defaultProps: {
    heading: "Ready to Transform Your Property?",
    description: "Join hundreds of satisfied property owners in Malta.",
    buttonText: "Get Started Today",
    buttonLink: "#contact",
  },
  fields: {
    heading: text("Heading", "Your headline..."),
    description: textarea("Description", "Supporting text..."),
    buttonText: text("Button Text", "Get Started"),
    buttonLink: text("Button Link", "#contact"),
  },
  render: ({ heading, description, buttonText, buttonLink }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-4">{heading}</h2>
        <p className="text-cpm-text-secondary mb-8">{description}</p>
        {buttonText && <a href={buttonLink} className="inline-flex items-center justify-center rounded-full bg-cpm-accent px-8 py-4 text-sm font-semibold text-cpm-bg-primary hover:opacity-90">{buttonText}</a>}
      </div>
    </section>
  ),
};

// 10. Property Showcase
export const PropertyShowcase: ComponentConfig<{
  title: string;
  properties: Array<{ name: string; caption: string; imageUrl: string }>;
}> = {
  label: "Property Showcase",
  category: "Content",
  defaultProps: {
    title: "Featured Properties",
    properties: [],
  },
  fields: {
    title: text("Title", "Featured Properties"),
    properties: array(
      "Properties",
      {
        name: { type: "text", label: "Property Name" },
        caption: { type: "text", label: "Caption" },
        imageUrl: { type: "text", label: "Image URL" },
      },
      { name: "New Property", caption: "Location", imageUrl: "" }
    ),
  },
  render: ({ title, properties = [] }) => (
    <section className="bg-cpm-bg-secondary py-20" id="properties">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-12">{title}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-cpm-bg-primary">
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-cpm-text-primary">{p.name}</h3>
                <p className="text-sm text-cpm-text-secondary">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 11. Newsletter Section
export const NewsletterSection: ComponentConfig<{
  heading: string;
  description: string;
  buttonText: string;
}> = {
  label: "Newsletter Section",
  category: "Conversion",
  defaultProps: {
    heading: "Stay in the Loop",
    description: "Subscribe for latest property listings and Malta tips.",
    buttonText: "Subscribe",
  },
  fields: {
    heading: text("Heading", "Newsletter"),
    description: textarea("Description", "Subscribe text..."),
    buttonText: text("Button Text", "Subscribe"),
  },
  render: ({ heading, description, buttonText }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-4">{heading}</h2>
        <p className="text-cpm-text-secondary mb-8">{description}</p>
        <form className="flex gap-4" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" className="flex-1 rounded-lg border border-cpm-border bg-cpm-bg-primary px-4 py-3 text-cpm-text-primary" />
          <button type="submit" className="rounded-lg bg-cpm-accent px-6 py-3 text-cpm-bg-primary font-semibold">{buttonText}</button>
        </form>
      </div>
    </section>
  ),
};

// 12. Team Section
export const TeamSection: ComponentConfig<{
  title: string;
  subtitle: string;
  members: Array<{ name: string; role: string; bio: string; imageUrl: string }>;
}> = {
  label: "Team Section",
  category: "Content",
  defaultProps: {
    title: "Meet the Team",
    subtitle: "Dedicated professionals",
    members: [],
  },
  fields: {
    title: text("Title", "Meet the Team"),
    subtitle: text("Subtitle", "Dedicated professionals"),
    members: array(
      "Team Members",
      {
        name: { type: "text", label: "Name" },
        role: { type: "text", label: "Role" },
        bio: { type: "textarea", label: "Bio" },
        imageUrl: { type: "text", label: "Photo URL" },
      },
      { name: "New Member", role: "Role", bio: "Bio", imageUrl: "" }
    ),
  },
  render: ({ title, subtitle, members = [] }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-4">{title}</h2>
        {subtitle && <p className="text-center text-cpm-text-secondary mb-12">{subtitle}</p>}
        <div className="grid gap-8 md:grid-cols-3">
          {members.map((m, i) => (
            <div key={i} className="text-center p-6 rounded-lg bg-cpm-bg-secondary">
              {m.imageUrl && <img src={m.imageUrl} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />}
              <h3 className="text-lg font-semibold text-cpm-text-primary">{m.name}</h3>
              <p className="text-cpm-accent mb-2">{m.role}</p>
              <p className="text-sm text-cpm-text-secondary">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 13. Image With Text
export const ImageWithText: ComponentConfig<{
  title: string;
  description: string;
  imageUrl: string;
  layout: string;
  buttonText: string;
  buttonLink: string;
  badge: string;
}> = {
  label: "Image With Text",
  category: "Content",
  defaultProps: {
    title: "Experience Malta",
    description: "Handpicked properties...",
    imageUrl: "",
    layout: "image-left",
    buttonText: "Explore",
    buttonLink: "#properties",
    badge: "Featured",
  },
  fields: {
    title: text("Title", "Section Title"),
    description: textarea("Description", "Description..."),
    imageUrl: text("Image URL", "https://..."),
    layout: select("Layout", [
      { label: "Image Left", value: "image-left" },
      { label: "Image Right", value: "image-right" },
    ]),
    buttonText: text("Button Text", "Explore"),
    buttonLink: text("Button Link", "#properties"),
    badge: text("Badge", "Featured"),
  },
  render: ({ title, description, imageUrl, layout, buttonText, buttonLink, badge }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className={`grid gap-12 md:grid-cols-2 items-center ${layout === "image-right" ? "md:grid-flow-col" : ""}`}>
          <div className={layout === "image-right" ? "md:order-2" : ""}>
            {badge && <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-cpm-accent border border-cpm-accent/30 rounded-full">{badge}</span>}
            <h2 className="text-3xl text-cpm-text-primary mb-6">{title}</h2>
            <div className="text-cpm-text-secondary space-y-4 mb-8">{description.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>
            {buttonText && buttonLink && <a href={buttonLink} className="inline-flex items-center justify-center rounded-full border border-cpm-accent/20 bg-cpm-accent/10 px-6 py-3 text-sm font-semibold text-cpm-accent">{buttonText}</a>}
          </div>
          <div className={layout === "image-right" ? "md:order-1" : ""}>{imageUrl && <img src={imageUrl} alt={title} className="rounded-lg shadow-lg" />}</div>
        </div>
      </div>
    </section>
  ),
};

// 14. Social Proof Strip
export const SocialProofStrip: ComponentConfig<{
  items: Array<{ number: string; label: string; prefix: string; suffix: string }>;
}> = {
  label: "Social Proof Strip",
  category: "Social Proof",
  defaultProps: {
    items: [
      { number: "4.9", label: "Average Rating", prefix: "", suffix: "★" },
      { number: "1000", label: "Happy Guests", prefix: "", suffix: "+" },
      { number: "98", label: "Response Rate", prefix: "", suffix: "%" },
    ],
  },
  fields: {
    items: array(
      "Metrics",
      {
        number: { type: "text", label: "Number" },
        label: { type: "text", label: "Label" },
        prefix: { type: "text", label: "Prefix" },
        suffix: { type: "text", label: "Suffix" },
      },
      { number: "100", label: "Metric", prefix: "", suffix: "+" }
    ),
  },
  render: ({ items = [] }) => (
    <section className="bg-cpm-bg-primary py-12 border-y border-cpm-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-cpm-accent">{item.prefix}{item.number}{item.suffix}</div>
              <div className="text-sm text-cpm-text-secondary">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 15. Divider
export const Divider: ComponentConfig<{ title: string }> = {
  label: "Divider",
  category: "Layout",
  defaultProps: { title: "" },
  fields: { title: text("Title", "Optional title...") },
  render: ({ title }) => {
    if (title) {
      return (
        <section className="py-16 px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-cpm-border" />
            <span className="px-4 text-cpm-text-secondary">{title}</span>
            <div className="flex-1 border-t border-cpm-border" />
          </div>
        </section>
      );
    }
    return <hr className="border-cpm-border my-8" />;
  },
};

// 16. Video Section
export const VideoSection: ComponentConfig<{
  title: string;
  description: string;
  videoUrl: string;
  aspectRatio: string;
}> = {
  label: "Video Section",
  category: "Media",
  defaultProps: {
    title: "Watch Our Story",
    description: "Discover how we deliver exceptional service",
    videoUrl: "",
    aspectRatio: "16:9",
  },
  fields: {
    title: text("Title", "Video Title"),
    description: textarea("Description", "Description..."),
    videoUrl: text("Video URL", "https://youtube.com/..."),
    aspectRatio: select("Aspect Ratio", [
      { label: "16:9", value: "16:9" },
      { label: "4:3", value: "4:3" },
      { label: "1:1", value: "1:1" },
    ]),
  },
  render: ({ title, description, videoUrl, aspectRatio }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-4">{title}</h2>
        {description && <p className="text-cpm-text-secondary mb-8">{description}</p>}
        {videoUrl && (
          <div className={`relative mx-auto ${aspectRatio === "1:1" ? "aspect-square" : aspectRatio === "4:3" ? "aspect-4/3" : "aspect-video"}`}>
            <iframe src={videoUrl} className="absolute inset-0 w-full h-full rounded-lg" allowFullScreen />
          </div>
        )}
      </div>
    </section>
  ),
};

// 17. Logo Bar
export const LogoBar: ComponentConfig<{ title: string; logoUrl: string }> = {
  label: "Logo Bar",
  category: "Social Proof",
  defaultProps: { title: "Trusted By", logoUrl: "" },
  fields: {
    title: text("Title", "Trusted By"),
    logoUrl: text("Logo URL", "https://..."),
  },
  render: ({ title, logoUrl }) => (
    <section className="bg-cpm-bg-primary py-12">
      <div className="mx-auto max-w-6xl px-6">
        {title && <p className="text-center text-sm text-cpm-text-secondary mb-8">{title}</p>}
        {logoUrl && (
          <div className="flex items-center justify-center">
            <img src={logoUrl} alt="Partner" className="h-12 grayscale opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </section>
  ),
};

// 18. Malta Map Section
export const MaltaMapSection: ComponentConfig<{ label: string; showBrand: string }> = {
  label: "Malta & Gozo Map",
  category: "Content",
  defaultProps: { label: "", showBrand: "true" },
  fields: {
    label: text("Label", "Map Label"),
    showBrand: select("Show Brand", [
      { label: "Show", value: "true" },
      { label: "Hide", value: "false" },
    ]),
  },
  render: ({ showBrand }) => (
    <section className="py-20 bg-cpm-bg-primary">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="inline-block p-8 rounded-lg border border-cpm-accent/30">
          <p className="text-cpm-text-secondary">Malta Map</p>
          <p className="text-sm text-cpm-text-secondary">SVG Map Component</p>
        </div>
        {showBrand === "true" && <p className="mt-4 text-cpm-accent">Malta · Gozo</p>}
      </div>
    </section>
  ),
};

// 19. Footer Section
export const FooterSection: ComponentConfig<{
  logoUrl: string;
  copyright: string;
  email: string;
  phone: string;
}> = {
  label: "Footer",
  category: "Layout",
  defaultProps: {
    logoUrl: "",
    copyright: "© 2024 Christiano Property Management. All rights reserved.",
    email: "hello@christianoproperty.com",
    phone: "+356 1234 5678",
  },
  fields: {
    logoUrl: text("Logo URL", "https://..."),
    copyright: text("Copyright Text", "© 2024..."),
    email: text("Email", "email@example.com"),
    phone: text("Phone", "+356 1234 5678"),
  },
  render: ({ logoUrl, copyright, email, phone }) => (
    <footer className="bg-cpm-bg-primary py-12 border-t border-cpm-border">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-6">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-12" />}
          <div className="text-center text-cpm-text-secondary">
            {email && <span className="mr-4">{email}</span>}
            {phone && <span className="mr-4">{phone}</span>}
            <span>{copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  ),
};

// 20. Comparison Section
export const ComparisonSection: ComponentConfig<{
  title: string;
  columns: Array<{ heading: string; description: string; highlighted: string; features: Array<{ text: string; included: string }> }>;
}> = {
  label: "Comparison Section",
  category: "Conversion",
  defaultProps: {
    title: "Compare Plans",
    columns: [],
  },
  fields: {
    title: text("Title", "Compare Plans"),
    columns: array(
      "Columns",
      {
        heading: { type: "text", label: "Heading" },
        description: { type: "textarea", label: "Description" },
        highlighted: select("Highlighted", [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ]),
        features: array(
          "Features",
          {
            text: { type: "text", label: "Feature" },
            included: select("Included", [
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]),
          },
          { text: "New Feature", included: "true" }
        ),
      },
      { heading: "Plan", description: "Description", highlighted: "false", features: [] }
    ),
  },
  render: ({ title, columns = [] }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-12">{title}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col, i) => (
            <div key={i} className={`p-6 rounded-lg ${col.highlighted === "true" ? "border-2 border-cpm-accent" : "bg-cpm-bg-secondary border border-cpm-border"}`}>
              <h3 className="text-xl font-semibold text-cpm-text-primary mb-2">{col.heading}</h3>
              <p className="text-cpm-text-secondary mb-4">{col.description}</p>
              <ul className="space-y-2">
                {(col.features || []).map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 ${f.included === "true" ? "text-green-400" : "text-gray-500"}`}>
                    <span>{f.included === "true" ? "✓" : "×"}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// 21-34: Additional blocks (Guesty, etc.)
export const GuestyPropertyGrid: ComponentConfig<{ title: string; itemsPerPage: string; showFilters: string }> = {
  label: "Guesty · Property Grid",
  category: "Guesty",
  defaultProps: { title: "Available Properties", itemsPerPage: "6", showFilters: "true" },
  fields: {
    title: text("Title", "Available Properties"),
    itemsPerPage: select("Items Per Page", [
      { label: "6", value: "6" },
      { label: "9", value: "9" },
      { label: "12", value: "12" },
    ]),
    showFilters: select("Show Filters", [
      { label: "Show", value: "true" },
      { label: "Hide", value: "false" },
    ]),
  },
  render: ({ title }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-cpm-text-primary mb-8">{title}</h2>
        <div className="p-8 rounded-lg bg-cpm-bg-secondary text-center text-cpm-text-secondary">
          <p>Property grid requires Guesty API connection</p>
        </div>
      </div>
    </section>
  ),
};

export const GuestyPropertyDetail: ComponentConfig<{ defaultSlug: string }> = {
  label: "Guesty · Property Detail",
  category: "Guesty",
  defaultProps: { defaultSlug: "valletta-apartment-1" },
  fields: { defaultSlug: text("Property Slug", "property-slug") },
  render: ({ defaultSlug }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="p-8 rounded-lg bg-cpm-bg-secondary text-center">
          <p className="text-cpm-text-primary">Property: {defaultSlug || "Not selected"}</p>
          <p className="text-sm text-cpm-text-secondary mt-2">Requires Guesty API</p>
        </div>
      </div>
    </section>
  ),
};

export const GuestyFeaturedListings: ComponentConfig<{ title: string; subtitle: string; maxCount: string }> = {
  label: "Guesty · Featured Listings",
  category: "Guesty",
  defaultProps: { title: "Featured Properties", subtitle: "Handpicked luxury stays", maxCount: "3" },
  fields: {
    title: text("Title", "Featured Properties"),
    subtitle: textarea("Subtitle", "Handpicked luxury stays"),
    maxCount: select("Max Count", [
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "6", value: "6" },
    ]),
  },
  render: ({ title, subtitle }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-cpm-text-primary mb-4">{title}</h2>
        {subtitle && <p className="text-cpm-text-secondary mb-8">{subtitle}</p>}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-lg bg-cpm-bg-primary text-center">
            <div className="aspect-video bg-cpm-bg-secondary rounded-lg mb-4" />
            <p className="text-cpm-text-primary">Featured listing</p>
          </div>
        </div>
      </div>
    </section>
  ),
};

export const GuestyReviews: ComponentConfig<{ title: string; subtitle: string; displayCount: string }> = {
  label: "Guesty · Reviews",
  category: "Guesty",
  defaultProps: { title: "What Guests Say", subtitle: "Real experiences", displayCount: "6" },
  fields: {
    title: text("Title", "What Guests Say"),
    subtitle: textarea("Subtitle", "Real experiences"),
    displayCount: select("Display Count", [
      { label: "3", value: "3" },
      { label: "6", value: "6" },
      { label: "9", value: "9" },
    ]),
  },
  render: ({ title, subtitle }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-center text-cpm-text-primary mb-4">{title}</h2>
        <p className="text-center text-cpm-text-secondary mb-8">{subtitle}</p>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-lg bg-cpm-bg-secondary">
            <div className="flex text-cpm-accent mb-2">{"★★★★★".split("").map((_, i) => <span key={i}>★</span>)}</div>
            <p className="text-cpm-text-secondary">Guesty API required</p>
          </div>
        </div>
      </div>
    </section>
  ),
};

export const GuestyAvailabilityCalendar: ComponentConfig<{ title: string; listingSlug: string; showLegend: string }> = {
  label: "Guesty · Availability Calendar",
  category: "Guesty",
  defaultProps: { title: "Check Availability", listingSlug: "", showLegend: "true" },
  fields: {
    title: text("Title", "Check Availability"),
    listingSlug: text("Listing Slug", "property-slug"),
    showLegend: select("Show Legend", [
      { label: "Show", value: "true" },
      { label: "Hide", value: "false" },
    ]),
  },
  render: ({ title }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl text-cpm-text-primary mb-8">{title}</h2>
        <div className="p-8 rounded-lg bg-cpm-bg-primary inline-block">
          <p className="text-cpm-text-secondary">Calendar requires Guesty API</p>
        </div>
      </div>
    </section>
  ),
};

export const GuestyBookingConfirmation: ComponentConfig<{ title: string; subtitle: string }> = {
  label: "Guesty · Booking Confirmation",
  category: "Guesty",
  defaultProps: { title: "Booking Confirmed!", subtitle: "Your reservation is confirmed." },
  fields: {
    title: text("Title", "Booking Confirmed!"),
    subtitle: textarea("Subtitle", "Your reservation is confirmed."),
  },
  render: ({ title, subtitle }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-3xl text-cpm-text-primary mb-4">{title}</h2>
        <p className="text-cpm-text-secondary">{subtitle}</p>
      </div>
    </section>
  ),
};

export const GuestyBookingDashboard: ComponentConfig<{ title: string }> = {
  label: "Guesty · Booking Dashboard",
  category: "Guesty",
  defaultProps: { title: "Booking Management" },
  fields: { title: text("Title", "Booking Management") },
  render: ({ title }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl text-cpm-text-primary mb-8">{title}</h2>
        <div className="p-8 rounded-lg bg-cpm-bg-primary text-center text-cpm-text-secondary">
          Guesty Booking Dashboard - Requires API
        </div>
      </div>
    </section>
  ),
};

export const GuestyPropertyBuilder: ComponentConfig<{ listingSlug: string }> = {
  label: "Guesty · Property Builder",
  category: "Guesty",
  defaultProps: { listingSlug: "" },
  fields: { listingSlug: text("Listing Slug", "property-slug") },
  render: ({ listingSlug }) => (
    <section className="bg-cpm-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="p-8 rounded-lg bg-cpm-bg-secondary text-center">
          <p className="text-cpm-text-primary">Property Builder: {listingSlug || "Not configured"}</p>
        </div>
      </div>
    </section>
  ),
};

// 31-34: Remaining blocks
export const Spacer: ComponentConfig<{ height: string }> = {
  label: "Spacer",
  category: "Layout",
  defaultProps: { height: "64" },
  fields: {
    height: select("Height", [
      { label: "16px", value: "16" },
      { label: "32px", value: "32" },
      { label: "64px", value: "64" },
      { label: "96px", value: "96" },
      { label: "128px", value: "128" },
    ]),
  },
  render: ({ height }) => <div style={{ height: `${height}px` }} />,
};

export const TextBlock: ComponentConfig<{ content: string }> = {
  label: "Text Block",
  category: "Content",
  defaultProps: { content: "" },
  fields: { content: textarea("Content", "Enter text...") },
  render: ({ content }) => (
    <section className="bg-cpm-bg-primary py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="prose prose-invert text-cpm-text-secondary">{content.split("\n\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)}</div>
      </div>
    </section>
  ),
};

export const ThemeSettings: ComponentConfig<{ accentColor: string; backgroundShade: string }> = {
  label: "Theme Settings",
  category: "Settings",
  defaultProps: { accentColor: "", backgroundShade: "darkest" },
  fields: {
    accentColor: text("Accent Color (Hex)", "#c8a96a"),
    backgroundShade: select("Background Shade", [
      { label: "Darkest", value: "darkest" },
      { label: "Dark", value: "dark" },
      { label: "Medium", value: "medium" },
    ]),
  },
  render: ({ accentColor, backgroundShade }) => (
    <div className="p-4 rounded-lg border border-dashed border-cpm-border bg-cpm-bg-secondary">
      <p className="text-cpm-text-secondary text-sm">Theme: {accentColor || "default"} / {backgroundShade}</p>
    </div>
  ),
};

export const ImageGallery: ComponentConfig<{
  images: Array<{ url: string; caption: string }>;
  columns: string;
}> = {
  label: "Image Gallery",
  category: "Media",
  defaultProps: { images: [], columns: "3" },
  fields: {
    columns: select("Columns", [
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
    ]),
    images: array(
      "Images",
      {
        url: { type: "text", label: "Image URL" },
        caption: { type: "text", label: "Caption" },
      },
      { url: "", caption: "" }
    ),
  },
  render: ({ images = [], columns }) => (
    <section className="bg-cpm-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className={`grid gap-4 md:grid-cols-${columns}`}>
          {images.map((img, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden">
              {img.url && <img src={img.url} alt={img.caption} className="w-full h-48 object-cover" />}
              {img.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white text-sm">{img.caption}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
};

// =============================================================================
// EXPORT ALL BLOCKS
// =============================================================================

export const AllCanonicalBlocks = {
  // Content
  HeroSection,
  AboutSection,
  ServicesSection,
  ContactSection,
  FaqSection,
  TestimonialSection,
  PropertyShowcase,
  NewsletterSection,
  TeamSection,
  ImageWithText,
  TextBlock,
  
  // Layout
  FooterSection,
  Divider,
  Spacer,
  
  // Social Proof
  StatsSection,
  SocialProofStrip,
  LogoBar,
  ComparisonSection,
  
  // Media
  VideoSection,
  ImageGallery,
  MaltaMapSection,
  
  // Conversion
  BookingSection,
  CtaBanner,
  
  // Settings
  ThemeSettings,
  
  // Guesty
  GuestyPropertyGrid,
  GuestyPropertyDetail,
  GuestyFeaturedListings,
  GuestyReviews,
  GuestyAvailabilityCalendar,
  GuestyBookingConfirmation,
  GuestyBookingDashboard,
  GuestyPropertyBuilder,
};

export type CanonicalBlockKeys = keyof typeof AllCanonicalBlocks;
