import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/token';

export type MeUser = {
  id: string | number;
  name: string;
  email: string;
  current_organization_id: number | null;
  permissions: string[];
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
      const { data } = await api.post('/api/login', { email, password });
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
      const { data } = await api.post('/api/register', {
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
      await api.post('/api/logout');
    },
    onSettled: async () => {
      await clearToken();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
