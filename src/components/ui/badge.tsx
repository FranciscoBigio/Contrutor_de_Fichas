import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RPGBadgeProps {
  label: string;
  variant?: 'gold' | 'hp' | 'mana' | 'stamina' | 'arcane' | 'neutral';
  icon?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function RPGBadge({
  label,
  variant = 'gold',
  icon,
  size = 'md',
  style,
}: RPGBadgeProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'gold':
        return { bg: theme.borderHighlight, text: theme.textGold, border: theme.primary };
      case 'hp':
        return { bg: theme.hpBg, text: theme.hp, border: theme.hp };
      case 'mana':
        return { bg: theme.manaBg, text: theme.mana, border: theme.mana };
      case 'stamina':
        return { bg: theme.staminaBg, text: theme.stamina, border: theme.stamina };
      case 'arcane':
        return { bg: `${theme.arcane}25`, text: theme.arcane, border: theme.arcane };
      case 'neutral':
      default:
        return { bg: theme.backgroundElevated, text: theme.textSecondary, border: theme.border };
    }
  };

  const { bg, text, border } = getColors();

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 8 : 10,
        },
        style,
      ]}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  icon: {
    fontSize: 12,
  },
});

