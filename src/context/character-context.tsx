import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { MOCK_CHARACTERS } from '@/data/mock-characters';
import {
  Character,
  InventoryItem,
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
  shortRest: (id: string) => Promise<void>;
  longRest: (id: string) => Promise<void>;
  useSpellSlot: (id: string, slotLevel: number) => Promise<void>;
  restoreSpellSlot: (id: string, slotLevel: number) => Promise<void>;
  toggleEquipItem: (charId: string, itemId: string) => Promise<void>;
  addItem: (charId: string, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  removeItem: (charId: string, itemId: string) => Promise<void>;
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
  const useSpellSlot = async (id: string, slotLevel: number) => {
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
        shortRest,
        longRest,
        useSpellSlot,
        restoreSpellSlot,
        toggleEquipItem,
        addItem,
        removeItem,
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

