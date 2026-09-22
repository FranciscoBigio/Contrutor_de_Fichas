import '@/global.css';

import { Platform } from 'react-native';

/**
 * Paleta de Cores Fantasy / Medieval Dark & Light (Pergaminho)
 * Alinhado à Aula 3 (Camada de Apresentação e Estado Global de Tema)
 */
export const Colors = {
  dark: {
    // Fundo e Superfícies
    background: '#0B0D12',
    backgroundCard: '#131722',
    backgroundElevated: '#1B2130',
    backgroundInput: '#0F1219',
    backgroundElement: '#1A2130',
    backgroundSelected: '#252F45',
    border: '#242B3D',
    borderHighlight: '#D4AF3740',

    // Cores Semânticas de RPG
    primary: '#D4AF37', // Ouro Épico
    primaryText: '#0B0D12',
    accent: '#E63946', // Carmesim / Ações Críticas
    arcane: '#8B5CF6', // Púrpura Arcano
    hp: '#EF4444', // Pontos de Vida
    hpBg: '#EF444420',
    mana: '#3B82F6', // Espaços de Magia / Mana
    manaBg: '#3B82F620',
    stamina: '#F59E0B', // Vigor / Dados
    staminaBg: '#F59E0B20',
    healing: '#10B981', // Cura / Sucesso
    armor: '#94A3B8', // Classe de Armadura

    // Textos
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textGold: '#F1C40F',
  },
  light: {
    // Fundo estilo Pergaminho Medieval Antigo
    background: '#F5EFEB',
    backgroundCard: '#EAE1D7',
    backgroundElevated: '#DFD4C7',
    backgroundInput: '#F9F6F2',
    backgroundElement: '#E3D7C9',
    backgroundSelected: '#D4C5B3',
    border: '#D0C3B4',
    borderHighlight: '#AA820A50',

    // Cores Semânticas de RPG adaptadas para alto contraste
    primary: '#8C6D15',
    primaryText: '#FFFFFF',
    accent: '#C52233',
    arcane: '#6D28D9',
    hp: '#DC2626',
    hpBg: '#DC262620',
    mana: '#2563EB',
    manaBg: '#2563EB20',
    stamina: '#D97706',
    staminaBg: '#D9770620',
    healing: '#059669',
    armor: '#475569',

    // Textos
    text: '#1C1917',
    textSecondary: '#57534E',
    textMuted: '#78716C',
    textGold: '#8C6D15',
  },
} as const;

export type ThemeType = 'dark' | 'light';
export type ThemeColor = keyof typeof Colors.dark;
export type ThemePalette = { [K in ThemeColor]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // compatibilidade com componentes legados
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    title: 32,
  },
} as const;

export const Fonts = {
  sans: Typography.fontFamily,
  serif: 'serif',
  rounded: 'sans-serif',
  mono: 'monospace',
};

/**
 * Sombras Temáticas e Auras Luminosas de RPG (Fantasy Elevation)
 */
export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2.5,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  glowGold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 4,
  },
  glowArcane: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 4,
  },
  glowHp: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  glowMana: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  glowHealing: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;
