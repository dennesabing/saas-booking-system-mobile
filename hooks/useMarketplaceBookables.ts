import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type MarketplaceBookable = {
  id: string;
  name: string;
  description: string | null;
  kind: 'slot' | 'resource';
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  distance_km: number;
  org_name: string | null;
};

export type MarketplaceParams = {
  lat: number;
  lng: number;
  radius?: number;
  search?: string;
  kind?: string;
};

type PageData = {
  data: MarketplaceBookable[];
  meta: { current_page: number; last_page: number; total: number };
};

export function useMarketplaceBookables(params: MarketplaceParams | null) {
  return useInfiniteQuery<PageData>({
    queryKey: ['marketplace-bookables', params],
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get('/api/v1/marketplace/bookables', {
        params: { ...params, page: pageParam },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta ?? {};
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: params !== null,
  });
}
