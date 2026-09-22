import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RPGPasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * RPGPasswordInput:
 * Aplica o princípio da Aula 3 (Slide 14) do Prof. Márcio Garrido:
 * "Senha visível ou oculta é Estado LOCAL (useState) no próprio componente,
 * pois apenas altera a renderização de pontos/texto sem afetar outras partes da árvore."
 */
export function RPGPasswordInput({
  label = 'Senha Secreta',
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...rest
}: RPGPasswordInputProps) {
  const { theme } = useTheme();
  // Estado LOCAL: visibilidade da senha (Aula 3, Slide 14)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
        <Text style={styles.lockIcon}>🛡️</Text>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
            style,
          ]}
          secureTextEntry={!isPasswordVisible}
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

        <TouchableOpacity
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          style={styles.eyeButton}
          activeOpacity={0.7}
          accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
        >
          <Text style={styles.eyeIcon}>{isPasswordVisible ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
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
  lockIcon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
  },
});

