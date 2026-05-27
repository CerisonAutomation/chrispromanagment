// =============================================================================
// PAGE REPOSITORY INTERFACE - CQRS Repository Pattern
// =============================================================================
import type { Page, PageId, Slug, Result } from './types';

/**
 * Repository interface for Page aggregate
 * Abstracts all data access behind this interface
 */
export interface PageRepository {
  // Queries (Read operations)
  findById(id: PageId): Promise<Result<Page, Error>>;
  findBySlug(slug: Slug): Promise<Result<Page | null, Error>>;
  findAll(): Promise<Result<Page[], Error>>;
  findPublished(): Promise<Result<Page[], Error>>;
  findByStatus(status: Page['status']): Promise<Result<Page[], Error>>;
  
  // Commands (Write operations)
  save(page: Page): Promise<Result<Page, Error>>;
  delete(id: PageId): Promise<Result<void, Error>>;
  publish(id: PageId): Promise<Result<Page, Error>>;
  unpublish(id: PageId): Promise<Result<Page, Error>>;
}

// =============================================================================
// LISTING REPOSITORY INTERFACE
// =============================================================================
import type { Listing, ListingId } from './types';
import type { GuestyListing } from './guesty-types';

export interface ListingRepository {
  // Queries
  findById(id: ListingId): Promise<Result<Listing, Error>>;
  findAll(filters?: ListingFilters): Promise<Result<Listing[], Error>>;
  search(query: string): Promise<Result<Listing[], Error>>;
  
  // Commands
  save(listing: Listing): Promise<Result<Listing, Error>>;
  syncFromGuesty(guestyData: GuestyListing): Promise<Result<Listing, Error>>;
  updateAvailability(id: ListingId, dates: Availability): Promise<Result<void, Error>>;
}

export interface ListingFilters {
  minBedrooms?: number;
  maxBedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
}

// =============================================================================
// RESERVATION REPOSITORY INTERFACE
// =============================================================================
import type { Reservation, ReservationId } from './types';

export interface ReservationRepository {
  findById(id: ReservationId): Promise<Result<Reservation, Error>>;
  findByListing(listingId: ListingId): Promise<Result<Reservation[], Error>>;
  findByGuest(email: string): Promise<Result<Reservation[], Error>>;
  save(reservation: Reservation): Promise<Result<Reservation, Error>>;
  cancel(id: ReservationId): Promise<Result<void, Error>>;
}
