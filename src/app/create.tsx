import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import {
  AVAILABLE_ALIGNMENTS,
  AVAILABLE_CLASSES,
  AVAILABLE_RACES,
} from '@/data/mock-characters';
import {
  calculateProficiencyBonus,
  RPGAlignment,
  RPGClass,
  RPGRace,
} from '@/types/character';

const COMMON_BACKGROUNDS = [
  'Soldado',
  'Acólito',
  'Criminoso',
  'Erudito',
  'Nobre',
  'Herói do Povo',
  'Artesão',
  'Órfão de Guerra',
  'Guardião da Floresta',
];

const AVATAR_EMOJIS = ['🛡️', '🗡️', '🔮', '✨', '🏹', '🪓', '🐺', '🐲', '🧙‍♂️', '🧝‍♀️'];

export default function CreateHeroScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  // Gerenciamento de Etapa do Assistente (Aula 3, Slide 12 - Estado Local)
  const [step, setStep] = useState<1 | 2>(1);

  // Estados da Etapa 1: Identidade & Origem
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [selectedRace, setSelectedRace] = useState<RPGRace>('Humano');
  const [selectedClass, setSelectedClass] = useState<RPGClass>('Guerreiro');
  const [selectedAlignment, setSelectedAlignment] = useState<RPGAlignment>('Leal e Bom');
  const [selectedBackground, setSelectedBackground] = useState<string>('Soldado');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🛡️');
  const [errorMessage, setErrorMessage] = useState('');

  const proficiencyBonus = calculateProficiencyBonus(level);
  const activeClassData = AVAILABLE_CLASSES.find((c) => c.name === selectedClass);
  const activeRaceData = AVAILABLE_RACES.find((r) => r.name === selectedRace);

  // Validação da Etapa 1
  const handleNextStep = () => {
    setErrorMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Informe o nome de batismo do herói (mínimo 2 letras).');
      return;
    }

    setStep(2);
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
            <RPGBadge label="TELA 5 DE 11 • FORJA DE HERÓIS" variant="gold" size="sm" />
            <Text style={[styles.title, { color: theme.text }]}>
              ✨ Forjar Novo Aventureiro
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Etapa 1 de 2: Defina as raízes, vocação e conduta moral da sua lenda
            </Text>
          </View>

          {/* Stepper Visual de Progresso */}
          <View style={styles.stepperContainer}>
            <View
              style={[
                styles.stepItem,
                step === 1 && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  { color: step === 1 ? theme.primary : theme.textSecondary },
                ]}
              >
                1. Identidade & Raízes
              </Text>
            </View>
            <View
              style={[
                styles.stepItem,
                step === 2 && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  { color: step === 2 ? theme.primary : theme.textSecondary },
                ]}
              >
                2. Atributos & PV
              </Text>
            </View>
          </View>

          {/* Banner de Erro de Validação */}
          {errorMessage ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.hpBg, borderColor: theme.hp }]}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.errorText, { color: theme.hp }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            /* ========================================================
             * ETAPA 1: IDENTIDADE, RAÇA, CLASSE E TENDÊNCIA
             * ======================================================== */
            <View style={styles.stepContent}>
              {/* Card 1: Identidade Básica */}
              <RPGCard variant="highlight" style={styles.formCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  📜 Identidade do Aventureiro
                </Text>

                <RPGInput
                  label="Nome do Personagem *"
                  placeholder="Ex: Aethelgard Martelo-de-Ferro"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  icon="👤"
                />

                <RPGInput
                  label="Título ou Epíteto (Opcional)"
                  placeholder="Ex: O Destemido, A Lâmina da Noite"
                  value={title}
                  onChangeText={setTitle}
                  icon="👑"
                />

                {/* Seletor de Avatar / Emblema */}
                <View style={styles.fieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                    Emblema do Herói
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.avatarRow}
                  >
                    {AVATAR_EMOJIS.map((emoji) => {
                      const isSelected = selectedAvatar === emoji;
                      return (
                        <Pressable
                          key={emoji}
                          onPress={() => setSelectedAvatar(emoji)}
                          style={[
                            styles.avatarSelectBox,
                            {
                              backgroundColor: isSelected
                                ? theme.primary
                                : theme.backgroundInput,
                              borderColor: isSelected ? theme.primary : theme.border,
                            },
                          ]}
                        >
                          <Text style={styles.avatarEmoji}>{emoji}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Nível Inicial do Personagem */}
                <View style={styles.levelContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      Nível Inicial do Herói
                    </Text>
                    <Text style={[styles.levelSub, { color: theme.textSecondary }]}>
                      Bônus de Proficiência: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>+{proficiencyBonus}</Text>
                    </Text>
                  </View>
                  <View style={styles.levelControls}>
                    <Pressable
                      onPress={() => setLevel((prev) => Math.max(1, prev - 1))}
                      style={[styles.levelBtn, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
                    >
                      <Text style={[styles.levelBtnText, { color: theme.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.levelValue, { color: theme.primary }]}>{level}</Text>
                    <Pressable
                      onPress={() => setLevel((prev) => Math.min(20, prev + 1))}
                      style={[styles.levelBtn, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
                    >
                      <Text style={[styles.levelBtnText, { color: theme.text }]}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </RPGCard>

              {/* Card 2: Seleção de Raça */}
              <RPGCard style={styles.formCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    🧬 Raça Ancestral: {activeRaceData?.name}
                  </Text>
                  <RPGBadge label={activeRaceData?.bonus || ''} variant="gold" size="sm" />
                </View>

                <View style={styles.gridOptions}>
                  {AVAILABLE_RACES.map((race) => {
                    const isSelected = selectedRace === race.name;
                    return (
                      <Pressable
                        key={race.name}
                        onPress={() => setSelectedRace(race.name)}
                        style={[
                          styles.gridCard,
                          {
                            backgroundColor: isSelected
                              ? `${theme.primary}20`
                              : theme.backgroundInput,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={styles.gridIcon}>{race.icon}</Text>
                        <Text
                          style={[
                            styles.gridName,
                            {
                              color: isSelected ? theme.primary : theme.text,
                              fontWeight: isSelected ? 'bold' : '600',
                            },
                          ]}
                        >
                          {race.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </RPGCard>

              {/* Card 3: Seleção de Classe */}
              <RPGCard style={styles.formCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    ⚔️ Classe & Vocação: {activeClassData?.name}
                  </Text>
                  <RPGBadge
                    label={`Dado: ${activeClassData?.hd} • ${activeClassData?.role}`}
                    variant="mana"
                    size="sm"
                  />
                </View>

                <View style={styles.gridOptions}>
                  {AVAILABLE_CLASSES.map((cls) => {
                    const isSelected = selectedClass === cls.name;
                    return (
                      <Pressable
                        key={cls.name}
                        onPress={() => setSelectedClass(cls.name)}
                        style={[
                          styles.gridCard,
                          {
                            backgroundColor: isSelected
                              ? `${theme.mana}20`
                              : theme.backgroundInput,
                            borderColor: isSelected ? theme.mana : theme.border,
                          },
                        ]}
                      >
                        <Text style={styles.gridIcon}>{cls.icon}</Text>
                        <Text
                          style={[
                            styles.gridName,
                            {
                              color: isSelected ? theme.mana : theme.text,
                              fontWeight: isSelected ? 'bold' : '600',
                            },
                          ]}
                        >
                          {cls.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </RPGCard>

              {/* Card 4: Tendência e Antecedente */}
              <RPGCard style={styles.formCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  ⚖️ Alinhamento & Antecedente
                </Text>

                <View style={styles.fieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                    Tendência Moral (D&D 5e): <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedAlignment}</Text>
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalChips}
                  >
                    {AVAILABLE_ALIGNMENTS.map((align) => {
                      const isSelected = selectedAlignment === align;
                      return (
                        <Pressable
                          key={align}
                          onPress={() => setSelectedAlignment(align)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected
                                ? theme.primary
                                : theme.backgroundInput,
                              borderColor: isSelected ? theme.primary : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? '#1A140B' : theme.text,
                                fontWeight: isSelected ? 'bold' : 'normal',
                              },
                            ]}
                          >
                            {align}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                    Antecedente: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{selectedBackground}</Text>
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalChips}
                  >
                    {COMMON_BACKGROUNDS.map((bg) => {
                      const isSelected = selectedBackground === bg;
                      return (
                        <Pressable
                          key={bg}
                          onPress={() => setSelectedBackground(bg)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected
                                ? theme.stamina
                                : theme.backgroundInput,
                              borderColor: isSelected ? theme.stamina : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? '#1A140B' : theme.text,
                                fontWeight: isSelected ? 'bold' : 'normal',
                              },
                            ]}
                          >
                            {bg}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </RPGCard>

              {/* Botão de Avanço de Etapa */}
              <RPGButton
                title="Avançar para Etapa 2 (Atributos & PV) ➔"
                variant="primary"
                icon="⚔️"
                onPress={handleNextStep}
                style={{ marginTop: Spacing.sm }}
              />

              <RPGButton
                title="Cancelar e Voltar para a Taverna"
                variant="ghost"
                icon="✖"
                size="sm"
                onPress={() => router.back()}
              />
            </View>
          ) : (
            /* ========================================================
             * ETAPA 2: ATRIBUTOS & ESTATÍSTICAS (PREVIEW DO COMMIT 11)
             * ======================================================== */
            <View style={styles.stepContent}>
              <RPGCard variant="highlight" style={styles.formCard}>
                <RPGBadge label="ETAPA 1 CONCLUÍDA COM SUCESSO!" variant="gold" size="sm" />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryEmoji}>{selectedAvatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryName, { color: theme.text }]}>
                      {name} {title ? `• ${title}` : ''}
                    </Text>
                    <Text style={[styles.summaryDesc, { color: theme.textSecondary }]}>
                      {selectedRace} • {selectedClass} Nível {level} ({selectedAlignment})
                    </Text>
                    <Text style={[styles.summaryDesc, { color: theme.primary }]}>
                      Antecedente: {selectedBackground} • Bônus Prof.: +{proficiencyBonus}
                    </Text>
                  </View>
                </View>
              </RPGCard>

              <RPGCard style={styles.formCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  🎲 Etapa 2: Distribuição de Atributos & PV
                </Text>
                <Text style={[styles.step2Desc, { color: theme.textSecondary }]}>
                  Os dados básicos da Etapa 1 foram validados. No Commit #11, você distribuirá os 6 atributos principais (FOR, DES, CON, INT, SAB, CAR), calculará o PV e CA base e salvará a ficha no AsyncStorage!
                </Text>

                <RPGButton
                  title="⬅ Voltar para Etapa 1 (Editar Origem)"
                  variant="secondary"
                  icon="↩️"
                  onPress={() => setStep(1)}
                  style={{ marginTop: Spacing.sm }}
                />
              </RPGCard>
            </View>
          )}
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
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.sm,
  },
  stepperContainer: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  errorIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  stepContent: {
    gap: Spacing.md,
  },
  formCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  fieldBlock: {
    gap: 6,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  avatarSelectBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  levelSub: {
    fontSize: 11,
  },
  levelControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  levelBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 28,
    textAlign: 'center',
  },
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  gridCard: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  gridIcon: {
    fontSize: 22,
  },
  gridName: {
    fontSize: 11,
    textAlign: 'center',
  },
  horizontalChips: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  summaryEmoji: {
    fontSize: 36,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryDesc: {
    fontSize: 12,
  },
  step2Desc: {
    fontSize: 13,
    lineHeight: 18,
  },
});
