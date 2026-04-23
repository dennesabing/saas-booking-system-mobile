import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type BookingDetail = {
  uuid: string;
  booking_code: string;
  status: string;
  start_at: string;
  end_at: string;
  price_snapshot: number;
  currency: string;
  notes: string | null;
  qr_code: string | null;
  bookable: { name: string; kind: string };
};

export function useMyBookingDetail(uuid: string) {
  return useQuery<BookingDetail>({
    queryKey: ['booking-detail', uuid],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/bookings/${uuid}`);
      return data.data ?? data;
    },
    enabled: !!uuid,
  });
}
