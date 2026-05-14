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
  surface: 'rgba(255,255,255,0.65)',
  surfaceBorder: 'rgba(255,255,255,0.85)',
  accent: '#0ea5e9',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  tabBg: 'rgba(240,249,255,0.80)',
  tabBorder: 'rgba(255,255,255,0.70)',
  tabActive: '#0ea5e9',
  tabInactive: '#94a3b8',
  cardShadow: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
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

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  tokens: lightTokens,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    SecureStore.getItemAsync(THEME_KEY).then((stored) => {
      if (stored === 'dark') setTheme('dark');
    });
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    SecureStore.setItemAsync(THEME_KEY, next);
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
  return useContext(ThemeContext);
}
