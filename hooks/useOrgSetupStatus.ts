import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type SetupItems = {
  has_bookable: boolean;
  has_availability: boolean;
  has_team_member: boolean;
  booking_link_shared: boolean;
};

export type OrgSetupStatus = {
  items?: SetupItems;
  completed_count?: number;
  total_count?: number;
  setup_completed_at: string | null;
};

export function useOrgSetupStatus() {
  return useQuery<OrgSetupStatus>({
    queryKey: ['org-setup-status'],
    queryFn: () => api.get('/api/v1/org/setup-status').then(r => r.data),
  });
}

export function useMarkBookingLinkShared() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/api/v1/org/setup-status', { booking_link_shared: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-setup-status'] }),
  });
}
