import { Race, Item, Enemy, Stats, ItemSlot, Skill, SkillType, PlayerClass, ItemEffectTrigger, DamageType, Resistances, ItemType, StatusEffectType, Arena, CraftingRecipe, ModificationRecipe, ItemRarity } from './types';

// --- ITEMS ---

// A map for easy lookup
const ALL_ITEMS_LIST: Item[] = [
    // --- GEAR ---
    // Weapons
    { id: 'item_weapon_001', name: 'Basic Laser Pistol', rarity: ItemRarity.COMMON, category: 'Gear', type: ItemType.PISTOL, description: 'A reliable, if uninspired, sidearm. Standard issue for just about everyone.', slot: ItemSlot.WEAPON, damage: { type: DamageType.ENERGY, amount: 4 }, stats: {}, cost: 20 },
    { id: 'item_weapon_002', name: 'Calibrated Laser Rifle', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.RIFLE, description: 'A more powerful laser weapon.', slot: ItemSlot.WEAPON, damage: { type: DamageType.ENERGY, amount: 8 }, stats: { intelligence: 1 }, cost: 150 },
    { id: 'item_weapon_003', name: 'Ion Blaster', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.PISTOL, description: 'Deals significant lightning damage.', slot: ItemSlot.WEAPON, damage: { type: DamageType.LIGHTNING, amount: 12 }, stats: {}, cost: 350 },
    { id: 'item_weapon_004', name: 'Corrosive Disintegrator', rarity: ItemRarity.EPIC, category: 'Gear', type: ItemType.RIFLE, description: 'Fires projectiles that shred through defenses.', slot: ItemSlot.WEAPON, damage: { type: DamageType.ENERGY, amount: 10 }, stats: { strength: 1 }, cost: 750, effects: [ { trigger: ItemEffectTrigger.ON_HIT, type: 'armor_shred', value: 1, chance: 0.25, description: 'On Hit: 25% chance to reduce enemy defense.' } ] },
    { id: 'item_weapon_005', name: 'Vibro-Knife', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.MELEE, description: 'A silent but deadly blade for close encounters.', slot: ItemSlot.WEAPON, damage: { type: DamageType.KINETIC, amount: 6}, stats: { dexterity: 1 }, cost: 120 },
    { id: 'item_weapon_006', name: 'Concussion Grenade Launcher', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.RIFLE, description: 'Lobes grenades that deal explosive damage.', slot: ItemSlot.WEAPON, damage: { type: DamageType.EXPLOSIVE, amount: 15 }, stats: { strength: 1 }, cost: 500 },
    { id: 'item_weapon_007', name: 'Incinerator Nozzle', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.RIFLE, description: 'A weapon that spews a jet of plasma.', slot: ItemSlot.WEAPON, damage: { type: DamageType.FIRE, amount: 10 }, cost: 450, stats: {}, effects: [ { trigger: ItemEffectTrigger.ON_HIT, type: 'status_effect', value: 0, chance: 0.3, statusEffect: { type: StatusEffectType.BURN, duration: 2, value: 5 }, description: 'On Hit: 30% chance to Burn enemy.' }] },
    { id: 'item_weapon_008', name: 'Cryo Beam Emitter', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.RIFLE, description: 'Fires a beam of supercooled particles.', slot: ItemSlot.WEAPON, damage: { type: DamageType.ICE, amount: 8 }, cost: 420, stats: {} },
    // Armor
    { id: 'item_armor_001', name: 'Worn Plasteel Vest', rarity: ItemRarity.COMMON, category: 'Gear', type: ItemType.MEDIUM_ARMOR, description: 'It has seen better days, but it can still stop a low-energy blast or two.', slot: ItemSlot.ARMOR, stats: { constitution: 1 }, resistances: { [DamageType.KINETIC]: 0.1, [DamageType.ENERGY]: 0.05 }, cost: 20, },
    { id: 'item_armor_002', name: 'Reinforced Combat Armor', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.MEDIUM_ARMOR, description: 'Standard military-grade armor.', slot: ItemSlot.ARMOR, stats: { constitution: 2 }, resistances: { [DamageType.KINETIC]: 0.2, [DamageType.EXPLOSIVE]: 0.15 }, cost: 150 },
    { id: 'item_armor_003', name: 'Ablative Shielding', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.HEAVY_ARMOR, description: 'Top-tier personal protection.', slot: ItemSlot.ARMOR, stats: { constitution: 3 }, resistances: { [DamageType.KINETIC]: 0.3, [DamageType.ENERGY]: 0.1, [DamageType.FIRE]: 0.1 }, cost: 350 },
    { id: 'item_armor_004', name: 'Kinetic Reflector Armor', rarity: ItemRarity.EPIC, category: 'Gear', type: ItemType.HEAVY_ARMOR, description: 'This plating returns a portion of kinetic energy to its source.', slot: ItemSlot.ARMOR, stats: { constitution: 2 }, resistances: { [DamageType.KINETIC]: 0.2 }, cost: 900, effects: [ { trigger: ItemEffectTrigger.PASSIVE, type: 'damage_reflect', value: 0.1, description: 'Passive: Reflects 10% of incoming damage.' } ] },
    { id: 'item_armor_005', name: 'Synth-Leather Jacket', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.LIGHT_ARMOR, description: 'Favored by scoundrels and scouts for its flexibility.', slot: ItemSlot.ARMOR, stats: { dexterity: 1 }, resistances: { [DamageType.ENERGY]: 0.1, [DamageType.ICE]: -0.15 }, cost: 90 },
    { id: 'item_armor_006', name: 'Thermal Dampening Suit', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.MEDIUM_ARMOR, description: 'Provides excellent protection against extreme temperatures.', slot: ItemSlot.ARMOR, stats: { constitution: 1 }, resistances: { [DamageType.FIRE]: 0.5, [DamageType.ICE]: 0.5 }, cost: 600 },
    { id: 'item_armor_007', name: 'Asbestos-Lined Cloak', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.LIGHT_ARMOR, description: 'A light cloak offering surprising protection against flames, though it provides little physical defense.', slot: ItemSlot.ARMOR, stats: { dexterity: 1 }, resistances: { [DamageType.FIRE]: 0.4, [DamageType.KINETIC]: -0.15 }, cost: 180 },
    { id: 'item_armor_008', name: 'Cryo-Weave Tunic', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.MEDIUM_ARMOR, description: 'Insulated plating that dissipates extreme cold but is susceptible to shock.', slot: ItemSlot.ARMOR, stats: { constitution: 1 }, resistances: { [DamageType.ICE]: 0.4, [DamageType.LIGHTNING]: -0.2 }, cost: 190 },
    { id: 'item_armor_009', name: 'Faraday Cage Mesh', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.HEAVY_ARMOR, description: 'A heavy suit that grounds and disperses electrical attacks but is cumbersome.', slot: ItemSlot.ARMOR, stats: { constitution: 2, dexterity: -1 }, resistances: { [DamageType.LIGHTNING]: 0.6, [DamageType.ENERGY]: 0.2 }, cost: 400 },
    // Implants
    { id: 'item_implant_001', name: 'Reflex Booster', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.CYBERNETIC, description: 'Subdermal implant to speed up reaction times.', slot: ItemSlot.IMPLANT, stats: { dexterity: 2 }, cost: 200 },
    { id: 'item_implant_002', name: 'Probability Modulator', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.CYBERNETIC, description: 'A small device that subtly manipulates chance in your favor.', slot: ItemSlot.IMPLANT, stats: { luck: 2 }, cost: 250 },
    { id: 'item_implant_003', name: 'Cognitive Enhancer', rarity: ItemRarity.UNCOMMON, category: 'Gear', type: ItemType.CYBERNETIC, description: 'Boosts tactical processing power.', slot: ItemSlot.IMPLANT, stats: { intelligence: 2}, cost: 200 },
    { id: 'item_implant_004', name: 'Nanite Blood-Leech', rarity: ItemRarity.EPIC, category: 'Gear', type: ItemType.CYBERNETIC, description: 'A swarm of nanites that repair your tissue by consuming enemy bio-matter.', slot: ItemSlot.IMPLANT, stats: {}, cost: 800, effects: [ { trigger: ItemEffectTrigger.ON_HIT, type: 'lifesteal', value: 0.10, description: 'On Hit: Heals for 10% of damage dealt.' } ] },
    { id: 'item_implant_005', name: 'Scholar\'s Datachip', rarity: ItemRarity.EPIC, category: 'Gear', type: ItemType.CYBERNETIC, description: 'This implant analyzes combat data, accelerating the learning process.', slot: ItemSlot.IMPLANT, stats: { intelligence: 1 }, cost: 600, effects: [ { trigger: ItemEffectTrigger.PASSIVE, type: 'bonus_xp', value: 0.15, description: 'Passive: Gain 15% more XP from combat.' } ] },

    // --- CRAFTED/MODIFIED ITEMS ---
    { id: 'item_weapon_cr_001', name: 'Precision Laser Rifle', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.RIFLE, description: 'An upgraded rifle with a superior focusing lens.', slot: ItemSlot.WEAPON, damage: { type: DamageType.ENERGY, amount: 11 }, stats: { intelligence: 2, luck: 1 }, cost: 400 },
    { id: 'item_armor_cr_001', name: 'Hardened Combat Armor', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.MEDIUM_ARMOR, description: 'Combat armor reinforced with exotic alloys.', slot: ItemSlot.ARMOR, stats: { constitution: 3 }, resistances: { [DamageType.KINETIC]: 0.25, [DamageType.EXPLOSIVE]: 0.2, [DamageType.ENERGY]: 0.1 }, cost: 500 },
    { id: 'item_weapon_cr_002', name: 'Venom-Tipped Vibro-Knife', rarity: ItemRarity.RARE, category: 'Gear', type: ItemType.MELEE, description: 'This blade carries a potent neurotoxin.', slot: ItemSlot.WEAPON, damage: { type: DamageType.KINETIC, amount: 7}, stats: { dexterity: 1 }, cost: 400, effects: [{ trigger: ItemEffectTrigger.ON_HIT, type: 'status_effect', value: 0, chance: 0.4, statusEffect: { type: StatusEffectType.POISON, duration: 3, value: 4 }, description: 'On Hit: 40% chance to Poison enemy.' }] },


    // --- MATERIALS ---
    { id: 'mat_scrap', name: 'Scrap Metal', rarity: ItemRarity.COMMON, category: 'Material', type: ItemType.MATERIAL, description: 'Commonplace metal fragments. Useful for basic crafting.', slot: null, stats: {}, cost: 5 },
    { id: 'mat_energy_cell', name: 'Energy Cell', rarity: ItemRarity.COMMON, category: 'Material', type: ItemType.MATERIAL, description: 'A standard power source for various technologies.', slot: null, stats: {}, cost: 10 },
    { id: 'mat_zylorian_crystal', name: 'Zylorian Crystal', rarity: ItemRarity.RARE, category: 'Material', type: ItemType.MATERIAL, description: 'A rare crystal that hums with latent psionic energy.', slot: null, stats: {}, cost: 100 },
    { id: 'mat_focusing_lens', name: 'Focusing Lens', rarity: ItemRarity.UNCOMMON, category: 'Material', type: ItemType.MATERIAL, description: 'A precision-cut lens used in advanced energy weapons.', slot: null, stats: {}, cost: 75 },
    { id: 'mat_hardened_plating', name: 'Hardened Plating', rarity: ItemRarity.UNCOMMON, category: 'Material', type: ItemType.MATERIAL, description: 'Alloy plates used to reinforce armor.', slot: null, stats: {}, cost: 80 },
    { id: 'mat_neurotoxin', name: 'Concentrated Neurotoxin', rarity: ItemRarity.UNCOMMON, category: 'Material', type: ItemType.MATERIAL, description: 'A potent poison harvested from alien creatures.', slot: null, stats: {}, cost: 90 },
];

