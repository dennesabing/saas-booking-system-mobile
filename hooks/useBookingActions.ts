import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

type Action = 'confirm' | 'complete' | 'no-show' | 'cancel';

export function useBookingAction(action: Action) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uuid: string) => {
      const { data } = await api.post(`/api/v1/tenant/bookings/${uuid}/${action}`);
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-bookings'] });
    },
  });
}
