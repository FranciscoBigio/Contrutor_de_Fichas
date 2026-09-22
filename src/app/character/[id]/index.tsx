import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
  RPGHpBar,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import {
  Attributes,
  calculateModifier,
  formatModifier,
} from '@/types/character';

const ATTRIBUTE_LIST: { key: keyof Attributes; short: string; full: string }[] = [
  { key: 'strength', short: 'FOR', full: 'Força' },
  { key: 'dexterity', short: 'DES', full: 'Destreza' },
  { key: 'constitution', short: 'CON', full: 'Constituição' },
  { key: 'intelligence', short: 'INT', full: 'Inteligência' },
  { key: 'wisdom', short: 'SAB', full: 'Sabedoria' },
  { key: 'charisma', short: 'CAR', full: 'Carisma' },
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
    shortRest,
    longRest,
    updateCharacter,
  } = useCharacters();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Feedback local de ação executada (Aula 3, Slide 12 - Estado Local)
  const [combatLog, setCombatLog] = useState<string>('');

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

  const handleApplyDamage = async (amount: number) => {
    await modifyHp(character.id, -amount);
    setCombatLog(`⚔️ ${character.name} sofreu ${amount} de dano!`);
  };

  const handleApplyHeal = async (amount: number) => {
    await modifyHp(character.id, amount);
    setCombatLog(`✨ ${character.name} recuperou ${amount} PV!`);
  };

  const handleAddTempHp = async (amount: number) => {
    await modifyTempHp(character.id, (character.tempHp || 0) + amount);
    setCombatLog(`🛡️ +${amount} PV Temporário adicionado!`);
  };

  const handleClearTempHp = async () => {
    await modifyTempHp(character.id, 0);
    setCombatLog('🛡️ PV Temporário zerado.');
  };

  const handleShortRest = async () => {
    await shortRest(character.id);
    Alert.alert('☕ Descanso Curto Concluído', `${character.name} recuperou parte de seus pontos de vida e fôlego de batalha!`);
    setCombatLog('☕ Descanso Curto realizado com sucesso.');
  };

  const handleLongRest = async () => {
    await longRest(character.id);
    Alert.alert('⛺ Descanso Longo Concluído', `${character.name} teve seus PVs restaurados ao máximo, dados de vida e espaços de magia renovados!`);
    setCombatLog('⛺ Descanso Longo realizado (PV total e magias restauradas).');
  };

  const toggleDeathSave = async (type: 'successes' | 'failures', index: number) => {
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
          <RPGBadge label="TELA 6 DE 11 • HUB 2 - FICHA GERAL & COMBATE" variant="gold" size="sm" />
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
        </View>

        {/* Log de Combate Instantâneo */}
        {combatLog ? (
          <View style={[styles.logBanner, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
            <Text style={[styles.logText, { color: theme.text }]}>{combatLog}</Text>
          </View>
        ) : null}

        {/* Card 1: Painel Dinâmico de Pontos de Vida (PV) */}
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
            height={14}
            style={{ marginVertical: Spacing.xs }}
          />

          {/* Botões Rápidos de Dano e Cura */}
          <View style={styles.hpActionsSection}>
            <View style={styles.hpActionColumn}>
              <Text style={[styles.actionColTitle, { color: theme.hp }]}>Dano Sofrido</Text>
              <View style={styles.hpButtonRow}>
                <RPGButton
                  title="-1"
                  variant="danger"
                  size="sm"
                  onPress={() => handleApplyDamage(1)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="-5"
                  variant="danger"
                  size="sm"
                  onPress={() => handleApplyDamage(5)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="-10"
                  variant="danger"
                  size="sm"
                  onPress={() => handleApplyDamage(10)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <View style={styles.hpActionColumn}>
              <Text style={[styles.actionColTitle, { color: theme.healing }]}>Cura Recebida</Text>
              <View style={styles.hpButtonRow}>
                <RPGButton
                  title="+1"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleApplyHeal(1)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="+5"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleApplyHeal(5)}
                  style={{ flex: 1 }}
                />
                <RPGButton
                  title="+10"
                  variant="secondary"
                  size="sm"
                  onPress={() => handleApplyHeal(10)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>

          {/* PV Temporário */}
          <View style={[styles.tempHpRow, { backgroundColor: theme.backgroundInput }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tempHpLabel, { color: theme.textSecondary }]}>
                PV Temporário Atual: <Text style={{ color: theme.mana, fontWeight: 'bold' }}>+{character.tempHp || 0}</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <RPGButton
                title="+5 TEMP"
                variant="ghost"
                size="sm"
                onPress={() => handleAddTempHp(5)}
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

          {/* Testes contra a Morte (Death Saves) */}
          <View style={styles.deathSavesContainer}>
            <Text style={[styles.deathSavesTitle, { color: theme.text }]}>
              💀 Salvaguardas contra a Morte (0 PV)
            </Text>
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

        {/* Card 2: Estatísticas Vitais de Combate */}
        <RPGCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            ⚔️ Parâmetros de Combate
          </Text>

          <View style={styles.combatStatsGrid}>
            <View style={[styles.combatStatCard, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
              <Text style={[styles.combatStatLabel, { color: theme.armor }]}>🛡️ CLASSE ARMADURA</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>{character.armorClass}</Text>
              <Text style={[styles.combatStatSub, { color: theme.textSecondary }]}>CA Base</Text>
            </View>

            <View style={[styles.combatStatCard, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}>
              <Text style={[styles.combatStatLabel, { color: theme.stamina }]}>⚡ INICIATIVA</Text>
              <Text style={[styles.combatStatVal, { color: theme.text }]}>
                {formatModifier(character.initiative)}
              </Text>
              <Text style={[styles.combatStatSub, { color: theme.textSecondary }]}>Mod DES</Text>
            </View>

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

        {/* Card 3: Grade dos 6 Atributos & Modificadores */}
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

        {/* Card 4: Atalhos para as Sub-Telas da Ficha do Herói (Telas 7 a 11) */}
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
  logBanner: {
    padding: Spacing.xs + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  logText: {
    fontSize: 11,
    fontWeight: '600',
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
});
