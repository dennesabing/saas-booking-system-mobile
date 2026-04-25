import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type AvailabilityWindow = {
  start_at: string;
  end_at: string;
  is_available: boolean;
  booked_count: number;
  capacity: number | null;
  remaining: number;
  slot_id?: number | null;
};

export function useAvailability(bookableUuid: string, date: string | null, headcount: number = 1) {
  return useQuery<AvailabilityWindow[]>({
    queryKey: ['availability', bookableUuid, date, headcount],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/v1/bookables/${bookableUuid}/availability`,
        { params: { date, headcount } }
      );
      return data.data ?? data;
    },
    enabled: !!bookableUuid && !!date,
  });
}
