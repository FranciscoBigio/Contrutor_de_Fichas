import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RPGInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
}

export function RPGInput({
  label,
  error,
  helperText,
  icon,
  style,
  onFocus,
  onBlur,
  ...rest
}: RPGInputProps) {
  const { theme } = useTheme();
  // Estado LOCAL: se o input está com foco visual (Aula 3, Slide 12)
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.hp;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundInput,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
            style,
          ]}
          placeholderTextColor={theme.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: theme.hp }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: theme.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm + 4,
    height: 48,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
  },
});

