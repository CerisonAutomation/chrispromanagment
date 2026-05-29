// =============================================================================
// Christiano Property Management — Image URL Constants  
// Single source of truth for all image URLs
// =============================================================================

const CDN = "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe";

// ─── Brand Assets ──────────────────────────────────────────────────────────────
export const LOGO_URL = `${CDN}/image-high-82icb0.png`;

// ─── Hero & About Images ────────────────────────────────────────────────────────
export const HERO_BG = `${CDN}/MUAjN1w9lUA.jpg`;
export const ABOUT_IMG = `${CDN}/9f5bb789-c9cd-4da2-9672-7071482f7efb-high.png`;
export const OG_IMAGE = HERO_BG;

// ─── Property Images ────────────────────────────────────────────────────────────
export const PROP_IMAGES = {
  valletta: `${CDN}/valletta-apartment-10-high.jpg`,
  valletta2: `${CDN}/img_7990-high.jpg`,
  baharIcCaghaq: `${CDN}/img_7963-high.jpg`,
  pieta: `${CDN}/img_7365-high.jpg`,
  madliena: `${CDN}/65259-1-high-3hwctx.jpg`,
  gzira: `${CDN}/img_2625-high-g3dssk.jpg`,
} as const;

// ─── Extra Gallery Images ──────────────────────────────────────────────────────
export const GALLERY_IMAGES = {
  img2625: `${CDN}/img_2625-high-g3dssk.jpg`,
  img9593: `${CDN}/img_9593-high-szbz83.jpg`,
  img9588: `${CDN}/img_9588-high.jpg`,
  img9590: `${CDN}/img_9590-high.jpg`,
  img7136: `${CDN}/img_7136-high.jpg`,
  img6590: `${CDN}/img_6590-high.png`,
  img6106: `${CDN}/img_6106-high.jpg`,
  img3886: `${CDN}/img_3886-high-vowc5f.jpg`,
  img3819: `${CDN}/img_3819-high-io7zhg.jpg`,
  img3814: `${CDN}/img_3814-high.jpg`,
  img6113: `${CDN}/img_6113-high.jpg`,
  img0557: `${CDN}/img_0557-high.jpg`,
  img6115: `${CDN}/img_6115-high.jpg`,
} as const;

// Property grid array for default pages (ordered)
export const DEFAULT_PROPERTY_GRID = [
  { name: "Valletta Apartment 1", imageUrl: PROP_IMAGES.valletta, caption: "2 Bed · 2 Bath · Sleeps 6" },
  { name: "Valletta Apartment 2", imageUrl: PROP_IMAGES.valletta2, caption: "2 Bed · 2 Bath · Sleeps 4" },
  { name: "Bahar ic-Caghaq Villa", imageUrl: PROP_IMAGES.baharIcCaghaq, caption: "3 Bed · 3 Bath · Sleeps 6" },
  { name: "Madliena Event Space", imageUrl: PROP_IMAGES.madliena, caption: "Unique Event Venue" },
  { name: "Pieta Apartment", imageUrl: PROP_IMAGES.pieta, caption: "2 Bed · 2 Bath · Sleeps 4" },
  { name: "Gzira Apartment", imageUrl: PROP_IMAGES.gzira, caption: "2 Bed · 2 Bath · Sleeps 4" },
] as const;

// All gallery images as a flat array
export const ALL_GALLERY_IMAGES = Object.values(GALLERY_IMAGES);
