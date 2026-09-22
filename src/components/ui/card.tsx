import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { rpgHapticButton } from '@/utils/haptics';

export interface RPGCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'highlight';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function RPGCard({
  children,
  variant = 'default',
  style,
  onPress,
}: RPGCardProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return theme.backgroundElevated;
      case 'highlight':
        return theme.backgroundCard;
      default:
        return theme.backgroundCard;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'highlight':
        return theme.primary;
      default:
        return theme.border;
    }
  };

  const getShadowStyle = (): ViewStyle => {
    switch (variant) {
      case 'highlight':
        return {
          ...Shadows.glowGold,
          shadowColor: theme.primary,
        };
      case 'elevated':
        return Shadows.md;
      default:
        return Shadows.sm;
    }
  };

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    getShadowStyle(),
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() => {
          rpgHapticButton();
          onPress();
        }}
        activeOpacity={0.78}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
});

