export enum GameState {
  MAIN_MENU,
  CHARACTER_CREATION,
  HUB,
  COMBAT,
  CHARACTER_SHEET,
  SHOP,
  TRAINER,
  WORKSHOP,
}

export interface Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  luck: number;
}

export enum ItemSlot {
  WEAPON = 'Weapon',
  ARMOR = 'Armor',
  IMPLANT = 'Implant',
}

export enum ItemType {
  // Weapons
  PISTOL = 'Pistol',
  RIFLE = 'Rifle',
  MELEE = 'Melee',
  // Armor
  LIGHT_ARMOR = 'Light Armor',
  MEDIUM_ARMOR = 'Medium Armor',
  HEAVY_ARMOR = 'Heavy Armor',
  // Implants
  CYBERNETIC = 'Cybernetic',
  // Crafting
  MATERIAL = 'Material',
}

export enum ItemRarity {
    COMMON = 'Common',
    UNCOMMON = 'Uncommon',
    RARE = 'Rare',
    EPIC = 'Epic',
}

export enum DamageType {
    KINETIC = 'Kinetic',
    ENERGY = 'Energy',
    MAGIC = 'Magic',
    EXPLOSIVE = 'Explosive',
    FIRE = 'Fire',
    ICE = 'Ice',
    LIGHTNING = 'Lightning'
}

export type Resistances = Partial<Record<DamageType, number>>; // e.g., { KINETIC: 0.25 } is 25% resistance, { ENERGY: -0.5 } is 50% vulnerability

export enum ItemEffectTrigger {
  PASSIVE = 'Passive',
  ON_HIT = 'On Hit',
  ON_CRIT = 'On Critical Hit',
}

export type ItemEffectType = 'lifesteal' | 'armor_shred' | 'damage_reflect' | 'bonus_xp' | 'status_effect';

export interface ItemEffect {
  trigger: ItemEffectTrigger;
  type: ItemEffectType;
  value: number; // e.g., 0.1 for 10% lifesteal, or a flat value for armor_shred
  chance?: number; // optional, e.g., 0.25 for 25% chance
  statusEffect?: StatusEffect; // The status effect to apply
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description:string;
  slot: ItemSlot | null; // Null for materials
  category: 'Gear' | 'Material';
  stats: Partial<Stats>;
  damage?: {
    type: DamageType;
    amount: number;
  };
  resistances?: Resistances;
  cost: number;
  effects?: ItemEffect[];
}

export interface CraftingRecipe {
    id: string;
    result: string; // item ID
    materials: Record<string, number>; // key: item ID, value: quantity
    cost: number;
}

export interface ModificationRecipe extends CraftingRecipe {
    baseItem: string; // item ID of the item to modify
}

export enum Gender {
    MALE = 'Male',
    FEMALE = 'Female',
    NON_BINARY = 'Non-binary',
}

export enum SkillType {
  ACTIVE = 'Active',
  PASSIVE = 'Passive',
}

export enum StatusEffectType {
    POISON = 'Poison',
    BURN = 'Burn',
    STUN = 'Stun',
    REGEN = 'Regen',
    DEFENSE_UP = 'Defense Up',
}

export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    value?: number; // e.g., damage for POISON, healing for REGEN
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  tree: 'Soldier' | 'Scoundrel' | 'Mystic' | 'Trainer';
  levelRequired: number;
  prerequisites?: string[]; // IDs of required skills
  effect: {
    damageMultiplier?: number;
    damageType?: DamageType;
    healAmount?: number;
    statBonus?: Partial<Stats>; 
    statusEffect?: {
        target: 'player' | 'enemy';
        effect: StatusEffect;
    }
  };
  cooldown?: number; // Turns
  manaCost?: number;
  cost?: number; // Gold cost for trainer skills
}

export interface Player {
  name: string;
  gender: Gender;
  race: Race;
  playerClass: PlayerClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  stats: Stats;
  currentHealth: number;
  maxHealth: number;
  currentMana: number;
  maxMana: number;
  equipment: {
    [ItemSlot.WEAPON]?: Item;
    [ItemSlot.ARMOR]?: Item;
    [ItemSlot.IMPLANT]?: Item;
  };
  inventory: Item[];
  backstory: string;
  skills: string[];
  skillPoints: number;
  statusEffects: StatusEffect[];
  ngPlus: number;
}

export interface Race {
  name: string;
  description: string;
  statBonuses: Partial<Stats>;
}

export interface PlayerClass {
  name: string;
  description: string;
  statBonuses: Partial<Stats>;
  startingBonusText: string;
}

export interface EnvironmentalEffect {
    type: 'damage_mod' | 'turn_effect';
    damageType?: DamageType; // For 'damage_mod'
    modifier?: number; // e.g., 1.25 for +25%, 0.75 for -25%
    statusEffect?: StatusEffect; // For 'turn_effect'
    chance?: number; // For 'turn_effect'
    description: string;
}

export interface Arena {
    id: string;
    name: string;
    description: string;
    levelRange: [number, number];
    possibleEnemies: string[]; // Enemy IDs
    environmentalEffects: EnvironmentalEffect[];
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  damage: {
    type: DamageType;
    amount: number;
  };
  resistances: Resistances;
  currentHealth: number;
  maxHealth: number;
  statusEffects: StatusEffect[];
  statusEffectOnHit?: StatusEffect;
  lootTable: { itemId: string; dropChance: number; quantity: [number, number] }[];
  goldDrop: { min: number; max: number };
  xpValue: number;
}