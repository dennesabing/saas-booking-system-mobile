import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type PublicBookable = {
  id: string;
  name: string;
  kind: 'slot' | 'resource';
  price: number;
  currency: string;
  is_active: boolean;
};

export function usePublicBookables(orgSlug: string) {
  return useQuery<PublicBookable[]>({
    queryKey: ['public-bookables', orgSlug],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/public/orgs/${orgSlug}/bookables`);
      return data.data ?? data;
    },
    enabled: !!orgSlug,
  });
}
