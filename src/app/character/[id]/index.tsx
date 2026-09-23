import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RPGBadge,
  RPGButton,
  RPGCard,
  RPGHpBar,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/context/theme-context';
import {
  Attributes,
  calculateModifier,
  CombatCondition,
  DamageType,
  formatModifier,
} from '@/types/character';
import {
  rpgHapticButton,
  rpgHapticCriticalFailure,
  rpgHapticCriticalSuccess,
  rpgHapticDamage,
  rpgHapticHeal,
  rpgHapticRoll,
  rpgHapticSelection,
} from '@/utils/haptics';

const ATTRIBUTE_LIST: { key: keyof Attributes; short: string; full: string }[] = [
  { key: 'strength', short: 'FOR', full: 'Força' },
  { key: 'dexterity', short: 'DES', full: 'Destreza' },
  { key: 'constitution', short: 'CON', full: 'Constituição' },
  { key: 'intelligence', short: 'INT', full: 'Inteligência' },
  { key: 'wisdom', short: 'SAB', full: 'Sabedoria' },
  { key: 'charisma', short: 'CAR', full: 'Carisma' },
];

const ALL_CONDITIONS: { name: CombatCondition; icon: string; desc: string }[] = [
  { name: 'Cego', icon: '👁️', desc: 'Falha em testes visuais. Ataques contra têm vantagem, seus ataques têm desvantagem.' },
  { name: 'Enfeitiçado', icon: '💖', desc: 'Não pode ferir o encantador. Ele tem vantagem social.' },
  { name: 'Surdo', icon: '👂', desc: 'Falha em testes de audição.' },
  { name: 'Amedrontado', icon: '😨', desc: 'Desvantagem em testes e ataques com a fonte visível.' },
  { name: 'Agarrado', icon: '🤼', desc: 'Deslocamento reduzido a 0m.' },
  { name: 'Incapacitado', icon: '😵', desc: 'Não pode realizar ações nem reações.' },
  { name: 'Invisível', icon: '👻', desc: 'Invisível sem magia. Ataques próprios têm vantagem, contra têm desvantagem.' },
  { name: 'Paralisado', icon: '⚡', desc: 'Incapacitado, imóvel. Falha automática em testes de FOR e DES.' },
  { name: 'Petrificado', icon: '🗿', desc: 'Transformado em pedra. Peso x10 e resistência a todos os danos.' },
  { name: 'Envenenado', icon: '🧪', desc: 'Desvantagem em jogadas de ataque e testes de habilidade.' },
  { name: 'Caído', icon: '🥋', desc: 'Rasteja. Seus ataques têm desvantagem; ataques corpo a corpo têm vantagem.' },
  { name: 'Restringido', icon: '🕸️', desc: 'Deslocamento 0. Seus ataques têm desvantagem, contra têm vantagem.' },
  { name: 'Atordoado', icon: '💫', desc: 'Incapacitado, fala hesitante. Falha automática em FOR e DES.' },
  { name: 'Inconsciente', icon: '💤', desc: 'Incapacitado e caído. Ataques a 1.5m são acertos críticos automáticos.' },
  { name: 'Exaustão', icon: '🥵', desc: 'Penalidades cumulativas de fadiga extrema.' },
];

const DAMAGE_TYPES: { type: DamageType; icon: string }[] = [
  { type: 'Físico', icon: '🗡️' },
  { type: 'Fogo', icon: '🔥' },
  { type: 'Gelo', icon: '❄️' },
  { type: 'Elétrico', icon: '⚡' },
  { type: 'Ácido', icon: '🧪' },
  { type: 'Veneno', icon: '☠️' },
  { type: 'Radiante', icon: '✨' },
  { type: 'Necrótico', icon: '💀' },
  { type: 'Psíquico', icon: '🧠' },
  { type: 'Trovejante', icon: '📢' },
  { type: 'Força', icon: '🌌' },
];

