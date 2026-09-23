import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/context/theme-context';
import { Attributes, calculateModifier, formatModifier } from '@/types/character';
import {
  rpgHapticButton,
  rpgHapticCriticalFailure,
  rpgHapticCriticalSuccess,
  rpgHapticRoll,
  rpgHapticSelection,
} from '@/utils/haptics';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface DiceRollLog {
  id: string;
  timestamp: string;
  title: string;
  diceType: DiceType;
  diceCount: number;
  modifier: number;
  rolls: number[];
  droppedRoll?: number;
  d20Mode: 'normal' | 'advantage' | 'disadvantage';
  total: number;
  isCriticalSuccess?: boolean;
  isCriticalFailure?: boolean;
}

const DICE_TYPES: { type: DiceType; sides: number; label: string; icon: string }[] = [
  { type: 'd4', sides: 4, label: 'd4', icon: '🔺' },
  { type: 'd6', sides: 6, label: 'd6', icon: '🎲' },
  { type: 'd8', sides: 8, label: 'd8', icon: '🔷' },
  { type: 'd10', sides: 10, label: 'd10', icon: '💎' },
  { type: 'd12', sides: 12, label: 'd12', icon: '🛡️' },
  { type: 'd20', sides: 20, label: 'd20', icon: '👑' },
  { type: 'd100', sides: 100, label: 'd100', icon: '💯' },
];

