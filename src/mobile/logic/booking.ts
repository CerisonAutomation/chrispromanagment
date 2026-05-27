// @ts-nocheck
import { apiClient } from '@/lib/api-client';
import { MobileProperty, MobileBooking } from './types';

export async function getMobileProperties(): Promise<MobileProperty[]> {
  const response = await apiClient.get('/properties');
  return response.data;
}

export async function getMobileBookings(): Promise<MobileBooking[]> {
  const response = await apiClient.get('/bookings');
  return response.data;
}

export async function createMobileBooking(booking: Omit<MobileBooking, 'id'>): Promise<MobileBooking> {
  const response = await apiClient.post('/bookings', booking);
  return response.data;
}
