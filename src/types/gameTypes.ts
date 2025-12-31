export enum CharacterClass {
    MAGE = 'Mage',
    CLERIC = 'Cleric',
    BARBARIAN = 'Barbarian',
    RANGER = 'Ranger'
}

export type ItemType = 'item' | 'weapon' | 'special' | 'consumable';

export interface Character {
    id?: string;
    name: string;
    age: string;
    description: string;
    class: CharacterClass;
}

export interface Stats {
    strength: number;
    charisma: number;
    faith: number;
    intelligence: number;
    constitution: number;
    luck: number;
    defence: number;
    dexterity: number;
}

export interface Skills {
    magic: string[];
    nonMagic: string[];
}

export interface InventoryItem {
    id: string;
    name: string;
    type: ItemType;
    description?: string;
    quantity?: number;
}

export interface GameState {
    character: Character;
    stats: Stats;
    baseStats: Stats;
    skills: Skills;
    inventory: InventoryItem[];
    gameLog: string[];
    currentScene: string;
    isEditing: boolean;
}

export const CharacterClasses = {
    [CharacterClass.MAGE]: {
        name: 'Mage',
        stats: {
            strength: 2,
            charisma: 4,
            faith: 3,
            intelligence: 8,
            constitution: 4,
            luck: 4,
            defence: 4,
            dexterity: 1
        },
        skills: {
            magic: ['Fireball', 'Magic missile', 'Teleport', 'Shield'],
            nonMagic: ['Alchemy', 'Appraisal', 'Secret knowledge']
        },
        startingInventory: [
            {id: '1', name: 'Spellbook', type: 'special' as const, description: 'Ancient tome of magic'},
            {id: '2', name: 'Staff', type: 'weapon' as const, description: 'Wooden staff used for casting spells'},
            {id: '3', name: 'Health potion', type: 'consumable' as const, quantity: 2}
        ]
    },
    [CharacterClass.CLERIC]: {
        name: 'Cleric',
        stats: {
            strength: 2,
            charisma: 4,
            faith: 8,
            intelligence: 4,
            constitution: 4,
            luck: 5,
            defence: 5,
            dexterity: 2
        },
        skills: {
            magic: ['Heal', 'Bless', 'Protection', 'Turn undead'],
            nonMagic: ['Medicine', 'Diplomacy', 'First aid']
        },
        startingInventory: [
            {id: '1', name: 'Holy Symbol', type: 'special' as const, description: 'Symbol of a forgotten diety'},
            {id: '2', name: 'Mace', type: 'weapon' as const, description: 'Heavy mace'},
            {id: '3', name: 'Healing kit', type: 'consumable' as const, quantity: 3}
        ]
    },
    [CharacterClass.BARBARIAN]: {
        name: 'Barbarian',
        stats: {
            strength: 8,
            charisma: 3,
            faith: 2,
            intelligence: 1,
            constitution: 7,
            luck: 6,
            defence: 7,
            dexterity: 4
        },
        skills: {
            magic: ['Berserk', 'Battle Cry'],
            nonMagic: ['Athletics', 'Survival', 'Intimidation']
        },
        startingInventory: [
            {id: '1', name: 'Great Axe', type: 'weapon' as const, description: 'Massive two-handed axe'},
            {id: '2', name: 'Trophy necklace', type: 'special' as const, description: 'Necklace of the fallen foes'},
            {id: '3', name: 'Rations', type: 'consumable' as const, quantity: 5}
        ]
    },
    [CharacterClass.RANGER]: {
        name: 'Ranger',
        stats: {
            strength: 3,
            charisma: 8,
            faith: 4,
            intelligence: 6,
            constitution: 5,
            luck: 8,
            defence: 4,
            dexterity: 7
        },
        skills: {
            magic: ['Animal companion', 'Nature\'s Blessing'],
            nonMagic: ['Archery', 'Stealth', 'Herbalism', 'Tracking', 'Survival']
        },
        startingInventory: [
            {id: '1', name: 'Longbow', type: 'weapon' as const, description: 'Precise hunting bow'},
            {id: '2', name: 'Cloak', type: 'special' as const, description: 'Stealthy cloak'},
            {id: '3', name: 'Arrows', type: 'consumable' as const, quantity: 20},
            {id: '3', name: 'Herbs', type: 'consumable' as const, quantity: 3}
        ]
    }
};