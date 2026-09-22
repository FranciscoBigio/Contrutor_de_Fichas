import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RPGHpBarProps {
  current: number;
  max: number;
  temp?: number;
  showNumbers?: boolean;
  height?: number;
  label?: string;
  style?: ViewStyle;
}

export function RPGHpBar({
  current,
  max,
  temp = 0,
  showNumbers = true,
  height = 10,
  label = 'PONTOS DE VIDA (PV)',
  style,
}: RPGHpBarProps) {
  const { theme } = useTheme();

  const safeMax = Math.max(1, max);
  const percent = Math.min(100, Math.max(0, (current / safeMax) * 100));

  // Determina a cor com base na porcentagem de vida
  const getBarColor = () => {
    if (percent <= 25) return theme.hp; // Vermelho / Crítico
    if (percent <= 50) return theme.stamina; // Âmbar / Alerta
    return theme.healing; // Verde esmeralda / Saudável
  };

  const barColor = getBarColor();

  return (
    <View style={[styles.container, style]}>
      {showNumbers ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {label}
          </Text>
          <View style={styles.numbersRow}>
            <Text style={[styles.numbers, { color: theme.text }]}>
              <Text style={{ color: barColor, fontWeight: 'bold' }}>{current}</Text> / {max}
            </Text>
            {temp > 0 ? (
              <Text style={[styles.tempHp, { color: theme.mana }]}>
                +{temp} TEMP
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.backgroundInput,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  numbers: {
    fontSize: 12,
  },
  tempHp: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  track: {
    width: '100%',
    borderRadius: Radius.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});