export default function CharacterGeneralSheetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const {
    getCharacterById,
    activeCharacter,
    setActiveCharacterId,
    modifyHp,
    modifyTempHp,
    toggleCondition,
    toggleInspiration,
    rollDeathSave,
    shortRest,
    longRest,
    updateCharacter,
    exportCharacterAsJson,
  } = useCharacters();
  const { settings } = useSettings();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Estado Local de Combate (Aula 3, Slide 12 - Estados Locais)
  const [combatHistory, setCombatHistory] = useState<string[]>([
    '⚔️ Sessão de combate iniciada na Masmorra.',
  ]);

  // Modais de Combate Interativo (Commit 13)
  const [isDamageModalVisible, setIsDamageModalVisible] = useState<boolean>(false);
  const [isConditionsModalVisible, setIsConditionsModalVisible] = useState<boolean>(false);

  // Calculadora de Dano & Cura
  const [calcMode, setCalcMode] = useState<'damage' | 'heal' | 'temp'>('damage');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [damageMultiplier, setDamageMultiplier] = useState<number>(1);
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType>('Físico');

  if (!character) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>⚠️</Text>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Ficha de Herói Não Encontrada
          </Text>
          <Text style={[styles.notFoundDesc, { color: theme.textSecondary }]}>
            O aventureiro solicitado não consta nos registros atuais da Taverna.
          </Text>
          <RPGButton
            title="Voltar ao Salão de Heróis"
            variant="primary"
            icon="🛡️"
            onPress={() => router.replace('/characters' as any)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isActive = activeCharacter?.id === character.id;
  const activeConditions = character.conditions || [];

  const addCombatLog = (entry: string) => {
    setCombatHistory((prev) => [entry, ...prev.slice(0, 4)]);
  };

  const handleQuickDamage = async (amount: number) => {
    rpgHapticDamage();
    await modifyHp(character.id, -amount);
    addCombatLog(`⚔️ ${character.name} sofreu ${amount} de dano!`);
  };

  const handleQuickHeal = async (amount: number) => {
    rpgHapticHeal();
    await modifyHp(character.id, amount);
    addCombatLog(`✨ ${character.name} recuperou ${amount} PV!`);
  };

  const handleClearTempHp = async () => {
    rpgHapticButton();
    await modifyTempHp(character.id, 0);
    addCombatLog('🛡️ PV Temporário zerado.');
  };

  const handleApplyCalculator = async () => {
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Valor Inválido', 'Digite uma quantidade numérica maior que zero.');
      return;
    }

    if (!character) return;

    if (calcMode === 'damage') {
      const finalDmg = Math.max(1, Math.round(val * damageMultiplier));
      const willBeLethal = character.currentHp - finalDmg <= 0;

      const executeApplyDamage = async () => {
        rpgHapticDamage();
        await modifyHp(character.id, -finalDmg);
        const multiText =
          damageMultiplier === 0.5
            ? ' (Resistência: ½)'
            : damageMultiplier === 2
            ? ' (Vulnerabilidade: 2x)'
            : '';
        addCombatLog(`💥 Dano de ${selectedDamageType}: ${finalDmg} PV${multiText}!`);

        if (willBeLethal && settings.autoDeathSave) {
          Alert.alert(
            '💀 Aventureiro Inconsciente!',
            `${character.name} caiu com 0 Pontos de Vida. As Salvaguardas Contra a Morte foram ativadas!`,
            [
              {
                text: 'Fazer Teste de Morte',
                onPress: () => handleRollDeathSave(),
              },
              { text: 'Ok', style: 'cancel' },
            ]
          );
        }
      };

      if (settings.confirmActions && willBeLethal) {
        Alert.alert(
          '⚠️ Confirmar Dano Letal',
          `Esse ataque de ${finalDmg} PV deixará ${character.name} inconsciente (0 PV). Confirmar dano?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Aplicar Dano',
              style: 'destructive',
              onPress: async () => {
                await executeApplyDamage();
                setCustomAmount('');
                setIsDamageModalVisible(false);
              },
            },
          ]
        );
        return;
      }

      await executeApplyDamage();
    } else if (calcMode === 'heal') {
      rpgHapticHeal();
      await modifyHp(character.id, val);
      addCombatLog(`✨ Cura aplicada: +${val} PV recuperados!`);
    } else {
      rpgHapticHeal();
      await modifyTempHp(character.id, (character.tempHp || 0) + val);
      addCombatLog(`🛡️ Escudo Adicional: +${val} PV Temporário!`);
    }

    setCustomAmount('');
    setIsDamageModalVisible(false);
  };

  const handleRollInitiative = () => {
    if (!character) return;
    const d20 = Math.floor(Math.random() * 20) + 1;
    if (d20 === 20) {
      rpgHapticCriticalSuccess();
    } else if (d20 === 1) {
      rpgHapticCriticalFailure();
    } else {
      rpgHapticRoll();
    }
    const total = d20 + character.initiative;
    addCombatLog(`⚡ Iniciativa: Rolou d20(${d20}) + ${formatModifier(character.initiative)} = ${total}!`);
    Alert.alert('⚡ Rolagem de Iniciativa', `Resultado do d20: ${d20}\nModificador de DES: ${formatModifier(character.initiative)}\nTotal de Combate: ${total}!`);
  };

  const handleRollDeathSave = async () => {
    if (!character) return;
    const res = await rollDeathSave(character.id);
    if (res.result === 'critical_success') {
      rpgHapticCriticalSuccess();
    } else if (res.result === 'success') {
      rpgHapticHeal();
    } else {
      rpgHapticCriticalFailure();
    }
    addCombatLog(res.message);
    Alert.alert('💀 Salvaguarda contra a Morte', res.message);
  };

  const handleToggleInspiration = async () => {
    if (!character) return;
    rpgHapticSelection();
    await toggleInspiration(character.id);
    addCombatLog(
      character.hasInspiration
        ? '👑 Inspiração Heroica foi gasta pelo herói!'
        : '🌟 Inspiração Heroica concedida pelo Mestre!'
    );
  };

  const handleShortRest = async () => {
    if (!character) return;
    rpgHapticHeal();
    await shortRest(character.id);
    addCombatLog('☕ Descanso Curto concluído (PVs recuperados com dado de vida).');
    Alert.alert('☕ Descanso Curto', `${character.name} recuperou fôlego e pontos de vida!`);
  };

  const handleLongRest = async () => {
    if (!character) return;
    const executeLongRest = async () => {
      rpgHapticHeal();
      await longRest(character.id);
      addCombatLog('⛺ Descanso Longo concluído (100% PV, slots de magia e dados restaurados).');
      Alert.alert('⛺ Descanso Longo', `${character.name} descansou completamente. PV ao máximo e magias recarregadas!`);
    };

    if (settings.confirmActions) {
      Alert.alert(
        '⛺ Confirmar Descanso Longo (8 Horas)',
        `Deseja aplicar o descanso longo para ${character.name}? Todos os Pontos de Vida e espaços de magia serão restaurados.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar Descanso', onPress: executeLongRest },
        ]
      );
    } else {
      await executeLongRest();
    }
  };

  const toggleDeathSave = async (type: 'successes' | 'failures', index: number) => {
    rpgHapticSelection();
    const current = character.deathSaves[type];
    const nextVal = current === index + 1 ? index : index + 1;
    await updateCharacter(character.id, {
      deathSaves: {
        ...character.deathSaves,
        [type]: nextVal,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho do Herói (HUB 2) */}
        <View style={styles.header}>
          <RPGBadge label="TELA 6 DE 11 • HUB 2 - FICHA GERAL & COMBATE INTERATIVO" variant="gold" size="sm" />
          <View style={styles.heroIdentityRow}>
            <View
              style={[
                styles.heroAvatarBox,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={styles.heroAvatar}>{character.avatarEmoji}</Text>
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <View style={styles.heroNameRow}>
                <Text style={[styles.heroName, { color: theme.text }]} numberOfLines={1}>
                  {character.name}
                </Text>
                {isActive ? (
                  <RPGBadge label="ATIVO 👑" variant="gold" size="sm" />
                ) : (
                  <Pressable onPress={() => setActiveCharacterId(character.id)}>
                    <RPGBadge label="TORNAR ATIVO" variant="neutral" size="sm" />
                  </Pressable>
                )}
              </View>

              {character.title ? (
                <Text style={[styles.heroTitle, { color: theme.primary }]}>
                  {character.title}
                </Text>
              ) : null}

              <Text style={[styles.heroDetails, { color: theme.textSecondary }]}>
                {character.race} • {character.class} Nível {character.level}{' '}
                {character.subclass ? `(${character.subclass})` : ''} • {character.alignment}
              </Text>
            </View>
          </View>

          {/* Botão Interativo de Inspiração Heroica (D&D 5e) */}
          <Pressable
            onPress={handleToggleInspiration}
            style={[
              styles.inspirationButton,
              {
                backgroundColor: character.hasInspiration ? '#D4AF37' : theme.backgroundCard,
                borderColor: '#D4AF37',
              },
            ]}
          >
            <Text
              style={[
                styles.inspirationText,
                { color: character.hasInspiration ? '#1A140B' : '#D4AF37' },
              ]}
            >
              {character.hasInspiration
                ? '🌟 INSPIRAÇÃO HEROICA: ATIVA (Toque para usar)'
                : '✨ Inspiração Heroica: Inativa (Toque para conceder)'}
            </Text>
          </Pressable>
        </View>

        {/* Condições de Combate Ativas */}
        {activeConditions.length > 0 ? (
          <View style={[styles.conditionsBanner, { backgroundColor: `${theme.hp}15`, borderColor: theme.hp }]}>
            <View style={styles.conditionsBannerHeader}>
              <Text style={[styles.conditionsBannerTitle, { color: theme.hp }]}>
                🩸 Condições de Combate Ativas ({activeConditions.length}):
              </Text>
              <Pressable onPress={() => setIsConditionsModalVisible(true)}>
                <Text style={[styles.conditionsManageLink, { color: theme.primary }]}>Editar ⚙️</Text>
              </Pressable>
            </View>
            <View style={styles.conditionTagsRow}>
              {activeConditions.map((cond) => (
                <Pressable
                  key={cond}
                  onPress={() => toggleCondition(character.id, cond)}
                  style={[styles.activeConditionChip, { backgroundColor: theme.backgroundCard, borderColor: theme.hp }]}
                >
                  <Text style={[styles.activeConditionText, { color: theme.text }]}>
                    {cond} ✕
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Card 1: Painel Dinâmico de Pontos de Vida (PV) & Calculadora Interativa */}
        <RPGCard variant="highlight" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              ❤️ Pontos de Vida (Combate)
            </Text>
            {character.currentHp === 0 ? (
              <RPGBadge label="INCONSCIENTE / SANGRANDO" variant="hp" size="sm" />
            ) : character.currentHp <= character.maxHp * 0.25 ? (
              <RPGBadge label="FERIDO CRÍTICO" variant="hp" size="sm" />
            ) : (
              <RPGBadge label="PRONTO PARA COMBATE" variant="mana" size="sm" />
            )}
          </View>

          <RPGHpBar
            current={character.currentHp}
            max={character.maxHp}
            temp={character.tempHp}
            height={16}
            style={{ marginVertical: Spacing.xs }}
          />

          {/* Botões Rápidos de Dano e Cura */}
          <View style={styles.hpActionsSection}>
            <View style={styles.hpActionColumn}>
              <Text style={[styles.actionColTitle, { color: theme.hp }]}>Dano Rápido</Text>
              <View style={styles.hpButtonRow}>
                <RPGButton
                  title="-1"
                  variant="danger"
                  size="sm"
                  onPress={() => handleQuickDamage(1)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="-5"
                  variant="danger"
                  size="sm"
                  onPress={() => handleQuickDamage(5)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="-10"
                  variant="danger"
                  size="sm"
                  onPress={() => handleQuickDamage(10)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <View style={styles.hpActionColumn}>
              <Text style={[styles.actionColTitle, { color: theme.healing }]}>Cura Rápida</Text>
              <View style={styles.hpButtonRow}>
                <RPGButton
                  title="+1"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleQuickHeal(1)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="+5"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleQuickHeal(5)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="+10"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleQuickHeal(10)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>

          {/* Botão da Calculadora Completa */}
          <RPGButton
            title="💥 Calculadora de Dano & Cura Personalizada"
            variant="primary"
            icon="🧮"
            size="sm"
            onPress={() => {
              setCustomAmount('');
              setIsDamageModalVisible(true);
            }}
            style={{ marginTop: Spacing.xs }}
          />

          {/* PV Temporário */}
          <View style={[styles.tempHpRow, { backgroundColor: theme.backgroundInput }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tempHpLabel, { color: theme.textSecondary }]}>
                PV Temporário: <Text style={{ color: theme.mana, fontWeight: 'bold' }}>+{character.tempHp || 0}</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <RPGButton
                title="+5 TEMP"
                variant="ghost"
                size="sm"
                onPress={() => modifyTempHp(character.id, (character.tempHp || 0) + 5)}
              />
              {character.tempHp > 0 ? (
                <RPGButton
                  title="Zerar"
                  variant="ghost"
                  size="sm"
                  onPress={handleClearTempHp}
                />
              ) : null}
            </View>
          </View>

          {/* Testes contra a Morte (Death Saves com Auto-Rolagem) */}
          <View style={styles.deathSavesContainer}>
            <View style={styles.deathSavesHeader}>
              <Text style={[styles.deathSavesTitle, { color: theme.text }]}>
                💀 Salvaguardas contra a Morte (0 PV)
              </Text>
              <RPGButton
                title="Rolar d20 🎲"
                variant="danger"
                size="sm"
                onPress={handleRollDeathSave}
              />
            </View>

            <View style={styles.deathSavesRow}>
              {/* Sucessos */}
              <View style={styles.saveCol}>
                <Text style={[styles.saveColText, { color: theme.healing }]}>Sucessos:</Text>
                <View style={styles.circlesRow}>
                  {[0, 1, 2].map((i) => {
                    const marked = character.deathSaves.successes > i;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleDeathSave('successes', i)}
                        style={[
                          styles.saveCircle,
                          {
                            backgroundColor: marked ? theme.healing : 'transparent',
                            borderColor: theme.healing,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Falhas */}
              <View style={styles.saveCol}>
                <Text style={[styles.saveColText, { color: theme.hp }]}>Falhas:</Text>
                <View style={styles.circlesRow}>
                  {[0, 1, 2].map((i) => {
                    const marked = character.deathSaves.failures > i;
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleDeathSave('failures', i)}
                        style={[
                          styles.saveCircle,
                          {
                            backgroundColor: marked ? theme.hp : 'transparent',
                            borderColor: theme.hp,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </RPGCard>

        {/* Card 2: Estatísticas Vitais de Combate & Condições */}
        <RPGCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              ⚔️ Parâmetros de Combate
            </Text>
            <RPGButton
              title="Condições (15) 🩸"
              variant="secondary"
              size="sm"
              onPress={() => setIsConditionsModalVisible(true)}
            />
          </View>

          <View style={styles.combatStatsGrid}>
            <View style={[styles.combatStatCard, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
              <Text style={[styles.combatStatLabel, { color: theme.armor }]}>🛡️ CLASSE ARMADURA</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>{character.armorClass}</Text>
              <Text style={[styles.combatStatSub, { color: theme.textSecondary }]}>CA Base</Text>
            </View>

            <Pressable
              onPress={handleRollInitiative}
              style={[styles.combatStatCard, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}
            >
              <Text style={[styles.combatStatLabel, { color: theme.stamina }]}>⚡ INICIATIVA</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>
                {formatModifier(character.initiative)}
              </Text>
              <Text style={[styles.combatStatSub, { color: theme.stamina, fontWeight: 'bold' }]}>
                Toque p/ Rolar 🎲
              </Text>
            </Pressable>

            <View style={[styles.combatStatCard, { backgroundColor: `${theme.mana}15`, borderColor: theme.mana }]}>
              <Text style={[styles.combatStatLabel, { color: theme.mana }]}>🏃 DESLOCAMENTO</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>{character.speed}m</Text>
              <Text style={[styles.combatStatSub, { color: theme.textSecondary }]}>Passada</Text>
            </View>

            <View style={[styles.combatStatCard, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
              <Text style={[styles.combatStatLabel, { color: theme.primary }]}>🎲 DADO DE VIDA</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>{character.hitDice}</Text>
              <Text style={[styles.combatStatSub, { color: theme.textSecondary }]}>
                Usado: {character.hitDiceUsed || 0}/{character.level}
              </Text>
            </View>
          </View>

          {/* Ações de Descanso (Regras D&D 5e) */}
          <View style={styles.restActionsRow}>
            <RPGButton
              title="Descanso Curto ☕"
              variant="secondary"
              icon="⛺"
              size="sm"
              onPress={handleShortRest}
              style={{ flex: 1 }}
            />
            <RPGButton
              title="Descanso Longo 🌙"
              variant="primary"
              icon="✨"
              size="sm"
              onPress={handleLongRest}
              style={{ flex: 1 }}
            />
          </View>
        </RPGCard>

        {/* Card 3: Histórico de Eventos da Rodada de Combate */}
        <RPGCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            📜 Histórico da Rodada de Combate
          </Text>
          <View style={styles.historyList}>
            {combatHistory.map((entry, index) => (
              <View
                key={index}
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: theme.backgroundInput,
                    borderLeftColor: index === 0 ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.historyText, { color: index === 0 ? theme.text : theme.textSecondary }]}>
                  {entry}
                </Text>
              </View>
            ))}
          </View>
        </RPGCard>

        {/* Card 4: Grade dos 6 Atributos & Modificadores */}
        <RPGCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              🎲 Atributos & Testes de Resistência
            </Text>
            <RPGBadge label={`Bônus Prof.: +${character.proficiencyBonus}`} variant="gold" size="sm" />
          </View>

          <View style={styles.attributesGrid}>
            {ATTRIBUTE_LIST.map((item) => {
              const score = character.attributes[item.key];
              const mod = calculateModifier(score);
              const isProficientSave = character.savingThrowProficiencies.includes(item.key);
              const saveBonus = mod + (isProficientSave ? character.proficiencyBonus : 0);

              return (
                <View
                  key={item.key}
                  style={[
                    styles.attributeBox,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderColor: isProficientSave ? theme.primary : theme.border,
                      borderWidth: isProficientSave ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.attrShortLabel, { color: isProficientSave ? theme.primary : theme.textSecondary }]}>
                    {item.short} {isProficientSave ? '⭐' : ''}
                  </Text>
                  <Text style={[styles.attrScoreText, { color: theme.text }]}>{score}</Text>
                  <View
                    style={[
                      styles.attrModChip,
                      { backgroundColor: `${theme.primary}20`, borderColor: theme.primary },
                    ]}
                  >
                    <Text style={[styles.attrModText, { color: theme.primary }]}>
                      {formatModifier(mod)}
                    </Text>
                  </View>
                  <Text style={[styles.attrSaveLabel, { color: theme.textSecondary }]}>
                    TR: <Text style={{ color: theme.text, fontWeight: 'bold' }}>{formatModifier(saveBonus)}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
        </RPGCard>

        {/* Card 5: Atalhos para as Sub-Telas da Ficha do Herói (Telas 7 a 11) */}
        <RPGCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            🗺️ Seções Detalhadas da Ficha
          </Text>
          <Text style={[styles.subSectionsDesc, { color: theme.textSecondary }]}>
            Navegue pelos módulos de perícias, magias, inventário e histórico:
          </Text>

          <View style={styles.subSectionsList}>
            <RPGButton
              title="7. Perícias & Salvaguardas (18 Perícias)"
              variant="secondary"
              icon="🎯"
              onPress={() => router.push(`/character/${character.id}/skills` as any)}
              style={styles.subBtn}
            />
            <RPGButton
              title="8. Grimório & Magias (Espaços & Círculos)"
              variant="secondary"
              icon="🔮"
              onPress={() => router.push(`/character/${character.id}/spells` as any)}
              style={styles.subBtn}
            />
            <RPGButton
              title="9. Inventário & Mochila de Aventura"
              variant="secondary"
              icon="🎒"
              onPress={() => router.push(`/character/${character.id}/inventory` as any)}
              style={styles.subBtn}
            />
            <RPGButton
              title="10. Biografia, Traços & Notas"
              variant="secondary"
              icon="📜"
              onPress={() => router.push(`/character/${character.id}/bio` as any)}
              style={styles.subBtn}
            />
            <RPGButton
              title="11. Rolador de Dados Integrado"
              variant="primary"
              icon="🎲"
              onPress={() => router.push(`/character/${character.id}/dice` as any)}
              style={styles.subBtn}
            />
            <RPGButton
              title="📦 Backup: Exportar Ficha (JSON)"
              variant="secondary"
              icon="💾"
              onPress={() => {
                const json = exportCharacterAsJson(character.id);
                if (json) {
                  Alert.alert(
                    `📦 Backup: ${character.name}`,
                    `Ficha serializada com sucesso (${json.length} caracteres)!\n\nAcesse Configurações no menu principal para exportar/importar fichas completas.`
                  );
                }
              }}
              style={styles.subBtn}
            />
          </View>
        </RPGCard>

        {/* Botão de Retorno */}
        <View style={{ alignItems: 'center', marginTop: Spacing.xs }}>
          <RPGButton
            title="Voltar ao Salão dos Aventureiros"
            variant="ghost"
            icon="🛡️"
            onPress={() => router.replace('/characters' as any)}
          />
        </View>
      </ScrollView>

      {/* Modal 1: Calculadora de Dano & Cura */}
      <Modal
        visible={isDamageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDamageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              💥 Calculadora de Combate
            </Text>

            {/* Modos: Dano / Cura / Temp */}
            <View style={styles.modalModeRow}>
              <Pressable
                onPress={() => setCalcMode('damage')}
                style={[
                  styles.modeTab,
                  {
                    backgroundColor: calcMode === 'damage' ? theme.hp : theme.backgroundInput,
                    borderColor: theme.hp,
                  },
                ]}
              >
                <Text style={[styles.modeTabText, { color: calcMode === 'damage' ? '#FFF' : theme.text }]}>
                  ⚔️ Dano
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCalcMode('heal')}
                style={[
                  styles.modeTab,
                  {
                    backgroundColor: calcMode === 'heal' ? theme.healing : theme.backgroundInput,
                    borderColor: theme.healing,
                  },
                ]}
              >
                <Text style={[styles.modeTabText, { color: calcMode === 'heal' ? '#FFF' : theme.text }]}>
                  ✨ Cura
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCalcMode('temp')}
                style={[
                  styles.modeTab,
                  {
                    backgroundColor: calcMode === 'temp' ? theme.mana : theme.backgroundInput,
                    borderColor: theme.mana,
                  },
                ]}
              >
                <Text style={[styles.modeTabText, { color: calcMode === 'temp' ? '#FFF' : theme.text }]}>
                  🛡️ PV Temp
                </Text>
              </Pressable>
            </View>

            {/* Input Numérico */}
            <View style={styles.modalInputSection}>
              <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>
                Quantidade de Pontos:
              </Text>
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Ex: 14"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                style={[
                  styles.modalTextInput,
                  {
                    backgroundColor: theme.backgroundInput,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />

              {/* Botões rápidos de valor */}
              <View style={styles.quickValueRow}>
                {[5, 10, 15, 20, 30].map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => setCustomAmount(String(v))}
                    style={[styles.quickValueChip, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}
                  >
                    <Text style={[styles.quickValueText, { color: theme.text }]}>+{v}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Opções de Dano: Multiplicador & Tipo */}
            {calcMode === 'damage' ? (
              <View style={{ gap: Spacing.xs }}>
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary }]}>
                  Modificador de Resistência:
                </Text>
                <View style={styles.multipliersRow}>
                  <Pressable
                    onPress={() => setDamageMultiplier(1)}
                    style={[
                      styles.multiplierChip,
                      {
                        backgroundColor: damageMultiplier === 1 ? theme.primary : theme.backgroundInput,
                        borderColor: damageMultiplier === 1 ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.multiplierText, { color: damageMultiplier === 1 ? '#1A140B' : theme.text }]}>
                      Normal (1x)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDamageMultiplier(0.5)}
                    style={[
                      styles.multiplierChip,
                      {
                        backgroundColor: damageMultiplier === 0.5 ? theme.primary : theme.backgroundInput,
                        borderColor: damageMultiplier === 0.5 ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.multiplierText, { color: damageMultiplier === 0.5 ? '#1A140B' : theme.text }]}>
                      Resistência (½)
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDamageMultiplier(2)}
                    style={[
                      styles.multiplierChip,
                      {
                        backgroundColor: damageMultiplier === 2 ? theme.primary : theme.backgroundInput,
                        borderColor: damageMultiplier === 2 ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.multiplierText, { color: damageMultiplier === 2 ? '#1A140B' : theme.text }]}>
                      Vulnerável (2x)
                    </Text>
                  </Pressable>
                </View>

                {/* Tipo de dano */}
                <Text style={[styles.modalInputLabel, { color: theme.textSecondary, marginTop: 4 }]}>
                  Tipo de Dano:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.damageTypeScroll}>
                  {DAMAGE_TYPES.map((dt) => {
                    const isSelected = selectedDamageType === dt.type;
                    return (
                      <Pressable
                        key={dt.type}
                        onPress={() => setSelectedDamageType(dt.type)}
                        style={[
                          styles.damageTypeChip,
                          {
                            backgroundColor: isSelected ? theme.hp : theme.backgroundInput,
                            borderColor: isSelected ? theme.hp : theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.damageTypeText, { color: isSelected ? '#FFF' : theme.text }]}>
                          {dt.icon} {dt.type}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Ações do Modal */}
            <View style={styles.modalButtonsRow}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsDamageModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title={
                  calcMode === 'damage'
                    ? 'Aplicar Dano 💥'
                    : calcMode === 'heal'
                    ? 'Aplicar Cura ✨'
                    : 'Adicionar PV Temp 🛡️'
                }
                variant={calcMode === 'damage' ? 'danger' : 'primary'}
                onPress={handleApplyCalculator}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Seletor de Condições de Combate */}
      <Modal
        visible={isConditionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsConditionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%', backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              🩸 Condições de Combate (D&D 5e)
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Toque para ativar ou remover estados do aventureiro:
            </Text>

            <ScrollView style={{ marginVertical: Spacing.sm }}>
              <View style={{ gap: Spacing.xs }}>
                {ALL_CONDITIONS.map((cond) => {
                  const isChecked = activeConditions.includes(cond.name);
                  return (
                    <Pressable
                      key={cond.name}
                      onPress={() => toggleCondition(character.id, cond.name)}
                      style={[
                        styles.conditionRowItem,
                        {
                          backgroundColor: isChecked ? `${theme.hp}15` : theme.backgroundInput,
                          borderColor: isChecked ? theme.hp : theme.border,
                        },
                      ]}
                    >
                      <Text style={styles.conditionRowIcon}>{cond.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.conditionRowName, { color: isChecked ? theme.hp : theme.text }]}>
                          {cond.name} {isChecked ? '✔' : ''}
                        </Text>
                        <Text style={[styles.conditionRowDesc, { color: theme.textSecondary }]}>
                          {cond.desc}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <RPGButton
              title="Concluir e Voltar"
              variant="primary"
              onPress={() => setIsConditionsModalVisible(false)}
            />
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
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
  },
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  heroAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: {
    fontSize: 30,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  heroTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroDetails: {
    fontSize: 11,
    lineHeight: 15,
  },
  inspirationButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 2,
  },
  inspirationText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  conditionsBanner: {
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  conditionsBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionsBannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  conditionsManageLink: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  conditionTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activeConditionChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  activeConditionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  card: {
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
  hpActionsSection: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  hpActionColumn: {
    flex: 1,
    gap: 4,
  },
  actionColTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hpButtonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tempHpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  tempHpLabel: {
    fontSize: 11,
  },
  deathSavesContainer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  deathSavesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deathSavesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deathSavesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveColText: {
    fontSize: 11,
    fontWeight: '600',
  },
  circlesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  saveCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  combatStatsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  combatStatCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  combatStatLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  combatStatVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  combatStatSub: {
    fontSize: 8,
  },
  restActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  historyList: {
    gap: 6,
  },
  historyItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
  },
  historyText: {
    fontSize: 11,
    lineHeight: 16,
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  attributeBox: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 3,
  },
  attrShortLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  attrScoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attrModChip: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  attrModText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  attrSaveLabel: {
    fontSize: 9,
    marginTop: 2,
  },
  subSectionsDesc: {
    fontSize: 12,
    marginTop: -2,
    marginBottom: 4,
  },
  subSectionsList: {
    gap: 6,
  },
  subBtn: {
    width: '100%',
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
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
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
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalModeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalInputSection: {
    gap: 6,
    marginTop: 4,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalTextInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickValueRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  quickValueChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  quickValueText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  multipliersRow: {
    flexDirection: 'row',
    gap: 6,
  },
  multiplierChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  multiplierText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  damageTypeScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  damageTypeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  damageTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  conditionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  conditionRowIcon: {
    fontSize: 22,
  },
  conditionRowName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  conditionRowDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
});
