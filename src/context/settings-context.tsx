import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { setHapticsEnabled } from '@/utils/haptics';

export interface AppSettings {
  hapticFeedback: boolean;
  diceSoundEffects: boolean;
  encumbranceRule: boolean;
  confirmActions: boolean;
  autoDeathSave: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  hapticFeedback: true,
  diceSoundEffects: true,
  encumbranceRule: true,
  confirmActions: false,
  autoDeathSave: true,
};

const STORAGE_SETTINGS_KEY = '@questsheet:settings';

interface SettingsContextData {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextData | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar preferências persistidas no AsyncStorage
  useEffect(() => {
    async function loadSettings() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const merged: AppSettings = {
            ...DEFAULT_SETTINGS,
            ...parsed,
          };
          setSettings(merged);
          setHapticsEnabled(merged.hapticFeedback);
        } else {
          setHapticsEnabled(DEFAULT_SETTINGS.hapticFeedback);
        }
      } catch (error) {
        console.warn('Erro ao carregar configurações do AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Atualizar uma configuração específica e persistir no AsyncStorage
  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const nextSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(nextSettings);

    if (key === 'hapticFeedback') {
      setHapticsEnabled(value as boolean);
    }

    try {
      await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(nextSettings));
    } catch (error) {
      console.warn('Erro ao salvar configuração no AsyncStorage:', error);
    }
  };

  // Restaurar preferências padrão
  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    setHapticsEnabled(DEFAULT_SETTINGS.hapticFeedback);
    try {
      await AsyncStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.warn('Erro ao redefinir configurações no AsyncStorage:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextData {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser utilizado dentro de um SettingsProvider');
  }
  return context;
}