export const ALL_ITEMS_MAP: Record<string, Item> = ALL_ITEMS_LIST.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
}, {} as Record<string, Item>);

export const SHOP_INVENTORY: Item[] = ALL_ITEMS_LIST.filter(item => item.category === 'Gear' && item.cost < 600); // Only sell non-crafted, non-material items under a certain price

// --- RACES ---
export const RACES: Race[] = [
  {
    name: 'Human',
    description: 'Versatile and adaptable, humans are found in every corner of the galaxy. They receive a bonus to all stats.',
    statBonuses: { strength: 1, dexterity: 1, intelligence: 1, constitution: 1, luck: 1 },
  },
  {
    name: 'Cyborg',
    description: 'Beings of flesh and steel, cyborgs are durable and powerful, excelling in direct combat.',
    statBonuses: { strength: 2, constitution: 2, dexterity: 0, intelligence: 0, luck: 0 },
  },
  {
    name: 'Zylorian',
    description: 'A slender, enigmatic alien race known for their sharp minds and quick reflexes.',
    statBonuses: { dexterity: 2, intelligence: 2, strength: 0, constitution: 0, luck: 0 },
  },
];

// --- CLASSES ---
export const CLASSES: PlayerClass[] = [
  {
    name: 'Soldier',
    description: 'A trained warrior, disciplined and tough. You excel with all forms of combat.',
    statBonuses: { strength: 2, constitution: 1 },
    startingBonusText: '+2 Strength, +1 Constitution',
  },
  {
    name: 'Scoundrel',
    description: 'A survivor from the galactic underworld. You are resourceful, quick-fingered, and lucky.',
    statBonuses: { dexterity: 2, luck: 1 },
    startingBonusText: '+2 Dexterity, +1 Luck',
  },
  {
    name: 'Mystic',
    description: 'Your mind is your greatest weapon. You wield cosmic energies, bending reality to your will.',
    statBonuses: { intelligence: 3 },
    startingBonusText: '+3 Intelligence',
  },
];

