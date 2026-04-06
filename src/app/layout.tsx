import type {Metadata, Viewport} from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Lato,
  Libre_Baskerville,
  Outfit,
  Playfair_Display,
} from "next/font/google";
import {Toaster} from "@/components/ui/sonner";
import "./globals.css";
import "./puck-animations.css";

// ============================================================
// Font Pair Configuration
// ============================================================
// Set NEXT_PUBLIC_FONT_PAIR to one of: "default" | "modern" | "elegant" | "bold"
const fontPair = process.env.NEXT_PUBLIC_FONT_PAIR || "default";

// All font loaders MUST be called at module scope (Next.js requirement)
const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body", display: "swap" });
const cormorantGaramond = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-heading", display: "swap" });

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-body", display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-heading", display: "swap" });

const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-body", display: "swap" });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-heading", display: "swap" });

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-heading", display: "swap" });

// Select the active font pair based on env variable
const fontPairMap: Record<string, { body: ReturnType<typeof Outfit>; heading: ReturnType<typeof Outfit> }> = {
  default: { body: outfit, heading: cormorantGaramond },
  modern: { body: inter, heading: playfairDisplay },
  elegant: { body: lato, heading: libreBaskerville },
  bold: { body: dmSans, heading: fraunces },
};

const selectedPair = fontPairMap[fontPair] || fontPairMap.default;

// ============================================================
// Canonical URL — Auto-canonicalize
// ============================================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://christianopropertymanagement.com";

// ============================================================
// Metadata — SEO + Open Graph + Canonical
// ============================================================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#c8a96a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Christiano Property Management | Luxury Short-Term Rental Management Malta",
    template: "%s | Christiano Property Management",
  },
  description:
    "Luxury short-term rental and property management across Malta & Gozo. 9+ years of Superhost experience, transparent fees, no hidden markups, full-service operations for discerning property owners.",
  keywords: [
    "Malta property management",
    "short-term rental Malta",
    "luxury rental management",
    "Airbnb management Malta",
    "Gozo vacation rentals",
    "property management Malta",
    "holiday let management",
    "Christiano Property Management",
  ],
  authors: [{ name: "Christiano Property Management", url: SITE_URL }],
  creator: "Christiano Property Management",
  publisher: "Christiano Property Management",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: SITE_URL,
    siteName: "Christiano Property Management",
    title: "Christiano Property Management | Luxury Short-Term Rental Management Malta",
    description:
      "Luxury short-term rental and property management across Malta & Gozo. 9+ years of Superhost experience, transparent fees, full-service operations.",
    images: [
      {
        url: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/MUAjN1w9lUA.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury property in Malta managed by Christiano Property Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christiano Property Management | Malta",
    description:
      "Luxury short-term rental and property management across Malta & Gozo. 9+ years of Superhost experience.",
    images: [
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/MUAjN1w9lUA.jpg",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
  },
};

// ============================================================
// JSON-LD Structured Data — LocalBusiness
// ============================================================
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: "Christiano Property Management",
  url: SITE_URL,
  logo: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
  image: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/MUAjN1w9lUA.jpg",
  description:
    "Luxury short-term rental and property management across Malta & Gozo.",
  telephone: "+35679790202",
  email: "info@christianopropertymanagement.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Birkirkara",
    addressLocality: "Birkirkara",
    addressRegion: "Central Region",
    postalCode: "BKR",
    addressCountry: "MT",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 35.8961327,
    longitude: 14.4644929,
  },
  areaServed: [
    { "@type": "Place", name: "Malta" },
    { "@type": "Place", name: "Gozo" },
  ],
  priceRange: "€€€",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1000",
    bestRating: "5",
    worstRating: "1",
  },
  sameAs: [],
};

// ============================================================
// Root Layout
// ============================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${selectedPair.body.variable} ${selectedPair.heading.variable}`}>
      <head>
        {/* Auto-canonicalize: dynamic canonical link updated by client-side hash router */}
        <link rel="canonical" href={SITE_URL} key="canonical" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://primary.jwwb.nl" crossOrigin="anonymous" />
      </head>
      <body className="font-[family-name:var(--font-body)] antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
