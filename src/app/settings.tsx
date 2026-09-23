import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useCharacters } from '@/context/character-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/context/theme-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    characters,
    resetToMock,
    exportAllCharactersAsJson,
    importCharacterFromJson,
  } = useCharacters();

  // Preferências de Jogo e Interface persistidas via SettingsContext (AsyncStorage)
  const { settings, updateSetting, resetSettings } = useSettings();

  // Estados dos Modais de Backup JSON
  const [isExportModalVisible, setIsExportModalVisible] = useState<boolean>(false);
  const [exportedJsonText, setExportedJsonText] = useState<string>('');

  const [isImportModalVisible, setIsImportModalVisible] = useState<boolean>(false);
  const [jsonToImport, setJsonToImport] = useState<string>('');

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

  // Abrir Modal de Exportação
  const handleOpenExportModal = () => {
    const json = exportAllCharactersAsJson();
    setExportedJsonText(json);
    setIsExportModalVisible(true);
  };

  // Carregar Modelo de Teste para Importação
  const handleLoadSampleJson = () => {
    const sample = {
      name: 'Grommash o Implacável',
      title: 'O Flagelo dos Ermos',
      playerName: 'Francisco Bigio',
      race: 'Meio-Orc',
      class: 'Bárbaro',
      level: 4,
      experience: 2700,
      alignment: 'Caótico e Neutro',
      background: 'Forasteiro',
      avatarEmoji: '🪓',
      proficiencyBonus: 2,
      speed: 12,
      initiative: 2,
      armorClass: 15,
      currentHp: 44,
      maxHp: 44,
      tempHp: 0,
      hitDice: '1d12',
      hitDiceUsed: 0,
      deathSaves: { successes: 0, failures: 0 },
      attributes: {
        strength: 18,
        dexterity: 14,
        constitution: 16,
        intelligence: 8,
        wisdom: 12,
        charisma: 10,
      },
      savingThrowProficiencies: ['strength', 'constitution'],
      skills: [
        { name: 'Atletismo', attribute: 'strength', proficient: true },
        { name: 'Intimidação', attribute: 'charisma', proficient: true },
        { name: 'Sobrevivência', attribute: 'wisdom', proficient: true },
      ],
      inventory: [
        {
          id: 'item-machado-1',
          name: 'Machado de Batalha Pesado',
          category: 'Arma',
          quantity: 1,
          weight: 3.5,
          equipped: true,
          damage: '1d12+4 cortante',
          description: 'Lâmina entalhada com runas tribais de fúria.',
          rarity: 'Incomum',
        },
      ],
      coins: { cp: 50, sp: 20, ep: 0, gp: 35, pp: 1 },
      features: [
        {
          id: 'feat-furia-1',
          name: 'Fúria Bárbara',
          source: 'Classe',
          description: 'Vantagem em testes de FOR, +2 no dano corpo a corpo e resistência a corte, impacto e perfuração.',
        },
      ],
      bio: {
        personalityTraits: 'Falo pouco e prefiro que meu machado resolva os impasses.',
        ideals: 'A força da tribo reside na coragem de cada guerreiro.',
        bonds: 'Protegerei o talismã dos meus ancestrais até meu último suspiro.',
        flaws: 'Facilmente provocado quando duvidam da minha honra.',
        backstory: 'Nascido nas estepes montanhosas, vaga em busca de desafios dignos.',
        appearance: 'Cicatrizações rituais nos ombros, 1.95m, pele cinzenta e olhos amarelos.',
        notes: 'Prometeu vingança contra o xamã que traiu seu clã.',
      },
    };

    setJsonToImport(JSON.stringify(sample, null, 2));
  };

  // Executar Importação do JSON
  const handleExecuteImport = async () => {
    if (!jsonToImport.trim()) {
      Alert.alert('Atenção', 'Cole o código JSON da ficha para importar.');
      return;
    }

    const result = await importCharacterFromJson(jsonToImport);
    if (result.success) {
      setIsImportModalVisible(false);
      setJsonToImport('');
      Alert.alert('🎉 Ficha Importada!', result.message, [
        {
          text: 'Ver Personagens',
          onPress: () => router.push('/characters' as any),
        },
      ]);
    } else {
      Alert.alert('Erro na Importação', result.message);
    }
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Text style={styles.sectionEmoji}>🎲</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Preferências de Jogo
              </Text>
            </View>
            <RPGBadge label="💾 SALVAMENTO ATIVO" variant="gold" size="sm" />
          </View>
          <Text style={[styles.settingDesc, { color: theme.textSecondary, marginBottom: 4 }]}>
            Todas as alterações abaixo são salvas automaticamente no armazenamento local (AsyncStorage):
          </Text>

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
              value={settings.hapticFeedback}
              onValueChange={(val) => updateSetting('hapticFeedback', val)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.hapticFeedback ? '#FFFFFF' : '#8C6D15'}
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
              value={settings.diceSoundEffects}
              onValueChange={(val) => updateSetting('diceSoundEffects', val)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.diceSoundEffects ? '#FFFFFF' : '#8C6D15'}
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
              value={settings.encumbranceRule}
              onValueChange={(val) => updateSetting('encumbranceRule', val)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.encumbranceRule ? '#FFFFFF' : '#8C6D15'}
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
              value={settings.autoDeathSave}
              onValueChange={(val) => updateSetting('autoDeathSave', val)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.autoDeathSave ? '#FFFFFF' : '#8C6D15'}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Confirmar Ações Críticas de Combate
              </Text>
              <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Exibe alerta antes de aplicar dano letal, gastar espaços de magia ou descartar itens.
              </Text>
            </View>
            <Switch
              value={settings.confirmActions}
              onValueChange={(val) => updateSetting('confirmActions', val)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.confirmActions ? '#FFFFFF' : '#8C6D15'}
            />
          </View>

          <RPGButton
            title="↺ Restaurar Preferências Originais"
            variant="ghost"
            size="sm"
            onPress={() => {
              Alert.alert(
                'Restaurar Preferências',
                'Deseja redefinir as configurações para os padrões de fábrica?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Restaurar', onPress: resetSettings },
                ]
              );
            }}
            style={{ marginTop: Spacing.xs }}
          />
        </RPGCard>

        {/* Seção 4: Backup & Troca de Fichas (JSON) */}
        <RPGCard variant="default" style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionEmoji}>📦</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Backup & Troca de Fichas (JSON)
            </Text>
          </View>

          <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>
            Exporte suas fichas completas para compartilhar com mestres ou importe heróis criados por amigos via arquivo JSON estruturado:
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <RPGButton
              title="📤 Exportar JSON"
              variant="secondary"
              size="sm"
              icon="💾"
              onPress={handleOpenExportModal}
              style={{ flex: 1 }}
            />
            <RPGButton
              title="📥 Importar JSON"
              variant="primary"
              size="sm"
              icon="✨"
              onPress={() => {
                setJsonToImport('');
                setIsImportModalVisible(true);
              }}
              style={{ flex: 1 }}
            />
          </View>
        </RPGCard>

        {/* Seção 5: Armazenamento & Camada de Dados (Offline-First) */}
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

        {/* Seção 6: Informações Acadêmicas & Versão */}
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
            Versão: <Text style={{ color: theme.textGold, fontWeight: 'bold' }}>v1.0.0 (Release Final)</Text> • Expo SDK 57 / React Native 0.86
          </Text>

          <View style={styles.techTagsRow}>
            <RPGBadge label="Expo Router" variant="mana" size="sm" />
            <RPGBadge label="AsyncStorage" variant="stamina" size="sm" />
            <RPGBadge label="SecureStore" variant="gold" size="sm" />
            <RPGBadge label="Backup JSON" variant="arcane" size="sm" />
            <RPGBadge label="v1.0.0 Final" variant="hp" size="sm" />
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

      {/* Modal 1: Exportação JSON */}
      <Modal
        visible={isExportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              📤 Backup de Fichas (JSON)
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              {characters.length} ficha(s) serializada(s) prontas para cópia ou compartilhamento:
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              <TextInput
                value={exportedJsonText}
                editable={false}
                multiline
                selectTextOnFocus
                style={[
                  styles.jsonCodeBox,
                  { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                ]}
              />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <RPGButton
                title="Fechar"
                variant="primary"
                onPress={() => setIsExportModalVisible(false)}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Importação JSON */}
      <Modal
        visible={isImportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              📥 Importar Ficha via JSON
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Cole o objeto JSON da ficha ou carregue o modelo demonstrativo:
            </Text>

            <TextInput
              value={jsonToImport}
              onChangeText={setJsonToImport}
              placeholder="Cole aqui o JSON estruturado da ficha..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={8}
              style={[
                styles.jsonCodeBox,
                { height: 160, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
              ]}
            />

            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 4 }}>
              <RPGButton
                title="⚡ Carregar Exemplo (Grommash)"
                variant="ghost"
                size="sm"
                onPress={handleLoadSampleJson}
                style={{ flex: 1 }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsImportModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="📥 Importar Herói"
                variant="primary"
                onPress={handleExecuteImport}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  jsonCodeBox: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: 10,
    fontSize: 11,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
});
