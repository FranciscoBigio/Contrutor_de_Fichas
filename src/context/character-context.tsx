import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { MOCK_CHARACTERS } from '@/data/mock-characters';
import {
  Attributes,
  calculateModifier,
  Character,
  CharacterBio,
  Coins,
  CombatCondition,
  FeatureTrait,
  InventoryItem,
  Spell,
  SpellcastingData,
} from '@/types/character';

const CHARACTERS_STORAGE_KEY = '@questsheet_characters_v1';
const ACTIVE_CHAR_STORAGE_KEY = '@questsheet_active_char_id_v1';

interface CharacterContextData {
  characters: Character[];
  activeCharacter: Character | null;
  loading: boolean;
  setActiveCharacterId: (id: string | null) => Promise<void>;
  getCharacterById: (id: string) => Character | undefined;
  createCharacter: (charData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Character>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  modifyHp: (id: string, delta: number) => Promise<void>;
  modifyTempHp: (id: string, tempHp: number) => Promise<void>;
  toggleCondition: (charId: string, condition: CombatCondition) => Promise<void>;
  toggleInspiration: (charId: string) => Promise<void>;
  rollDeathSave: (charId: string) => Promise<{
    roll: number;
    result: 'success' | 'failure' | 'critical_success' | 'critical_failure';
    message: string;
  }>;
  shortRest: (id: string) => Promise<void>;
  longRest: (id: string) => Promise<void>;
  consumeSpellSlot: (id: string, slotLevel: number) => Promise<void>;
  useSpellSlot: (id: string, slotLevel: number) => Promise<void>;
  restoreSpellSlot: (id: string, slotLevel: number) => Promise<void>;
  restoreAllSpellSlots: (charId: string) => Promise<void>;
  togglePrepareSpell: (charId: string, spellId: string) => Promise<void>;
  addSpell: (charId: string, spell: Omit<Spell, 'id'>) => Promise<void>;
  deleteSpell: (charId: string, spellId: string) => Promise<void>;
  initializeSpellcasting: (charId: string, ability: keyof Attributes) => Promise<void>;
  toggleEquipItem: (charId: string, itemId: string) => Promise<void>;
  addItem: (charId: string, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  removeItem: (charId: string, itemId: string) => Promise<void>;
  updateCoins: (charId: string, coins: Coins) => Promise<void>;
  updateItemQuantity: (charId: string, itemId: string, delta: number) => Promise<void>;
  updateBio: (charId: string, bioUpdates: Partial<CharacterBio>) => Promise<void>;
  addFeature: (charId: string, feature: Omit<FeatureTrait, 'id'>) => Promise<void>;
  removeFeature: (charId: string, featureId: string) => Promise<void>;
  resetToMock: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextData>({} as CharacterContextData);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharacterId, setActiveCharIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inicializa carregando dados do AsyncStorage (Camada de Dados / Offline-First)
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedCharsJson = await AsyncStorage.getItem(CHARACTERS_STORAGE_KEY);
        const storedActiveId = await AsyncStorage.getItem(ACTIVE_CHAR_STORAGE_KEY);

        if (storedCharsJson) {
          const parsed: Character[] = JSON.parse(storedCharsJson);
          setCharacters(parsed);
          if (storedActiveId && parsed.some((c) => c.id === storedActiveId)) {
            setActiveCharIdState(storedActiveId);
          } else if (parsed.length > 0) {
            setActiveCharIdState(parsed[0].id);
          }
        } else {
          // Inicialização limpa com MOCK inicial (D&D / T20)
          await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(MOCK_CHARACTERS));
          setCharacters(MOCK_CHARACTERS);
          setActiveCharIdState(MOCK_CHARACTERS[0].id);
        }
      } catch {
        // Fallback em caso de erro de leitura
        setCharacters(MOCK_CHARACTERS);
        setActiveCharIdState(MOCK_CHARACTERS[0]?.id || null);
      } finally {
        setLoading(false);
      }
    }

    loadStoredData();
  }, []);

  // Helper para persistir alterações no AsyncStorage
  const persistCharacters = async (updatedList: Character[]) => {
    setCharacters(updatedList);
    try {
      await AsyncStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {
      // Ignora erro assíncrono de persistência
    }
  };

  const setActiveCharacterId = async (id: string | null) => {
    setActiveCharIdState(id);
    try {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_CHAR_STORAGE_KEY, id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_CHAR_STORAGE_KEY);
      }
    } catch {
      // silencioso
    }
  };

  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || null;

  const getCharacterById = (id: string) => {
    return characters.find((c) => c.id === id);
  };

  const createCharacter = async (
    charData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Character> => {
    const newChar: Character = {
      ...charData,
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newChar, ...characters];
    await persistCharacters(updated);
    await setActiveCharacterId(newChar.id);
    return newChar;
  };

  const updateCharacter = async (id: string, updates: Partial<Character>) => {
    const updated = characters.map((char) => {
      if (char.id === id) {
        return {
          ...char,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return char;
    });
    await persistCharacters(updated);
  };

  const deleteCharacter = async (id: string) => {
    const updated = characters.filter((c) => c.id !== id);
    await persistCharacters(updated);

    if (activeCharacterId === id) {
      const nextActive = updated.length > 0 ? updated[0].id : null;
      await setActiveCharacterId(nextActive);
    }
  };

  // Operações de Combate e Pontos de Vida (PV)
  const modifyHp = async (id: string, delta: number) => {
    const target = characters.find((c) => c.id === id);
    if (!target) return;

    let newCurrent = target.currentHp + delta;
    let newTemp = target.tempHp;

    // Se tomou dano (delta negativo) e tem PV temporários
    if (delta < 0 && newTemp > 0) {
      const absDamage = Math.abs(delta);
      if (newTemp >= absDamage) {
        newTemp -= absDamage;
        newCurrent = target.currentHp; // Não mexe no PV atual
      } else {
        const remainingDamage = absDamage - newTemp;
        newTemp = 0;
        newCurrent = target.currentHp - remainingDamage;
      }
    }

    // Trava entre 0 e maxHp
    newCurrent = Math.max(0, Math.min(target.maxHp, newCurrent));

    await updateCharacter(id, { currentHp: newCurrent, tempHp: newTemp });
  };

  const modifyTempHp = async (id: string, tempHp: number) => {
    await updateCharacter(id, { tempHp: Math.max(0, tempHp) });
  };

  const toggleCondition = async (charId: string, condition: CombatCondition) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const existing = target.conditions || [];
    const hasCondition = existing.includes(condition);
    const updatedConditions = hasCondition
      ? existing.filter((c) => c !== condition)
      : [...existing, condition];

    await updateCharacter(charId, { conditions: updatedConditions });
  };

  const toggleInspiration = async (charId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    await updateCharacter(charId, { hasInspiration: !target.hasInspiration });
  };

  const rollDeathSave = async (charId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) {
      return { roll: 10, result: 'success' as const, message: 'Herói não encontrado' };
    }

    const roll = Math.floor(Math.random() * 20) + 1;
    let newSuccesses = target.deathSaves.successes;
    let newFailures = target.deathSaves.failures;
    let result: 'success' | 'failure' | 'critical_success' | 'critical_failure' = 'success';
    let message = '';

    if (roll === 20) {
      result = 'critical_success';
      await updateCharacter(charId, {
        currentHp: 1,
        deathSaves: { successes: 0, failures: 0 },
      });
      message = '🎉 20 NATURAL! O herói recupera o fôlego com 1 PV e acorda!';
      return { roll, result, message };
    } else if (roll === 1) {
      result = 'critical_failure';
      newFailures = Math.min(3, newFailures + 2);
      message = `💀 1 NATURAL! Desastre! 2 falhas sofridas (${newFailures}/3).`;
    } else if (roll >= 10) {
      result = 'success';
      newSuccesses = Math.min(3, newSuccesses + 1);
      message = `✨ Rolou ${roll} (>=10): Sucesso! (${newSuccesses}/3).`;
    } else {
      result = 'failure';
      newFailures = Math.min(3, newFailures + 1);
      message = `🩸 Rolou ${roll} (<10): Falha! (${newFailures}/3).`;
    }

    await updateCharacter(charId, {
      deathSaves: { successes: newSuccesses, failures: newFailures },
    });

    return { roll, result, message };
  };

  // Descansos (Regras D&D 5e / T20)
  const shortRest = async (id: string) => {
    const target = characters.find((c) => c.id === id);
    if (!target) return;

    // Recupera uma parte de PV caso tenha dados de vida restantes
    const healAmount = Math.floor(target.maxHp * 0.3) || 5;
    const newHp = Math.min(target.maxHp, target.currentHp + healAmount);

    await updateCharacter(id, {
      currentHp: newHp,
      deathSaves: { successes: 0, failures: 0 },
    });
  };

  const longRest = async (id: string) => {
    const target = characters.find((c) => c.id === id);
    if (!target) return;

    // Restaura PV completo, dados de vida e espaços de magia
    let updatedSpellcasting = target.spellcasting;
    if (target.spellcasting) {
      updatedSpellcasting = {
        ...target.spellcasting,
        slots: target.spellcasting.slots.map((s) => ({ ...s, used: 0 })),
      };
    }

    await updateCharacter(id, {
      currentHp: target.maxHp,
      tempHp: 0,
      hitDiceUsed: 0,
      deathSaves: { successes: 0, failures: 0 },
      spellcasting: updatedSpellcasting,
    });
  };

  // Gerenciamento de Magias
  const consumeSpellSlot = async (id: string, slotLevel: number) => {
    const target = characters.find((c) => c.id === id);
    if (!target || !target.spellcasting) return;

    const newSlots = target.spellcasting.slots.map((s) => {
      if (s.level === slotLevel && s.used < s.total) {
        return { ...s, used: s.used + 1 };
      }
      return s;
    });

    await updateCharacter(id, {
      spellcasting: {
        ...target.spellcasting,
        slots: newSlots,
      },
    });
  };

  const restoreSpellSlot = async (id: string, slotLevel: number) => {
    const target = characters.find((c) => c.id === id);
    if (!target || !target.spellcasting) return;

    const newSlots = target.spellcasting.slots.map((s) => {
      if (s.level === slotLevel && s.used > 0) {
        return { ...s, used: s.used - 1 };
      }
      return s;
    });

    await updateCharacter(id, {
      spellcasting: {
        ...target.spellcasting,
        slots: newSlots,
      },
    });
  };

  const restoreAllSpellSlots = async (charId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target || !target.spellcasting) return;

    const restoredSlots = target.spellcasting.slots.map((s) => ({ ...s, used: 0 }));

    await updateCharacter(charId, {
      spellcasting: {
        ...target.spellcasting,
        slots: restoredSlots,
      },
    });
  };

  const togglePrepareSpell = async (charId: string, spellId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target || !target.spellcasting) return;

    const updatedSpells = target.spellcasting.spells.map((s) => {
      if (s.id === spellId) {
        return { ...s, prepared: !s.prepared };
      }
      return s;
    });

    await updateCharacter(charId, {
      spellcasting: {
        ...target.spellcasting,
        spells: updatedSpells,
      },
    });
  };

  const addSpell = async (charId: string, spell: Omit<Spell, 'id'>) => {
    const target = characters.find((c) => c.id === charId);
    if (!target || !target.spellcasting) return;

    const newSpell: Spell = {
      ...spell,
      id: `sp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };

    await updateCharacter(charId, {
      spellcasting: {
        ...target.spellcasting,
        spells: [...target.spellcasting.spells, newSpell],
      },
    });
  };

  const deleteSpell = async (charId: string, spellId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target || !target.spellcasting) return;

    const updatedSpells = target.spellcasting.spells.filter((s) => s.id !== spellId);

    await updateCharacter(charId, {
      spellcasting: {
        ...target.spellcasting,
        spells: updatedSpells,
      },
    });
  };

  const initializeSpellcasting = async (charId: string, ability: keyof Attributes) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const attrScore = target.attributes[ability] || 10;
    const mod = calculateModifier(attrScore);
    const profBonus = target.proficiencyBonus || 2;

    const defaultSpellcasting: SpellcastingData = {
      ability,
      saveDc: 8 + profBonus + mod,
      attackBonus: profBonus + mod,
      slots: [
        { level: 1, total: 2, used: 0 },
        { level: 2, total: 0, used: 0 },
        { level: 3, total: 0, used: 0 },
      ],
      spells: [
        {
          id: 'sp-default-1',
          name: 'Luz',
          level: 0,
          school: 'Evocação',
          castingTime: '1 Ação',
          range: 'Toque',
          components: 'V, M (Vagalume)',
          duration: '1 Hora',
          description: 'Faz um objeto tocado emitir luz brilhante num raio de 6 metros.',
          prepared: true,
        },
        {
          id: 'sp-default-2',
          name: 'Toque Chocante',
          level: 0,
          school: 'Evocação',
          castingTime: '1 Ação',
          range: 'Toque',
          components: 'V, S',
          duration: 'Instantânea',
          description: 'Ataque mágico que causa 1d8 de dano elétrico e impede o alvo de usar reações.',
          damageOrEffect: '1d8 Elétrico',
          prepared: true,
        },
      ],
    };

    await updateCharacter(charId, { spellcasting: defaultSpellcasting });
  };

  // Gerenciamento de Inventário
  const toggleEquipItem = async (charId: string, itemId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const updatedInv = target.inventory.map((item) => {
      if (item.id === itemId) {
        return { ...item, equipped: !item.equipped };
      }
      return item;
    });

    await updateCharacter(charId, { inventory: updatedInv });
  };

  const addItem = async (charId: string, item: Omit<InventoryItem, 'id'>) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const newItem: InventoryItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };

    await updateCharacter(charId, {
      inventory: [...target.inventory, newItem],
    });
  };

  const removeItem = async (charId: string, itemId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const updatedInv = target.inventory.filter((item) => item.id !== itemId);
    await updateCharacter(charId, { inventory: updatedInv });
  };

  const updateCoins = async (charId: string, coins: Coins) => {
    await updateCharacter(charId, { coins });
  };

  const updateItemQuantity = async (charId: string, itemId: string, delta: number) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const updatedInv = target.inventory
      .map((item) => {
        if (item.id === itemId) {
          const nextQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    await updateCharacter(charId, { inventory: updatedInv });
  };

  const updateBio = async (charId: string, bioUpdates: Partial<CharacterBio>) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const updatedBio: CharacterBio = {
      ...target.bio,
      ...bioUpdates,
    };
    await updateCharacter(charId, { bio: updatedBio });
  };

  const addFeature = async (charId: string, feature: Omit<FeatureTrait, 'id'>) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const newFeature: FeatureTrait = {
      ...feature,
      id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    await updateCharacter(charId, { features: [...target.features, newFeature] });
  };

  const removeFeature = async (charId: string, featureId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;

    const updatedFeatures = target.features.filter((f) => f.id !== featureId);
    await updateCharacter(charId, { features: updatedFeatures });
  };

  const resetToMock = async () => {
    await persistCharacters(MOCK_CHARACTERS);
    if (MOCK_CHARACTERS.length > 0) {
      await setActiveCharacterId(MOCK_CHARACTERS[0].id);
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        activeCharacter,
        loading,
        setActiveCharacterId,
        getCharacterById,
        createCharacter,
        updateCharacter,
        deleteCharacter,
        modifyHp,
        modifyTempHp,
        toggleCondition,
        toggleInspiration,
        rollDeathSave,
        shortRest,
        longRest,
        consumeSpellSlot,
        useSpellSlot: consumeSpellSlot,
        restoreSpellSlot,
        restoreAllSpellSlots,
        togglePrepareSpell,
        addSpell,
        deleteSpell,
        initializeSpellcasting,
        toggleEquipItem,
        addItem,
        removeItem,
        updateCoins,
        updateItemQuantity,
        updateBio,
        addFeature,
        removeFeature,
        resetToMock,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacters = (): CharacterContextData => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacters deve ser utilizado dentro de um CharacterProvider');
  }
  return context;
};

