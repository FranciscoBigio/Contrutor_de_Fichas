import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { rpgHapticButton } from '@/utils/haptics';

export interface RPGButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function RPGButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
}: RPGButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.backgroundElevated;
      case 'danger':
        return theme.accent;
      case 'ghost':
        return 'transparent';
      default:
        return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'primary':
        return theme.primaryText;
      case 'secondary':
        return theme.text;
      case 'danger':
        return '#FFFFFF';
      case 'ghost':
        return theme.primary;
      default:
        return theme.primaryText;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.border;
    switch (variant) {
      case 'secondary':
        return theme.border;
      case 'ghost':
        return theme.border;
      default:
        return 'transparent';
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (disabled || variant === 'ghost') return {};
    switch (variant) {
      case 'primary':
        return {
          ...Shadows.glowGold,
          shadowColor: theme.primary,
          shadowOpacity: 0.28,
          elevation: 3,
        };
      case 'danger':
        return {
          ...Shadows.glowHp,
          shadowColor: theme.accent,
          shadowOpacity: 0.28,
          elevation: 3,
        };
      case 'secondary':
        return Shadows.sm;
      default:
        return {};
    }
  };

  const sizePadding = {
    sm: { paddingVertical: 6, paddingHorizontal: 10, fontSize: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 14 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 16 },
  }[size];

  const handlePress = () => {
    if (disabled || loading) return;
    rpgHapticButton();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getShadowStyle(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' || variant === 'ghost' ? 1 : 0,
          paddingVertical: sizePadding.paddingVertical,
          paddingHorizontal: sizePadding.paddingHorizontal,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: sizePadding.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  icon: {
    fontSize: 16,
  },
});

