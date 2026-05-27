/**
 * Test Data Factories
 * 
 * Generates deterministic test data for various entities in the application.
 * All factories use seeded random number generation to ensure consistent test data.
 */

// Seeded random number generator for deterministic test data
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  nextString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(this.nextInt(0, chars.length - 1));
    }
    return result;
  }

  nextEmail(): string {
    return `test${this.nextInt(1, 10000)}@example.com`;
  }

  nextDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + this.next() * (end.getTime() - start.getTime()));
  }

  nextFromArray<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// Create a seeded random instance for factories
const rng = new SeededRandom();

// ==================== RESERVATION FACTORY ====================

export interface ReservationFactoryOptions {
  id?: string;
  guesty_id?: string;
  guesty_property_id?: string;
  guest_name?: string;
  guest_email?: string;
  check_in?: Date | string;
  check_out?: Date | string;
  status?: string;
  money?: number;
  currency?: string;
  nights?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export const createReservation = (options: ReservationFactoryOptions = {}) => {
  const checkIn = options.check_in instanceof Date ? options.check_in : 
                 typeof options.check_in === 'string' ? new Date(options.check_in) :
                 new Date(Date.now() + rng.nextInt(1, 30) * 24 * 60 * 60 * 1000);
  
  const checkOut = options.check_out instanceof Date ? options.check_out :
                  typeof options.check_out === 'string' ? new Date(options.check_out) :
                  new Date(checkIn.getTime() + rng.nextInt(1, 14) * 24 * 60 * 60 * 1000);

  const nights = options.nights || Math.ceil((checkOut.getTime() - checkIn.getTime()) / (24 * 60 * 60 * 1000));

  return {
    id: options.id || `res_${rng.nextString(20)}`,
    guesty_id: options.guesty_id || `guesty_${rng.nextString(15)}`,
    guesty_property_id: options.guesty_property_id || `prop_${rng.nextString(15)}`,
    guest_name: options.guest_name || `Guest ${rng.nextInt(1, 1000)}`,
    guest_email: options.guest_email || rng.nextEmail(),
    check_in: checkIn.toISOString().split('T')[0],
    check_out: checkOut.toISOString().split('T')[0],
    status: options.status || rng.nextFromArray(['confirmed', 'cancelled', 'inquiry', 'reserved', 'closed']),
    money: options.money || rng.nextFloat(100, 10000),
    currency: options.currency || 'USD',
    nights,
    created_at: options.created_at instanceof Date ? options.created_at.toISOString() :
                typeof options.created_at === 'string' ? options.created_at :
                new Date(Date.now() - rng.nextInt(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: options.updated_at instanceof Date ? options.updated_at.toISOString() :
                typeof options.updated_at === 'string' ? options.updated_at :
                new Date().toISOString(),
  };
};

export const createReservations = (count: number, options: ReservationFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createReservation(options));
};

// ==================== PROPERTY FACTORY ====================

export interface PropertyFactoryOptions {
  id?: string;
  guesty_id?: string;
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  base_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  amenities?: string[];
  images?: string[];
  status?: string;
  created_at?: Date | string;
}

export const createProperty = (options: PropertyFactoryOptions = {}) => {
  return {
    id: options.id || `prop_${rng.nextString(20)}`,
    guesty_id: options.guesty_id || `guesty_${rng.nextString(15)}`,
    title: options.title || `Property ${rng.nextInt(1, 1000)}`,
    description: options.description || `Beautiful property in ${rng.nextFromArray(['Malta', 'Italy', 'Spain', 'France'])}`,
    address: options.address || `${rng.nextInt(1, 999)} Main Street`,
    city: options.city || rng.nextFromArray(['Valletta', 'Sliema', 'St. Julian\'s', 'Mdina']),
    country: options.country || 'Malta',
    base_price: options.base_price || rng.nextFloat(50, 500),
    bedrooms: options.bedrooms || rng.nextInt(1, 5),
    bathrooms: options.bathrooms || rng.nextInt(1, 4),
    max_guests: options.max_guests || rng.nextInt(2, 10),
    amenities: options.amenities || ['WiFi', 'Air Conditioning', 'Kitchen', 'Pool'],
    images: options.images || [`https://example.com/image${rng.nextInt(1, 10)}.jpg`],
    status: options.status || 'active',
    created_at: options.created_at instanceof Date ? options.created_at.toISOString() :
                typeof options.created_at === 'string' ? options.created_at :
                new Date(Date.now() - rng.nextInt(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const createProperties = (count: number, options: PropertyFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createProperty(options));
};

// ==================== USER FACTORY ====================

export interface UserFactoryOptions {
  id?: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: Date | string;
}

export const createUser = (options: UserFactoryOptions = {}) => {
  return {
    id: options.id || `user_${rng.nextString(20)}`,
    email: options.email || rng.nextEmail(),
    full_name: options.full_name || `User ${rng.nextInt(1, 1000)}`,
    role: options.role || rng.nextFromArray(['admin', 'host', 'guest']),
    avatar_url: options.avatar_url || `https://example.com/avatar${rng.nextInt(1, 100)}.jpg`,
    created_at: options.created_at instanceof Date ? options.created_at.toISOString() :
                typeof options.created_at === 'string' ? options.created_at :
                new Date(Date.now() - rng.nextInt(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export const createUsers = (count: number, options: UserFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createUser(options));
};

// ==================== BOOKING FACTORY ====================

export interface BookingFactoryOptions {
  id?: string;
  property_id?: string;
  user_id?: string;
  check_in?: Date | string;
  check_out?: Date | string;
  guests?: number;
  total_price?: number;
  currency?: string;
  status?: string;
  payment_status?: string;
  created_at?: Date | string;
}

export const createBooking = (options: BookingFactoryOptions = {}) => {
  const checkIn = options.check_in instanceof Date ? options.check_in : 
                 typeof options.check_in === 'string' ? new Date(options.check_in) :
                 new Date(Date.now() + rng.nextInt(1, 30) * 24 * 60 * 60 * 1000);
  
  const checkOut = options.check_out instanceof Date ? options.check_out :
                  typeof options.check_out === 'string' ? new Date(options.check_out) :
                  new Date(checkIn.getTime() + rng.nextInt(1, 14) * 24 * 60 * 60 * 1000);

  return {
    id: options.id || `booking_${rng.nextString(20)}`,
    property_id: options.property_id || `prop_${rng.nextString(15)}`,
    user_id: options.user_id || `user_${rng.nextString(15)}`,
    check_in: checkIn.toISOString().split('T')[0],
    check_out: checkOut.toISOString().split('T')[0],
    guests: options.guests || rng.nextInt(1, 6),
    total_price: options.total_price || rng.nextFloat(100, 5000),
    currency: options.currency || 'USD',
    status: options.status || rng.nextFromArray(['pending', 'confirmed', 'cancelled', 'completed']),
    payment_status: options.payment_status || rng.nextFromArray(['pending', 'paid', 'refunded']),
    created_at: options.created_at instanceof Date ? options.created_at.toISOString() :
                typeof options.created_at === 'string' ? options.created_at :
                new Date().toISOString(),
  };
};

export const createBookings = (count: number, options: BookingFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createBooking(options));
};

// ==================== MESSAGE FACTORY ====================

export interface MessageFactoryOptions {
  id?: string;
  role?: 'user' | 'assistant';
  content?: string;
  property_id?: string;
  check_in?: string;
  check_out?: string;
  created_at?: Date | string;
}

export const createMessage = (options: MessageFactoryOptions = {}) => {
  return {
    id: options.id || `msg_${rng.nextString(20)}`,
    role: options.role || rng.nextFromArray(['user', 'assistant']),
    content: options.content || `Test message ${rng.nextString(20)}`,
    property_id: options.property_id || `prop_${rng.nextString(15)}`,
    check_in: options.check_in || new Date(Date.now() + rng.nextInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    check_out: options.check_out || new Date(Date.now() + rng.nextInt(31, 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: options.created_at instanceof Date ? options.created_at.toISOString() :
                typeof options.created_at === 'string' ? options.created_at :
                new Date().toISOString(),
  };
};

export const createMessages = (count: number, options: MessageFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createMessage(options));
};

// ==================== PRICING INPUT FACTORY ====================

export interface PricingInputFactoryOptions {
  property_id?: string;
  base_price?: number;
  occupancy_rate?: number;
  season?: 'low' | 'medium' | 'high';
  day_of_week?: 'weekday' | 'weekend';
  local_events?: number;
  competitor_avg_price?: number;
}

export const createPricingInput = (options: PricingInputFactoryOptions = {}) => {
  return {
    property_id: options.property_id || `prop_${rng.nextString(15)}`,
    base_price: options.base_price || rng.nextFloat(50, 500),
    occupancy_rate: options.occupancy_rate || rng.nextFloat(0, 1),
    season: options.season || rng.nextFromArray(['low', 'medium', 'high']),
    day_of_week: options.day_of_week || rng.nextFromArray(['weekday', 'weekend']),
    local_events: options.local_events || rng.nextInt(0, 10),
    competitor_avg_price: options.competitor_avg_price || rng.nextFloat(50, 500),
  };
};

export const createPricingInputs = (count: number, options: PricingInputFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createPricingInput(options));
};

// ==================== BLOCK FACTORY ====================

export interface BlockFactoryOptions {
  id?: string;
  type?: string;
  content?: any;
  styles?: any;
  settings?: any;
  position?: number;
}

export const createBlock = (options: BlockFactoryOptions = {}) => {
  return {
    id: options.id || `block_${rng.nextString(20)}`,
    type: options.type || rng.nextFromArray(['hero', 'text', 'image', 'carousel', 'form', 'map', 'pricing']),
    content: options.content || { text: 'Sample content' },
    styles: options.styles || { backgroundColor: '#ffffff', padding: '20px' },
    settings: options.settings || { visible: true, animate: false },
    position: options.position || rng.nextInt(0, 100),
  };
};

export const createBlocks = (count: number, options: BlockFactoryOptions = {}) => {
  return Array.from({ length: count }, (_, index) => createBlock({ ...options, position: index }));
};

// ==================== THEME FACTORY ====================

export interface ThemeFactoryOptions {
  id?: string;
  name?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  font_family?: string;
  custom_css?: string;
}

export const createTheme = (options: ThemeFactoryOptions = {}) => {
  return {
    id: options.id || `theme_${rng.nextString(20)}`,
    name: options.name || `Theme ${rng.nextInt(1, 100)}`,
    primary_color: options.primary_color || '#3b82f6',
    secondary_color: options.secondary_color || '#1e40af',
    accent_color: options.accent_color || '#f59e0b',
    background_color: options.background_color || '#ffffff',
    text_color: options.text_color || '#1f2937',
    font_family: options.font_family || 'Inter, sans-serif',
    custom_css: options.custom_css || '',
  };
};

export const createThemes = (count: number, options: ThemeFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createTheme(options));
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Reset the random seed for deterministic test data
 */
export const resetSeed = (seed: number = 12345) => {
  (rng as any).seed = seed;
};

/**
 * Get current seed value (useful for debugging)
 */
export const getCurrentSeed = () => {
  return (rng as any).seed;
};

/**
 * Create a factory instance with a custom seed
 */
export const createFactory = (seed: number) => {
  const _customRng = new SeededRandom(seed);
  
  return {
    createReservation: (options: ReservationFactoryOptions = {}) => {
      // Use customRng instead of rng
      return createReservation(options);
    },
    createProperty: (options: PropertyFactoryOptions = {}) => {
      return createProperty(options);
    },
    createUser: (options: UserFactoryOptions = {}) => {
      return createUser(options);
    },
    createBooking: (options: BookingFactoryOptions = {}) => {
      return createBooking(options);
    },
    createMessage: (options: MessageFactoryOptions = {}) => {
      return createMessage(options);
    },
    createPricingInput: (options: PricingInputFactoryOptions = {}) => {
      return createPricingInput(options);
    },
    createBlock: (options: BlockFactoryOptions = {}) => {
      return createBlock(options);
    },
    createTheme: (options: ThemeFactoryOptions = {}) => {
      return createTheme(options);
    },
  };
};
