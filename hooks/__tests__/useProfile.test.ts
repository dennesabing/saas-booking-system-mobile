// mobile/hooks/__tests__/useProfile.test.ts
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { TestWrapper } from '../../__tests__/test-utils';
import { useUpdateProfile, useUpdateNotificationPrefs } from '../useProfile';

jest.mock('../../lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../lib/token', () => ({
  __esModule: true,
  getToken: jest.fn(),
  setToken: jest.fn(),
  clearToken: jest.fn(),
}));

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const mockApi = require('../../lib/api').default;

test('useUpdateProfile calls PUT /api/v1/me', async () => {
  mockApi.put.mockResolvedValue({ data: { data: { name: 'New Name' } } });

  const { result } = renderHook(() => useUpdateProfile(), { wrapper: TestWrapper });

  await act(async () => {
    await result.current.mutateAsync({ name: 'New Name' });
  });

  expect(mockApi.put).toHaveBeenCalledWith('/api/v1/me', { name: 'New Name' });
});

test('useUpdateNotificationPrefs calls PUT /api/v1/me/notification-preferences', async () => {
  mockApi.put.mockResolvedValue({
    data: { data: { notification_preferences: { sms: true } } },
  });

  const { result } = renderHook(() => useUpdateNotificationPrefs(), { wrapper: TestWrapper });

  await act(async () => {
    await result.current.mutateAsync({ sms: true });
  });

  expect(mockApi.put).toHaveBeenCalledWith('/api/v1/me/notification-preferences', { sms: true });
});