export default function CharacterDiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getCharacterById, activeCharacter } = useCharacters();
  const { settings } = useSettings();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Parâmetros de Seleção do Dado
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [diceCount, setDiceCount] = useState<number>(1);
  const [manualModifier, setManualModifier] = useState<number>(0);
  const [d20Mode, setD20Mode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  // Estado da Rolagem
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<DiceRollLog | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRollLog[]>([]);

  // Função central de Rolagem
  const executeRoll = useCallback(
    (
      sides: number,
      type: DiceType,
      count: number,
      mod: number,
      title: string,
      mode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
    ) => {
      rpgHapticButton();
      setIsRolling(true);

      setTimeout(() => {
        let rolledNumbers: number[] = [];
        let droppedRoll: number | undefined;
        let total = 0;
        let isCritSuccess = false;
        let isCritFail = false;

        if (type === 'd20' && (mode === 'advantage' || mode === 'disadvantage')) {
          // Rola dois d20
          const r1 = Math.floor(Math.random() * 20) + 1;
          const r2 = Math.floor(Math.random() * 20) + 1;

          if (mode === 'advantage') {
            const chosen = Math.max(r1, r2);
            droppedRoll = Math.min(r1, r2);
            rolledNumbers = [chosen];
          } else {
            const chosen = Math.min(r1, r2);
            droppedRoll = Math.max(r1, r2);
            rolledNumbers = [chosen];
          }

          const chosenRoll = rolledNumbers[0];
          if (chosenRoll === 20) isCritSuccess = true;
          if (chosenRoll === 1) isCritFail = true;

          total = Math.max(0, chosenRoll + mod);
        } else {
          for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * sides) + 1;
            rolledNumbers.push(r);
          }

          if (type === 'd20' && count === 1) {
            if (rolledNumbers[0] === 20) isCritSuccess = true;
            if (rolledNumbers[0] === 1) isCritFail = true;
          }

          const diceSum = rolledNumbers.reduce((acc, n) => acc + n, 0);
          total = Math.max(0, diceSum + mod);
        }

        // Resposta Háptica Tátil baseada no resultado da rolagem
        if (isCritSuccess) {
          rpgHapticCriticalSuccess();
        } else if (isCritFail) {
          rpgHapticCriticalFailure();
        } else {
          rpgHapticRoll();
        }

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const newLog: DiceRollLog = {
          id: `roll-${Date.now()}`,
          timestamp: timeStr,
          title,
          diceType: type,
          diceCount: count,
          modifier: mod,
          rolls: rolledNumbers,
          droppedRoll,
          d20Mode: mode,
          total,
          isCriticalSuccess: isCritSuccess,
          isCriticalFailure: isCritFail,
        };

        setLastRoll(newLog);
        setRollHistory((prev) => [newLog, ...prev.slice(0, 19)]); // Guarda até 20 rolagens
        setIsRolling(false);
      }, 250);
    },
    []
  );

  // Rolador Manual do Painel Superior
  const handleRollCustom = () => {
    const diceDef = DICE_TYPES.find((d) => d.type === selectedDice) || DICE_TYPES[5];
    const mode = selectedDice === 'd20' ? d20Mode : 'normal';
    const title = `${diceCount}${diceDef.label}${manualModifier !== 0 ? ` ${formatModifier(manualModifier)}` : ''}`;
    executeRoll(diceDef.sides, selectedDice, diceCount, manualModifier, title, mode);
  };

  // Rolador Rápido por Atributo do Herói
  const handleRollAttributeCheck = (attrKey: keyof Attributes, label: string) => {
    if (!character) return;
    const score = character.attributes[attrKey] || 10;
    const mod = calculateModifier(score);
    const title = `Teste de ${label} (${formatModifier(mod)})`;
    executeRoll(20, 'd20', 1, mod, title, d20Mode);
  };

  // Rolador Rápido de Iniciativa
  const handleRollInitiative = () => {
    if (!character) return;
    const init = character.initiative || 0;
    const title = `Iniciativa de Combate (${formatModifier(init)})`;
    executeRoll(20, 'd20', 1, init, title, d20Mode);
  };

  // Limpar Histórico
  const handleClearHistory = () => {
    Alert.alert('Limpar Histórico', 'Deseja apagar os registros desta sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => setRollHistory([]) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com Identificação do Aventureiro */}
        {character ? (
          <RPGCard variant="elevated" style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.charName, { color: theme.text }]}>
                  {character.name}
                </Text>
                <Text style={[styles.charSub, { color: theme.textSecondary }]}>
                  {character.race} • {character.class} (Nível {character.level})
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <RPGBadge label="🎲 Rolador Integrado" variant="gold" size="md" />
                {settings.diceSoundEffects ? (
                  <RPGBadge label="🔊 Som Ativo" variant="mana" size="sm" />
                ) : null}
              </View>
            </View>
          </RPGCard>
        ) : null}

        {/* Display do Resultado da Última Rolagem */}
        <RPGCard
          variant={lastRoll?.isCriticalSuccess ? 'highlight' : 'elevated'}
          style={[
            styles.displayCard,
            lastRoll?.isCriticalSuccess && { borderColor: theme.primary, borderWidth: 2 },
            lastRoll?.isCriticalFailure && { borderColor: theme.hp, borderWidth: 2 },
          ]}
        >
          {lastRoll ? (
            <View style={styles.displayContent}>
              <View style={styles.displayTopRow}>
                <Text style={[styles.displayTitle, { color: theme.textSecondary }]}>
                  {lastRoll.title} • {lastRoll.timestamp}
                </Text>

                {lastRoll.isCriticalSuccess && (
                  <RPGBadge label="✨ 20 NATURAL! CRÍTICO!" variant="gold" size="sm" />
                )}
                {lastRoll.isCriticalFailure && (
                  <RPGBadge label="💀 1 NATURAL! DESASTRE!" variant="hp" size="sm" />
                )}
              </View>

              {/* Total Gigante */}
              <View style={styles.totalNumberBox}>
                <Text
                  style={[
                    styles.totalText,
                    {
                      color: lastRoll.isCriticalSuccess
                        ? theme.textGold
                        : lastRoll.isCriticalFailure
                        ? theme.hp
                        : theme.text,
                    },
                  ]}
                >
                  {isRolling ? '🎲...' : lastRoll.total}
                </Text>
              </View>

              {/* Detalhamento da Rolagem (Dados + Modificador) */}
              <View style={[styles.breakdownRow, { backgroundColor: theme.backgroundInput }]}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Detalhes:
                </Text>
                <Text style={[styles.breakdownDetails, { color: theme.text }]}>
                  Dados: [{lastRoll.rolls.join(', ')}]
                  {lastRoll.droppedRoll !== undefined && (
                    <Text style={{ color: theme.textMuted }}> (ignorado: {lastRoll.droppedRoll})</Text>
                  )}
                  {lastRoll.modifier !== 0 && (
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                      {' '}{formatModifier(lastRoll.modifier)}
                    </Text>
                  )}
                  {' '}= <Text style={{ fontWeight: 'bold' }}>{lastRoll.total}</Text>
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.displayEmpty}>
              <Text style={styles.emptyDiceEmoji}>🎲</Text>
              <Text style={[styles.emptyPrompt, { color: theme.text }]}>
                Selecione os dados ou faça um teste de atributo abaixo
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Suporte a d4, d6, d8, d10, d12, d20 (Vantagem/Desvantagem) e d100
              </Text>
            </View>
          )}
        </RPGCard>

        {/* Mesa de Dados Poliédricos */}
        <RPGCard variant="default" style={styles.dicePickerCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🎲 Escolha o Tipo de Dado:
          </Text>

          {/* Grid de 7 Dados */}
          <View style={styles.diceGrid}>
            {DICE_TYPES.map((d) => {
              const isSelected = selectedDice === d.type;
              return (
                <Pressable
                  key={d.type}
                  onPress={() => {
                    rpgHapticSelection();
                    setSelectedDice(d.type);
                  }}
                  style={[
                    styles.diceBtn,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.diceBtnIcon}>{d.icon}</Text>
                  <Text
                    style={[
                      styles.diceBtnText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Opções de Quantidade e Modificador */}
          <View style={styles.controlsRow}>
            {/* Quantidade de Dados */}
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                Qtd de Dados:
              </Text>
              <View style={styles.stepperBox}>
                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setDiceCount((prev) => Math.max(1, prev - 1));
                  }}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.text }]}>-</Text>
                </Pressable>
                <Text style={[styles.stepperVal, { color: theme.text }]}>{diceCount}</Text>
                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setDiceCount((prev) => Math.min(10, prev + 1));
                  }}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Modificador Manual */}
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                Modificador (+/-):
              </Text>
              <View style={styles.stepperBox}>
                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setManualModifier((prev) => prev - 1);
                  }}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.text }]}>-</Text>
                </Pressable>
                <Text style={[styles.stepperVal, { color: theme.text }]}>
                  {formatModifier(manualModifier)}
                </Text>
                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setManualModifier((prev) => prev + 1);
                  }}
                  style={[styles.stepperBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Opção Especial D20: Vantagem e Desvantagem */}
          {selectedDice === 'd20' && (
            <View style={styles.advantageRow}>
              <Text style={[styles.controlLabel, { color: theme.textSecondary }]}>
                Modo D20:
              </Text>
              <View style={styles.advantageToggleGroup}>
                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setD20Mode('normal');
                  }}
                  style={[
                    styles.advBtn,
                    {
                      backgroundColor: d20Mode === 'normal' ? theme.primary : theme.backgroundInput,
                      borderColor: d20Mode === 'normal' ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.advBtnText,
                      { color: d20Mode === 'normal' ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    Normal (1d20)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setD20Mode('advantage');
                  }}
                  style={[
                    styles.advBtn,
                    {
                      backgroundColor: d20Mode === 'advantage' ? theme.healing : theme.backgroundInput,
                      borderColor: d20Mode === 'advantage' ? theme.healing : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.advBtnText,
                      { color: d20Mode === 'advantage' ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    🟢 Vantagem
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    rpgHapticSelection();
                    setD20Mode('disadvantage');
                  }}
                  style={[
                    styles.advBtn,
                    {
                      backgroundColor: d20Mode === 'disadvantage' ? theme.hp : theme.backgroundInput,
                      borderColor: d20Mode === 'disadvantage' ? theme.hp : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.advBtnText,
                      { color: d20Mode === 'disadvantage' ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    🔴 Desvantagem
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Botão de Rolagem Principal */}
          <RPGButton
            title={
              isRolling
                ? 'Rolando os Dados...'
                : `Rolar ${diceCount}${selectedDice}${manualModifier !== 0 ? ` ${formatModifier(manualModifier)}` : ''}`
            }
            variant="primary"
            size="lg"
            onPress={handleRollCustom}
            style={{ marginTop: Spacing.xs }}
          />
        </RPGCard>

        {/* Ações Rápidas do Personagem (Testes de Atributos & Iniciativa) */}
        {character ? (
          <RPGCard variant="default" style={styles.characterQuickCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ⚡ Testes Rápidos de {character.name}:
            </Text>
            <Text style={[styles.quickSub, { color: theme.textSecondary }]}>
              Rola 1d20 aplicando o modificador do atributo automaticamente:
            </Text>

            <View style={styles.quickGrid}>
              <Pressable
                onPress={() => handleRollAttributeCheck('strength', 'Força')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>💪</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>FOR</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.strength))}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRollAttributeCheck('dexterity', 'Destreza')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>🏹</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>DES</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.dexterity))}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRollAttributeCheck('constitution', 'Constituição')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>🛡️</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>CON</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.constitution))}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRollAttributeCheck('intelligence', 'Inteligência')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>🧠</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>INT</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.intelligence))}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRollAttributeCheck('wisdom', 'Sabedoria')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>👁️</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>SAB</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.wisdom))}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRollAttributeCheck('charisma', 'Carisma')}
                style={[styles.quickTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
              >
                <Text style={styles.quickAttrEmoji}>👑</Text>
                <Text style={[styles.quickAttrLabel, { color: theme.text }]}>CAR</Text>
                <Text style={[styles.quickAttrMod, { color: theme.primary }]}>
                  {formatModifier(calculateModifier(character.attributes.charisma))}
                </Text>
              </Pressable>
            </View>

            <RPGButton
              title={`⚡ Rolar Iniciativa (${formatModifier(character.initiative || 0)})`}
              variant="secondary"
              size="sm"
              onPress={handleRollInitiative}
              style={{ marginTop: Spacing.xs }}
            />
          </RPGCard>
        ) : null}

        {/* Histórico das Rolagens da Sessão */}
        <RPGCard variant="default" style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>📜</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Histórico de Rolagens ({rollHistory.length})
              </Text>
            </View>
            {rollHistory.length > 0 && (
              <RPGButton
                title="Limpar"
                variant="ghost"
                size="sm"
                onPress={handleClearHistory}
              />
            )}
          </View>

          {rollHistory.length === 0 ? (
            <Text style={[styles.historyEmptyText, { color: theme.textSecondary }]}>
              Nenhum dado rolado nesta sessão ainda. Que os deuses da sorte estejam com você!
            </Text>
          ) : (
            <View style={{ gap: 6 }}>
              {rollHistory.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.historyItemRow,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderLeftColor: item.isCriticalSuccess
                        ? theme.primary
                        : item.isCriticalFailure
                        ? theme.hp
                        : theme.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyItemTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.historyItemDetails, { color: theme.textSecondary }]}>
                      [{item.rolls.join(', ')}]
                      {item.droppedRoll !== undefined && ` (descarte: ${item.droppedRoll})`}
                      {item.modifier !== 0 && ` ${formatModifier(item.modifier)}`} • {item.timestamp}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.historyItemTotal,
                      {
                        color: item.isCriticalSuccess
                          ? theme.textGold
                          : item.isCriticalFailure
                          ? theme.hp
                          : theme.text,
                      },
                    ]}
                  >
                    {item.total}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </RPGCard>

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Biografia (Tela 10)"
            variant="secondary"
            onPress={() => router.push((character ? `/character/${character.id}/bio` : '/characters') as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Ficha de Combate ⚔️"
            variant="secondary"
            onPress={() => router.push((character ? `/character/${character.id}` : '/characters') as any)}
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
  charName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  charSub: {
    fontSize: 12,
    marginTop: 2,
  },
  displayCard: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  displayContent: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  displayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  displayTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalNumberBox: {
    paddingVertical: 4,
  },
  totalText: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    gap: 6,
  },
  breakdownLabel: {
    fontSize: 12,
  },
  breakdownDetails: {
    fontSize: 13,
  },
  displayEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyDiceEmoji: {
    fontSize: 48,
  },
  emptyPrompt: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  dicePickerCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  diceBtn: {
    flexBasis: '13%',
    flexGrow: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  diceBtnIcon: {
    fontSize: 18,
  },
  diceBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 4,
  },
  controlGroup: {
    flex: 1,
    gap: 4,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepperVal: {
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 28,
    textAlign: 'center',
  },
  advantageRow: {
    gap: 4,
    marginTop: 4,
  },
  advantageToggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  advBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  advBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  characterQuickCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  quickSub: {
    fontSize: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTile: {
    flexBasis: '30%',
    flexGrow: 1,
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  quickAttrEmoji: {
    fontSize: 16,
  },
  quickAttrLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  quickAttrMod: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: Radius.sm,
    borderLeftWidth: 4,
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  historyItemDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  historyItemTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navigationFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});

