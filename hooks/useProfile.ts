// mobile/hooks/useProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import api from '../lib/api';
import { NotificationPreferences, useCurrentUser } from './useAuth';

export function useProfile() {
  return useCurrentUser();
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<{
      name: string;
      email: string;
      mobile_number: string | null;
      date_of_birth: string | null;
      default_location: string | null;
      default_location_lat: number | null;
      default_location_lng: number | null;
    }>) => {
      const { data: res } = await api.put('/api/v1/me', data);
      return res.data ?? res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const { data: res } = await api.put('/api/v1/me/notification-preferences', prefs);
      return res.data ?? res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') throw new Error('Photo library permission denied');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return null;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' } as any);

      // Use native fetch — Axios's default Content-Type: application/json header
      // clobbers the multipart boundary that React Native generates for FormData.
      const { getToken } = await import('../lib/token');
      const token = await getToken();
      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

      const response = await fetch(`${baseUrl}/api/v1/me/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const text = await response.text();
      console.log('[avatar] status', response.status, 'body', text.slice(0, 300));

      if (!response.ok) {
        let err: any = {};
        try { err = JSON.parse(text); } catch { err = { message: text }; }
        throw Object.assign(new Error('Upload failed'), { response: { data: err, status: response.status } });
      }

      const res = JSON.parse(text);
      return res.data ?? res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}
