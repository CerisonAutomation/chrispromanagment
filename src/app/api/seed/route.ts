import {db} from "@/lib/db";
import {defaultPages} from "@/lib/default-pages";
import {NextResponse} from "next/server";

const PROPERTY_SEED_DATA = [
  {
    slug: "valletta-apartment-1",
    name: "Valletta Apartment 1",
    type: "apartment",
    description:
      "Elegant apartment in the heart of Malta's capital city, Valletta. This beautifully restored property offers modern comforts within historic walls, featuring stunning city views and walking distance to all major attractions including St. John's Co-Cathedral and the Grand Harbour.",
    location: "Heart of Valletta, Malta",
    city: "Valletta",
    address: "Old Mint Street, Valletta, VLT 1515, Malta",
    latitude: "35.8989",
    longitude: "14.5144",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 6,
    basePrice: 189,
    currency: "EUR",
    cleaningFee: 65,
    minStay: 2,
    maxStay: 30,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Washer",
      "TV",
      "Balcony",
      "City View",
      "Elevator",
      "Hair Dryer",
      "Iron",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/valletta-apartment-10-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9593-high-szbz83.jpg",
    ]),
    rating: 4.9,
    reviewCount: 47,
    featured: true,
    active: true,
  },
  {
    slug: "valletta-apartment-2",
    name: "Valletta Apartment 2",
    type: "apartment",
    description:
      "Stunning waterfront apartment along the Valletta promenade with breathtaking sea views. This contemporary space combines luxury living with the charm of Malta's historic capital, perfect for couples or small families seeking an unforgettable Mediterranean escape.",
    location: "Valletta Waterfront, Malta",
    city: "Valletta",
    address: "Valletta Waterfront, Valletta, VLT 1914, Malta",
    latitude: "35.8942",
    longitude: "14.5178",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    basePrice: 159,
    currency: "EUR",
    cleaningFee: 55,
    minStay: 2,
    maxStay: 30,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Washer",
      "TV",
      "Sea View",
      "Elevator",
      "Dishwasher",
      "Hair Dryer",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9588-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9590-high.jpg",
    ]),
    rating: 4.8,
    reviewCount: 32,
    featured: true,
    active: true,
  },
  {
    slug: "bahar-ic-caghaq-villa",
    name: "Bahar ic-Caghaq Villa",
    type: "villa",
    description:
      "Luxurious villa nestled in the serene coastal area of Bahar ic-Caghaq. This spacious retreat offers a private pool, lush garden, and stunning sea views. Ideal for families and groups looking for privacy and comfort in one of Malta's most sought-after residential areas.",
    location: "Bahar ic-Caghaq, Malta",
    city: "Naxxar",
    address: "Bahar ic-Caghaq, Naxxar, NXR 9021, Malta",
    latitude: "35.9167",
    longitude: "14.4833",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    basePrice: 275,
    currency: "EUR",
    cleaningFee: 85,
    minStay: 3,
    maxStay: 30,
    checkInTime: "16:00",
    checkOutTime: "10:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Washer",
      "TV",
      "Pool",
      "Garden",
      "Parking",
      "BBQ",
      "Sea View",
      "Terrace",
      "Dishwasher",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7963-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7136-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_6590-high.png",
    ]),
    rating: 5.0,
    reviewCount: 28,
    featured: true,
    active: true,
  },
  {
    slug: "madliena-event-space",
    name: "Madliena Event Space",
    type: "event_space",
    description:
      "An exquisite event space in the prestigious area of Madliena, perfect for weddings, corporate events, and special celebrations. This versatile venue offers both indoor and outdoor spaces with a private pool, lush gardens, and professional-grade sound system.",
    location: "Madliena, Malta",
    city: "Madliena",
    address: "Madliena, Swieqi, SWQ 3131, Malta",
    latitude: "35.9200",
    longitude: "14.4700",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 20,
    basePrice: 350,
    currency: "EUR",
    cleaningFee: 120,
    minStay: 1,
    maxStay: 14,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Parking",
      "Garden",
      "Terrace",
      "Sound System",
      "Event Space",
      "BBQ",
      "Pool",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/65259-1-high-3hwctx.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_6106-high.jpg",
    ]),
    rating: 4.9,
    reviewCount: 15,
    featured: false,
    active: true,
  },
  {
    slug: "pieta-apartment",
    name: "Pieta Apartment",
    type: "apartment",
    description:
      "A charming apartment in the quiet residential area of Pieta, just minutes away from Valletta. This cozy retreat offers excellent value with modern amenities, a lovely balcony, and easy access to public transport and local shops. Perfect for budget-conscious travelers who want convenience.",
    location: "Pieta, Malta",
    city: "Pieta",
    address: "Pieta, PTR 1012, Malta",
    latitude: "35.8980",
    longitude: "14.4960",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    basePrice: 129,
    currency: "EUR",
    cleaningFee: 50,
    minStay: 2,
    maxStay: 30,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Washer",
      "TV",
      "Balcony",
      "Hair Dryer",
      "Iron",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7365-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_3886-high-vowc5f.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_3819-high-io7zhg.jpg",
    ]),
    rating: 4.7,
    reviewCount: 19,
    featured: false,
    active: true,
  },
  {
    slug: "gzira-apartment",
    name: "Gzira Apartment",
    type: "apartment",
    description:
      "Modern waterfront apartment in Gzira with stunning views of Manoel Island and the Sliema skyline. This well-appointed space features contemporary interiors, a sea-view balcony, and is perfectly positioned for exploring the vibrant dining and entertainment scene of the Sliema/Gzira area.",
    location: "Gzira Waterfront, Malta",
    city: "Gzira",
    address: "The Strand, Gzira, GZR 1037, Malta",
    latitude: "35.9110",
    longitude: "14.4840",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    basePrice: 145,
    currency: "EUR",
    cleaningFee: 55,
    minStay: 2,
    maxStay: 30,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    amenities: JSON.stringify([
      "WiFi",
      "Air Conditioning",
      "Kitchen",
      "Washer",
      "TV",
      "Sea View",
      "Balcony",
      "Dishwasher",
      "Hair Dryer",
    ]),
    images: JSON.stringify([
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_3814-high.jpg",
      "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_6113-high.jpg",
    ]),
    rating: 4.8,
    reviewCount: 24,
    featured: true,
    active: true,
  },
];

