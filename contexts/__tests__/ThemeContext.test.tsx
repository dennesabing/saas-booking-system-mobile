import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider, useTheme } from '../ThemeContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const SecureStore = require('expo-secure-store');

beforeEach(() => {
  jest.clearAllMocks();
  SecureStore.getItemAsync.mockResolvedValue(null);
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

test('default theme is light', async () => {
  const { result } = renderHook(() => useTheme(), { wrapper });
  await act(async () => {});
  expect(result.current.theme).toBe('light');
  expect(result.current.tokens.accent).toBe('#0ea5e9');
});

test('toggleTheme switches to dark', async () => {
  const { result } = renderHook(() => useTheme(), { wrapper });
  await act(async () => {});
  await act(async () => { result.current.toggleTheme(); });
  expect(result.current.theme).toBe('dark');
  expect(result.current.tokens.accent).toBe('#38bdf8');
});

test('toggleTheme persists to SecureStore', async () => {
  const { result } = renderHook(() => useTheme(), { wrapper });
  await act(async () => {});
  await act(async () => { result.current.toggleTheme(); });
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('app_theme', 'dark');
});

test('stored dark preference is loaded on mount', async () => {
  SecureStore.getItemAsync.mockResolvedValueOnce('dark');
  const { result } = renderHook(() => useTheme(), { wrapper });
  await act(async () => {});
  expect(result.current.theme).toBe('dark');
});

test('toggleTheme back to light', async () => {
  SecureStore.getItemAsync.mockResolvedValueOnce('dark');
  const { result } = renderHook(() => useTheme(), { wrapper });
  await act(async () => {});
  await act(async () => { result.current.toggleTheme(); });
  expect(result.current.theme).toBe('light');
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('app_theme', 'light');
});
