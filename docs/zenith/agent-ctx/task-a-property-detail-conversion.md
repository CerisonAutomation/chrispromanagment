# Task A: PropertyDetailPage Conversion — Work Record

## Task ID
task-a-property-detail-conversion

## Agent
Main Agent

## Summary
Converted and merged the React Router `PropertyDetailPage.jsx` into the existing Next.js App Router page at `src/app/property/[id]/page.tsx`.

## Changes Made

### 1. React Router → Next.js App Router Conversions
- **`useParams()`** → `params: Promise<{ id: string }>` prop with `use(params)` (Next.js 16 async params)
- **`useNavigate()`** → `useRouter()` from `next/navigation`, using `router.push()` instead of `navigate()`
- **`useSearchParams()`** from `react-router-dom` → `useSearchParams()` from `next/navigation`
- **`Link` from `react-router-dom`** → `Link` from `next/link`
- **Added `'use client'`** directive (already existed in original)
- **Removed `react-router-dom` imports** entirely

### 2. API Route Updates
- `${API}/listings/${id}` → `LISTING_ROUTES.listing(id)` (uses `/api/listings/${id}`)
- `${API}/listings/${id}/calendar` → `LISTING_ROUTES.listingCalendar(id)`
- `${API}/quotes` → `QUOTE_ROUTES.QUOTES`
- `${API}/quotes/${quoteId}/coupons` → `QUOTE_ROUTES.quoteCoupon(quoteId)`
- Coupon removal uses full URL with `QUOTE_ROUTES.quoteCoupon()`

### 3. Features Integrated from Uploaded PropertyDetailPage.jsx

#### Gallery & Lightbox (Superior version)
- Full-screen lightbox with **top bar** (title + counter)
- **Thumbnail strip** at bottom with gold border highlight on active
- **Image captions** support from Guesty picture objects
- **Nav arrows** as round buttons with border styling
- Guesty picture object support (`img.original`, `img.large`, `img.regular`, `img.thumbnail`)
- "View all N photos" button below gallery grid

#### Booking Widget
- **Rate plan selector** — Visual button UI for Non-refundable/Flexible packages
- **Coupon system** — Canonical Guesty BEAPI `/coupons` endpoint with:
  - "I have a coupon" toggle
  - Apply/remove coupon with loading state
  - Active coupon display with remove button
- **V2 Price breakdown** using `buildBreakdownV2()`:
  - Subtotal (accommodation)
  - Fees with itemized breakdown
  - Subtotal before taxes
  - Taxes with itemized breakdown (VAT, City Tax, etc.)
  - Grand total
- **Cancellation policy** using `describeCancellationPolicyV2()` with label/tone
- **"You won't be charged yet"** text under Book Now button
- **Dynamic Book Now text** — shows "Select dates", "Getting price…", or "Book Now — €XXX"

#### Content Sections (from uploaded file)
- **About This Property** (publicDescription.summary)
- **The Space** (publicDescription.space)
- **Guest Access** (publicDescription.access)
- **The Neighborhood** (publicDescription.neighborhood)
- **Getting Around** (publicDescription.transit)
- **Additional Notes** (publicDescription.notes)

#### House Rules (Enhanced)
- Structured smoking/pets rules from `unitTypeHouseRules.houseRules`
- Generic rules array fallback
- Default rules when none specified

#### Reviews Display
- Guesty `reviews.avg` with proper 5-point scale handling
- Review count display
- Star rating with gold fill

#### Calendar
- Unavailable date **strikethrough** styling with modifiers
- "Strikethrough dates are unavailable" hint text
- Both Date[] and `{ before: new Date() }` disabled dates

#### Search Params
- `checkIn` and `checkOut` initialized from URL search params

### 4. Features Kept from Existing Page
- **NormalizedListing** with `MapGuestyToListing()` — handles both Guesty API and mock data
- **Mock data fallback** when API fails
- **Dynamic Leaflet imports** (SSR-safe with `next/dynamic`)
- **Dark CARTO tiles** for map (instead of OpenStreetMap light tiles)
- **LoadingSpinner** and **ErrorState** components
- **Existing project routes** via `LISTING_ROUTES`, `QUOTE_ROUTES`, `PAGE_ROUTES`
- **Breadcrumb navigation**

### 5. NormalizedListing Type Extensions
Added new fields to support uploaded file's data:
- `pictures: any[]` — Guesty picture objects
- `accommodates: number` — max guest count
- `reviews: { avg: number; total: number } | null` — Guesty reviews
- `defaultCheckInTime: string | null` — check-in time
- `defaultCheckOutTime: string | null` — check-out time
- `address: Record<string, any> | null` — full address object

### 6. Lint Fixes
- Added `// eslint-disable-next-line @typescript-eslint/no-require-imports` for Leaflet `require()` calls (necessary for SSR-safe dynamic loading)
