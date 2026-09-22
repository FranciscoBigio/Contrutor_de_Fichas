/**
 * Tipos e Interfaces do Ecossistema QuestSheet RPG
 * Mapeamento completo dos dados de ficha segundo regras de D&D 5e e Tormenta20
 */

export type RPGClass =
  | 'Guerreiro'
  | 'Mago'
  | 'Ladino'
  | 'Clérigo'
  | 'Bárbaro'
  | 'Bardo'
  | 'Paladino'
  | 'Druida'
  | 'Patrulheiro'
  | 'Feiticeiro'
  | 'Bruxo'
  | 'Monge';

export type RPGRace =
  | 'Humano'
  | 'Elfo'
  | 'Anão'
  | 'Halfling'
  | 'Draconato'
  | 'Tiefling'
  | 'Meio-Elfo'
  | 'Meio-Orc'
  | 'Gnomo';

export type RPGAlignment =
  | 'Leal e Bom'
  | 'Neutro e Bom'
  | 'Caótico e Bom'
  | 'Leal e Neutro'
  | 'Neutro'
  | 'Caótico e Neutro'
  | 'Leal e Mau'
  | 'Neutro e Mau'
  | 'Caótico e Mau';

export interface Attributes {
  strength: number; // FOR - Força
  dexterity: number; // DES - Destreza
  constitution: number; // CON - Constituição
  intelligence: number; // INT - Inteligência
  wisdom: number; // SAB - Sabedoria
  charisma: number; // CAR - Carisma
}

export type SkillName =
  | 'Acrobacia'
  | 'Adestrar Animais'
  | 'Arcanismo'
  | 'Atletismo'
  | 'Enganação'
  | 'História'
  | 'Intuição'
  | 'Intimidação'
  | 'Investigação'
  | 'Medicina'
  | 'Natureza'
  | 'Percepção'
  | 'Atuação'
  | 'Persuasão'
  | 'Religião'
  | 'Prestidigitação'
  | 'Furtividade'
  | 'Sobrevivência';

export interface Skill {
  name: SkillName;
  attribute: keyof Attributes;
  proficient: boolean;
  expertise?: boolean;
}

export interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = Truque / Cantrip
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  damageOrEffect?: string;
  prepared: boolean;
}

export type ItemCategory =
  | 'Arma'
  | 'Armadura'
  | 'Poção'
  | 'Pergaminho'
  | 'Equipamento'
  | 'Tesouro';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  weight: number; // em kg
  equipped: boolean;
  damage?: string;
  armorClassBonus?: number;
  description: string;
  rarity?: 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário';
}

export interface Coins {
  cp: number; // Peças de Cobre (PC)
  sp: number; // Peças de Prata (PP)
  ep: number; // Peças de Electrum (PE)
  gp: number; // Peças de Ouro (PO)
  pp: number; // Peças de Platina (PL)
}

export interface FeatureTrait {
  id: string;
  name: string;
  source: 'Raça' | 'Classe' | 'Antecedente' | 'Talento';
  description: string;
}

export interface DeathSaves {
  successes: number; // 0 a 3
  failures: number; // 0 a 3
}

export interface CharacterBio {
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  appearance: string;
  notes: string;
}

export interface SpellcastingData {
  ability: keyof Attributes;
  saveDc: number;
  attackBonus: number;
  slots: SpellSlot[];
  spells: Spell[];
}

export interface Character {
  id: string;
  name: string;
  title?: string;
  playerName: string;
  race: RPGRace;
  class: RPGClass;
  subclass?: string;
  level: number;
  experience: number;
  alignment: RPGAlignment;
  background: string;
  avatarUrl?: string;
  avatarEmoji: string;

  // Estatísticas de Combate
  proficiencyBonus: number;
  speed: number; // em metros (ex: 9m)
  initiative: number;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hitDice: string;
  hitDiceUsed: number;
  deathSaves: DeathSaves;

  // Atributos & Testes de Resistência
  attributes: Attributes;
  savingThrowProficiencies: (keyof Attributes)[];
  skills: Skill[];

  // Magias (Opcional, para classes conjuradoras)
  spellcasting?: SpellcastingData;

  // Inventário e Finanças
  inventory: InventoryItem[];
  coins: Coins;

  // Talentos e Características
  features: FeatureTrait[];

  // História e Notas
  bio: CharacterBio;

  // Metadados
  createdAt: string;
  updatedAt: string;
}

/**
 * Funções utilitárias canônicas para regras de RPG
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

