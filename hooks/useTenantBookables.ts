import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type TenantBookable = {
  id: string;
  uuid: string;
  name: string;
  kind: 'slot' | 'resource';
  price: number;
  currency: string;
  is_active: boolean;
};

export function useTenantBookables() {
  return useQuery<TenantBookable[]>({
    queryKey: ['tenant-bookables'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/bookables');
      return data.data ?? data;
    },
  });
}

export function useToggleBookable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ uuid, isActive }: { uuid: string; isActive: boolean }) => {
      const { data } = await api.patch(`/api/v1/bookables/${uuid}`, {
        is_active: isActive,
      });
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-bookables'] });
    },
  });
}
