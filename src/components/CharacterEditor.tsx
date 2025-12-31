import React, { useState } from 'react';
import { Character, CharacterClass, CharacterClasses } from '../types/gameTypes';
import '../App.css';

interface CharacterEditorProps {
    character: Character;
    onSave: (character: Character) => void;
    onCancel: () => void;
}

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
                                                                    character,
                                                                    onSave,
                                                                    onCancel
                                                                }) => {
    const [editedCharacter, setEditedCharacter] = useState<Character>(character);
    const [selectedClass, setSelectedClass] = useState<CharacterClass>(character.class);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedCharacter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClassChange = (charClass: CharacterClass) => {
        setSelectedClass(charClass);
        setEditedCharacter(prev => ({
            ...prev,
            class: charClass
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedCharacter);
    };

    const classButtons = [
        { class: CharacterClass.MAGE, color: 'btn-purple', icon: '🔮', label: 'Mage' },
        { class: CharacterClass.CLERIC, color: 'btn-blue', icon: '⛪', label: 'Cleric' },
        { class: CharacterClass.BARBARIAN, color: 'btn-red', icon: '⚔️', label: 'Barbarian' },
        { class: CharacterClass.RANGER, color: 'btn-green', icon: '🏹', label: 'Ranger' }
    ];

    return (
        <div className="panel">
            <h2 className="section-title">Edit Character</h2>

            <form onSubmit={handleSubmit}>
                {/* Class Selection */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gold">Choose Class</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {classButtons.map(({ class: charClass, color, icon, label }) => (
                            <button
                                key={charClass}
                                type="button"
                                onClick={() => handleClassChange(charClass)}
                                className={`${color} p-4 rounded-lg transition-all duration-200 ${
                                    selectedClass === charClass ? 'ring-2 ring-yellow scale-105' : ''
                                }`}
                            >
                                <div className="text-2xl mb-1">{icon}</div>
                                <div className="font-bold">{label}</div>
                            </button>
                        ))}
                    </div>

                    {/* Class Stats */}
                    <div className="p-3 bg-secondary rounded mb-4">
                        <h4 className="font-bold mb-2">{CharacterClasses[selectedClass].name} Stats:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>STR: {CharacterClasses[selectedClass].stats.strength}</div>
                            <div>CHR: {CharacterClasses[selectedClass].stats.charisma}</div>
                            <div>FTH: {CharacterClasses[selectedClass].stats.faith}</div>
                            <div>INT: {CharacterClasses[selectedClass].stats.intelligence}</div>
                            <div>CNST: {CharacterClasses[selectedClass].stats.constitution}</div>
                            <div>LCK: {CharacterClasses[selectedClass].stats.luck}</div>
                            <div>DEF: {CharacterClasses[selectedClass].stats.defence}</div>
                            <div>DEX: {CharacterClasses[selectedClass].stats.dexterity}</div>
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block mb-2 font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={editedCharacter.name}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter character name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Age</label>
                        <input
                            type="text"
                            name="age"
                            value={editedCharacter.age}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., XXIX or 29"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Description</label>
                        <textarea
                            name="description"
                            value={editedCharacter.description}
                            onChange={handleChange}
                            rows={4}
                            className="textarea-field"
                            placeholder="Describe your character..."
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary flex-1">
                        Save Changes
                    </button>
                    <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};