// --- ENEMIES ---
export const ENEMIES: Enemy[] = [
    {
        id: 'enemy_001',
        name: 'Space Pirate Grunt',
        level: 1,
        stats: { strength: 5, dexterity: 4, intelligence: 2, constitution: 6, luck: 2 },
        damage: { type: DamageType.KINETIC, amount: 5 },
        resistances: { [DamageType.MAGIC]: -0.5 },
        currentHealth: 60, maxHealth: 60,
        statusEffects: [],
        lootTable: [
            {itemId: 'mat_scrap', dropChance: 0.8, quantity: [1, 3]},
            {itemId: 'item_weapon_005', dropChance: 0.05, quantity: [1, 1]}
        ],
        goldDrop: { min: 10, max: 25 },
        xpValue: 15,
    },
    {
        id: 'enemy_002',
        name: 'Rogue Security Drone',
        level: 2,
        stats: { strength: 7, dexterity: 5, intelligence: 1, constitution: 8, luck: 1 },
        damage: { type: DamageType.KINETIC, amount: 8 },
        resistances: { [DamageType.KINETIC]: 0.25, [DamageType.ENERGY]: -0.25, [DamageType.MAGIC]: 0.5, [DamageType.EXPLOSIVE]: -0.3, [DamageType.ICE]: 0.3, [DamageType.LIGHTNING]: -0.4 },
        currentHealth: 80, maxHealth: 80,
        statusEffects: [],
        lootTable: [
            {itemId: 'mat_scrap', dropChance: 0.5, quantity: [2, 4]},
            {itemId: 'mat_energy_cell', dropChance: 0.7, quantity: [1, 2]},
            {itemId: 'mat_hardened_plating', dropChance: 0.1, quantity: [1,1]},
        ],
        goldDrop: { min: 20, max: 40 },
        xpValue: 25,
    },
    {
        id: 'enemy_003',
        name: 'Void Lurker',
        level: 3,
        stats: { strength: 8, dexterity: 8, intelligence: 4, constitution: 7, luck: 5 },
        damage: { type: DamageType.KINETIC, amount: 10 },
        resistances: { [DamageType.ENERGY]: 0.2, [DamageType.MAGIC]: -0.2, [DamageType.FIRE]: -0.3 },
        currentHealth: 70, maxHealth: 70,
        statusEffects: [],
        statusEffectOnHit: { type: StatusEffectType.POISON, duration: 3, value: 3 },
        lootTable: [
            {itemId: 'mat_neurotoxin', dropChance: 0.25, quantity: [1, 2]},
        ],
        goldDrop: { min: 30, max: 60 },
        xpValue: 40,
    },
     {
        id: 'enemy_004',
        name: 'Psionic Shade',
        level: 4,
        stats: { strength: 5, dexterity: 7, intelligence: 10, constitution: 6, luck: 4 },
        damage: { type: DamageType.MAGIC, amount: 12 },
        resistances: { [DamageType.MAGIC]: 0.5, [DamageType.KINETIC]: 0.2 },
        currentHealth: 60, maxHealth: 60,
        statusEffects: [],
        lootTable: [
            {itemId: 'mat_zylorian_crystal', dropChance: 0.2, quantity: [1, 1]},
            {itemId: 'mat_energy_cell', dropChance: 0.5, quantity: [1, 3]},
        ],
        goldDrop: { min: 40, max: 70 },
        xpValue: 55,
    }
];

