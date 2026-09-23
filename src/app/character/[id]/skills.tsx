import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
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
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import {
  Attributes,
  calculateModifier,
  formatModifier,
  Skill,
  SkillName,
} from '@/types/character';

interface SkillDefinition {
  name: SkillName;
  attribute: keyof Attributes;
  attrShort: string;
  icon: string;
  desc: string;
}

const CANONICAL_SKILLS: SkillDefinition[] = [
  { name: 'Acrobacia', attribute: 'dexterity', attrShort: 'DES', icon: '🤸', desc: 'Equilíbrio, saltos e piruetas em superfícies estreitas.' },
  { name: 'Adestrar Animais', attribute: 'wisdom', attrShort: 'SAB', icon: '🐎', desc: 'Acalmar montarias e intuir intenções de feras selvagens.' },
  { name: 'Arcanismo', attribute: 'intelligence', attrShort: 'INT', icon: '🔮', desc: 'Conhecimento sobre feitiços, itens mágicos e planos de existência.' },
  { name: 'Atletismo', attribute: 'strength', attrShort: 'FOR', icon: '🏋️', desc: 'Escalar, nadar em correntezas e saltar longas distâncias.' },
  { name: 'Enganação', attribute: 'charisma', attrShort: 'CAR', icon: '🎭', desc: 'Disfarces, mentiras convincentes e blefes sociais.' },
  { name: 'História', attribute: 'intelligence', attrShort: 'INT', icon: '📜', desc: 'Lendas ancestrais, guerras passadas, impérios e genealogias.' },
  { name: 'Intuição', attribute: 'wisdom', attrShort: 'SAB', icon: '👁️', desc: 'Detectar mentiras, ler linguagem corporal e pressentir emboscadas.' },
  { name: 'Intimidação', attribute: 'charisma', attrShort: 'CAR', icon: '💀', desc: 'Ameaças verbais ou presença imponente para coagir alvos.' },
  { name: 'Investigação', attribute: 'intelligence', attrShort: 'INT', icon: '🔍', desc: 'Encontrar pistas escondidas, deduzir mecanismos e armadilhas.' },
  { name: 'Medicina', attribute: 'wisdom', attrShort: 'SAB', icon: '🩺', desc: 'Estabilizar aliados agonizantes e diagnosticar venenos ou doenças.' },
  { name: 'Natureza', attribute: 'intelligence', attrShort: 'INT', icon: '🌿', desc: 'Fauna, flora, ciclos climáticos e geografia selvagem.' },
  { name: 'Percepção', attribute: 'wisdom', attrShort: 'SAB', icon: '👂', desc: 'Ouvir passos no escuro, avistar emboscadas e sentir odores.' },
  { name: 'Atuação', attribute: 'charisma', attrShort: 'CAR', icon: '🪕', desc: 'Danças, canções, poesia épica e entreter audiências.' },
  { name: 'Persuasão', attribute: 'charisma', attrShort: 'CAR', icon: '💬', desc: 'Diplomacia, acordos éticos, oratória e liderança pacífica.' },
  { name: 'Religião', attribute: 'intelligence', attrShort: 'INT', icon: '⛪', desc: 'Divindades sagradas, ritos, cultos antigos e mortos-vivos.' },
  { name: 'Prestidigitação', attribute: 'dexterity', attrShort: 'DES', icon: '🧤', desc: 'Punga, esconder pequenos objetos nas mangas e truques ágeis.' },
  { name: 'Furtividade', attribute: 'dexterity', attrShort: 'DES', icon: '🥷', desc: 'Mover-se em silêncio absoluto e ocultar-se nas sombras.' },
  { name: 'Sobrevivência', attribute: 'wisdom', attrShort: 'SAB', icon: '🏕️', desc: 'Rastrear pegadas, caçar caça selvagem e orientar-se no ermo.' },
];

const ATTRIBUTE_FILTERS: { key: string; label: string }[] = [
  { key: 'Todas', label: 'Todas' },
  { key: 'strength', label: 'FOR' },
  { key: 'dexterity', label: 'DES' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'SAB' },
  { key: 'charisma', label: 'CAR' },
];

const SAVING_THROW_LIST: { key: keyof Attributes; short: string; full: string }[] = [
  { key: 'strength', short: 'FOR', full: 'Força' },
  { key: 'dexterity', short: 'DES', full: 'Destreza' },
  { key: 'constitution', short: 'CON', full: 'Constituição' },
  { key: 'intelligence', short: 'INT', full: 'Inteligência' },
  { key: 'wisdom', short: 'SAB', full: 'Sabedoria' },
  { key: 'charisma', short: 'CAR', full: 'Carisma' },
];

