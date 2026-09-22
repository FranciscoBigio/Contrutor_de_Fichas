import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { RPGBadge, RPGButton, RPGCard } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <RPGCard variant="highlight" style={styles.card}>
          <RPGBadge label="TELA 3 DE 11 • EM DESENVOLVIMENTO" variant="stamina" size="sm" />
          <Text style={[styles.title, { color: theme.text }]}>
            Recuperação de Senha
          </Text>
          <Text style={[styles.desc, { color: theme.textSecondary }]}>
            Esta tela será implementada detalhadamente no Commit #06 (v0.6.0).
          </Text>
          <RPGButton
            title="Voltar para o Login"
            variant="secondary"
            icon="⬅️"
            onPress={() => router.back()}
          />
        </RPGCard>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  card: { alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.lg },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  desc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});

