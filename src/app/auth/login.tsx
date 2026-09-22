import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
  RPGInput,
  RPGPasswordInput,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { login, loginAsGuest } = useAuth();

  // Estados locais do formulário (Aula 3, Slide 12 - Estado LOCAL)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail de aventureiro.');
      return;
    }

    if (!password) {
      setErrorMessage('Informe suas runas secretas (senha).');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/' as any);
    } else {
      setErrorMessage(result.error || 'Falha ao autenticar.');
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);
    router.replace('/' as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Cabeçalho Temático */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🛡️</Text>
            <RPGBadge label="TELA 1 DE 11 • AUTENTICAÇÃO" variant="gold" size="sm" />
            <Text style={[styles.title, { color: theme.text }]}>
              Portal do Aventureiro
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Entre na guilda e acesse suas fichas, magias e inventários
            </Text>
          </View>

          {/* Card do Formulário */}
          <RPGCard variant="highlight" style={styles.card}>
            {errorMessage ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.hpBg, borderColor: theme.hp }]}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[styles.errorBannerText, { color: theme.hp }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <RPGInput
              label="E-mail do Aventureiro"
              placeholder="exemplo@guilda.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="✉️"
            />

            <RPGPasswordInput
              label="Runas Secretas (Senha)"
              placeholder="Digite sua senha..."
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password' as any)}
              style={styles.forgotBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotText, { color: theme.primary }]}>
                Esqueceu suas runas de acesso? (Recuperar)
              </Text>
            </TouchableOpacity>

            <RPGButton
              title="Entrar na Taverna"
              variant="primary"
              icon="⚔️"
              loading={loading}
              onPress={handleLogin}
              style={{ marginTop: Spacing.xs }}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textMuted }]}>OU</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <RPGButton
              title="Criar Nova Conta de Jogador"
              variant="secondary"
              icon="📜"
              disabled={loading}
              onPress={() => router.push('/auth/register' as any)}
            />

            <RPGButton
              title="Entrar como Convidado (Modo Offline)"
              variant="ghost"
              icon="🎲"
              disabled={loading}
              onPress={handleGuestLogin}
            />
          </RPGCard>

          {/* Nota de Segurança Acadêmica (OWASP Mobile M2) */}
          <View style={[styles.securityNotice, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityTitle, { color: theme.text }]}>
                Segurança OWASP M2 (Aula 4)
              </Text>
              <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                Sessão com Token JWT salva exclusivamente via SecureStore criptografado (Keychain/Keystore), nunca em texto puro.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Spacing.md,
    gap: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  card: {
    gap: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  securityNotice: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  securityIcon: {
    fontSize: 22,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  securityText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