export async function POST() {
  try {
    // In production, only allow seeding from internal requests
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: "Seeding disabled in production" }, { status: 403 });
    }

    const results = [];

    await db.$transaction(async (tx) => {
      // Seed CMS pages
      for (const [slug, page] of Object.entries(defaultPages)) {
        const result = await tx.cmsPage.upsert({
          where: { slug },
          update: {
            title: page.title,
            data: JSON.stringify(page.data),
            status: "PUBLISHED",
          },
          create: {
            slug,
            title: page.title,
            data: JSON.stringify(page.data),
            status: "PUBLISHED",
          },
        });
        results.push({ type: "page", slug: result.slug, title: result.title });
      }

      // Seed properties
      for (const propertyData of PROPERTY_SEED_DATA) {
        const result = await tx.property.upsert({
          where: { slug: propertyData.slug },
          update: {
            name: propertyData.name,
            type: propertyData.type,
            description: propertyData.description,
            location: propertyData.location,
            city: propertyData.city,
            address: propertyData.address,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            maxGuests: propertyData.maxGuests,
            basePrice: propertyData.basePrice,
            currency: propertyData.currency,
            cleaningFee: propertyData.cleaningFee,
            minStay: propertyData.minStay,
            maxStay: propertyData.maxStay,
            checkInTime: propertyData.checkInTime,
            checkOutTime: propertyData.checkOutTime,
            amenities: propertyData.amenities,
            images: propertyData.images,
            rating: propertyData.rating,
            reviewCount: propertyData.reviewCount,
            featured: propertyData.featured,
            active: propertyData.active,
          },
          create: propertyData,
        });
        results.push({ type: "property", slug: result.slug, name: result.name });
      }
    });

    const pages = results.filter((r) => r.type === "page");
    const properties = results.filter((r) => r.type === "property");

    // Seed sample bookings
    const sampleProperty1 = await db.property.findFirst({ where: { slug: "valletta-apartment-1" } });
    const sampleProperty2 = await db.property.findFirst({ where: { slug: "gzira-apartment" } });
    const sampleProperty3 = await db.property.findFirst({ where: { slug: "bahar-ic-caghaq-villa" } });
    const sampleProperty4 = await db.property.findFirst({ where: { slug: "pieta-apartment" } });

    let bookingsSeeded = 0;
    if (sampleProperty1) {
      const demoBookings = [
            {
              confirmationCode: "CPM-DEMO1",
              propertyId: sampleProperty1.id,
              propertyName: sampleProperty1.name,
              guestName: "Emma Watson",
              guestEmail: "emma@example.com",
              guestPhone: "+44 7911 123456",
              checkIn: "2025-08-20",
              checkOut: "2025-08-25",
              nights: 5,
              guests: 4,
              basePrice: 945,
              cleaningFee: 65,
              serviceFee: 121.2,
              totalPrice: 1131.2,
              currency: "EUR",
              status: "confirmed",
              source: "direct",
              specialRequests: "Late check-in requested",
              notes: "",
            },
            {
              confirmationCode: "CPM-DEMO2",
              propertyId: sampleProperty2.id,
              propertyName: sampleProperty2.name,
              guestName: "Marco Rossi",
              guestEmail: "marco@example.com",
              guestPhone: "+39 333 456789",
              checkIn: "2025-09-01",
              checkOut: "2025-09-04",
              nights: 3,
              guests: 2,
              basePrice: 435,
              cleaningFee: 55,
              serviceFee: 58.8,
              totalPrice: 548.8,
              currency: "EUR",
              status: "pending",
              source: "airbnb",
              specialRequests: "",
              notes: "Anniversary trip",
            },
            {
              confirmationCode: "CPM-DEMO3",
              propertyId: sampleProperty3.id,
              propertyName: sampleProperty3.name,
              guestName: "Sophie Laurent",
              guestEmail: "sophie@example.com",
              guestPhone: "+33 6 12 34 56 78",
              checkIn: "2025-07-10",
              checkOut: "2025-07-17",
              nights: 7,
              guests: 6,
              basePrice: 1925,
              cleaningFee: 85,
              serviceFee: 241.2,
              totalPrice: 2251.2,
              currency: "EUR",
              status: "completed",
              source: "booking.com",
              specialRequests: "Will need a baby cot",
              notes: "Left a 5-star review",
            },
            {
              confirmationCode: "CPM-DEMO4",
              propertyId: sampleProperty4.id,
              propertyName: sampleProperty4.name,
              guestName: "Hans Mueller",
              guestEmail: "hans@example.com",
              guestPhone: "+49 171 2345678",
              checkIn: "2025-09-15",
              checkOut: "2025-09-18",
              nights: 3,
              guests: 3,
              basePrice: 387,
              cleaningFee: 50,
              serviceFee: 52.44,
              totalPrice: 489.44,
              currency: "EUR",
              status: "cancelled",
              source: "direct",
              specialRequests: "",
              notes: "Cancelled due to flight change",
            },
          ];

      for (const demoBooking of demoBookings) {
        await db.booking.upsert({
          where: { confirmationCode: demoBooking.confirmationCode },
          update: demoBooking,
          create: demoBooking,
        });
        bookingsSeeded++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${pages.length} pages, ${properties.length} properties${bookingsSeeded > 0 ? `, and ${bookingsSeeded} bookings` : ""}`,
      pages: pages.map((r) => ({ slug: r.slug, title: r.title })),
      properties: properties.map((r) => ({ slug: r.slug, name: r.name })),
      bookingsSeeded,
    });
  } catch (error) {
    console.error("[seed]", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
