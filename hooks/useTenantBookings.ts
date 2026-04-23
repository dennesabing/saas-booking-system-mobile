import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type TenantBooking = {
  uuid: string;
  booking_code: string;
  status: string;
  start_at: string;
  end_at: string;
  price_snapshot: number;
  currency: string;
  notes: string | null;
  qr_code: string | null;
  bookable: { uuid: string; name: string; kind: string };
  user: { name: string; email: string } | null;
};

export function useTenantBookings(filters: { status?: string; bookable?: string } = {}) {
  return useQuery<TenantBooking[]>({
    queryKey: ['tenant-bookings', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.bookable) params.bookable = filters.bookable;
      const { data } = await api.get('/api/v1/tenant/bookings', { params });
      return data.data ?? data;
    },
  });
}
