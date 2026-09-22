import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import { FeatureTrait } from '@/types/character';

type BioTab = 'personality' | 'backstory' | 'features';
type FeatureSourceFilter = 'Todas' | 'Raça' | 'Classe' | 'Antecedente' | 'Talento';

const FEATURE_SOURCES: FeatureSourceFilter[] = [
  'Todas',
  'Raça',
  'Classe',
  'Antecedente',
  'Talento',
];

export default function CharacterBioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const {
    getCharacterById,
    activeCharacter,
    updateBio,
    addFeature,
    removeFeature,
  } = useCharacters();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Aba selecionada
  const [activeTab, setActiveTab] = useState<BioTab>('personality');

  // Modo de Edição dos Textos da Biografia
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [draftPersonality, setDraftPersonality] = useState<string>('');
  const [draftIdeals, setDraftIdeals] = useState<string>('');
  const [draftBonds, setDraftBonds] = useState<string>('');
  const [draftFlaws, setDraftFlaws] = useState<string>('');
  const [draftBackstory, setDraftBackstory] = useState<string>('');
  const [draftAppearance, setDraftAppearance] = useState<string>('');
  const [draftNotes, setDraftNotes] = useState<string>('');

  // Filtro e Modal de Características (Features & Traits)
  const [featureFilter, setFeatureFilter] = useState<FeatureSourceFilter>('Todas');
  const [isAddFeatureModalVisible, setIsAddFeatureModalVisible] = useState<boolean>(false);
  const [newFeatureName, setNewFeatureName] = useState<string>('');
  const [newFeatureSource, setNewFeatureSource] = useState<'Raça' | 'Classe' | 'Antecedente' | 'Talento'>('Classe');
  const [newFeatureDesc, setNewFeatureDesc] = useState<string>('');

  // Inicializa os drafts ao abrir o modo de edição
  const startEditing = () => {
    if (!character) return;
    setDraftPersonality(character.bio?.personalityTraits || '');
    setDraftIdeals(character.bio?.ideals || '');
    setDraftBonds(character.bio?.bonds || '');
    setDraftFlaws(character.bio?.flaws || '');
    setDraftBackstory(character.bio?.backstory || '');
    setDraftAppearance(character.bio?.appearance || '');
    setDraftNotes(character.bio?.notes || '');
    setIsEditingBio(true);
  };

  const cancelEditing = () => {
    setIsEditingBio(false);
  };

  const saveBioChanges = async () => {
    if (!character) return;
    await updateBio(character.id, {
      personalityTraits: draftPersonality,
      ideals: draftIdeals,
      bonds: draftBonds,
      flaws: draftFlaws,
      backstory: draftBackstory,
      appearance: draftAppearance,
      notes: draftNotes,
    });
    setIsEditingBio(false);
    Alert.alert('✨ Grimório Atualizado', 'A biografia e anotações do herói foram salvas com sucesso!');
  };

  // Filtragem de Características
  const filteredFeatures = useMemo(() => {
    if (!character?.features) return [];
    if (featureFilter === 'Todas') return character.features;
    return character.features.filter((f) => f.source === featureFilter);
  }, [character, featureFilter]);

  // Adicionar Nova Característica
  const handleAddNewFeature = async () => {
    if (!character) return;
    if (!newFeatureName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da habilidade ou talento.');
      return;
    }

    await addFeature(character.id, {
      name: newFeatureName.trim(),
      source: newFeatureSource,
      description: newFeatureDesc.trim() || 'Habilidade especial descrita pelo mestre.',
    });

    setNewFeatureName('');
    setNewFeatureDesc('');
    setIsAddFeatureModalVisible(false);
    Alert.alert('🌟 Habilidade Adicionada', `"${newFeatureName.trim()}" foi gravada na ficha do aventureiro!`);
  };

  // Remover Característica
  const handleRemoveFeature = (feat: FeatureTrait) => {
    if (!character) return;
    Alert.alert(
      'Remover Habilidade',
      `Deseja realmente esquecer o talento "${feat.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removeFeature(character.id, feat.id),
        },
      ]
    );
  };

  if (!character) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>⚠️</Text>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Nenhum Aventureiro Selecionado
          </Text>
          <RPGButton
            title="Voltar para a Taverna"
            variant="primary"
            onPress={() => router.replace('/characters' as any)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const getSourceBadgeVariant = (source: string): 'gold' | 'arcane' | 'mana' | 'stamina' | 'neutral' => {
    switch (source) {
      case 'Raça':
        return 'arcane';
      case 'Classe':
        return 'gold';
      case 'Talento':
        return 'mana';
      case 'Antecedente':
        return 'stamina';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header do Herói com Detalhes Narrativos */}
        <RPGCard variant="elevated" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.characterName, { color: theme.text }]}>
                  {character.name}
                </Text>
                {character.title ? (
                  <Text style={[styles.characterTitle, { color: theme.textGold }]}>
                    «{character.title}»
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.characterSub, { color: theme.textSecondary }]}>
                {character.race} • {character.class} • Nível {character.level}
              </Text>
              <Text style={[styles.playerSub, { color: theme.textSecondary }]}>
                Jogador: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{character.playerName || 'Anônimo'}</Text>
              </Text>
            </View>

            <RPGBadge label="📜 Biografia" variant="gold" size="md" />
          </View>

          {/* Badges de Antecedente e Alinhamento */}
          <View style={styles.metaBadgesRow}>
            <RPGBadge
              label={`⚖️ ${character.alignment}`}
              variant="neutral"
              size="sm"
            />
            <RPGBadge
              label={`🏛️ ${character.background || 'Aventureiro'}`}
              variant="stamina"
              size="sm"
            />
            {character.subclass ? (
              <RPGBadge
                label={`⚔️ ${character.subclass}`}
                variant="arcane"
                size="sm"
              />
            ) : null}
          </View>
        </RPGCard>

        {/* Barra de Abas da Biografia */}
        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setActiveTab('personality')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'personality' ? theme.primary : theme.backgroundInput,
                borderColor: activeTab === 'personality' ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'personality' ? '#FFFFFF' : theme.text },
              ]}
            >
              🌟 Traços
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('backstory')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'backstory' ? theme.primary : theme.backgroundInput,
                borderColor: activeTab === 'backstory' ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'backstory' ? '#FFFFFF' : theme.text },
              ]}
            >
              📖 História & Notas
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('features')}
            style={[
              styles.tabBtn,
              {
                backgroundColor: activeTab === 'features' ? theme.primary : theme.backgroundInput,
                borderColor: activeTab === 'features' ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'features' ? '#FFFFFF' : theme.text },
              ]}
            >
              ⚡ Habilidades ({character.features.length})
            </Text>
          </Pressable>
        </View>

        {/* Botão de Alternar Modo de Edição / Leitura */}
        {(activeTab === 'personality' || activeTab === 'backstory') && (
          <View style={styles.editControlsRow}>
            {isEditingBio ? (
              <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                <RPGButton
                  title="Cancelar"
                  variant="ghost"
                  size="sm"
                  onPress={cancelEditing}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="💾 Salvar Alterações"
                  variant="primary"
                  size="sm"
                  onPress={saveBioChanges}
                  style={{ flex: 1.5 }}
                />
              </View>
            ) : (
              <RPGButton
                title="✏️ Editar Textos da Biografia"
                variant="secondary"
                size="sm"
                onPress={startEditing}
                style={{ width: '100%' }}
              />
            )}
          </View>
        )}

        {/* ABA 1: TRAÇOS & PERSONALIDADE (D&D 5e: Traços, Ideais, Vínculos e Defeitos) */}
        {activeTab === 'personality' && (
          <View style={{ gap: Spacing.sm }}>
            {/* Traços de Personalidade */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>🌟</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Traços de Personalidade
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftPersonality}
                  onChangeText={setDraftPersonality}
                  placeholder="Maneirismos, costumes, frases de efeito e jeito de agir..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.bioInput,
                    { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text }]}>
                  {character.bio?.personalityTraits || 'Nenhum traço definido ainda.'}
                </Text>
              )}
            </RPGCard>

            {/* Ideais */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>⚖️</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Ideais & Princípios
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftIdeals}
                  onChangeText={setDraftIdeals}
                  placeholder="Justiça, liberdade, poder, honra, destino ou fé..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.bioInput,
                    { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text }]}>
                  {character.bio?.ideals || 'Nenhum ideal definido ainda.'}
                </Text>
              )}
            </RPGCard>

            {/* Vínculos */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>🤝</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Vínculos & Promessas
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftBonds}
                  onChangeText={setDraftBonds}
                  placeholder="Pessoas queridas, terras natais, dívidas de honra ou relíquias..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.bioInput,
                    { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text }]}>
                  {character.bio?.bonds || 'Nenhum vínculo definido ainda.'}
                </Text>
              )}
            </RPGCard>

            {/* Defeitos */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>⚠️</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Fraquezas & Defeitos
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftFlaws}
                  onChangeText={setDraftFlaws}
                  placeholder="Vícios, medos incontroláveis, orgulho cego ou ganância..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.bioInput,
                    { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text }]}>
                  {character.bio?.flaws || 'Nenhum defeito registrado ainda.'}
                </Text>
              )}
            </RPGCard>
          </View>
        )}

        {/* ABA 2: HISTÓRICO, APARÊNCIA & ANOTAÇÕES DA CAMPANHA */}
        {activeTab === 'backstory' && (
          <View style={{ gap: Spacing.sm }}>
            {/* História / Origem */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>📜</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Histórico do Aventureiro (Backstory)
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftBackstory}
                  onChangeText={setDraftBackstory}
                  placeholder="Origens familiares, eventos traumáticos, vitórias e motivação..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={5}
                  style={[
                    styles.bioInput,
                    { height: 100, textAlignVertical: 'top', backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text, lineHeight: 20 }]}>
                  {character.bio?.backstory || 'Sem histórico registrado.'}
                </Text>
              )}
            </RPGCard>

            {/* Aparência Física */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>🎨</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Aparência Física & Vestes
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftAppearance}
                  onChangeText={setDraftAppearance}
                  placeholder="Idade, altura, cicatrizes, cor dos olhos, postura e roupas..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.bioInput,
                    { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text }]}>
                  {character.bio?.appearance || 'Sem descrição física informada.'}
                </Text>
              )}
            </RPGCard>

            {/* Anotações da Campanha */}
            <RPGCard variant="default" style={styles.bioCard}>
              <View style={styles.bioCardHeader}>
                <Text style={styles.bioCardEmoji}>📝</Text>
                <Text style={[styles.bioCardTitle, { color: theme.text }]}>
                  Diário & Anotações de Campanha
                </Text>
              </View>
              {isEditingBio ? (
                <TextInput
                  value={draftNotes}
                  onChangeText={setDraftNotes}
                  placeholder="NPCs encontrados, pistas de masmorras, objetivos de missão..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.bioInput,
                    { height: 80, textAlignVertical: 'top', backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                  ]}
                />
              ) : (
                <Text style={[styles.bioCardBody, { color: theme.text, fontStyle: 'italic' }]}>
                  {character.bio?.notes || 'Nenhuma anotação de sessão adicionada.'}
                </Text>
              )}
            </RPGCard>
          </View>
        )}

        {/* ABA 3: HABILIDADES, TALENTOS & CARACTERÍSTICAS */}
        {activeTab === 'features' && (
          <View style={{ gap: Spacing.sm }}>
            {/* Header com Filtros de Fonte e Botão de Novo Talento */}
            <RPGCard variant="default" style={styles.filterCard}>
              <View style={styles.filterHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Filtro de Origem:
                </Text>
                <RPGButton
                  title="+ Novo Talento"
                  variant="primary"
                  size="sm"
                  onPress={() => setIsAddFeatureModalVisible(true)}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {FEATURE_SOURCES.map((src) => {
                  const isSelected = featureFilter === src;
                  return (
                    <Pressable
                      key={src}
                      onPress={() => setFeatureFilter(src)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          { color: isSelected ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {src}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </RPGCard>

            {/* Listagem de Características */}
            {filteredFeatures.length === 0 ? (
              <RPGCard variant="default" style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⚡</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Nenhuma habilidade nesta categoria
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  {featureFilter !== 'Todas'
                    ? 'Experimente selecionar "Todas" para ver os talentos de outras fontes.'
                    : 'Adicione suas características de classe ou talentos recebidos pelo mestre.'}
                </Text>
                <RPGButton
                  title="Cadastrar Primeira Habilidade"
                  variant="secondary"
                  size="sm"
                  onPress={() => setIsAddFeatureModalVisible(true)}
                  style={{ marginTop: Spacing.sm }}
                />
              </RPGCard>
            ) : (
              filteredFeatures.map((feat) => (
                <RPGCard key={feat.id} variant="default" style={styles.featureCard}>
                  <View style={styles.featureHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.featureName, { color: theme.text }]}>
                        {feat.name}
                      </Text>
                      <View style={{ marginTop: 2 }}>
                        <RPGBadge
                          label={feat.source}
                          variant={getSourceBadgeVariant(feat.source)}
                          size="sm"
                        />
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleRemoveFeature(feat)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                    {feat.description}
                  </Text>
                </RPGCard>
              ))
            )}
          </View>
        )}

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Inventário (Tela 9)"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}/inventory` as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Combate ⚔️"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}` as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Dados 🎲"
            variant="primary"
            onPress={() => router.push(`/character/${character.id}/dice` as any)}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      {/* Modal para Adicionar Nova Característica / Talento */}
      <Modal
        visible={isAddFeatureModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddFeatureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              ⚡ Nova Habilidade ou Talento
            </Text>

            <View style={{ gap: 8, marginVertical: 8 }}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Nome da Característica:
              </Text>
              <TextInput
                value={newFeatureName}
                onChangeText={setNewFeatureName}
                placeholder="Ex: Visão no Escuro, Ataque Furtivo..."
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.modalInput,
                  { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Origem / Fonte:
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['Raça', 'Classe', 'Antecedente', 'Talento'] as const).map((src) => (
                  <Pressable
                    key={src}
                    onPress={() => setNewFeatureSource(src)}
                    style={[
                      styles.chipBtn,
                      {
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: newFeatureSource === src ? theme.primary : theme.backgroundInput,
                        borderColor: newFeatureSource === src ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipBtnText,
                        { color: newFeatureSource === src ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {src}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Descrição do Efeito / Mecânica:
              </Text>
              <TextInput
                value={newFeatureDesc}
                onChangeText={setNewFeatureDesc}
                placeholder="Explique como a habilidade funciona em jogo..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                style={[
                  styles.modalInput,
                  {
                    height: 80,
                    textAlignVertical: 'top',
                    backgroundColor: theme.backgroundInput,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsAddFeatureModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Gravar Habilidade"
                variant="primary"
                onPress={handleAddNewFeature}
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
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterTitle: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  characterSub: {
    fontSize: 12,
    marginTop: 2,
  },
  playerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  metaBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  editControlsRow: {
    marginTop: -2,
  },
  bioCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  bioCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bioCardEmoji: {
    fontSize: 16,
  },
  bioCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioCardBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  bioInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginTop: 4,
  },
  filterCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  featureCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featureName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 16,
  },
  navigationFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  notFoundIcon: {
    fontSize: 48,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  modalInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
});

