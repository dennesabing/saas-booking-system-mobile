import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/token';

export type NotificationPreferences = {
  push: boolean;
  email: boolean;
  sms: boolean;
  booking_confirmations: boolean;
  appointment_reminders: boolean;
  waitlist_updates: boolean;
  review_requests: boolean;
  cancellation_alerts: boolean;
  promotional_offers: boolean;
};

export type MeUser = {
  id: string | number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  current_organization_id: number | null;
  permissions: string[];
  mobile_number: string | null;
  date_of_birth: string | null;
  default_location: string | null;
  default_location_lat: number | null;
  default_location_lng: number | null;
  notification_preferences: NotificationPreferences;
  stats: {
    bookings_count: number;
    organizations_count: number;
  };
};

export function isStaff(user: MeUser | undefined): boolean {
  if (!user) return false;
  return (
    user.permissions.includes('bookings.manage') ||
    user.permissions.includes('bookables.manage')
  );
}

export function useCurrentUser() {
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getToken().then((t) => {
      setHasToken(!!t);
      setTokenChecked(true);
    });
  }, []);

  const query = useQuery<MeUser>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/me');
      return data.data ?? data;
    },
    enabled: tokenChecked && hasToken,
    retry: false,
  });

  return { ...query, tokenChecked };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data } = await api.post('/api/v1/login', { email, password });
      return data.data ?? data;
    },
    onSuccess: async (data) => {
      await setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
      password_confirmation,
    }: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { data } = await api.post('/api/v1/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      return data.data ?? data;
    },
    onSuccess: async (data) => {
      await setToken(data.token);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/api/v1/logout');
    },
    onSettled: async () => {
      await clearToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
