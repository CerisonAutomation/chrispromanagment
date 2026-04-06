import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["ADMIN", "EDITOR", "VIEWER"] }).notNull().default("VIEWER"),
  passwordHash: text("passwordHash"),
  avatarUrl: text("avatarUrl"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp" }),
  canPublish: integer("canPublish", { mode: "boolean" }).notNull().default(false),
  canDelete: integer("canDelete", { mode: "boolean" }).notNull().default(false),
  canManageUsers: integer("canManageUsers", { mode: "boolean" }).notNull().default(false),
  canViewAnalytics: integer("canViewAnalytics", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// =============================================================================
// CMS PAGES
// =============================================================================

export const cmsPages = sqliteTable("cms_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  draftData: text("draftData"),
  publishedData: text("publishedData"),
  workflowState: text("workflowState", { enum: ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED"] }).notNull().default("DRAFT"),
  assignedTo: text("assignedTo"),
  reviewedBy: text("reviewedBy"),
  reviewedAt: integer("reviewedAt", { mode: "timestamp" }),
  reviewNotes: text("reviewNotes"),
  metaTitle: text("metaTitle"),
  metaDescription: text("metaDescription"),
  metaKeywords: text("metaKeywords").default("[]"),
  ogTitle: text("ogTitle"),
  ogDescription: text("ogDescription"),
  ogImage: text("ogImage"),
  canonicalUrl: text("canonicalUrl"),
  noIndex: integer("noIndex", { mode: "boolean" }).notNull().default(false),
  structuredData: text("structuredData"),
  locale: text("locale").notNull().default("en"),
  translations: text("translations").default("{}"),
  status: text("status", { enum: ["DRAFT", "REVIEW", "APPROVED", "PUBLISHED", "SCHEDULED", "ARCHIVED"] }).notNull().default("DRAFT"),
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  scheduledFor: integer("scheduledFor", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  cacheTag: text("cacheTag").default(""),
});

export const pageVersions = sqliteTable("page_versions", {
  id: text("id").primaryKey(),
  pageId: text("pageId").notNull(),
  data: text("data").notNull(),
  diffFrom: text("diffFrom"),
  baseVersion: text("baseVersion"),
  message: text("message"),
  authorId: text("authorId"),
  authorName: text("authorName"),
  blocksAdded: integer("blocksAdded").notNull().default(0),
  blocksRemoved: integer("blocksRemoved").notNull().default(0),
  blocksModified: integer("blocksModified").notNull().default(0),
  diffData: text("diffData"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pageEdits = sqliteTable("page_edits", {
  id: text("id").primaryKey(),
  pageId: text("pageId").notNull(),
  type: text("type").notNull(),
  blockId: text("blockId"),
  blockType: text("blockType"),
  before: text("before"),
  after: text("after"),
  authorId: text("authorId"),
  authorName: text("authorName"),
  sessionId: text("sessionId"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  pageId: text("pageId"),
  action: text("action", {
    enum: ["CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH", "SCHEDULE", "APPROVE", "REJECT", "LOGIN", "LOGOUT", "VIEW", "PERMISSION_CHANGE", "WEBHOOK_TRIGGERED", "AB_TEST_START", "AB_TEST_END", "AB_TEST_WINNER", "ASSET_UPLOAD", "ASSET_DELETE", "VERSION_RESTORE", "LOCALE_CHANGE"]
  }).notNull(),
  details: text("details"),
  userId: text("userId"),
  userName: text("userName"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  resourceType: text("resourceType"),
  resourceId: text("resourceId"),
  previousState: text("previousState"),
  newState: text("newState"),
  severity: text("severity").notNull().default("info"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// =============================================================================
// ASSETS
// =============================================================================

export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("originalName").notNull(),
  mimeType: text("mimeType").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  variants: text("variants"),
  optimizedUrl: text("optimizedUrl"),
  width: integer("width"),
  height: integer("height"),
  altText: text("altText"),
  focalPointX: real("focalPointX"),
  focalPointY: real("focalPointY"),
  duration: integer("duration"),
  videoThumbnail: text("videoThumbnail"),
  folder: text("folder").notNull().default("/"),
  tags: text("tags").default("[]"),
  usageCount: integer("usageCount").notNull().default(0),
  usedInPages: text("usedInPages").default("[]"),
  uploadedBy: text("uploadedBy"),
  cdnProvider: text("cdnProvider"),
  cdnUrl: text("cdnUrl"),
  processingStatus: text("processingStatus").notNull().default("pending"),
  processingError: text("processingError"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// =============================================================================
// PROPERTIES & BOOKINGS
// =============================================================================

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull().default("apartment"),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull().default("Valletta"),
  address: text("address").notNull().default(""),
  latitude: text("latitude").notNull().default("35.8992"),
  longitude: text("longitude").notNull().default("14.5140"),
  bedrooms: integer("bedrooms").notNull().default(2),
  bathrooms: integer("bathrooms").notNull().default(2),
  maxGuests: integer("maxGuests").notNull().default(4),
  basePrice: real("basePrice").notNull().default(150),
  currency: text("currency").notNull().default("EUR"),
  cleaningFee: real("cleaningFee").notNull().default(50),
  minStay: integer("minStay").notNull().default(2),
  maxStay: integer("maxStay").notNull().default(30),
  checkInTime: text("checkInTime").notNull().default("15:00"),
  checkOutTime: text("checkOutTime").notNull().default("11:00"),
  amenities: text("amenities").default("[]"),
  images: text("images").default("[]"),
  rating: real("rating").notNull().default(4.9),
  reviewCount: integer("reviewCount").notNull().default(0),
  featured: integer("featured", { mode: "boolean" }).notNull().default(true),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  confirmationCode: text("confirmationCode").notNull().unique(),
  propertyId: text("propertyId").notNull(),
  propertyName: text("propertyName").notNull().default(""),
  guestName: text("guestName").notNull(),
  guestEmail: text("guestEmail").notNull(),
  guestPhone: text("guestPhone").notNull(),
  guestAddress: text("guestAddress").notNull().default(""),
  guestCity: text("guestCity").notNull().default(""),
  guestCountry: text("guestCountry").notNull().default(""),
  checkIn: text("checkIn").notNull(),
  checkOut: text("checkOut").notNull(),
  nights: integer("nights").notNull().default(1),
  guests: integer("guests").notNull().default(1),
  basePrice: real("basePrice").notNull().default(0),
  cleaningFee: real("cleaningFee").notNull().default(0),
  serviceFee: real("serviceFee").notNull().default(0),
  totalPrice: real("totalPrice").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("pending"),
  source: text("source").notNull().default("direct"),
  specialRequests: text("specialRequests").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