export default function CharacterSkillsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getCharacterById, activeCharacter, updateCharacter } = useCharacters();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Estados de Busca e Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAttrFilter, setSelectedAttrFilter] = useState<string>('Todas');
  const [onlyProficientFilter, setOnlyProficientFilter] = useState<boolean>(false);

  // Modal de Rolagem d20
  const [isRollModalVisible, setIsRollModalVisible] = useState<boolean>(false);
  const [rollTitle, setRollTitle] = useState<string>('');
  const [rollBonus, setRollBonus] = useState<number>(0);
  const [rollMode, setRollMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [rollResult, setRollResult] = useState<{
    die1: number;
    die2?: number;
    chosenDie: number;
    total: number;
    isCritical: boolean;
    isFumble: boolean;
  } | null>(null);

  // Helper de cálculo de perícia com memoização
  const getSkillData = useCallback(
    (skillName: SkillName, attrKey: keyof Attributes) => {
      if (!character) return { isProf: false, isExp: false, attrMod: 0, total: 0 };
      const found = character.skills?.find((s) => s.name === skillName);
      const attrScore = character.attributes[attrKey] || 10;
      const attrMod = calculateModifier(attrScore);
      const pBonus = character.proficiencyBonus || 2;

      const isProf = found ? found.proficient : false;
      const isExp = found ? !!found.expertise : false;

      const total = attrMod + (isExp ? pBonus * 2 : isProf ? pBonus : 0);
      return { isProf, isExp, attrMod, total };
    },
    [character]
  );

  // Filtragem das 18 Perícias (Hook chamado incondicionalmente no topo)
  const filteredSkills = useMemo(() => {
    return CANONICAL_SKILLS.filter((s) => {
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAttr =
        selectedAttrFilter === 'Todas' || s.attribute === selectedAttrFilter;

      const skillData = getSkillData(s.name, s.attribute);
      const matchProf = onlyProficientFilter ? skillData.isProf || skillData.isExp : true;

      return matchQuery && matchAttr && matchProf;
    });
  }, [searchQuery, selectedAttrFilter, onlyProficientFilter, getSkillData]);

  if (!character) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>⚠️</Text>
          <Text style={[styles.notFoundTitle, { color: theme.text }]}>
            Herói Não Encontrado
          </Text>
          <RPGButton
            title="Voltar ao Salão"
            variant="primary"
            icon="🛡️"
            onPress={() => router.replace('/characters' as any)}
          />
        </View>
      </SafeAreaView>
    );
  }

  const profBonus = character.proficiencyBonus || 2;

  // Alterna Proficiência na Salvaguarda (Saving Throw)
  const handleToggleSavingThrow = async (attrKey: keyof Attributes) => {
    const isProf = character.savingThrowProficiencies.includes(attrKey);
    const updatedSaves = isProf
      ? character.savingThrowProficiencies.filter((k) => k !== attrKey)
      : [...character.savingThrowProficiencies, attrKey];

    await updateCharacter(character.id, { savingThrowProficiencies: updatedSaves });
  };

  // Cicla status da perícia: Normal -> Proficiente -> Maestria -> Normal
  const handleCycleSkillStatus = async (skillDef: SkillDefinition) => {
    const existingSkills = character.skills || [];
    const foundIndex = existingSkills.findIndex((s) => s.name === skillDef.name);

    let updatedSkills: Skill[] = [...existingSkills];

    if (foundIndex >= 0) {
      const current = existingSkills[foundIndex];
      if (current.proficient && !current.expertise) {
        // De Proficiente para Maestria (Expertise)
        updatedSkills[foundIndex] = {
          ...current,
          proficient: true,
          expertise: true,
        };
      } else if (current.expertise) {
        // De Maestria para Não Proficiente
        updatedSkills[foundIndex] = {
          ...current,
          proficient: false,
          expertise: false,
        };
      } else {
        // De Não Proficiente para Proficiente
        updatedSkills[foundIndex] = {
          ...current,
          proficient: true,
          expertise: false,
        };
      }
    } else {
      // Cria como Proficiente
      updatedSkills.push({
        name: skillDef.name,
        attribute: skillDef.attribute,
        proficient: true,
        expertise: false,
      });
    }

    await updateCharacter(character.id, { skills: updatedSkills });
  };

  // Abre Modal de Rolagem
  const openRollModal = (title: string, bonus: number) => {
    setRollTitle(title);
    setRollBonus(bonus);
    setRollResult(null);
    setRollMode('normal');
    setIsRollModalVisible(true);
  };

  // Executa rolagem de d20
  const executeRoll = () => {
    const d1 = Math.floor(Math.random() * 20) + 1;
    let chosen = d1;
    let d2: number | undefined;

    if (rollMode === 'advantage') {
      d2 = Math.floor(Math.random() * 20) + 1;
      chosen = Math.max(d1, d2);
    } else if (rollMode === 'disadvantage') {
      d2 = Math.floor(Math.random() * 20) + 1;
      chosen = Math.min(d1, d2);
    }

    const total = chosen + rollBonus;
    setRollResult({
      die1: d1,
      die2: d2,
      chosenDie: chosen,
      total,
      isCritical: chosen === 20,
      isFumble: chosen === 1,
    });
  };

  const passivePerception = 10 + getSkillData('Percepção', 'wisdom').total;
  const passiveInvestigation = 10 + getSkillData('Investigação', 'intelligence').total;
  const passiveInsight = 10 + getSkillData('Intuição', 'wisdom').total;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho do Aventureiro (Tela 7) */}
        <View style={styles.header}>
          <RPGBadge label="TELA 7 DE 11 • PERÍCIAS & SALVAGUARDAS (D&D 5e)" variant="gold" size="sm" />
          <View style={styles.heroIdentityRow}>
            <View style={[styles.heroAvatarBox, { backgroundColor: theme.backgroundCard, borderColor: theme.primary }]}>
              <Text style={styles.heroAvatar}>{character.avatarEmoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroName, { color: theme.text }]}>{character.name}</Text>
              <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
                {character.race} • {character.class} Nível {character.level}
              </Text>
            </View>
            <View style={[styles.profBonusBox, { backgroundColor: `${theme.primary}20`, borderColor: theme.primary }]}>
              <Text style={[styles.profBonusLabel, { color: theme.primary }]}>PROFICIÊNCIA</Text>
              <Text style={[styles.profBonusVal, { color: theme.text }]}>+{profBonus}</Text>
            </View>
          </View>
        </View>

        {/* Banner de Sentidos Passivos Canônicos */}
        <View style={styles.passiveRow}>
          <View style={[styles.passiveCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.passiveIcon}>👂</Text>
            <Text style={[styles.passiveVal, { color: theme.primary }]}>{passivePerception}</Text>
            <Text style={[styles.passiveLabel, { color: theme.textSecondary }]}>Percepção Passiva</Text>
          </View>
          <View style={[styles.passiveCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.passiveIcon}>🔍</Text>
            <Text style={[styles.passiveVal, { color: theme.mana }]}>{passiveInvestigation}</Text>
            <Text style={[styles.passiveLabel, { color: theme.textSecondary }]}>Investigação Passiva</Text>
          </View>
          <View style={[styles.passiveCard, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={styles.passiveIcon}>👁️</Text>
            <Text style={[styles.passiveVal, { color: theme.healing }]}>{passiveInsight}</Text>
            <Text style={[styles.passiveLabel, { color: theme.textSecondary }]}>Intuição Passiva</Text>
          </View>
        </View>

        {/* Seção 1: Salvaguardas (Testes de Resistência) */}
        <RPGCard variant="highlight" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              🛡️ Salvaguardas (Testes de Resistência)
            </Text>
            <RPGBadge label="6 ATRIBUTOS" variant="mana" size="sm" />
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Toque na estrela para treinar ou no dado para rolar o teste contra magias e armadilhas:
          </Text>

          <View style={styles.savesGrid}>
            {SAVING_THROW_LIST.map((item) => {
              const score = character.attributes[item.key] || 10;
              const mod = calculateModifier(score);
              const isProf = character.savingThrowProficiencies.includes(item.key);
              const totalSave = mod + (isProf ? profBonus : 0);

              return (
                <View
                  key={item.key}
                  style={[
                    styles.saveBox,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderColor: isProf ? theme.primary : theme.border,
                      borderWidth: isProf ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.saveBoxTop}>
                    <Pressable
                      onPress={() => handleToggleSavingThrow(item.key)}
                      style={styles.starTouch}
                    >
                      <Text style={[styles.starIcon, { color: isProf ? '#D4AF37' : theme.textSecondary }]}>
                        {isProf ? '★' : '☆'}
                      </Text>
                    </Pressable>
                    <Text style={[styles.saveShort, { color: isProf ? theme.primary : theme.text }]}>
                      {item.short}
                    </Text>
                  </View>

                  <Text style={[styles.saveTotal, { color: theme.text }]}>
                    {formatModifier(totalSave)}
                  </Text>

                  <Pressable
                    onPress={() => openRollModal(`Salvaguarda de ${item.full} (${item.short})`, totalSave)}
                    style={[styles.saveRollBtn, { backgroundColor: `${theme.primary}25` }]}
                  >
                    <Text style={[styles.saveRollBtnText, { color: theme.primary }]}>Rolar 🎲</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </RPGCard>

        {/* Seção 2: As 18 Perícias Canônicas de D&D 5e */}
        <RPGCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              🎯 18 Perícias de Aventureiro
            </Text>
            <RPGBadge label={`Exibindo ${filteredSkills.length} de 18`} variant="gold" size="sm" />
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Ciclo de status: Não Treinada ⚪ ➔ Proficiente 🟢 ➔ Maestria 🌟
          </Text>

          {/* Campo de Busca em Tempo Real */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar perícia por nome ou descrição..."
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.backgroundInput,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />

          {/* Filtros Horizontais por Atributo */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {ATTRIBUTE_FILTERS.map((filter) => {
              const isSelected = selectedAttrFilter === filter.key;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setSelectedAttrFilter(filter.key)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: isSelected ? '#1A140B' : theme.text }]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}

            {/* Toggle de Apenas Treinadas */}
            <Pressable
              onPress={() => setOnlyProficientFilter(!onlyProficientFilter)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: onlyProficientFilter ? theme.healing : theme.backgroundInput,
                  borderColor: onlyProficientFilter ? theme.healing : theme.border,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: onlyProficientFilter ? '#FFF' : theme.text }]}>
                {onlyProficientFilter ? '✔ Treinadas' : '⭐ Apenas Treinadas'}
              </Text>
            </Pressable>
          </ScrollView>

          {/* Lista das Perícias Filtradas */}
          <View style={styles.skillsList}>
            {filteredSkills.map((s) => {
              const { isProf, isExp, total } = getSkillData(s.name, s.attribute);

              return (
                <View
                  key={s.name}
                  style={[
                    styles.skillRowCard,
                    {
                      backgroundColor: theme.backgroundInput,
                      borderColor: isExp ? '#D4AF37' : isProf ? theme.healing : theme.border,
                      borderWidth: isExp ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.skillIcon}>{s.icon}</Text>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.skillHeaderLine}>
                      <Text style={[styles.skillName, { color: theme.text }]}>{s.name}</Text>
                      <RPGBadge label={s.attrShort} variant="neutral" size="sm" />
                    </View>
                    <Text style={[styles.skillDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {s.desc}
                    </Text>

                    {/* Ciclo de Status Clicável */}
                    <Pressable
                      onPress={() => handleCycleSkillStatus(s)}
                      style={styles.statusTouch}
                    >
                      {isExp ? (
                        <RPGBadge label="🌟 MAESTRIA (2x PROF)" variant="gold" size="sm" />
                      ) : isProf ? (
                        <RPGBadge label="🟢 PROFICIENTE" variant="hp" size="sm" />
                      ) : (
                        <RPGBadge label="⚪ NÃO TREINADA" variant="neutral" size="sm" />
                      )}
                    </Pressable>
                  </View>

                  {/* Bônus Total e Botão de Rolar */}
                  <View style={styles.skillActionCol}>
                    <Text style={[styles.skillTotalBonus, { color: isExp ? '#D4AF37' : isProf ? theme.primary : theme.text }]}>
                      {formatModifier(total)}
                    </Text>
                    <RPGButton
                      title="Rolar 🎲"
                      variant="secondary"
                      size="sm"
                      onPress={() => openRollModal(`Teste de ${s.name} (${s.attrShort})`, total)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </RPGCard>

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Voltar à Ficha de Combate"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}` as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Ir para Grimório (Tela 8) ➡️"
            variant="primary"
            onPress={() => router.push(`/character/${character.id}/spells` as any)}
            style={{ flex: 1.2 }}
          />
        </View>
      </ScrollView>

      {/* Modal de Rolagem Interativa com Vantagem / Desvantagem */}
      <Modal
        visible={isRollModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRollModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              🎲 {rollTitle}
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Bônus Aplicado: <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{formatModifier(rollBonus)}</Text>
            </Text>

            {/* Seletor de Modo de Rolagem */}
            <View style={styles.rollModeRow}>
              <Pressable
                onPress={() => setRollMode('normal')}
                style={[
                  styles.rollModeBtn,
                  {
                    backgroundColor: rollMode === 'normal' ? theme.primary : theme.backgroundInput,
                    borderColor: rollMode === 'normal' ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.rollModeBtnText, { color: rollMode === 'normal' ? '#1A140B' : theme.text }]}>
                  Normal (1d20)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRollMode('advantage')}
                style={[
                  styles.rollModeBtn,
                  {
                    backgroundColor: rollMode === 'advantage' ? theme.healing : theme.backgroundInput,
                    borderColor: rollMode === 'advantage' ? theme.healing : theme.border,
                  },
                ]}
              >
                <Text style={[styles.rollModeBtnText, { color: rollMode === 'advantage' ? '#FFF' : theme.text }]}>
                  Vantagem (2d20)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRollMode('disadvantage')}
                style={[
                  styles.rollModeBtn,
                  {
                    backgroundColor: rollMode === 'disadvantage' ? theme.hp : theme.backgroundInput,
                    borderColor: rollMode === 'disadvantage' ? theme.hp : theme.border,
                  },
                ]}
              >
                <Text style={[styles.rollModeBtnText, { color: rollMode === 'disadvantage' ? '#FFF' : theme.text }]}>
                  Desvantagem
                </Text>
              </Pressable>
            </View>

            {/* Resultado da Rolagem */}
            {rollResult ? (
              <View style={[styles.rollResultBox, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
                {rollResult.die2 !== undefined ? (
                  <Text style={[styles.rollDiceFormula, { color: theme.textSecondary }]}>
                    Dados: [{rollResult.die1}] e [{rollResult.die2}] ➔ Selecionado: {rollResult.chosenDie}
                  </Text>
                ) : (
                  <Text style={[styles.rollDiceFormula, { color: theme.textSecondary }]}>
                    d20 Rolado: {rollResult.die1} + Bônus ({formatModifier(rollBonus)})
                  </Text>
                )}

                <Text
                  style={[
                    styles.rollTotalText,
                    {
                      color: rollResult.isCritical
                        ? '#D4AF37'
                        : rollResult.isFumble
                        ? theme.hp
                        : theme.primary,
                    },
                  ]}
                >
                  Total: {rollResult.total}
                </Text>

                {rollResult.isCritical ? (
                  <Text style={[styles.critAlert, { color: '#D4AF37' }]}>
                    🎉 20 NATURAL! SUCESSO CRÍTICO EXTRAORDINÁRIO!
                  </Text>
                ) : rollResult.isFumble ? (
                  <Text style={[styles.critAlert, { color: theme.hp }]}>
                    💀 1 NATURAL! FALHA CRÍTICA DESASTROSA!
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* Botões de Ação */}
            <View style={styles.modalActionRow}>
              <RPGButton
                title="Fechar"
                variant="ghost"
                onPress={() => setIsRollModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title={rollResult ? 'Rolar Novamente 🎲' : 'Rolar Dados 🎲'}
                variant="primary"
                onPress={executeRoll}
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
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: {
    fontSize: 26,
  },
  heroName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  heroSub: {
    fontSize: 12,
  },
  profBonusBox: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  profBonusLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  profBonusVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  passiveRow: {
    flexDirection: 'row',
    gap: 6,
  },
  passiveCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  passiveIcon: {
    fontSize: 16,
  },
  passiveVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  passiveLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  card: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: -4,
  },
  savesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  saveBox: {
    width: '31%',
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: 4,
  },
  saveBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starTouch: {
    padding: 2,
  },
  starIcon: {
    fontSize: 14,
  },
  saveShort: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveRollBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  saveRollBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  filterScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  skillsList: {
    gap: 8,
    marginTop: 4,
  },
  skillRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  skillIcon: {
    fontSize: 22,
  },
  skillHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  skillDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  statusTouch: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  skillActionCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  skillTotalBonus: {
    fontSize: 17,
    fontWeight: 'bold',
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
  modalSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  rollModeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  rollModeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  rollModeBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  rollResultBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  rollDiceFormula: {
    fontSize: 12,
  },
  rollTotalText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  critAlert: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
