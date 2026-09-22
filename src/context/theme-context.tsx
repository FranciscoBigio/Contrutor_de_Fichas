import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { Colors, ThemePalette, ThemeType } from '@/constants/theme';

interface ThemeContextData {
  theme: ThemePalette;
  themeMode: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
}

const STORAGE_THEME_KEY = '@questsheet:theme';

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeType>('dark');

  // Carrega a preferência persistida no AsyncStorage (Aula 4, Slide 7)
  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_THEME_KEY);
        if (stored === 'light' || stored === 'dark') {
          setThemeMode(stored);
        }
      } catch (error) {
        console.warn('Erro ao carregar tema do AsyncStorage:', error);
      }
    }
    loadStoredTheme();
  }, []);

  const toggleTheme = async () => {
    const nextMode: ThemeType = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    try {
      await AsyncStorage.setItem(STORAGE_THEME_KEY, nextMode);
    } catch (error) {
      console.warn('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  const currentTheme = Colors[themeMode];

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeMode,
        isDark: themeMode === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}

