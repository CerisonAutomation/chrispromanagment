/**
 * Simple CMS - Content management via JSON config
 * Replace with Google Sheets API integration for dynamic updates
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteContent {
  navigation: NavItem[];
  hero: {
    tagline: string;
    headline: string;
    highlightedWord: string;
    description: string;
    ctaText: string;
    secondaryCtaText: string;
  };
  stats: Array<{ value: string; label: string }>;
}

// Default content - edit this JSON to update the site
const SITE_CONTENT: SiteContent = {
  navigation: [
    { label: "Process", href: "#process" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  hero: {
    tagline: "Malta's Premier Property Partner",
    headline: "Maximise your rental income,",
    highlightedWord: "effortlessly.",
    description: "Full-service short-let management across Malta & Gozo. We handle everything — you earn more.",
    ctaText: "Get Your Free Assessment",
    secondaryCtaText: "How It Works",
  },
  stats: [
    { value: "€2.4M+", label: "Revenue Generated" },
    { value: "45+", label: "Properties Managed" },
    { value: "4.97", label: "Average Rating" },
    { value: "94%", label: "Occupancy Rate" },
  ],
};

export function getSiteContent(): SiteContent {
  return SITE_CONTENT;
}

export async function getSimpleNavigation(): Promise<NavItem[]> {
  return SITE_CONTENT.navigation;
}
