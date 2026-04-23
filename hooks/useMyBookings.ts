import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type MyBooking = {
  uuid: string;
  booking_code: string;
  status: string;
  start_at: string;
  end_at: string;
  price_snapshot: number;
  currency: string;
  qr_code: string | null;
  bookable: { name: string; kind: string };
};

export function useMyBookings(status?: string) {
  return useQuery<MyBooking[]>({
    queryKey: ['my-bookings', status],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/bookings', {
        params: status ? { status } : {},
      });
      return data.data ?? data;
    },
  });
}

export function useCancelMyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      await api.post(`/api/v1/bookings/${uuid}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-detail'] });
    },
  });
}
