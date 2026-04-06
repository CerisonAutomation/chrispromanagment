// Shared helpers and constants used across blocks

import { LOGO_URL, HERO_BG, ABOUT_IMG, PROP_IMAGES, GALLERY_IMAGES } from "@/lib/images";

// ============================================================
// safeHref — Validates URLs to prevent XSS
// ============================================================
export function safeHref(url: string | undefined, fallback: string = "#"): string {
  if (!url) return fallback;
  if (url.startsWith("#") || url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:")) return url;
  return fallback;
}

// ============================================================
// Backward-compatible image aliases used throughout blocks
// ============================================================
export const PROP_1 = PROP_IMAGES.valletta2;
export const PROP_2 = PROP_IMAGES.baharIcCaghaq;
export const PROP_3 = PROP_IMAGES.pieta;
export const PROP_VALLETTA = PROP_IMAGES.valletta;
export const PROP_MADLIENA = PROP_IMAGES.madliena;
export const PROP_GZIRA = PROP_IMAGES.gzira;
export const IMG_2625 = GALLERY_IMAGES.img2625;
export const IMG_9593 = GALLERY_IMAGES.img9593;
export const IMG_9588 = GALLERY_IMAGES.img9588;
export const IMG_9590 = GALLERY_IMAGES.img9590;
export const IMG_7136 = GALLERY_IMAGES.img7136;
export const IMG_6590 = GALLERY_IMAGES.img6590;
export const IMG_6106 = GALLERY_IMAGES.img6106;
export const IMG_3886 = GALLERY_IMAGES.img3886;
export const IMG_3819 = GALLERY_IMAGES.img3819;
export const IMG_3814 = GALLERY_IMAGES.img3814;
export const IMG_6113 = GALLERY_IMAGES.img6113;
export const IMG_0557 = GALLERY_IMAGES.img0557;
export const IMG_6115 = GALLERY_IMAGES.img6115;