// --- GAME PROGRESSION ---
export const LEVEL_XP_REQUIREMENTS: { [key: number]: number } = {
  1: 100,
  2: 250,
  3: 500,
  4: 1000,
  5: 2000,
  6: 4000,
  7: 8000,
  8: 15000,
  9: 30000,
  10: 60000
};

// --- SKILLS ---
export interface SkillTree {
  id: string;
  name: string;
  class: PlayerClass['name'] | 'Trainer';
  skills: Skill[];
}

export const SKILL_TREES: SkillTree[] = [
    {
        id: 'soldier_tree',
        name: 'Soldier Skills',
        class: 'Soldier',
        skills: [
            { id: 'power_shot', name: 'Power Shot', description: 'A charged attack that deals 150% of normal weapon damage.', type: SkillType.ACTIVE, tree: 'Soldier', levelRequired: 1, effect: { damageMultiplier: 1.5, damageType: DamageType.KINETIC }, cooldown: 3 },
            { id: 'heavy_hitter', name: 'Heavy Hitter', description: 'Passive: Permanently increases Strength by 2.', type: SkillType.PASSIVE, tree: 'Soldier', levelRequired: 3, prerequisites: ['power_shot'], effect: { statBonus: { strength: 2 } } },
            { id: 'breaching_strike', name: 'Breaching Strike', description: 'An attack that ignores half of the enemy\'s defense.', type: SkillType.ACTIVE, tree: 'Soldier', levelRequired: 5, prerequisites: ['heavy_hitter'], effect: { damageMultiplier: 1.2, damageType: DamageType.KINETIC }, cooldown: 4 }, // special combat logic needed
            { id: 'demolition_charge', name: 'Demolition Charge', description: 'Deals damage equal to 120% of your Strength as Explosive damage.', type: SkillType.ACTIVE, tree: 'Soldier', levelRequired: 7, prerequisites: ['breaching_strike'], effect: { damageType: DamageType.EXPLOSIVE }, cooldown: 5 },
        ]
    },
    {
        id: 'scoundrel_tree',
        name: 'Scoundrel Skills',
        class: 'Scoundrel',
        skills: [
            { id: 'swift_strike', name: 'Swift Strike', description: 'A quick jab that deals 80% weapon damage but has a short cooldown.', type: SkillType.ACTIVE, tree: 'Scoundrel', levelRequired: 1, effect: { damageMultiplier: 0.8, damageType: DamageType.KINETIC }, cooldown: 1 },
            { id: 'venomous_strike', name: 'Venomous Strike', description: 'An attack that has a 50% chance to poison the target for 3 turns.', type: SkillType.ACTIVE, tree: 'Scoundrel', levelRequired: 3, prerequisites: ['swift_strike'], effect: { damageMultiplier: 1.1, damageType: DamageType.KINETIC, statusEffect: { target: 'enemy', effect: { type: StatusEffectType.POISON, duration: 3, value: 4 } } }, cooldown: 4 },
            { id: 'double_tap', name: 'Double Tap', description: 'Passive: Your basic attacks have a 15% chance to strike twice.', type: SkillType.PASSIVE, tree: 'Scoundrel', levelRequired: 5, prerequisites: ['venomous_strike'], effect: {} }, // special combat logic
        ]
    },
    {
        id: 'mystic_tree',
        name: 'Mystic Skills',
        class: 'Mystic',
        skills: [
            { id: 'mana_bolt', name: 'Mana Bolt', description: 'Attack using your intelligence, dealing 120% of your INT as Magic damage.', type: SkillType.ACTIVE, tree: 'Mystic', levelRequired: 1, effect: { damageType: DamageType.MAGIC }, cooldown: 2, manaCost: 10 },
            { id: 'mental_fortitude', name: 'Mental Fortitude', description: 'Passive: Permanently increases Intelligence by 2.', type: SkillType.PASSIVE, tree: 'Mystic', levelRequired: 3, prerequisites: ['mana_bolt'], effect: { statBonus: { intelligence: 2 } } },
            { id: 'arcane_shield', name: 'Arcane Shield', description: 'Create a shield that absorbs up to 2x your INT in damage. Lasts 3 turns.', type: SkillType.ACTIVE, tree: 'Mystic', levelRequired: 5, prerequisites: ['mental_fortitude'], effect: {}, cooldown: 6, manaCost: 20 },
            { id: 'mind_wrack', name: 'Mind Wrack', description: 'Assault the enemy\'s mind, with a 30% chance to Stun them for 1 turn.', type: SkillType.ACTIVE, tree: 'Mystic', levelRequired: 7, prerequisites: ['arcane_shield'], effect: { damageType: DamageType.MAGIC, statusEffect: { target: 'enemy', effect: {type: StatusEffectType.STUN, duration: 1}} }, cooldown: 5, manaCost: 25 },
        ]
    },
    {
        id: 'trainer_tree',
        name: 'Trainer Skills',
        class: 'Trainer',
        skills: [
            { id: 'first_aid', name: 'First Aid', description: 'Apply a quick stimpack, healing for 25 health.', type: SkillType.ACTIVE, tree: 'Trainer', levelRequired: 2, effect: { healAmount: 25 }, cooldown: 5, cost: 500 },
            { id: 'improved_constitution', name: 'Improved Constitution', description: 'Passive: Permanently increases Constitution by 2.', type: SkillType.PASSIVE, tree: 'Trainer', levelRequired: 4, prerequisites: ['first_aid'], effect: { statBonus: { constitution: 2 } }, cost: 1000 },
            { id: 'lucky_find', name: 'Lucky Find', description: 'Passive: Permanently increases Luck by 2.', type: SkillType.PASSIVE, tree: 'Trainer', levelRequired: 3, effect: { statBonus: { luck: 2 } }, cost: 750 },
        ]
    }
];

