import React from 'react';
import { Character, CharacterClass } from '../types/gameTypes';
import '../App.css';

interface CharacterPanelProps {
    character: Character;
    onEditClick: () => void;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
                                                                  character,
                                                                  onEditClick
                                                              }) => {
    const getClassColor = (charClass: CharacterClass) => {
        switch(charClass) {
            case CharacterClass.MAGE: return 'class-mage';
            case CharacterClass.CLERIC: return 'class-cleric';
            case CharacterClass.BARBARIAN: return 'class-barbarian';
            case CharacterClass.RANGER: return 'class-ranger';
            default: return '';
        }
    };

    const getClassIcon = (charClass: CharacterClass) => {
        switch(charClass) {
            case CharacterClass.MAGE: return '🔮';
            case CharacterClass.CLERIC: return '⛪';
            case CharacterClass.BARBARIAN: return '⚔️';
            case CharacterClass.RANGER: return '🏹';
            default: return '👤';
        }
    };

    return (
        <div className="panel">
            <button className="edit-btn" onClick={onEditClick} title="Edit Character">
                ✏️ Edit
            </button>

            <h2 className="section-title">Character</h2>

            <div className="mb-4">
                <div className={`class-badge ${character.class.toLowerCase()}`}>
                    <span>{getClassIcon(character.class)}</span>
                    <span className={getClassColor(character.class)}>{character.class}</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-secondary">Name</div>
                        <div className="font-bold text-lg">{character.name}</div>
                    </div>
                    <div>
                        <div className="text-secondary">Age</div>
                        <div className="font-bold">{character.age}</div>
                    </div>
                </div>

                <div>
                    <div className="text-secondary mb-1">Description</div>
                    <div className="italic p-3 bg-secondary rounded">
                        {character.description || "No description provided."}
                    </div>
                </div>
            </div>
        </div>
    );
};