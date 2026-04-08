/**
 * @fileoverview Database Schema — Drizzle ORM canonical definitions
 * 
 * TABLES:
 * - cms_pages: CMS pages managed by Puck
 * - properties: Property listings
 * - reservations: Guesty reservations
 * - media: Media library files
 */
import { pgTable, uuid, varchar, text, timestamp, jsonb, boolean, integer, numeric } from 'drizzle-orm/pg-core';

// ─── CMS Pages ─────────────────────────────────────────────────────────────

export const cmsPages = pgTable('cms_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  data: jsonb('data').notNull().default({ content: [], root: { props: {} } }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CmsPage = typeof cmsPages.$inferSelect;
export type CmsPageInsert = typeof cmsPages.$inferInsert;

// ─── Properties ────────────────────────────────────────────────────────────

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestyId: varchar('guesty_id', { length: 255 }).unique(),
  title: varchar('title', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 255 }),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  address: jsonb('address').default({}),
  bedrooms: integer('bedrooms').default(0),
  bathrooms: integer('bathrooms').default(0),
  accommodates: integer('accommodates').default(0),
  pricePerNight: numeric('price_per_night', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('EUR'),
  amenities: jsonb('amenities').default([]),
  pictures: jsonb('pictures').default([]),
  isActive: boolean('is_active').default(true),
  syncStatus: varchar('sync_status', { length: 50 }).default('pending'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type PropertyInsert = typeof properties.$inferInsert;

// ─── Reservations ──────────────────────────────────────────────────────────

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestyId: varchar('guesty_id', { length: 255 }).unique(),
  propertyId: uuid('property_id').references(() => properties.id),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestEmail: varchar('guest_email', { length: 255 }),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('EUR'),
  guestCount: jsonb('guest_count').default({ adults: 1, children: 0 }),
  confirmationCode: varchar('confirmation_code', { length: 255 }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type ReservationInsert = typeof reservations.$inferInsert;

// ─── Media Library ─────────────────────────────────────────────────────────

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  alt: varchar('alt', { length: 255 }),
  folder: varchar('folder', { length: 255 }).default('uploads'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type MediaInsert = typeof media.$inferInsert;
