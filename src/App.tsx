import React, { useState } from 'react';
import { CharacterPanel } from './components/CharacterPanel';
import { CharacterEditor } from './components/CharacterEditor';
import { StatsBars } from './components/StatsBars';
import { SkillsSection } from './components/SkillsSection';
import { Inventory } from './components/Inventory';
import { GameLog } from './components/GameLog';
import { ActionInput } from './components/ActionInput';
import {
    GameState,
    Character,
    CharacterClass,
    CharacterClasses
} from './types/gameTypes';
import './App.css';

const createInitialCharacter = (charClass: CharacterClass = CharacterClass.MAGE): Character => ({
    name: "Alandra",
    age: "XXVII",
    description: "A mysterious traveler with unknown origins",
    class: charClass
});

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const initialClass = CharacterClass.MAGE;
        const initialCharacter = createInitialCharacter(initialClass);
        const classData = CharacterClasses[initialClass];

        return {
            character: initialCharacter,
            stats: { ...classData.stats },
            baseStats: { ...classData.stats },
            skills: { ...classData.skills },
            inventory: [...classData.startingInventory],
            gameLog: [
                `Welcome, ${initialCharacter.name} the ${initialClass}!`,
                "Your adventure begins in the Whispering Woods...",
                "Type 'help' for available commands."
            ],
            currentScene: "whispering_woods",
            isEditing: false
        };
    });

    const [isLoading, setIsLoading] = useState(false);

    const toggleEditMode = () => {
        setGameState(prev => ({ ...prev, isEditing: !prev.isEditing }));
    };

    const handleSaveCharacter = (updatedCharacter: Character) => {
        const classData = CharacterClasses[updatedCharacter.class];

        setGameState(prev => ({
            ...prev,
            character: updatedCharacter,
            stats: { ...classData.stats },
            baseStats: { ...classData.stats },
            skills: { ...classData.skills },
            inventory: [...classData.startingInventory],
            gameLog: [
                ...prev.gameLog,
                `Character updated: ${updatedCharacter.name} the ${updatedCharacter.class}`,
                `Class changed to ${updatedCharacter.class}! Skills and inventory updated.`
            ],
            isEditing: false
        }));
    };

    const handleCancelEdit = () => {
        setGameState(prev => ({ ...prev, isEditing: false }));
    };

    const handleAction = async (action: string) => {
        setIsLoading(true);

        setGameState(prev => ({
            ...prev,
            gameLog: [...prev.gameLog, `> ${action}`]
        }));

        setTimeout(() => {
            const responses = [
                `You ${action.toLowerCase()}.`,
                `The forest responds to your action...`,
                `Your ${gameState.character.class.toLowerCase()} skills prove useful.`,
                `A strange energy fills the air.`,
                `Your party members look at you expectantly.`
            ];

            setGameState(prev => ({
                ...prev,
                gameLog: [
                    ...prev.gameLog,
                    responses[Math.floor(Math.random() * responses.length)]
                ]
            }));
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="app">
            {/* Game Header */}
            <div className="game-header">
                <div className="game-header-content">
                    <h1 className="game-title">🎮 AI Text RPG Adventure</h1>
                </div>
            </div>

            <div className="app-container">
                {/* Left Column */}
                <div>
                    {gameState.isEditing ? (
                        <CharacterEditor
                            character={gameState.character}
                            onSave={handleSaveCharacter}
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <CharacterPanel
                            character={gameState.character}
                            onEditClick={toggleEditMode}
                        />
                    )}

                    <StatsBars stats={gameState.stats} />
                    <SkillsSection skills={gameState.skills} characterClass={gameState.character.class} />
                </div>

                {/* Right Column */}
                <div>
                    <Inventory inventory={gameState.inventory} />
                    <GameLog logs={gameState.gameLog} />
                    <ActionInput
                        onAction={handleAction}
                        disabled={isLoading || gameState.isEditing}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;