export const ALL_SKILLS_LOOKUP = SKILL_TREES.flatMap(tree => tree.skills).reduce((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
}, {} as { [key: string]: Skill });

// --- ARENAS ---
export const ARENAS: Arena[] = [
    {
        id: 'arena_001',
        name: 'The Scrapyard',
        description: 'A junkyard arena where tetanus is as dangerous as the enemy.',
        levelRange: [1, 3],
        possibleEnemies: ['enemy_001', 'enemy_002'],
        environmentalEffects: [
            { type: 'damage_mod', damageType: DamageType.KINETIC, modifier: 1.15, description: '+15% Kinetic Damage' },
            { type: 'damage_mod', damageType: DamageType.EXPLOSIVE, modifier: 1.15, description: '+15% Explosive Damage' },
            { type: 'turn_effect', statusEffect: { type: StatusEffectType.POISON, duration: 2, value: 2 }, chance: 0.1, description: '10% chance to Poison combatants each turn.' },
        ]
    },
    {
        id: 'arena_002',
        name: 'Volcanic Forge',
        description: 'A battleground amidst rivers of lava. The intense heat is a constant threat.',
        levelRange: [3, 5],
        possibleEnemies: ['enemy_002', 'enemy_003'],
        environmentalEffects: [
            { type: 'damage_mod', damageType: DamageType.FIRE, modifier: 1.25, description: '+25% Fire Damage' },
            { type: 'damage_mod', damageType: DamageType.ICE, modifier: 0.75, description: '-25% Ice Damage' },
            { type: 'turn_effect', statusEffect: { type: StatusEffectType.BURN, duration: 1, value: 4 }, chance: 0.2, description: '20% chance to Burn combatants each turn.' },
        ]
    },
    {
        id: 'arena_003',
        name: 'Zylorian Mind-Scape',
        description: 'A psychic battleground where reality is thin and thoughts are weapons.',
        levelRange: [4, 6],
        possibleEnemies: ['enemy_004'],
        environmentalEffects: [
            { type: 'damage_mod', damageType: DamageType.MAGIC, modifier: 1.30, description: '+30% Magic Damage' },
            { type: 'damage_mod', damageType: DamageType.KINETIC, modifier: 0.80, description: '-20% Kinetic Damage' },
        ]
    }
];

// --- CRAFTING & MODIFICATION ---
export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'craft_reinforced_armor',
        result: 'item_armor_002',
        materials: { 'mat_scrap': 10, 'mat_hardened_plating': 2 },
        cost: 100,
    },
    {
        id: 'craft_ion_blaster',
        result: 'item_weapon_003',
        materials: { 'mat_scrap': 8, 'mat_energy_cell': 5 },
        cost: 150,
    }
];

export const MODIFICATION_RECIPES: ModificationRecipe[] = [
    {
        id: 'mod_precise_rifle',
        baseItem: 'item_weapon_002',
        result: 'item_weapon_cr_001',
        materials: { 'mat_focusing_lens': 2, 'mat_energy_cell': 5 },
        cost: 200,
    },
    {
        id: 'mod_hardened_armor',
        baseItem: 'item_armor_002',
        result: 'item_armor_cr_001',
        materials: { 'mat_hardened_plating': 4, 'mat_scrap': 10 },
        cost: 250,
    },
    {
        id: 'mod_venom_knife',
        baseItem: 'item_weapon_005',
        result: 'item_weapon_cr_002',
        materials: { 'mat_neurotoxin': 3, 'mat_zylorian_crystal': 1 },
        cost: 300,
    }
];