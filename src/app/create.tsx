import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { useAuth } from '@/context/auth-context';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import {
  AVAILABLE_ALIGNMENTS,
  AVAILABLE_CLASSES,
  AVAILABLE_RACES,
} from '@/data/mock-characters';
import {
  Attributes,
  calculateModifier,
  calculateProficiencyBonus,
  FeatureTrait,
  formatModifier,
  InventoryItem,
  RPGAlignment,
  RPGClass,
  RPGRace,
  Skill,
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

const ATTRIBUTE_LABELS: { key: keyof Attributes; short: string; full: string; desc: string }[] = [
  { key: 'strength', short: 'FOR', full: 'Força', desc: 'Poder físico, atletismo e dano corpo a corpo' },
  { key: 'dexterity', short: 'DES', full: 'Destreza', desc: 'Agilidade, esquiva, iniciativa e CA' },
  { key: 'constitution', short: 'CON', full: 'Constituição', desc: 'Saúde, vigor e pontos de vida (PV)' },
  { key: 'intelligence', short: 'INT', full: 'Inteligência', desc: 'Raciocínio lógico, arcanismo e investigação' },
  { key: 'wisdom', short: 'SAB', full: 'Sabedoria', desc: 'Percepção, intuição e força de vontade' },
  { key: 'charisma', short: 'CAR', full: 'Carisma', desc: 'Presença, liderança, persuasão e conjuração' },
];

function getSavingThrows(cls: RPGClass): (keyof Attributes)[] {
  switch (cls) {
    case 'Guerreiro':
    case 'Bárbaro':
      return ['strength', 'constitution'];
    case 'Mago':
      return ['intelligence', 'wisdom'];
    case 'Ladino':
      return ['dexterity', 'intelligence'];
    case 'Clérigo':
    case 'Paladino':
      return ['wisdom', 'charisma'];
    case 'Bardo':
    case 'Bruxo':
      return ['dexterity', 'charisma'];
    case 'Druida':
      return ['intelligence', 'wisdom'];
    case 'Patrulheiro':
    case 'Monge':
      return ['strength', 'dexterity'];
    case 'Feiticeiro':
      return ['constitution', 'charisma'];
    default:
      return ['strength', 'constitution'];
  }
}

function getDefaultSkills(cls: RPGClass): Skill[] {
  switch (cls) {
    case 'Guerreiro':
      return [
        { name: 'Atletismo', attribute: 'strength', proficient: true },
        { name: 'Intimidação', attribute: 'charisma', proficient: true },
        { name: 'Percepção', attribute: 'wisdom', proficient: false },
        { name: 'Sobrevivência', attribute: 'wisdom', proficient: false },
      ];
    case 'Mago':
      return [
        { name: 'Arcanismo', attribute: 'intelligence', proficient: true },
        { name: 'História', attribute: 'intelligence', proficient: true },
        { name: 'Investigação', attribute: 'intelligence', proficient: true },
        { name: 'Intuição', attribute: 'wisdom', proficient: false },
      ];
    case 'Ladino':
      return [
        { name: 'Acrobacia', attribute: 'dexterity', proficient: true },
        { name: 'Furtividade', attribute: 'dexterity', proficient: true, expertise: true },
        { name: 'Prestidigitação', attribute: 'dexterity', proficient: true },
        { name: 'Enganação', attribute: 'charisma', proficient: true },
      ];
    case 'Clérigo':
      return [
        { name: 'Medicina', attribute: 'wisdom', proficient: true },
        { name: 'Religião', attribute: 'intelligence', proficient: true },
        { name: 'Persuasão', attribute: 'charisma', proficient: true },
        { name: 'Intuição', attribute: 'wisdom', proficient: true },
      ];
    default:
      return [
        { name: 'Atletismo', attribute: 'strength', proficient: true },
        { name: 'Percepção', attribute: 'wisdom', proficient: true },
        { name: 'Sobrevivência', attribute: 'wisdom', proficient: false },
      ];
  }
}

function getDefaultInventory(cls: RPGClass): InventoryItem[] {
  switch (cls) {
    case 'Guerreiro':
      return [
        {
          id: 'item-init-1',
          name: 'Espada Longa de Aço',
          category: 'Arma',
          quantity: 1,
          weight: 1.5,
          equipped: true,
          damage: '1d8+3 Cortante (Versátil 1d10)',
          description: 'Lâmina reta forjada para combate marcial.',
          rarity: 'Comum',
        },
        {
          id: 'item-init-2',
          name: 'Cota de Malha',
          category: 'Armadura',
          quantity: 1,
          weight: 20.0,
          equipped: true,
          armorClassBonus: 16,
          description: 'Armadura pesada de anéis entrelaçados.',
          rarity: 'Comum',
        },
        {
          id: 'item-init-3',
          name: 'Poção de Cura',
          category: 'Poção',
          quantity: 2,
          weight: 0.5,
          equipped: false,
          description: 'Recupera 2d4+2 PV.',
          rarity: 'Comum',
        },
      ];
    case 'Mago':
      return [
        {
          id: 'item-init-1',
          name: 'Cajado de Foco Arcano',
          category: 'Arma',
          quantity: 1,
          weight: 1.8,
          equipped: true,
          damage: '1d6 Concussão',
          description: 'Cajado entalhado para canalizar energias arcanas.',
          rarity: 'Comum',
        },
        {
          id: 'item-init-2',
          name: 'Grimório de Feitiços',
          category: 'Equipamento',
          quantity: 1,
          weight: 1.5,
          equipped: false,
          description: 'Livro de pergaminhos com fórmulas místicas.',
          rarity: 'Comum',
        },
      ];
    case 'Ladino':
      return [
        {
          id: 'item-init-1',
          name: 'Adagas Gêmeas',
          category: 'Arma',
          quantity: 2,
          weight: 1.0,
          equipped: true,
          damage: '1d4+3 Perfurante (Ágil)',
          description: 'Par de adagas leves para ataques precisos.',
          rarity: 'Comum',
        },
        {
          id: 'item-init-2',
          name: 'Armadura de Couro',
          category: 'Armadura',
          quantity: 1,
          weight: 4.0,
          equipped: true,
          armorClassBonus: 11,
          description: 'Couro flexível para movimentação furtiva.',
          rarity: 'Comum',
        },
      ];
    default:
      return [
        {
          id: 'item-init-1',
          name: 'Arma Padrão de Classe',
          category: 'Arma',
          quantity: 1,
          weight: 1.5,
          equipped: true,
          damage: '1d8+2 Físico',
          description: 'Equipamento inicial de aventura.',
          rarity: 'Comum',
        },
        {
          id: 'item-init-2',
          name: 'Mochila de Expedição',
          category: 'Equipamento',
          quantity: 1,
          weight: 2.0,
          equipped: false,
          description: 'Contém tochas, corda e rações.',
          rarity: 'Comum',
        },
      ];
  }
}

function getDefaultFeatures(cls: RPGClass, race: RPGRace): FeatureTrait[] {
  return [
    {
      id: 'feat-cls-1',
      name: `Treinamento Marcial/Místico de ${cls}`,
      source: 'Classe',
      description: `Habilidade intrínseca desenvolvida através da dedicação à senda de ${cls}.`,
    },
    {
      id: 'feat-race-1',
      name: `Herança de ${race}`,
      source: 'Raça',
      description: `Traço ancestral conferido pela linhagem dos ${race}s.`,
    },
  ];
}

export default function CreateHeroScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { createCharacter } = useCharacters();

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

  // Estados da Etapa 2: Atributos D&D 5e
  const [attributes, setAttributes] = useState<Attributes>({
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  });
  const [isSaving, setIsSaving] = useState(false);

  const proficiencyBonus = calculateProficiencyBonus(level);
  const activeClassData = AVAILABLE_CLASSES.find((c) => c.name === selectedClass);
  const activeRaceData = AVAILABLE_RACES.find((r) => r.name === selectedRace);

  // Cálculos dinâmicos de combate (PV, CA, Iniciativa, Deslocamento)
  const conMod = calculateModifier(attributes.constitution);
  const dexMod = calculateModifier(attributes.dexterity);
  const hdDie = activeClassData?.hd || 'd8';
  const hdNumber = parseInt(hdDie.replace('d', ''), 10) || 8;
  const avgPerLevel = Math.floor(hdNumber / 2) + 1;
  const calculatedHp = Math.max(
    1,
    hdNumber + conMod + Math.max(0, level - 1) * Math.max(1, avgPerLevel + conMod)
  );
  const calculatedCA = 10 + dexMod;
  const calculatedSpeed =
    selectedRace === 'Anão' || selectedRace === 'Halfling' || selectedRace === 'Gnomo'
      ? 7.5
      : selectedRace === 'Elfo'
      ? 10.5
      : 9.0;
  const calculatedInitiative = dexMod;

  // Ações de Atributos
  const changeAttribute = (attr: keyof Attributes, delta: number) => {
    setAttributes((prev) => ({
      ...prev,
      [attr]: Math.max(3, Math.min(20, prev[attr] + delta)),
    }));
  };

  const setStandardArray = () => {
    setAttributes({
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });
  };

  const rollRandomAttributes = () => {
    const rollStat = () => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => a - b);
      return rolls[1] + rolls[2] + rolls[3];
    };
    setAttributes({
      strength: rollStat(),
      dexterity: rollStat(),
      constitution: rollStat(),
      intelligence: rollStat(),
      wisdom: rollStat(),
      charisma: rollStat(),
    });
  };

  // Validação da Etapa 1
  const handleNextStep = () => {
    setErrorMessage('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Informe o nome de batismo do herói (mínimo 2 letras).');
      return;
    }

    setStep(2);
  };

  // Conclusão e Salvamento da Ficha (Camada de Estado + Dados no AsyncStorage)
  const handleFinishCreation = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const newChar = await createCharacter({
        name: name.trim(),
        title: title.trim() || undefined,
        playerName: user ? user.name : 'Aventureiro',
        race: selectedRace,
        class: selectedClass,
        level,
        experience: (level - 1) * 1000,
        alignment: selectedAlignment,
        background: selectedBackground,
        avatarEmoji: selectedAvatar,
        proficiencyBonus,
        speed: calculatedSpeed,
        initiative: calculatedInitiative,
        armorClass: calculatedCA,
        currentHp: calculatedHp,
        maxHp: calculatedHp,
        tempHp: 0,
        hitDice: `${level}${hdDie}`,
        hitDiceUsed: 0,
        deathSaves: { successes: 0, failures: 0 },
        attributes,
        savingThrowProficiencies: getSavingThrows(selectedClass),
        skills: getDefaultSkills(selectedClass),
        inventory: getDefaultInventory(selectedClass),
        coins: { cp: 50, sp: 25, ep: 0, gp: 35, pp: 0 },
        features: getDefaultFeatures(selectedClass, selectedRace),
        bio: {
          personalityTraits: 'Determinado a provar seu valor perante os deuses e companheiros de guilda.',
          ideals: 'Honra e coragem diante dos perigos da escuridão.',
          bonds: 'Luta pela glória de sua guilda e pela segurança dos inocentes.',
          flaws: 'Costuma confiar demais em sua própria sorte.',
          backstory: `Nascido como ${selectedRace}, ${name} abraçou a senda de ${selectedClass} guiado por sua vocação.`,
          appearance: `Porte firme e olhar resoluto de quem já enfrentou provações.`,
          notes: 'Ficha forjada no construtor de heróis.',
        },
      });

      Alert.alert(
        '🎉 Herói Forjado com Sucesso!',
        `${newChar.name} (${newChar.class} Nv. ${newChar.level}) foi registrado na guilda e salvo no AsyncStorage!`,
        [
          {
            text: 'Abrir Salão dos Heróis',
            onPress: () => router.replace('/characters' as any),
          },
        ]
      );
    } catch {
      setErrorMessage('Erro ao salvar ficha no dispositivo. Tente novamente.');
    } finally {
      setIsSaving(false);
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
            <RPGBadge label="TELA 5 DE 11 • FORJA DE HERÓIS" variant="gold" size="sm" />
            <Text style={[styles.title, { color: theme.text }]}>
              ✨ Forjar Novo Aventureiro
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {step === 1
                ? 'Etapa 1 de 2: Defina as raízes, vocação e conduta moral da sua lenda'
                : 'Etapa 2 de 2: Alinhe os atributos vitais e calcule estatísticas de combate'}
            </Text>
          </View>

          {/* Stepper Visual de Progresso */}
          <View style={styles.stepperContainer}>
            <Pressable
              onPress={() => setStep(1)}
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
            </Pressable>
            <Pressable
              onPress={name.trim().length >= 2 ? () => setStep(2) : undefined}
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
            </Pressable>
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
             * ETAPA 2: DISTRIBUIÇÃO DE ATRIBUTOS & SALVAMENTO (COMMIT 11)
             * ======================================================== */
            <View style={styles.stepContent}>
              {/* Resumo da Identidade Escolhida */}
              <RPGCard variant="highlight" style={styles.formCard}>
                <RPGBadge label="ETAPA 1 CONCLUÍDA" variant="gold" size="sm" />
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

              {/* Preview Dinâmico de Combate */}
              <RPGCard style={styles.formCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  🛡️ Prévia de Combate Calculada
                </Text>
                <View style={styles.combatPreviewGrid}>
                  <View style={[styles.combatPreviewChip, { backgroundColor: `${theme.hp}15`, borderColor: theme.hp }]}>
                    <Text style={[styles.combatPreviewLabel, { color: theme.hp }]}>❤️ PV MÁXIMO</Text>
                    <Text style={[styles.combatPreviewValue, { color: theme.text }]}>{calculatedHp}</Text>
                    <Text style={[styles.combatPreviewSub, { color: theme.textSecondary }]}>{hdDie} + CON</Text>
                  </View>

                  <View style={[styles.combatPreviewChip, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
                    <Text style={[styles.combatPreviewLabel, { color: theme.armor }]}>🛡️ CA BASE</Text>
                    <Text style={[styles.combatPreviewValue, { color: theme.text }]}>{calculatedCA}</Text>
                    <Text style={[styles.combatPreviewSub, { color: theme.textSecondary }]}>10 + DES</Text>
                  </View>

                  <View style={[styles.combatPreviewChip, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}>
                    <Text style={[styles.combatPreviewLabel, { color: theme.stamina }]}>⚡ INICIATIVA</Text>
                    <Text style={[styles.combatPreviewValue, { color: theme.text }]}>{formatModifier(calculatedInitiative)}</Text>
                    <Text style={[styles.combatPreviewSub, { color: theme.textSecondary }]}>Mod DES</Text>
                  </View>

                  <View style={[styles.combatPreviewChip, { backgroundColor: `${theme.mana}15`, borderColor: theme.mana }]}>
                    <Text style={[styles.combatPreviewLabel, { color: theme.mana }]}>🏃 DESLOC.</Text>
                    <Text style={[styles.combatPreviewValue, { color: theme.text }]}>{calculatedSpeed}m</Text>
                    <Text style={[styles.combatPreviewSub, { color: theme.textSecondary }]}>{selectedRace}</Text>
                  </View>
                </View>
              </RPGCard>

              {/* Alocação dos 6 Atributos */}
              <RPGCard style={styles.formCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    🎲 6 Atributos D&D 5e
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <RPGButton
                      title="Padrão"
                      variant="secondary"
                      size="sm"
                      onPress={setStandardArray}
                    />
                    <RPGButton
                      title="Rolar 4d6"
                      variant="secondary"
                      icon="🎲"
                      size="sm"
                      onPress={rollRandomAttributes}
                    />
                  </View>
                </View>

                <View style={styles.attrList}>
                  {ATTRIBUTE_LABELS.map((item) => {
                    const val = attributes[item.key];
                    const mod = calculateModifier(val);
                    return (
                      <View
                        key={item.key}
                        style={[
                          styles.attrRowBox,
                          { backgroundColor: theme.backgroundInput, borderColor: theme.border },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.attrShortName, { color: theme.primary }]}>
                              {item.short}
                            </Text>
                            <Text style={[styles.attrFullName, { color: theme.text }]}>
                              {item.full}
                            </Text>
                          </View>
                          <Text style={[styles.attrDesc, { color: theme.textSecondary }]}>
                            {item.desc}
                          </Text>
                        </View>

                        <View style={styles.attrControls}>
                          <View
                            style={[
                              styles.modBadge,
                              { backgroundColor: `${theme.primary}20`, borderColor: theme.primary },
                            ]}
                          >
                            <Text style={[styles.modText, { color: theme.primary }]}>
                              {formatModifier(mod)}
                            </Text>
                          </View>

                          <Pressable
                            onPress={() => changeAttribute(item.key, -1)}
                            style={[styles.attrBtn, { borderColor: theme.border }]}
                          >
                            <Text style={[styles.attrBtnText, { color: theme.text }]}>-</Text>
                          </Pressable>

                          <Text style={[styles.attrScore, { color: theme.text }]}>{val}</Text>

                          <Pressable
                            onPress={() => changeAttribute(item.key, 1)}
                            style={[styles.attrBtn, { borderColor: theme.border }]}
                          >
                            <Text style={[styles.attrBtnText, { color: theme.text }]}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </RPGCard>

              {/* Botões de Ação Final */}
              <RPGButton
                title="✨ Forjar e Salvar Aventureiro"
                variant="primary"
                icon="🛡️"
                loading={isSaving}
                onPress={handleFinishCreation}
                style={{ marginTop: Spacing.xs }}
              />

              <RPGButton
                title="⬅ Voltar para Etapa 1 (Editar Origem)"
                variant="secondary"
                icon="↩️"
                onPress={() => setStep(1)}
              />
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
  combatPreviewGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  combatPreviewChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  combatPreviewLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  combatPreviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  combatPreviewSub: {
    fontSize: 9,
  },
  attrList: {
    gap: 8,
    marginTop: 4,
  },
  attrRowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  attrShortName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  attrFullName: {
    fontSize: 13,
    fontWeight: '600',
  },
  attrDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  attrControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modBadge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 32,
    alignItems: 'center',
  },
  modText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attrBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attrBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attrScore: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 24,
    textAlign: 'center',
  },
});
