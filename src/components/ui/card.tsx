import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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

  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
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
        onPress={onPress}
        activeOpacity={0.8}
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

