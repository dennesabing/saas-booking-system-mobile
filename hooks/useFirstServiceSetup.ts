import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type ServiceDetails = {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency?: string;
};

export type DaySchedule = {
  day: string;
  open: boolean;
  open_time?: string;
  close_time?: string;
};

async function createFirstService(details: ServiceDetails, days: DaySchedule[]) {
  const { data } = await api.post('/api/v1/bookables', {
    ...details,
    kind: 'slot',
  });
  const bookable = data.data ?? data;
  await api.post(`/api/v1/bookables/${bookable.id}/availability-schedules`, { days });
  return bookable;
}

export function useFirstServiceSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ details, days }: { details: ServiceDetails; days: DaySchedule[] }) =>
      createFirstService(details, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-bookables'] });
      queryClient.invalidateQueries({ queryKey: ['org-setup-status'] });
    },
  });
}
