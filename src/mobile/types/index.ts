export interface MobileProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
}

export interface MobileBooking {
  id: string;
  property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  total_price: number;
}

export interface MobileChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
