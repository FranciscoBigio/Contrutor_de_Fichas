import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { resetPassword } = useAuth();

  // Estados locais da tela (Aula 3, Slide 12 - Estado LOCAL)
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Temporizador local de reenvio de código (Aula 2 - Timers e ciclo assíncrono)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendResetEmail = async () => {
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Informe um e-mail válido da guilda para envio.');
      return;
    }

    setLoading(true);
    // Simula ciclo assíncrono de envio de e-mail (Aula 3, Slide 35)
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      setCountdown(60);
    }, 800);
  };

  const handleConfirmCode = async () => {
    if (!resetCode.trim() || resetCode.length < 4) {
      setErrorMessage('Informe o código de verificação recebido.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (newPassword) {
        await resetPassword(email, newPassword);
      }
      setLoading(false);
      // Redireciona para o login
      router.replace('/auth/login' as any);
    } catch {
      setLoading(false);
      router.replace('/auth/login' as any);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabeçalho Temático */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🔑</Text>
            <RPGBadge label="RECUPERAÇÃO DE RUNAS" variant="stamina" size="sm" />
            <Text style={[styles.title, { color: theme.text }]}>
              Redefinição de Runas
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Perdeu suas palavras secretas de acesso? Enviamos um pergaminho com o código de restauração
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

            {!isSent ? (
              <>
                <RPGInput
                  label="E-mail Cadastrado na Taverna"
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
                  helperText="Enviaremos um corvo mensageiro com as instruções de recuperação."
                />

                <RPGButton
                  title="Enviar Pergaminho de Redefinição"
                  variant="primary"
                  icon="🦅"
                  loading={loading}
                  onPress={handleSendResetEmail}
                  style={{ marginTop: Spacing.xs }}
                />
              </>
            ) : (
              <>
                <View style={[styles.successBanner, { backgroundColor: `${theme.healing}20`, borderColor: theme.healing }]}>
                  <Text style={styles.successIcon}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.successTitle, { color: theme.healing }]}>
                      Pergaminho Enviado com Sucesso!
                    </Text>
                    <Text style={[styles.successText, { color: theme.textSecondary }]}>
                      Verifique a caixa postal de <Text style={{ color: theme.text, fontWeight: 'bold' }}>{email}</Text>.
                    </Text>
                  </View>
                </View>

                <RPGInput
                  label="Código de Verificação de 6 Dígitos"
                  placeholder="Ex: 849201"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={resetCode}
                  onChangeText={(text) => {
                    setResetCode(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  icon="🛡️"
                />

                <RPGPasswordInput
                  label="Nova Runa Secreta (Nova Senha)"
                  placeholder="Mínimo 6 caracteres..."
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                />

                <RPGButton
                  title="Validar Código e Redefinir"
                  variant="primary"
                  icon="🔓"
                  loading={loading}
                  onPress={handleConfirmCode}
                />

                <RPGButton
                  title={countdown > 0 ? `Reenviar código (${countdown}s)` : 'Reenviar novo código'}
                  variant="ghost"
                  icon="🔄"
                  disabled={countdown > 0}
                  onPress={handleSendResetEmail}
                />
              </>
            )}

            <RPGButton
              title="Lembrei minhas Runas (Voltar ao Login)"
              variant="secondary"
              icon="⬅️"
              onPress={() => router.push('/auth/login' as any)}
            />
          </RPGCard>

          {/* Nota de Segurança Acadêmica */}
          <View style={[styles.securityNotice, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.securityTitle, { color: theme.text }]}>
                Segurança OWASP M4 — Autenticação (Aula 4)
              </Text>
              <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                Códigos de redefinição possuem tempo de expiração curto (60s) e expiram após o uso para evitar ataques de força bruta.
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
  successBanner: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 22,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  successText: {
    fontSize: 11,
    lineHeight: 16,
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
