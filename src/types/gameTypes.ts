export interface Character {
    name: string;
    age: number;
    decription: string;
}

export interface Stats {
    strength: number;
    charisma: number;
    wisdom: number;
    intelligence: number;
    constitution: number;
    dexterity: number;
    defence: number;
    luck: number;
}

export interface Skills {
    magic: string[];
    nonMagic: string[];
}

export interface InventoryItem {
    id: string;
    name: string;
    type: 'item' | 'weapon' | 'special';
}

export interface GameState {
    character: Character;
    stats: Stats;
    skills: Skills;
    inventory: InventoryItem[];
    gameLog: string[];
    currentScene: string;
}