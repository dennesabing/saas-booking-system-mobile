import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'app_theme';

export type ThemeMode = 'light' | 'dark';

export type ThemeTokens = {
  mode: ThemeMode;
  bg: readonly [string, string, string];
  surface: string;
  surfaceBorder: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  tabBg: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
  cardShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export const lightTokens: ThemeTokens = {
  mode: 'light',
  bg: ['#f0f9ff', '#e0f2fe', '#ecfdf5'],
  surface: 'transparent',
  surfaceBorder: 'rgba(14,165,233,0.22)',
  accent: '#0ea5e9',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  tabBg: 'rgba(186,230,253,0.45)',
  tabBorder: 'rgba(125,211,252,0.35)',
  tabActive: '#0ea5e9',
  tabInactive: '#94a3b8',
  cardShadow: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const darkTokens: ThemeTokens = {
  mode: 'dark',
  bg: ['#060d1a', '#0c1730', '#0a1628'],
  surface: 'rgba(255,255,255,0.06)',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  accent: '#38bdf8',
  textPrimary: '#f1f5f9',
  textSecondary: '#64748b',
  textMuted: '#475569',
  tabBg: 'rgba(6,13,26,0.85)',
  tabBorder: 'rgba(255,255,255,0.07)',
  tabActive: '#38bdf8',
  tabInactive: '#475569',
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
};

type ThemeContextValue = {
  theme: ThemeMode;
  tokens: ThemeTokens;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((stored) => {
      if (stored === 'dark') setTheme('dark');
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      SecureStore.setItemAsync(THEME_KEY, next).catch(() => {});
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme, tokens: theme === 'light' ? lightTokens : darkTokens, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
