import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export type CreateBookingPayload = {
  bookable_uuid: string;
  start_at: string;
  end_at: string;
  booking_slot_uuid?: string;
  attendee_count?: number;
  notes?: string;
};

export type BookingResult = {
  uuid: string;
  booking_code: string;
  status: string;
  attendee_count: number;
};

export function useCreateBooking() {
  return useMutation<BookingResult, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/v1/bookings', payload);
      return data.data ?? data;
    },
  });
}
