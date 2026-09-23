import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  RPGHpBar,
  RPGInput,
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useCharacters } from '@/context/character-context';
import { useTheme } from '@/context/theme-context';
import { AVAILABLE_CLASSES } from '@/data/mock-characters';

export default function CharactersListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    characters,
    activeCharacter,
    setActiveCharacterId,
    deleteCharacter,
    resetToMock,
    loading,
  } = useCharacters();

  // Estados locais para busca e filtro de classes (Aula 3, Slide 12 - Estado Local)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Todas');

  // Filtragem dinâmica em tempo real
  const filteredCharacters = characters.filter((char) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      char.name.toLowerCase().includes(query) ||
      (char.title && char.title.toLowerCase().includes(query)) ||
      char.race.toLowerCase().includes(query) ||
      char.class.toLowerCase().includes(query);

    const matchesClass =
      selectedClass === 'Todas' || char.class === selectedClass;

    return matchesSearch && matchesClass;
  });

  const isFiltered = searchQuery.trim() !== '' || selectedClass !== 'Todas';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedClass('Todas');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Despedir Herói',
      `Tem certeza que deseja banir ${name} dos registros da Taverna?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Banir',
          style: 'destructive',
          onPress: async () => {
            await deleteCharacter(id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Cabeçalho do HUB */}
        <View style={styles.header}>
          <RPGBadge label="TELA 4 DE 11 • HUB 1 DE PERSONAGENS" variant="gold" size="sm" />
          <Text style={[styles.title, { color: theme.text }]}>
            ⚔️ Salão dos Aventureiros
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {user
              ? `Taverna de ${user.name} • ${characters.length} herói(s) registrados na guilda`
              : `Gerencie seus heróis, acompanhe os pontos de vida e selecione o personagem ativo`}
          </Text>
        </View>

        {/* Botão Principal de Criação de Ficha */}
        <RPGButton
          title="Forjar Novo Herói (Criar Ficha)"
          variant="primary"
          icon="✨"
          onPress={() => router.push('/create' as any)}
          style={styles.createBtn}
        />

        {/* Herói Atualmente Selecionado (Destaque) */}
        {activeCharacter ? (
          <RPGCard variant="highlight" style={styles.activeHeroCard}>
            <View style={styles.activeHeaderRow}>
              <View style={styles.activeBadgeContainer}>
                <RPGBadge label="HERÓI ATIVO DA SESSÃO" variant="gold" size="sm" icon="👑" />
              </View>
              <Text style={styles.activeEmoji}>{activeCharacter.avatarEmoji}</Text>
            </View>

            <View style={{ gap: 2 }}>
              <Text style={[styles.activeHeroName, { color: theme.text }]}>
                {activeCharacter.name}
              </Text>
              {activeCharacter.title ? (
                <Text style={[styles.activeHeroTitle, { color: theme.primary }]}>
                  {activeCharacter.title}
                </Text>
              ) : null}
              <Text style={[styles.activeHeroClass, { color: theme.textSecondary }]}>
                {activeCharacter.race} • {activeCharacter.class} Nível {activeCharacter.level}{' '}
                {activeCharacter.subclass ? `(${activeCharacter.subclass})` : ''}
              </Text>
            </View>

            {/* Barra de Vida Dinâmica */}
            <RPGHpBar
              current={activeCharacter.currentHp}
              max={activeCharacter.maxHp}
              temp={activeCharacter.tempHp}
              style={{ marginTop: Spacing.xs }}
            />

            {/* Ações do Herói Ativo */}
            <View style={styles.activeActionsRow}>
              <RPGButton
                title="Abrir Ficha de Combate"
                variant="primary"
                icon="⚔️"
                size="sm"
                onPress={() => router.push(`/character/${activeCharacter.id}` as any)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Rolar Dados"
                variant="secondary"
                icon="🎲"
                size="sm"
                onPress={() => router.push(`/character/${activeCharacter.id}/dice` as any)}
              />
            </View>
          </RPGCard>
        ) : null}

        {/* Seção de Busca em Tempo Real & Filtro de Classes (Commit 09) */}
        <View style={styles.searchFilterSection}>
          <RPGInput
            label="Buscar Aventureiro na Guilda"
            placeholder="Digite nome, classe, raça ou título..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon="🔍"
          />

          {/* Carrossel de Filtros Rápidos por Classe */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <Pressable
              onPress={() => setSelectedClass('Todas')}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedClass === 'Todas'
                      ? theme.primary
                      : theme.backgroundCard,
                  borderColor:
                    selectedClass === 'Todas'
                      ? theme.primary
                      : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      selectedClass === 'Todas'
                        ? '#1A140B'
                        : theme.text,
                    fontWeight:
                      selectedClass === 'Todas' ? 'bold' : 'normal',
                  },
                ]}
              >
                🛡️ Todas ({characters.length})
              </Text>
            </Pressable>

            {AVAILABLE_CLASSES.map((cls) => {
              const count = characters.filter((c) => c.class === cls.name).length;
              const isSelected = selectedClass === cls.name;
              return (
                <Pressable
                  key={cls.name}
                  onPress={() => setSelectedClass(cls.name)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.backgroundCard,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isSelected ? '#1A140B' : theme.text,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {cls.icon} {cls.name} {count > 0 ? `(${count})` : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Status dos Filtros */}
          <View style={styles.filterStatusRow}>
            <Text style={[styles.filterStatusText, { color: theme.textSecondary }]}>
              Exibindo <Text style={{ color: theme.text, fontWeight: 'bold' }}>{filteredCharacters.length}</Text> de {characters.length} heróis
            </Text>
            {isFiltered ? (
              <Pressable onPress={handleClearFilters}>
                <Text style={[styles.clearFilterText, { color: theme.hp }]}>
                  Limpar Filtros ✖
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Lista de Todos os Personagens */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📜 Registro de Heróis ({filteredCharacters.length})
            </Text>
            <RPGBadge label="ASYNCSTORAGE" variant="mana" size="sm" />
          </View>

          {loading ? (
            <RPGCard style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Consultando os tomos da guilda...</Text>
            </RPGCard>
          ) : characters.length === 0 ? (
            <RPGCard style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🛡️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Nenhum herói convocado ainda!
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                Forje um novo aventureiro ou restaure os heróis lendários do mock para testar a aplicação.
              </Text>
              <View style={styles.emptyBtnRow}>
                <RPGButton
                  title="Criar Herói"
                  variant="primary"
                  icon="✨"
                  size="sm"
                  onPress={() => router.push('/create' as any)}
                />
                <RPGButton
                  title="Restaurar Mock"
                  variant="secondary"
                  icon="🔄"
                  size="sm"
                  onPress={resetToMock}
                />
              </View>
            </RPGCard>
          ) : filteredCharacters.length === 0 ? (
            <RPGCard style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Nenhum herói encontrado!
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                Não encontramos aventureiros com o termo &quot;{searchQuery}&quot;{' '}
                {selectedClass !== 'Todas' ? `na classe ${selectedClass}` : ''}.
              </Text>
              <RPGButton
                title="Limpar Busca e Filtros"
                variant="secondary"
                icon="🔄"
                size="sm"
                onPress={handleClearFilters}
              />
            </RPGCard>
          ) : (
            filteredCharacters.map((char) => {
              const isActive = activeCharacter?.id === char.id;
              return (
                <RPGCard
                  key={char.id}
                  variant={isActive ? 'highlight' : 'default'}
                  style={[
                    styles.characterCard,
                    isActive && { borderColor: theme.primary, borderWidth: 1.5 },
                  ]}
                >
                  {/* Cabeçalho do Card */}
                  <View style={styles.charHeader}>
                    <View
                      style={[
                        styles.avatarBox,
                        {
                          backgroundColor: theme.backgroundInput,
                          borderColor: isActive ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={styles.avatarEmoji}>{char.avatarEmoji}</Text>
                    </View>

                    <View style={styles.charInfo}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.charName, { color: theme.text }]} numberOfLines={1}>
                          {char.name}
                        </Text>
                        {isActive ? (
                          <RPGBadge label="ATIVO" variant="gold" size="sm" />
                        ) : null}
                      </View>
                      <Text style={[styles.charClass, { color: theme.textSecondary }]}>
                        {char.race} • {char.class} Nv. {char.level}
                      </Text>
                      {char.title ? (
                        <Text style={[styles.charTitleBadge, { color: theme.primary }]}>
                          {char.title}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Barra de Vida */}
                  <RPGHpBar
                    current={char.currentHp}
                    max={char.maxHp}
                    temp={char.tempHp}
                    style={{ marginVertical: Spacing.xs }}
                  />

                  {/* Badges de Combate */}
                  <View style={styles.statsBadgesRow}>
                    <View style={[styles.statChip, { backgroundColor: `${theme.armor}15`, borderColor: theme.armor }]}>
                      <Text style={[styles.statChipLabel, { color: theme.armor }]}>🛡️ CA</Text>
                      <Text style={[styles.statChipValue, { color: theme.text }]}>{char.armorClass}</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: `${theme.stamina}15`, borderColor: theme.stamina }]}>
                      <Text style={[styles.statChipLabel, { color: theme.stamina }]}>⚡ INIC</Text>
                      <Text style={[styles.statChipValue, { color: theme.text }]}>
                        {char.initiative >= 0 ? `+${char.initiative}` : char.initiative}
                      </Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: `${theme.mana}15`, borderColor: theme.mana }]}>
                      <Text style={[styles.statChipLabel, { color: theme.mana }]}>🏃 DESL</Text>
                      <Text style={[styles.statChipValue, { color: theme.text }]}>{char.speed}m</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: `${theme.primary}15`, borderColor: theme.primary }]}>
                      <Text style={[styles.statChipLabel, { color: theme.primary }]}>🎲 DADO</Text>
                      <Text style={[styles.statChipValue, { color: theme.text }]}>{char.hitDice}</Text>
                    </View>
                  </View>

                  {/* Resumo dos 6 Atributos D&D */}
                  <View style={[styles.attributesPill, { backgroundColor: theme.backgroundInput }]}>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      FOR <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.strength}</Text>
                    </Text>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      DES <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.dexterity}</Text>
                    </Text>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      CON <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.constitution}</Text>
                    </Text>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      INT <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.intelligence}</Text>
                    </Text>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      SAB <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.wisdom}</Text>
                    </Text>
                    <Text style={[styles.attrText, { color: theme.textSecondary }]}>
                      CAR <Text style={{ color: theme.text, fontWeight: 'bold' }}>{char.attributes.charisma}</Text>
                    </Text>
                  </View>

                  {/* Botões de Ação do Card */}
                  <View style={styles.cardActionsRow}>
                    <RPGButton
                      title="Abrir Ficha"
                      variant="primary"
                      icon="📜"
                      size="sm"
                      onPress={() => router.push(`/character/${char.id}` as any)}
                      style={{ flex: 1.5 }}
                    />
                    {!isActive ? (
                      <RPGButton
                        title="Ativar"
                        variant="secondary"
                        icon="👑"
                        size="sm"
                        onPress={() => setActiveCharacterId(char.id)}
                        style={{ flex: 1 }}
                      />
                    ) : null}
                    <RPGButton
                      title="Banir"
                      variant="danger"
                      icon="🗑️"
                      size="sm"
                      onPress={() => handleDelete(char.id, char.name)}
                    />
                  </View>
                </RPGCard>
              );
            })
          )}
        </View>

        {/* Rodapé com Ação de Reset */}
        <View style={styles.footer}>
          <RPGButton
            title="Restaurar Personagens Padrão (Mock)"
            variant="ghost"
            icon="🔄"
            size="sm"
            onPress={resetToMock}
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
    gap: 4,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: Spacing.xs,
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
  createBtn: {
    width: '100%',
  },
  activeHeroCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBadgeContainer: {
    flexDirection: 'row',
  },
  activeEmoji: {
    fontSize: 32,
  },
  activeHeroName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeHeroTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeHeroClass: {
    fontSize: 12,
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  listSection: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  characterCard: {
    padding: Spacing.md,
    gap: 8,
  },
  charHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  charInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  charName: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  charClass: {
    fontSize: 12,
  },
  charTitleBadge: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsBadgesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statChip: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  statChipLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  statChipValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  attributesPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: Radius.sm,
  },
  attrText: {
    fontSize: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  searchFilterSection: {
    gap: Spacing.xs,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 12,
  },
  filterStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  filterStatusText: {
    fontSize: 11,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

