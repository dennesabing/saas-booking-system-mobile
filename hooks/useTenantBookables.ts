import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type TenantBookable = {
  id: string;
  uuid: string;
  name: string;
  description: string | null;
  kind: 'slot' | 'resource';
  duration_minutes: number;
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
      const { data } = await api.patch(`/api/v1/bookables/${uuid}`, { is_active: isActive });
      return data.data ?? data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenant-bookables'] }),
  });
}

export type UpdateBookablePayload = {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
};

export function useUpdateBookable(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateBookablePayload) => {
      const { data } = await api.patch(`/api/v1/bookables/${uuid}`, payload);
      return data.data ?? data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-bookables'] });
      queryClient.invalidateQueries({ queryKey: ['org-setup-status'] });
    },
  });
}

export function useDeleteBookable(uuid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/bookables/${uuid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-bookables'] });
      queryClient.invalidateQueries({ queryKey: ['org-setup-status'] });
    },
  });
}
