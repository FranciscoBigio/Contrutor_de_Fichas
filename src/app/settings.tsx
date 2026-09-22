import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { characters, resetToMock } = useCharacters();

  // Preferências de Jogo e Interface (Estado Local)
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(true);
  const [diceSoundEffects, setDiceSoundEffects] = useState<boolean>(true);
  const [encumbranceRule, setEncumbranceRule] = useState<boolean>(true);
  const [confirmActions, setConfirmActions] = useState<boolean>(false);
  const [autoDeathSave, setAutoDeathSave] = useState<boolean>(true);

  // Confirmação de Logout
  const handleLogout = () => {
    Alert.alert('Encerrar Sessão', 'Deseja realmente sair da conta atual?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login' as any);
        },
      },
    ]);
  };

  // Confirmação de Reset de Dados
  const handleResetData = () => {
    Alert.alert(
      'Restaurar Fichas Padrão',
      'Isso restaurará as fichas originais do mock (D&D 5e / T20). Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            await resetToMock();
            Alert.alert('✨ Sucesso', 'Fichas padrão restauradas com sucesso no AsyncStorage!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header da Tela de Configurações */}
        <RPGCard variant="elevated" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                ⚙️ Configurações & Ajustes
              </Text>
              <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
                Personalize sua experiência no QuestSheet RPG
              </Text>
            </View>
            <RPGBadge label="SISTEMA" variant="gold" size="md" />
          </View>
        </RPGCard>

        {/* Seção 1: Sessão do Usuário & Perfil */}
        <RPGCard variant="default" style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>👤</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Conta & Autenticação
            </Text>
          </View>

          {isAuthenticated && user ? (
            <View style={styles.userProfileBox}>
              <View style={[styles.userAvatarBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.userAvatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {user.name}
                </Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                  {user.email}
                </Text>
                <View style={{ marginTop: 4 }}>
                  <RPGBadge
                    label={user.role === 'master' ? '👑 Mestre da Masmorra' : '⚔️ Jogador / Aventureiro'}
                    variant="gold"
                    size="sm"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.unauthBox}>
              <Text style={[styles.unauthText, { color: theme.textSecondary }]}>
                Você está utilizando o aplicativo como convidado local.
              </Text>
              <RPGButton
                title="Fazer Login"
                variant="primary"
                size="sm"
                icon="🔐"
                onPress={() => router.push('/auth/login' as any)}
              />
            </View>
          )}

          {isAuthenticated && (
            <RPGButton
              title="Encerrar Sessão da Conta"
              variant="danger"
              size="sm"
              icon="🚪"
              onPress={handleLogout}
              style={{ marginTop: Spacing.xs }}
            />
          )}
        </RPGCard>

        {/* Seção 2: Aparência e Tema Visual */}
        <RPGCard variant="default" style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>🎨</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Aparência & Tema
            </Text>
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Tema Ativo: {isDark ? 'Dark Fantasy (Masmorra)' : 'Pergaminho (Light)'}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                {isDark
                  ? 'Fundo escuro profundo com detalhes em dourado e runas mágicas.'
                  : 'Fundo pergaminho antigo medieval com alto contraste para leitura clara.'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D0C3B4', true: theme.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#8C6D15'}
            />
          </View>

          <RPGButton
            title={`Alternar para ${isDark ? '☀️ Modo Pergaminho (Light)' : '🌙 Modo Dark Fantasy'}`}
            variant="secondary"
            size="sm"
            onPress={toggleTheme}
            style={{ marginTop: Spacing.xs }}
          />
        </RPGCard>

        {/* Seção 3: Preferências de Jogo & Rolagem */}
        <RPGCard variant="default" style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>🎲</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Preferências de Jogo
            </Text>
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Feedback Tátil (Vibração)
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Vibra suavemente ao rolar dados, acertos críticos ou sofrer dano.
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Sons de Combate & Dados
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Efeitos sonoros para rolagens de dados, magias e acertos críticos.
              </Text>
            </View>
            <Switch
              value={diceSoundEffects}
              onValueChange={setDiceSoundEffects}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Regra Opcional de Carga Pesada
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Aplica as diretrizes de sobrecarga (Heavy Encumbrance) do D&D 5e na mochila.
              </Text>
            </View>
            <Switch
              value={encumbranceRule}
              onValueChange={setEncumbranceRule}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Auto-Rolagem de Salvaguarda da Morte
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Permite rolar d20 com 1 toque ao atingir 0 PV com detecção de 20 e 1 natural.
              </Text>
            </View>
            <Switch
              value={autoDeathSave}
              onValueChange={setAutoDeathSave}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Confirmar Ações Críticas de Combate
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Exibe alerta antes de aplicar dano letal, gastar espaços de magia ou descartar itens.
              </Text>
            </View>
            <Switch
              value={confirmActions}
              onValueChange={setConfirmActions}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </RPGCard>

        {/* Seção 4: Armazenamento & Camada de Dados (Offline-First) */}
        <RPGCard variant="default" style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>💾</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Armazenamento & Segurança
            </Text>
          </View>

          <View style={styles.storageStatsBox}>
            <View style={styles.storageStatItem}>
              <Text style={[styles.storageStatVal, { color: theme.primary }]}>
                {characters.length}
              </Text>
              <Text style={[styles.storageStatLabel, { color: theme.textSecondary }]}>
                Fichas Salvas
              </Text>
            </View>

            <View style={styles.storageStatItem}>
              <Text style={[styles.storageStatVal, { color: theme.healing }]}>
                Offline
              </Text>
              <Text style={[styles.storageStatLabel, { color: theme.textSecondary }]}>
                AsyncStorage
              </Text>
            </View>

            <View style={styles.storageStatItem}>
              <Text style={[styles.storageStatVal, { color: theme.mana }]}>
                OWASP M2
              </Text>
              <Text style={[styles.storageStatLabel, { color: theme.textSecondary }]}>
                SecureStore
              </Text>
            </View>
          </View>

          <Text style={[styles.securityNotice, { color: theme.textSecondary }]}>
            Suas fichas e itens são gravados localmente sem depender de internet. Seus dados de login são protegidos por criptografia de chave de hardware (Keychain no iOS e Keystore no Android).
          </Text>

          <RPGButton
            title="Restaurar Fichas Padrão (Mock Inicial)"
            variant="ghost"
            size="sm"
            icon="🔄"
            onPress={handleResetData}
            style={{ marginTop: Spacing.xs }}
          />
        </RPGCard>

        {/* Seção 5: Informações Acadêmicas & Versão */}
        <RPGCard variant="highlight" style={styles.academicCard}>
          <Text style={[styles.institutionHeader, { color: theme.textSecondary }]}>
            UNIVERSIDADE DE VASSOURAS • ENGENHARIA DE SOFTWARE
          </Text>
          <Text style={[styles.projectTitle, { color: theme.text }]}>
            ⚔️ QuestSheet RPG Mobile
          </Text>
          <Text style={[styles.projectDetails, { color: theme.textSecondary }]}>
            Disciplina: Aplicativos Híbridos{'\n'}
            Professor: <Text style={{ color: theme.text, fontWeight: 'bold' }}>Márcio Garrido</Text>{'\n'}
            Aluno: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Francisco Bigio</Text>{'\n'}
            Versão: <Text style={{ color: theme.textGold, fontWeight: 'bold' }}>v0.19.0</Text> • Expo SDK 57 / React Native 0.86
          </Text>

          <View style={styles.techTagsRow}>
            <RPGBadge label="Expo Router" variant="mana" size="sm" />
            <RPGBadge label="AsyncStorage" variant="stamina" size="sm" />
            <RPGBadge label="SecureStore" variant="gold" size="sm" />
            <RPGBadge label="11 Telas Entregues" variant="hp" size="sm" />
          </View>
        </RPGCard>

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Voltar ao Início"
            variant="secondary"
            onPress={() => router.replace('/' as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Meus Heróis 🛡️"
            variant="primary"
            onPress={() => router.push('/characters' as any)}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerCard: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  userProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  userAvatarBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0D12',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
  },
  unauthBox: {
    gap: 8,
  },
  unauthText: {
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  storageStatsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  storageStatItem: {
    alignItems: 'center',
    gap: 2,
  },
  storageStatVal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  storageStatLabel: {
    fontSize: 11,
  },
  securityNotice: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  academicCard: {
    padding: Spacing.md,
    gap: 6,
  },
  institutionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectDetails: {
    fontSize: 12,
    lineHeight: 18,
  },
  techTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  navigationFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
