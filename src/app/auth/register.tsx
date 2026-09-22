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

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { register } = useAuth();

  // Estados locais do formulário (Aula 3, Slide 12 - Estado LOCAL)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'player' | 'master'>('player');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Informe o nome do seu aventureiro.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }

    if (!password) {
      setErrorMessage('Informe uma senha secreta.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter ao menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      router.replace('/' as any);
    } else {
      setErrorMessage(result.error || 'Falha ao registrar conta.');
    }
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
            <Text style={styles.headerIcon}>📝</Text>
            <RPGBadge label="TELA 2 DE 11 • CADASTRO" variant="mana" size="sm" />
            <Text style={[styles.title, { color: theme.text }]}>
              Grimório de Registro
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Crie sua identidade de aventureiro para forjar heróis e fichas de RPG
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
              label="Nome do Aventureiro / Jogador"
              placeholder="Ex: Francisco Bigio, Legolas..."
              autoCapitalize="words"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errorMessage) setErrorMessage('');
              }}
              icon="👤"
            />

            <RPGInput
              label="E-mail da Guilda"
              placeholder="seu-email@guilda.com"
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
              placeholder="Mínimo 6 caracteres..."
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />

            <RPGPasswordInput
              label="Confirmar Runas Secretas"
              placeholder="Digite a mesma senha..."
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
            />

            {/* Seletor de Perfil (Role Selector) */}
            <View style={styles.roleSection}>
              <Text style={[styles.roleSectionLabel, { color: theme.text }]}>
                Função na Mesa de RPG:
              </Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: role === 'player' ? theme.borderHighlight : theme.backgroundInput,
                      borderColor: role === 'player' ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setRole('player')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleIcon}>🛡️</Text>
                  <Text style={[styles.roleTitle, { color: role === 'player' ? theme.primary : theme.text }]}>
                    Jogador
                  </Text>
                  <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
                    Cria e joga com heróis
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: role === 'master' ? theme.borderHighlight : theme.backgroundInput,
                      borderColor: role === 'master' ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setRole('master')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.roleIcon}>👑</Text>
                  <Text style={[styles.roleTitle, { color: role === 'master' ? theme.primary : theme.text }]}>
                    Mestre (DM)
                  </Text>
                  <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
                    Gerencia campanhas
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <RPGButton
              title="Registrar e Entrar na Guilda"
              variant="primary"
              icon="✨"
              loading={loading}
              onPress={handleRegister}
              style={{ marginTop: Spacing.xs }}
            />

            <RPGButton
              title="Já possui uma conta? Entrar na Taverna"
              variant="secondary"
              icon="⬅️"
              disabled={loading}
              onPress={() => router.push('/auth/login' as any)}
            />
          </RPGCard>

          {/* Nota de Segurança Acadêmica */}
          <View style={[styles.securityNotice, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityTitle, { color: theme.text }]}>
                Segurança OWASP M2 (Aula 4)
              </Text>
              <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                Ao registrar, sua nova conta é autenticada e as credenciais são criptografadas no SecureStore do dispositivo.
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
  roleSection: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  roleSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleCard: {
    flex: 1,
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  roleIcon: {
    fontSize: 20,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  roleDesc: {
    fontSize: 10,
    textAlign: 'center',
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
