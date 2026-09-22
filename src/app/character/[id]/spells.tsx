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
import {
  Attributes,
  Spell,
} from '@/types/character';

const SPELL_SCHOOLS = [
  'Evocação',
  'Abjuração',
  'Conjuração',
  'Adivinhação',
  'Encantamento',
  'Ilusão',
  'Necromancia',
  'Transmutação',
];

export default function CharacterSpellsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const {
    getCharacterById,
    activeCharacter,
    consumeSpellSlot,
    restoreSpellSlot,
    restoreAllSpellSlots,
    togglePrepareSpell,
    addSpell,
    deleteSpell,
    initializeSpellcasting,
  } = useCharacters();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Estados de Busca e Filtro (Hooks chamados no topo)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | 'all'>('all');
  const [onlyPreparedFilter, setOnlyPreparedFilter] = useState<boolean>(false);

  // Modal para Adicionar Magia
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [newSpellName, setNewSpellName] = useState<string>('');
  const [newSpellLevel, setNewSpellLevel] = useState<number>(1);
  const [newSpellSchool, setNewSpellSchool] = useState<string>('Evocação');
  const [newSpellTime, setNewSpellTime] = useState<string>('1 Ação');
  const [newSpellRange, setNewSpellRange] = useState<string>('18 metros');
  const [newSpellComponents, setNewSpellComponents] = useState<string>('V, S');
  const [newSpellDuration, setNewSpellDuration] = useState<string>('Instantânea');
  const [newSpellDamage, setNewSpellDamage] = useState<string>('');
  const [newSpellDesc, setNewSpellDesc] = useState<string>('');

  // Atributo para Inicializar Magia em classes marciais
  const [initAbility, setInitAbility] = useState<keyof Attributes>('intelligence');

  // Filtragem de Magias com useMemo
  const filteredSpells = useMemo(() => {
    if (!character?.spellcasting) return [];
    return character.spellcasting.spells.filter((spell) => {
      const matchQuery =
        spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spell.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spell.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLevel =
        selectedLevelFilter === 'all' || spell.level === selectedLevelFilter;

      const matchPrepared = onlyPreparedFilter ? spell.prepared : true;

      return matchQuery && matchLevel && matchPrepared;
    });
  }, [searchQuery, selectedLevelFilter, onlyPreparedFilter, character]);

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

  // Ação de Conjurar Magia
  const handleCastSpell = async (spell: Spell) => {
    if (spell.level === 0) {
      Alert.alert(
        '✨ Truque Conjurado!',
        `${character.name} canalizou o truque ${spell.name} com maestria! Truques não consomem espaços de magia.`
      );
      return;
    }

    const slot = character.spellcasting?.slots.find((s) => s.level === spell.level);
    if (!slot) {
      Alert.alert('Sem Espaços', `Este herói não possui círculos de magia de nível ${spell.level}.`);
      return;
    }

    if (slot.used >= slot.total) {
      Alert.alert(
        'Espaços Esgotados! 🚫',
        `Você gastou todos os ${slot.total} espaços de magia de ${spell.level}º Círculo. É necessário realizar um Descanso Longo para recuperá-los.`
      );
      return;
    }

    await consumeSpellSlot(character.id, spell.level);
    Alert.alert(
      '🔮 Magia Conjurada!',
      `${character.name} conjurou ${spell.name} (${spell.level}º Círculo)!\nRestam ${slot.total - (slot.used + 1)} espaços disponíveis.`
    );
  };

  // Ação de Salvar Nova Magia
  const handleSaveNewSpell = async () => {
    if (!newSpellName.trim()) {
      Alert.alert('Nome Obrigatório', 'Informe o nome da magia a ser inscrita no grimório.');
      return;
    }

    await addSpell(character.id, {
      name: newSpellName.trim(),
      level: newSpellLevel,
      school: newSpellSchool,
      castingTime: newSpellTime,
      range: newSpellRange,
      components: newSpellComponents,
      duration: newSpellDuration,
      damageOrEffect: newSpellDamage.trim() || undefined,
      description: newSpellDesc.trim() || 'Sem descrição cadastrada.',
      prepared: true,
    });

    setNewSpellName('');
    setNewSpellDamage('');
    setNewSpellDesc('');
    setIsAddModalVisible(false);
    Alert.alert('Grimório Atualizado', `A magia ${newSpellName} foi inscrita com sucesso!`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho do Conjurador (Tela 8) */}
        <View style={styles.header}>
          <RPGBadge label="TELA 8 DE 11 • GRIMÓRIO & MAGIAS ARCANAS / DIVINAS" variant="gold" size="sm" />
          <View style={styles.heroIdentityRow}>
            <View style={[styles.heroAvatarBox, { backgroundColor: theme.backgroundCard, borderColor: theme.mana }]}>
              <Text style={styles.heroAvatar}>{character.avatarEmoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroName, { color: theme.text }]}>{character.name}</Text>
              <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
                {character.race} • {character.class} Nível {character.level}
              </Text>
            </View>

            {character.spellcasting ? (
              <View style={[styles.dcBadgeBox, { backgroundColor: `${theme.mana}20`, borderColor: theme.mana }]}>
                <Text style={[styles.dcBadgeLabel, { color: theme.mana }]}>CD MAGIA</Text>
                <Text style={[styles.dcBadgeVal, { color: theme.text }]}>{character.spellcasting.saveDc}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Caso o Herói Não Possua Grimório Ativo */}
        {!character.spellcasting ? (
          <RPGCard variant="highlight" style={styles.card}>
            <Text style={styles.awakeningIcon}>🔮</Text>
            <Text style={[styles.awakeningTitle, { color: theme.text }]}>
              Centelha Mágica Adormecida
            </Text>
            <Text style={[styles.awakeningDesc, { color: theme.textSecondary }]}>
              {character.name} é de uma linhagem ou classe ({character.class}) focada em combate físico. Você pode despertar suas habilidades arcanas ou divinas configurando seu atributo de conjuração:
            </Text>

            <View style={styles.abilitySelectorRow}>
              {(['intelligence', 'wisdom', 'charisma'] as (keyof Attributes)[]).map((ab) => {
                const label = ab === 'intelligence' ? 'INT (Mago)' : ab === 'wisdom' ? 'SAB (Clérigo/Druida)' : 'CAR (Bardo/Feiticeiro)';
                const isSelected = initAbility === ab;
                return (
                  <Pressable
                    key={ab}
                    onPress={() => setInitAbility(ab)}
                    style={[
                      styles.abilityChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.abilityChipText, { color: isSelected ? '#1A140B' : theme.text }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <RPGButton
              title="✨ Despertar Grimório de Magias"
              variant="primary"
              icon="📖"
              onPress={() => initializeSpellcasting(character.id, initAbility)}
              style={{ marginTop: Spacing.xs }}
            />
          </RPGCard>
        ) : (
          <>
            {/* Parâmetros Mágicos Principais */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={[styles.statVal, { color: theme.primary }]}>
                  +{character.spellcasting.attackBonus}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ataque Mágico</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>🛡️</Text>
                <Text style={[styles.statVal, { color: theme.mana }]}>
                  {character.spellcasting.saveDc}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>CD Salvaguarda</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>🧠</Text>
                <Text style={[styles.statVal, { color: theme.healing }]}>
                  {character.spellcasting.ability === 'intelligence'
                    ? 'INT'
                    : character.spellcasting.ability === 'wisdom'
                    ? 'SAB'
                    : 'CAR'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Atributo Chave</Text>
              </View>
            </View>

            {/* Painel de Espaços de Magia (Spell Slots Tracker) */}
            <RPGCard variant="highlight" style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  ⚡ Espaços de Magia (Spell Slots)
                </Text>
                <RPGButton
                  title="Recarregar Tudo 🌙"
                  variant="ghost"
                  size="sm"
                  onPress={() => restoreAllSpellSlots(character.id)}
                />
              </View>

              <View style={styles.slotsList}>
                {character.spellcasting.slots.map((slot) => {
                  const available = slot.total - slot.used;
                  return (
                    <View
                      key={slot.level}
                      style={[
                        styles.slotRow,
                        { backgroundColor: theme.backgroundInput, borderColor: theme.border },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slotLevelTitle, { color: theme.text }]}>
                          {slot.level}º Círculo
                        </Text>
                        <Text style={[styles.slotSub, { color: theme.textSecondary }]}>
                          {available} de {slot.total} disponíveis
                        </Text>
                      </View>

                      {/* Bolinhas de Slots */}
                      <View style={styles.slotDotsRow}>
                        {Array.from({ length: slot.total }).map((_, idx) => {
                          const isSpent = idx < slot.used;
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.slotDot,
                                {
                                  backgroundColor: isSpent ? 'transparent' : theme.mana,
                                  borderColor: theme.mana,
                                },
                              ]}
                            />
                          );
                        })}
                      </View>

                      {/* Ações de Slot */}
                      <View style={styles.slotBtnRow}>
                        <Pressable
                          onPress={() => consumeSpellSlot(character.id, slot.level)}
                          disabled={slot.used >= slot.total}
                          style={[
                            styles.slotActionBtn,
                            {
                              backgroundColor: slot.used >= slot.total ? 'transparent' : `${theme.hp}25`,
                              borderColor: theme.hp,
                            },
                          ]}
                        >
                          <Text style={[styles.slotActionText, { color: theme.hp }]}>Gastar</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => restoreSpellSlot(character.id, slot.level)}
                          disabled={slot.used <= 0}
                          style={[
                            styles.slotActionBtn,
                            {
                              backgroundColor: slot.used <= 0 ? 'transparent' : `${theme.healing}25`,
                              borderColor: theme.healing,
                            },
                          ]}
                        >
                          <Text style={[styles.slotActionText, { color: theme.healing }]}>+1</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </RPGCard>

            {/* Catálogo de Magias Conhecidas & Preparadas */}
            <RPGCard style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  📖 Grimório ({filteredSpells.length} Magias)
                </Text>
                <RPGButton
                  title="+ Nova Magia"
                  variant="primary"
                  size="sm"
                  onPress={() => setIsAddModalVisible(true)}
                />
              </View>

              {/* Busca em Tempo Real */}
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar magia por nome, escola ou efeito..."
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

              {/* Filtros Horizontais por Círculo */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <Pressable
                  onPress={() => setSelectedLevelFilter('all')}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedLevelFilter === 'all' ? theme.primary : theme.backgroundInput,
                      borderColor: selectedLevelFilter === 'all' ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: selectedLevelFilter === 'all' ? '#1A140B' : theme.text }]}>
                    Todas
                  </Text>
                </Pressable>

                {[0, 1, 2, 3, 4, 5].map((lvl) => {
                  const isSelected = selectedLevelFilter === lvl;
                  return (
                    <Pressable
                      key={lvl}
                      onPress={() => setSelectedLevelFilter(lvl)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.filterChipText, { color: isSelected ? '#1A140B' : theme.text }]}>
                        {lvl === 0 ? 'Truques (0)' : `${lvl}º Círculo`}
                      </Text>
                    </Pressable>
                  );
                })}

                <Pressable
                  onPress={() => setOnlyPreparedFilter(!onlyPreparedFilter)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: onlyPreparedFilter ? theme.healing : theme.backgroundInput,
                      borderColor: onlyPreparedFilter ? theme.healing : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: onlyPreparedFilter ? '#FFF' : theme.text }]}>
                    {onlyPreparedFilter ? '✔ Preparadas' : '⭐ Apenas Preparadas'}
                  </Text>
                </Pressable>
              </ScrollView>

              {/* Lista de Magias */}
              <View style={styles.spellsList}>
                {filteredSpells.map((spell) => (
                  <View
                    key={spell.id}
                    style={[
                      styles.spellCard,
                      {
                        backgroundColor: theme.backgroundInput,
                        borderColor: spell.prepared ? theme.mana : theme.border,
                        borderWidth: spell.prepared ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={styles.spellHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.spellName, { color: theme.text }]}>{spell.name}</Text>
                        <Text style={[styles.spellSchool, { color: theme.textSecondary }]}>
                          {spell.level === 0 ? 'Truque' : `${spell.level}º Círculo`} • {spell.school}
                        </Text>
                      </View>

                      {/* Botão de Preparo */}
                      <Pressable
                        onPress={() => togglePrepareSpell(character.id, spell.id)}
                        style={[
                          styles.prepChip,
                          {
                            backgroundColor: spell.prepared ? `${theme.mana}20` : 'transparent',
                            borderColor: spell.prepared ? theme.mana : theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.prepChipText, { color: spell.prepared ? theme.mana : theme.textSecondary }]}>
                          {spell.prepared ? '★ PREPARADA' : '☆ PREPARAR'}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Metadados da Magia */}
                    <View style={styles.spellMetaRow}>
                      <Text style={[styles.spellMetaItem, { color: theme.textSecondary }]}>
                        ⏱️ {spell.castingTime}
                      </Text>
                      <Text style={[styles.spellMetaItem, { color: theme.textSecondary }]}>
                        🎯 {spell.range}
                      </Text>
                      <Text style={[styles.spellMetaItem, { color: theme.textSecondary }]}>
                        ⏳ {spell.duration}
                      </Text>
                    </View>

                    {spell.damageOrEffect ? (
                      <View style={[styles.effectBox, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                        <Text style={[styles.effectText, { color: theme.primary }]}>
                          💥 Efeito / Dano: <Text style={{ fontWeight: 'bold' }}>{spell.damageOrEffect}</Text>
                        </Text>
                      </View>
                    ) : null}

                    <Text style={[styles.spellDesc, { color: theme.text }]}>{spell.description}</Text>

                    {/* Ações da Magia */}
                    <View style={styles.spellActionsRow}>
                      <RPGButton
                        title="Conjurar ✨"
                        variant="primary"
                        size="sm"
                        onPress={() => handleCastSpell(spell)}
                        style={{ flex: 1.5 }}
                      />
                      <RPGButton
                        title="Remover 🗑️"
                        variant="ghost"
                        size="sm"
                        onPress={() => deleteSpell(character.id, spell.id)}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </RPGCard>
          </>
        )}

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Perícias (Tela 7)"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}/skills` as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Inventário (Tela 9) ➡️"
            variant="primary"
            onPress={() => router.push(`/character/${character.id}/inventory` as any)}
            style={{ flex: 1.2 }}
          />
        </View>
      </ScrollView>

      {/* Modal para Adicionar Nova Magia */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              ✨ Inscrever Nova Magia
            </Text>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={{ gap: Spacing.xs }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nome da Magia:</Text>
                <TextInput
                  value={newSpellName}
                  onChangeText={setNewSpellName}
                  placeholder="Ex: Bola de Fogo"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Círculo (Nível):</Text>
                <View style={styles.levelSelectorRow}>
                  {[0, 1, 2, 3, 4, 5].map((lvl) => (
                    <Pressable
                      key={lvl}
                      onPress={() => setNewSpellLevel(lvl)}
                      style={[
                        styles.levelChip,
                        {
                          backgroundColor: newSpellLevel === lvl ? theme.primary : theme.backgroundInput,
                          borderColor: newSpellLevel === lvl ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.levelChipText, { color: newSpellLevel === lvl ? '#1A140B' : theme.text }]}>
                        {lvl === 0 ? 'Truque' : `${lvl}º`}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Escola Arcana:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {SPELL_SCHOOLS.map((school) => (
                    <Pressable
                      key={school}
                      onPress={() => setNewSpellSchool(school)}
                      style={[
                        styles.levelChip,
                        {
                          backgroundColor: newSpellSchool === school ? theme.mana : theme.backgroundInput,
                          borderColor: newSpellSchool === school ? theme.mana : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.levelChipText, { color: newSpellSchool === school ? '#FFF' : theme.text }]}>
                        {school}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Tempo & Alcance:</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    value={newSpellTime}
                    onChangeText={setNewSpellTime}
                    placeholder="Tempo (ex: 1 Ação)"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.modalInput, { flex: 1, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                  />
                  <TextInput
                    value={newSpellRange}
                    onChangeText={setNewSpellRange}
                    placeholder="Alcance (ex: 18m)"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.modalInput, { flex: 1, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                  />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Componentes & Duração:</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TextInput
                    value={newSpellComponents}
                    onChangeText={setNewSpellComponents}
                    placeholder="Componentes (ex: V, S, M)"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.modalInput, { flex: 1, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                  />
                  <TextInput
                    value={newSpellDuration}
                    onChangeText={setNewSpellDuration}
                    placeholder="Duração (ex: Instantânea)"
                    placeholderTextColor={theme.textSecondary}
                    style={[styles.modalInput, { flex: 1, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                  />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Dano ou Efeito Principal:</Text>
                <TextInput
                  value={newSpellDamage}
                  onChangeText={setNewSpellDamage}
                  placeholder="Ex: 8d6 Fogo (Área 6m)"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Descrição Completa:</Text>
                <TextInput
                  value={newSpellDesc}
                  onChangeText={setNewSpellDesc}
                  placeholder="Descreva o efeito da magia..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[styles.modalInput, { height: 70, backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsAddModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Inscrever no Grimório ✨"
                variant="primary"
                onPress={handleSaveNewSpell}
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
  dcBadgeBox: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  dcBadgeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  dcBadgeVal: {
    fontSize: 16,
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
  awakeningIcon: {
    fontSize: 44,
    textAlign: 'center',
    marginVertical: 4,
  },
  awakeningTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  awakeningDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  abilitySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: Spacing.xs,
    justifyContent: 'center',
  },
  abilityChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  abilityChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 16,
  },
  statVal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  slotsList: {
    gap: 8,
    marginTop: 4,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  slotLevelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  slotSub: {
    fontSize: 10,
  },
  slotDotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  slotDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  slotBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  slotActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  slotActionText: {
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
  spellsList: {
    gap: 10,
    marginTop: 4,
  },
  spellCard: {
    padding: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  spellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  spellName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  spellSchool: {
    fontSize: 11,
  },
  prepChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  prepChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  spellMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spellMetaItem: {
    fontSize: 10,
  },
  effectBox: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  effectText: {
    fontSize: 11,
  },
  spellDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  spellActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
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
  levelSelectorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  levelChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  levelChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
