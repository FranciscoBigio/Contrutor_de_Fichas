import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
} from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useCharacters } from '@/context/character-context';
import { useSettings } from '@/context/settings-context';
import { useTheme } from '@/context/theme-context';
import {
  Coins,
  InventoryItem,
  ItemCategory,
} from '@/types/character';

const CATEGORIES: ('Todas' | ItemCategory)[] = [
  'Todas',
  'Arma',
  'Armadura',
  'Poção',
  'Pergaminho',
  'Equipamento',
  'Tesouro',
];

const RARITIES: ('Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário')[] = [
  'Comum',
  'Incomum',
  'Raro',
  'Muito Raro',
  'Lendário',
];

type SortField = 'name' | 'weight' | 'rarity' | 'quantity';
type SortDirection = 'asc' | 'desc';

const RARITY_WEIGHT: Record<string, number> = {
  'Lendário': 5,
  'Muito Raro': 4,
  'Raro': 3,
  'Incomum': 2,
  'Comum': 1,
};

export default function CharacterInventoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { settings } = useSettings();
  const {
    getCharacterById,
    activeCharacter,
    toggleEquipItem,
    addItem,
    removeItem,
    updateCoins,
    updateItemQuantity,
    modifyHp,
  } = useCharacters();

  const character = (id ? getCharacterById(id) : null) || activeCharacter;

  // Estados de Busca, Filtro e Ordenação Avançada
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [onlyEquippedFilter, setOnlyEquippedFilter] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Alternar campo ou direção de ordenação
  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Resetar filtros e busca
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setOnlyEquippedFilter(false);
    setSortField('name');
    setSortDirection('asc');
  };

  const isFilteredOrSorted =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'Todas' ||
    onlyEquippedFilter ||
    sortField !== 'name' ||
    sortDirection !== 'asc';

  // Modal para Adicionar Novo Item
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Equipamento');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [newItemWeight, setNewItemWeight] = useState<string>('1.0');
  const [newItemRarity, setNewItemRarity] = useState<
    'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário'
  >('Comum');
  const [newItemDamage, setNewItemDamage] = useState<string>('');
  const [newItemAcBonus, setNewItemAcBonus] = useState<string>('');
  const [newItemDescription, setNewItemDescription] = useState<string>('');

  // Modal para Ajustar Moedas
  const [isCoinsModalVisible, setIsCoinsModalVisible] = useState<boolean>(false);
  const [modalCp, setModalCp] = useState<string>('0');
  const [modalSp, setModalSp] = useState<string>('0');
  const [modalEp, setModalEp] = useState<string>('0');
  const [modalGp, setModalGp] = useState<string>('0');
  const [modalPp, setModalPp] = useState<string>('0');

  // Cálculos de Capacidade de Carga (Regras D&D 5e)
  const currentWeight = useMemo(() => {
    if (!character?.inventory) return 0;
    const total = character.inventory.reduce(
      (acc, item) => acc + (item.weight || 0) * (item.quantity || 1),
      0
    );
    return Math.round(total * 10) / 10;
  }, [character]);

  const maxCapacity = useMemo(() => {
    if (!character) return 100;
    // D&D 5e: FOR * 15 libras (~7.5 kg)
    return Math.round((character.attributes.strength || 10) * 7.5 * 10) / 10;
  }, [character]);

  const heavyEncumbrance = useMemo(() => {
    if (!character) return 50;
    // D&D 5e Heavy Encumbrance: FOR * 5 libras (~2.5 kg)
    return Math.round((character.attributes.strength || 10) * 2.5 * 10) / 10;
  }, [character]);

  // Cálculos de Moedas e Patrimônio
  const totalGoldValue = useMemo(() => {
    if (!character?.coins) return 0;
    const { cp, sp, ep, gp, pp } = character.coins;
    const total = cp * 0.01 + sp * 0.1 + ep * 0.5 + gp + pp * 10;
    return Math.round(total * 100) / 100;
  }, [character]);

  // Itens filtrados e ordenados com useMemo
  const filteredAndSortedInventory = useMemo(() => {
    if (!character?.inventory) return [];
    const list = character.inventory.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchEquipped = onlyEquippedFilter ? item.equipped : true;

      return matchQuery && matchCat && matchEquipped;
    });

    return [...list].sort((a, b) => {
      let diff = 0;
      if (sortField === 'name') {
        diff = a.name.localeCompare(b.name, 'pt-BR');
      } else if (sortField === 'weight') {
        const aWeight = (a.weight || 0) * (a.quantity || 1);
        const bWeight = (b.weight || 0) * (b.quantity || 1);
        diff = aWeight - bWeight;
      } else if (sortField === 'rarity') {
        const aR = RARITY_WEIGHT[a.rarity || 'Comum'] || 0;
        const bR = RARITY_WEIGHT[b.rarity || 'Comum'] || 0;
        diff = aR - bR;
      } else if (sortField === 'quantity') {
        diff = (a.quantity || 1) - (b.quantity || 1);
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
  }, [
    character,
    searchQuery,
    selectedCategory,
    onlyEquippedFilter,
    sortField,
    sortDirection,
  ]);

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

  // Helpers de Carga
  const isOverburdened = currentWeight > maxCapacity;
  const isHeavyEncumbered =
    settings.encumbranceRule && currentWeight > heavyEncumbrance && !isOverburdened;

  const capacityColor = isOverburdened
    ? theme.hp
    : isHeavyEncumbered
    ? theme.stamina
    : theme.healing;

  // Handler para Moedas Rápidas (+/-)
  const handleQuickCoinChange = async (coinKey: keyof Coins, delta: number) => {
    const current = character.coins[coinKey] || 0;
    const nextVal = Math.max(0, current + delta);
    const updatedCoins = {
      ...character.coins,
      [coinKey]: nextVal,
    };
    await updateCoins(character.id, updatedCoins);
  };

  // Abrir Modal de Moedas
  const openCoinsModal = () => {
    setModalCp(String(character.coins.cp || 0));
    setModalSp(String(character.coins.sp || 0));
    setModalEp(String(character.coins.ep || 0));
    setModalGp(String(character.coins.gp || 0));
    setModalPp(String(character.coins.pp || 0));
    setIsCoinsModalVisible(true);
  };

  // Salvar Moedas do Modal
  const saveCoinsFromModal = async () => {
    const nextCoins: Coins = {
      cp: Math.max(0, parseInt(modalCp, 10) || 0),
      sp: Math.max(0, parseInt(modalSp, 10) || 0),
      ep: Math.max(0, parseInt(modalEp, 10) || 0),
      gp: Math.max(0, parseInt(modalGp, 10) || 0),
      pp: Math.max(0, parseInt(modalPp, 10) || 0),
    };
    await updateCoins(character.id, nextCoins);
    setIsCoinsModalVisible(false);
  };

  // Rolar dano da arma
  const handleRollWeaponDamage = (weapon: InventoryItem) => {
    const dmg = weapon.damage || '1d8';
    const d8Roll = Math.floor(Math.random() * 8) + 1;
    const mod = Math.floor(((character.attributes.strength || 10) - 10) / 2);
    const total = Math.max(1, d8Roll + mod);

    Alert.alert(
      `⚔️ Ataque com ${weapon.name}`,
      `Fórmula: ${dmg}\nDado Rolado: ${d8Roll}\nModificador: ${mod >= 0 ? `+${mod}` : mod}\n\n💥 DANO TOTAL: ${total} pontos de dano!`,
      [{ text: 'Muito Bem!' }]
    );
  };

  // Usar poção
  const handleUsePotion = (item: InventoryItem) => {
    Alert.alert(
      `🧪 Usar ${item.name}`,
      `Deseja consumir 1 unidade de ${item.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Beber / Usar',
          onPress: async () => {
            await updateItemQuantity(character.id, item.id, -1);
            if (item.name.toLowerCase().includes('cura')) {
              const heal = Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 4) + 1 + 2;
              await modifyHp(character.id, heal);
              Alert.alert('✨ Poção Consumida!', `Você recuperou ${heal} Pontos de Vida (PV)!`);
            } else {
              Alert.alert('✨ Poção Consumida!', `${item.name} foi usada com sucesso.`);
            }
          },
        },
      ]
    );
  };

  // Adicionar novo item
  const handleAddNewItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Atenção', 'Informe o nome do item.');
      return;
    }

    const qty = Math.max(1, parseInt(newItemQuantity, 10) || 1);
    const weight = Math.max(0, parseFloat(newItemWeight.replace(',', '.')) || 0.1);
    const acBonus = newItemAcBonus ? parseInt(newItemAcBonus, 10) : undefined;

    await addItem(character.id, {
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: qty,
      weight,
      equipped: false,
      rarity: newItemRarity,
      damage: newItemDamage.trim() ? newItemDamage.trim() : undefined,
      armorClassBonus: acBonus,
      description: newItemDescription.trim() || 'Item aventureiro guardado na mochila.',
    });

    // Limpar formulário
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemWeight('1.0');
    setNewItemDamage('');
    setNewItemAcBonus('');
    setNewItemDescription('');
    setIsAddModalVisible(false);
  };

  // Ícone por categoria
  const getCategoryIcon = (cat: ItemCategory) => {
    switch (cat) {
      case 'Arma':
        return '⚔️';
      case 'Armadura':
        return '🛡️';
      case 'Poção':
        return '🧪';
      case 'Pergaminho':
        return '📜';
      case 'Equipamento':
        return '🎒';
      case 'Tesouro':
        return '💎';
      default:
        return '📦';
    }
  };

  // Cor por raridade
  const getRarityBadgeVariant = (
    rarity?: string
  ): 'gold' | 'hp' | 'arcane' | 'mana' | 'neutral' => {
    switch (rarity) {
      case 'Lendário':
        return 'gold';
      case 'Muito Raro':
        return 'hp';
      case 'Raro':
        return 'arcane';
      case 'Incomum':
        return 'mana';
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
        {/* Header do Personagem */}
        <RPGCard variant="elevated" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerTexts}>
              <Text style={[styles.characterName, { color: theme.text }]}>
                {character.name}
              </Text>
              <Text style={[styles.characterSub, { color: theme.textSecondary }]}>
                {character.race} • {character.class} • Nível {character.level}
              </Text>
            </View>
            <RPGBadge label="🎒 Mochila" variant="gold" size="md" />
          </View>
        </RPGCard>

        {/* Status de Carga e Capacidade D&D 5e */}
        <RPGCard variant="default" style={styles.encumbranceCard}>
          <View style={styles.encumbranceHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 18 }}>⚖️</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Capacidade de Carga
              </Text>
            </View>
            <RPGBadge
              label={
                isOverburdened
                  ? '⚠️ SOBRECARREGADO'
                  : isHeavyEncumbered
                  ? '🔶 CARGA PESADA'
                  : '🟢 CARGA LEVE'
              }
              variant={isOverburdened ? 'hp' : isHeavyEncumbered ? 'stamina' : 'neutral'}
              size="sm"
            />
          </View>

          <View style={styles.weightNumbersRow}>
            <Text style={[styles.weightCurrent, { color: capacityColor }]}>
              {currentWeight} <Text style={{ fontSize: 14, color: theme.textSecondary }}>kg</Text>
            </Text>
            <Text style={[styles.weightMax, { color: theme.textSecondary }]}>
              / {maxCapacity} kg máximo (FOR {character.attributes.strength})
            </Text>
          </View>

          {/* Barra de Progresso de Carga */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.round((currentWeight / maxCapacity) * 100))}%`,
                  backgroundColor: capacityColor,
                },
              ]}
            />
          </View>

          <Text style={[styles.encumbranceHint, { color: theme.textSecondary }]}>
            {isOverburdened
              ? 'Deslocamento reduzido em 6 metros e desvantagem em testes de atributos, ataques e salvaguardas de FOR, DES e CON.'
              : isHeavyEncumbered
              ? 'Deslocamento reduzido em 3 metros (Regra de Sobrecarga Opcional do D&D 5e).'
              : 'Seu aventureiro caminha com agilidade e passos firmes sem penalidades.'}
          </Text>
        </RPGCard>

        {/* Bolsa da Fortuna (Moedas D&D 5e) */}
        <RPGCard variant="elevated" style={styles.wealthCard}>
          <View style={styles.wealthHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20 }}>💰</Text>
              <View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  Bolsa da Fortuna
                </Text>
                <Text style={[styles.patrimonyText, { color: theme.textGold }]}>
                  Patrimônio: {totalGoldValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} PO
                </Text>
              </View>
            </View>

            <RPGButton
              title="✏️ Ajustar"
              variant="secondary"
              size="sm"
              onPress={openCoinsModal}
            />
          </View>

          {/* Grid com as 5 Moedas */}
          <View style={styles.coinsGrid}>
            {/* PC */}
            <View style={[styles.coinTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
              <Text style={styles.coinLabel}>🪙 PC (Cobre)</Text>
              <Text style={[styles.coinValue, { color: '#CD7F32' }]}>{character.coins.cp || 0}</Text>
              <View style={styles.coinControls}>
                <Pressable
                  onPress={() => handleQuickCoinChange('cp', -1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>-1</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickCoinChange('cp', 1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>+1</Text>
                </Pressable>
              </View>
            </View>

            {/* PP */}
            <View style={[styles.coinTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
              <Text style={styles.coinLabel}>🪙 PP (Prata)</Text>
              <Text style={[styles.coinValue, { color: '#C0C0C0' }]}>{character.coins.sp || 0}</Text>
              <View style={styles.coinControls}>
                <Pressable
                  onPress={() => handleQuickCoinChange('sp', -1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>-1</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickCoinChange('sp', 1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>+1</Text>
                </Pressable>
              </View>
            </View>

            {/* PE */}
            <View style={[styles.coinTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
              <Text style={styles.coinLabel}>🪙 PE (Electrum)</Text>
              <Text style={[styles.coinValue, { color: '#50C878' }]}>{character.coins.ep || 0}</Text>
              <View style={styles.coinControls}>
                <Pressable
                  onPress={() => handleQuickCoinChange('ep', -1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>-1</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickCoinChange('ep', 1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>+1</Text>
                </Pressable>
              </View>
            </View>

            {/* PO */}
            <View style={[styles.coinTile, { backgroundColor: theme.backgroundInput, borderColor: theme.primary }]}>
              <Text style={[styles.coinLabel, { color: theme.textGold, fontWeight: 'bold' }]}>🪙 PO (Ouro)</Text>
              <Text style={[styles.coinValue, { color: theme.textGold }]}>{character.coins.gp || 0}</Text>
              <View style={styles.coinControls}>
                <Pressable
                  onPress={() => handleQuickCoinChange('gp', -5)}
                  style={[styles.miniBtn, { borderColor: theme.primary }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>-5</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickCoinChange('gp', 5)}
                  style={[styles.miniBtn, { borderColor: theme.primary }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>+5</Text>
                </Pressable>
              </View>
            </View>

            {/* PL */}
            <View style={[styles.coinTile, { backgroundColor: theme.backgroundInput, borderColor: theme.border }]}>
              <Text style={styles.coinLabel}>🪙 PL (Platina)</Text>
              <Text style={[styles.coinValue, { color: '#E5E4E2' }]}>{character.coins.pp || 0}</Text>
              <View style={styles.coinControls}>
                <Pressable
                  onPress={() => handleQuickCoinChange('pp', -1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>-1</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickCoinChange('pp', 1)}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.miniBtnText, { color: theme.text }]}>+1</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </RPGCard>

        {/* Controles de Busca, Filtro e Ordenação Avançada */}
        <RPGCard variant="default" style={styles.filtersCard}>
          <View style={styles.searchRow}>
            <View
              style={[
                styles.searchInputWrapper,
                {
                  backgroundColor: theme.backgroundInput,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="🔍 Buscar item ou descrição..."
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.searchInput,
                  {
                    color: theme.text,
                  },
                ]}
              />
              {searchQuery.trim().length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  style={styles.searchClearBtn}
                  hitSlop={8}
                >
                  <Text style={[styles.searchClearBtnText, { color: theme.textSecondary }]}>✕</Text>
                </Pressable>
              )}
            </View>
            <RPGButton
              title="+ Item"
              variant="primary"
              size="sm"
              onPress={() => setIsAddModalVisible(true)}
            />
          </View>

          {/* Categorias horizontais */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundInput,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Toggle Apenas Equipados e Contador */}
          <View style={styles.equippedToggleRow}>
            <Pressable
              onPress={() => setOnlyEquippedFilter(!onlyEquippedFilter)}
              style={[
                styles.equippedToggleBtn,
                {
                  backgroundColor: onlyEquippedFilter ? `${theme.primary}25` : theme.backgroundInput,
                  borderColor: onlyEquippedFilter ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={{ fontSize: 13, color: theme.text }}>
                {onlyEquippedFilter ? '🛡️ Filtrando apenas Equipados' : '⚪ Ver Todos (Equipados + Mochila)'}
              </Text>
            </Pressable>
            <Text style={[styles.itemsCountText, { color: theme.textSecondary }]}>
              {filteredAndSortedInventory.length} de {character.inventory.length} itens
            </Text>
          </View>

          {/* Barra de Ordenação Avançada */}
          <View style={styles.sortSection}>
            <View style={styles.sortHeaderRow}>
              <Text style={[styles.sortSectionTitle, { color: theme.textSecondary }]}>
                ⚡ Ordenar Mochila:
              </Text>
              {isFilteredOrSorted && (
                <Pressable onPress={handleResetFilters} hitSlop={8}>
                  <Text style={[styles.resetFilterText, { color: theme.hp }]}>
                    ↺ Limpar Filtros
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.sortChipsRow}>
              {/* Nome */}
              <Pressable
                onPress={() => handleToggleSort('name')}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: sortField === 'name' ? `${theme.primary}25` : theme.backgroundInput,
                    borderColor: sortField === 'name' ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: sortField === 'name' ? theme.primary : theme.text },
                  ]}
                >
                  🔤 Nome {sortField === 'name' ? (sortDirection === 'asc' ? 'A→Z ▲' : 'Z→A ▼') : ''}
                </Text>
              </Pressable>

              {/* Peso */}
              <Pressable
                onPress={() => handleToggleSort('weight')}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: sortField === 'weight' ? `${theme.primary}25` : theme.backgroundInput,
                    borderColor: sortField === 'weight' ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: sortField === 'weight' ? theme.primary : theme.text },
                  ]}
                >
                  ⚖️ Peso {sortField === 'weight' ? (sortDirection === 'desc' ? 'Maior ▼' : 'Menor ▲') : ''}
                </Text>
              </Pressable>

              {/* Raridade */}
              <Pressable
                onPress={() => handleToggleSort('rarity')}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: sortField === 'rarity' ? `${theme.primary}25` : theme.backgroundInput,
                    borderColor: sortField === 'rarity' ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: sortField === 'rarity' ? theme.primary : theme.text },
                  ]}
                >
                  ✨ Raridade {sortField === 'rarity' ? (sortDirection === 'desc' ? 'Épico ▼' : 'Comum ▲') : ''}
                </Text>
              </Pressable>

              {/* Quantidade */}
              <Pressable
                onPress={() => handleToggleSort('quantity')}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: sortField === 'quantity' ? `${theme.primary}25` : theme.backgroundInput,
                    borderColor: sortField === 'quantity' ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: sortField === 'quantity' ? theme.primary : theme.text },
                  ]}
                >
                  🔢 Qtd {sortField === 'quantity' ? (sortDirection === 'desc' ? '+ ▼' : '- ▲') : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </RPGCard>

        {/* Listagem de Itens */}
        {filteredAndSortedInventory.length === 0 ? (
          <RPGCard variant="default" style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Nenhum item encontrado
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {isFilteredOrSorted
                ? 'Nenhum item corresponde aos critérios de busca ou filtros ativos.'
                : 'A mochila do seu aventureiro está vazia. Adicione itens e armas!'}
            </Text>
            {isFilteredOrSorted ? (
              <RPGButton
                title="↺ Limpar Filtros e Busca"
                variant="secondary"
                size="sm"
                onPress={handleResetFilters}
                style={{ marginTop: Spacing.sm }}
              />
            ) : (
              <RPGButton
                title="Adicionar Primeiro Item"
                variant="secondary"
                size="sm"
                onPress={() => setIsAddModalVisible(true)}
                style={{ marginTop: Spacing.sm }}
              />
            )}
          </RPGCard>
        ) : (
          filteredAndSortedInventory.map((item) => {
            const isEquipped = item.equipped;
            const itemTotalWeight = Math.round((item.weight || 0) * (item.quantity || 1) * 10) / 10;

            return (
              <RPGCard
                key={item.id}
                variant="default"
                style={[
                  styles.itemCard,
                  isEquipped ? { borderColor: theme.primary, borderWidth: 1.5 } : undefined,
                ]}
              >
                {/* Linha Superior: Ícone, Nome, Badges */}
                <View style={styles.itemTopRow}>
                  <View style={styles.itemIconAndName}>
                    <Text style={styles.itemCategoryEmoji}>
                      {getCategoryIcon(item.category)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemName, { color: theme.text }]}>
                        {item.name}
                      </Text>
                      <View style={styles.itemBadgesRow}>
                        <RPGBadge label={item.category} variant="neutral" size="sm" />
                        {item.rarity && (
                          <RPGBadge
                            label={item.rarity}
                            variant={getRarityBadgeVariant(item.rarity)}
                            size="sm"
                          />
                        )}
                        {item.damage && (
                          <RPGBadge label={`⚔️ ${item.damage}`} variant="hp" size="sm" />
                        )}
                        {item.armorClassBonus !== undefined && item.armorClassBonus > 0 && (
                          <RPGBadge
                            label={`🛡️ +${item.armorClassBonus} CA`}
                            variant="mana"
                            size="sm"
                          />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Toggle Equipado */}
                  <Pressable
                    onPress={() => toggleEquipItem(character.id, item.id)}
                    style={[
                      styles.equipBtn,
                      {
                        backgroundColor: isEquipped ? theme.primary : theme.backgroundInput,
                        borderColor: isEquipped ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.equipBtnText,
                        { color: isEquipped ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {isEquipped ? '✓ EQUIPADO' : '+ EQUIPAR'}
                    </Text>
                  </Pressable>
                </View>

                {/* Descrição do Item */}
                {item.description ? (
                  <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
                    {item.description}
                  </Text>
                ) : null}

                {/* Linha Inferior: Quantidade, Peso e Ações Especiais */}
                <View style={[styles.itemBottomRow, { borderTopColor: theme.border }]}>
                  {/* Controle de Quantidade */}
                  <View style={styles.quantityControl}>
                    <Text style={[styles.quantityLabel, { color: theme.textSecondary }]}>Qtd:</Text>
                    <Pressable
                      onPress={() => updateItemQuantity(character.id, item.id, -1)}
                      style={[styles.qtyBtn, { borderColor: theme.border }]}
                    >
                      <Text style={[styles.qtyBtnText, { color: theme.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.qtyNumber, { color: theme.text }]}>
                      {item.quantity}
                    </Text>
                    <Pressable
                      onPress={() => updateItemQuantity(character.id, item.id, 1)}
                      style={[styles.qtyBtn, { borderColor: theme.border }]}
                    >
                      <Text style={[styles.qtyBtnText, { color: theme.text }]}>+</Text>
                    </Pressable>
                  </View>

                  {/* Peso */}
                  <View style={styles.itemWeightBox}>
                    <Text style={[styles.itemWeightText, { color: theme.textSecondary }]}>
                      ⚖️ {itemTotalWeight} kg
                    </Text>
                  </View>

                  {/* Ações contextuais (Rolar dano / Beber poção / Remover) */}
                  <View style={styles.itemActionBtns}>
                    {item.category === 'Arma' && (
                      <RPGButton
                        title="⚔️ Dano"
                        variant="secondary"
                        size="sm"
                        onPress={() => handleRollWeaponDamage(item)}
                      />
                    )}
                    {item.category === 'Poção' && (
                      <RPGButton
                        title="🧪 Beber"
                        variant="primary"
                        size="sm"
                        onPress={() => handleUsePotion(item)}
                      />
                    )}
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          'Descartar Item',
                          `Deseja realmente remover "${item.name}" da sua mochila?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Descartar',
                              style: 'destructive',
                              onPress: () => removeItem(character.id, item.id),
                            },
                          ]
                        );
                      }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              </RPGCard>
            );
          })
        )}

        {/* Rodapé de Navegação */}
        <View style={styles.navigationFooter}>
          <RPGButton
            title="⬅️ Magias (Tela 8)"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}/spells` as any)}
            style={{ flex: 1 }}
          />
          <RPGButton
            title="Ficha ⚔️"
            variant="secondary"
            onPress={() => router.push(`/character/${character.id}` as any)}
            style={{ flex: 0.8 }}
          />
          <RPGButton
            title="Biografia (Tela 10) 📜 ➡️"
            variant="primary"
            onPress={() => router.push(`/character/${character.id}/bio` as any)}
            style={{ flex: 1.2 }}
          />
        </View>
      </ScrollView>

      {/* Modal para Adicionar Novo Item */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              🎒 Guardar Novo Item na Mochila
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={{ gap: 8 }}>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nome do Item:</Text>
                <TextInput
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Ex: Espada Longa Élfica"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Categoria:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {(['Arma', 'Armadura', 'Poção', 'Pergaminho', 'Equipamento', 'Tesouro'] as ItemCategory[]).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewItemCategory(cat)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: newItemCategory === cat ? theme.primary : theme.backgroundInput,
                          borderColor: newItemCategory === cat ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipBtnText, { color: newItemCategory === cat ? '#FFF' : theme.text }]}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Quantidade:</Text>
                    <TextInput
                      value={newItemQuantity}
                      onChangeText={setNewItemQuantity}
                      keyboardType="numeric"
                      style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Peso Un. (kg):</Text>
                    <TextInput
                      value={newItemWeight}
                      onChangeText={setNewItemWeight}
                      keyboardType="decimal-pad"
                      style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                    />
                  </View>
                </View>

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Raridade:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {RARITIES.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setNewItemRarity(r)}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: newItemRarity === r ? theme.primary : theme.backgroundInput,
                          borderColor: newItemRarity === r ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipBtnText, { color: newItemRarity === r ? '#FFF' : theme.text }]}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {newItemCategory === 'Arma' && (
                  <>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Fórmula de Dano:</Text>
                    <TextInput
                      value={newItemDamage}
                      onChangeText={setNewItemDamage}
                      placeholder="Ex: 1d8+2 cortante"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                    />
                  </>
                )}

                {newItemCategory === 'Armadura' && (
                  <>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Bônus de Classe de Armadura (+CA):</Text>
                    <TextInput
                      value={newItemAcBonus}
                      onChangeText={setNewItemAcBonus}
                      keyboardType="numeric"
                      placeholder="Ex: 2"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.modalInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                    />
                  </>
                )}

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Descrição / Efeito:</Text>
                <TextInput
                  value={newItemDescription}
                  onChangeText={setNewItemDescription}
                  placeholder="Propriedades mágicas, histórico ou utilidade..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[styles.modalInput, { height: 60, textAlignVertical: 'top', backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsAddModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Guardar Item"
                variant="primary"
                onPress={handleAddNewItem}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Ajustar Bolsa de Moedas */}
      <Modal
        visible={isCoinsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCoinsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              💰 Tesouraria & Moedas
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Atualize as moedas que o aventureiro carrega na algibeira:
            </Text>

            <View style={{ gap: 8, marginVertical: 8 }}>
              <View style={styles.coinEditRow}>
                <Text style={[styles.coinEditLabel, { color: '#CD7F32' }]}>Peças de Cobre (PC):</Text>
                <TextInput
                  value={modalCp}
                  onChangeText={setModalCp}
                  keyboardType="numeric"
                  style={[styles.coinInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <View style={styles.coinEditRow}>
                <Text style={[styles.coinEditLabel, { color: '#C0C0C0' }]}>Peças de Prata (PP):</Text>
                <TextInput
                  value={modalSp}
                  onChangeText={setModalSp}
                  keyboardType="numeric"
                  style={[styles.coinInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <View style={styles.coinEditRow}>
                <Text style={[styles.coinEditLabel, { color: '#50C878' }]}>Peças de Electrum (PE):</Text>
                <TextInput
                  value={modalEp}
                  onChangeText={setModalEp}
                  keyboardType="numeric"
                  style={[styles.coinInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>

              <View style={styles.coinEditRow}>
                <Text style={[styles.coinEditLabel, { color: theme.textGold, fontWeight: 'bold' }]}>Peças de Ouro (PO):</Text>
                <TextInput
                  value={modalGp}
                  onChangeText={setModalGp}
                  keyboardType="numeric"
                  style={[styles.coinInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.primary }]}
                />
              </View>

              <View style={styles.coinEditRow}>
                <Text style={[styles.coinEditLabel, { color: '#E5E4E2' }]}>Peças de Platina (PL):</Text>
                <TextInput
                  value={modalPp}
                  onChangeText={setModalPp}
                  keyboardType="numeric"
                  style={[styles.coinInput, { backgroundColor: theme.backgroundInput, color: theme.text, borderColor: theme.border }]}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <RPGButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setIsCoinsModalVisible(false)}
                style={{ flex: 1 }}
              />
              <RPGButton
                title="Salvar Moedas"
                variant="primary"
                onPress={saveCoinsFromModal}
                style={{ flex: 1 }}
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
  headerTexts: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterSub: {
    fontSize: 12,
    marginTop: 2,
  },
  encumbranceCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  encumbranceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  weightNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  weightCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  weightMax: {
    fontSize: 13,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  encumbranceHint: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  wealthCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  wealthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patrimonyText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  coinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  coinTile: {
    flexBasis: '31%',
    flexGrow: 1,
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  coinLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  coinValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinControls: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  miniBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  miniBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  filtersCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
  },
  searchClearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sortSection: {
    gap: 6,
    marginTop: 4,
  },
  sortHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sortChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  equippedToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  equippedToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  itemsCountText: {
    fontSize: 11,
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
  itemCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemIconAndName: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  itemCategoryEmoji: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  equipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  equipBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    marginTop: 2,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quantityLabel: {
    fontSize: 11,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  qtyBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  qtyNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 16,
    textAlign: 'center',
  },
  itemWeightBox: {
    alignItems: 'center',
  },
  itemWeightText: {
    fontSize: 11,
  },
  itemActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    padding: 6,
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
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
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
  chipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  coinEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  coinEditLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  coinInput: {
    width: 90,
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    textAlign: 'center',
  },
});
