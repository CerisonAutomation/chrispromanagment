// Stub schema - exports for compatibility
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cmsPages = sqliteTable('cms_pages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('DRAFT'),
  content: text('content'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const pageVersions = sqliteTable('page_versions', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id'),
  createdAt: text('created_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  status: text('status').notNull().default('PENDING'),
  createdAt: text('created_at'),
});

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  price: integer('price'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  maxGuests: integer('max_guests'),
  amenities: text('amenities'),
  images: text('images'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});
