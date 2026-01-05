import React, { useState } from 'react';
import { CharacterPanel } from './components/CharacterPanel';
import { CharacterEditor } from './components/CharacterEditor';
import { StatsBars } from './components/StatsBars';
import { SkillsSection } from './components/SkillsSection';
import { Inventory } from './components/Inventory';
import { GameLog } from './components/GameLog';
import { Enemies } from './components/Enemies';
import { ActionInput } from './components/ActionInput';
import {
    GameState,
    Character,
    CharacterClass,
    CharacterClasses
} from './types/gameTypes';
import { ApiService } from './services/apiService';
import './App.css';

const createInitialCharacter = (charClass: CharacterClass = CharacterClass.MAGE): Character => {
    const classData = CharacterClasses[charClass];
    return {
        name: "Alandra",
        age: 15,
        description: "A mysterious traveler with unknown origins",
        hp: 100,
        class: charClass,
        stats: { ...classData.stats },
        skills: { ...classData.skills },
        inventory: [...classData.startingInventory]
    };
};

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
            isEditing: false,
            enemies: []
        };
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [savedSessionId, setSavedSessionId] = useState<number| null>(null);
    const [sessionIdToLoad, setSessionIdToLoad] = useState('');

    const handleSaveSession = async () => {
        let characterId: number;
        if (gameState.character.id) {
            characterId = gameState.character.id;
        } else {
            characterId = await handleSaveCharacter(gameState.character);
        }

        try {
            const result = await ApiService.saveGameSession(characterId, gameState.gameLog, gameState.currentScene);
            setSavedSessionId(result.id);
        } catch (error) {
            alert('Failed to save session.');
        }
    };

    const handleLoadSession = async () => {
        if (!sessionIdToLoad) {
            alert('Please enter a session ID.');
            return;
        }

        try {
            const session = await ApiService.getGameSession(parseInt(sessionIdToLoad));
            let character: Character;
            try {
                character = await ApiService.getCharacter(session.character_id);
            } catch (charError: any) {
                if (charError.message.includes('not found')) {
                    alert('The character associated with this session was not found. Loading session with current character.');
                    character = gameState.character; // Keep current character
                } else {
                    throw charError;
                }
            }

            setGameState(prev => ({
                ...prev,
                character: character,
                stats: character.stats,
                baseStats: character.stats,
                skills: character.skills,
                inventory: character.inventory,
                gameLog: session.game_log,
                currentScene: session.current_scene
            }));
            setIsSessionModalOpen(false);
            setSessionIdToLoad('');
        } catch (error: any) {
            alert(error.message || 'Failed to load session.');
        }
    };

    const toggleEditMode = () => {
        setGameState(prev => ({ ...prev, isEditing: !prev.isEditing }));
    };

    const handleSaveCharacter = async (updatedCharacter: Character): Promise<number> => {
        setIsLoading(true);
        const classData = CharacterClasses[updatedCharacter.class];

        try {
            let saveResult: { id: number; message?: string };
            if (gameState.character.id) {
                // Update existing character
                await ApiService.updateCharacter(gameState.character.id, {
                    name: updatedCharacter.name,
                    age: updatedCharacter.age,
                    class: updatedCharacter.class,
                    description: updatedCharacter.description,
                    hp: updatedCharacter.hp || 100,
                    inventory: [...classData.startingInventory]
                });
                saveResult = { id: gameState.character.id };
            } else {
                // Save new character
                saveResult = await ApiService.saveCharacter({
                    name: updatedCharacter.name,
                    class: updatedCharacter.class,
                    stats: { ...classData.stats },
                    skills: { ...classData.skills },
                    inventory: [...classData.startingInventory]
                });
            }

            setGameState(prev => ({
                ...prev,
                character: { ...updatedCharacter, id: saveResult.id },
                stats: { ...classData.stats },
                baseStats: { ...classData.stats },
                skills: { ...classData.skills },
                inventory: [...classData.startingInventory],
                gameLog: [
                    ...prev.gameLog,
                    `Character updated: ${updatedCharacter.name} the ${updatedCharacter.class}`,
                    `Class changed to ${updatedCharacter.class}! Skills and inventory updated.`,
                    `Character saved to database.`
                ],
                isEditing: false
            }));
            return saveResult.id;
        } catch (error) {
            console.error('Failed to save character:', error);
            setGameState(prev => ({
                ...prev,
                gameLog: [
                    ...prev.gameLog,
                    `Error: Failed to save character to database.`
                ]
            }));
            throw error; // or return some error id, but better throw
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setGameState(prev => ({ ...prev, isEditing: false }));
    };

    const handleAction = async (action: string) => {
        console.log('handleAction called with action:', action);
        if (!gameState.character.id) {
            console.log('No character ID, alerting user to save character first');
            alert('Please save your character first.');
            return;
        }

        console.log('Setting loading to true');
        // Add placeholder to gameLog
        setGameState(prev => ({
            ...prev,
            gameLog: [...prev.gameLog, `> ${action}`, 'The DM is thinking...']
        }));
        setIsLoading(true);

        try {
            console.log('Calling ApiService.sendAction with:', { action, characterId: gameState.character.id, gameLog: gameState.gameLog, enemies: gameState.enemies });
            const response = await ApiService.sendAction(action, gameState.character.id, gameState.gameLog, gameState.enemies);
            console.log('Received response from ApiService:', response);

            // Remove placeholder and add AI response
            setGameState(prev => {
                // Remove last 'The DM is thinking...' if present
                const logWithoutThinking = prev.gameLog[prev.gameLog.length - 1] === 'The DM is thinking...'
                    ? prev.gameLog.slice(0, -1)
                    : prev.gameLog;
                return {
                    ...prev,
                    character: { ...prev.character, hp: response.updatedHp },
                    inventory: response.updatedInventory,
                    gameLog: [...logWithoutThinking, response.gameLog[0]],
                    currentScene: response.scene,
                    enemies: response.enemies ? [...prev.enemies, ...response.enemies] : prev.enemies
                };
            });
            console.log('Game state updated successfully');
        } catch (error) {
            console.error('Action error:', error);
            setGameState(prev => {
                // Remove placeholder if present
                const logWithoutThinking = prev.gameLog[prev.gameLog.length - 1] === 'The DM is thinking...'
                    ? prev.gameLog.slice(0, -1)
                    : prev.gameLog;
                return {
                    ...prev,
                    gameLog: [...logWithoutThinking, 'Error: Failed to process action.']
                };
            });
        } finally {
            console.log('Setting loading to false');
            setIsLoading(false);
        }
    };

    return (
        <div className="app">
            {/* Game Header */}
            <div className="game-header">
                <div className="game-header-content">
                    <h1 className="game-title">🎮 AI Text RPG Adventure</h1>
                    <button className="session-btn" onClick={() => setIsSessionModalOpen(true)}>💾 Save/Load Session</button>
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
                    <Enemies enemies={gameState.enemies} />
                    <GameLog logs={gameState.gameLog} />
                    <ActionInput
                        onAction={handleAction}
                        disabled={isLoading || gameState.isEditing}
                    />
                </div>
            </div>
        {isSessionModalOpen && (
            <div className="modal-overlay" onClick={() => setIsSessionModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h2>Save/Load Session</h2>
                    <div className="modal-section">
                        <h3>Save Current Session</h3>
                        <button onClick={handleSaveSession}>Save Session</button>
                        {savedSessionId && (
                            <p>Session saved with ID: <strong>{savedSessionId}</strong></p>
                        )}
                    </div>
                    <div className="modal-section">
                        <h3>Load Session</h3>
                        <input
                            type="text"
                            placeholder="Enter Session ID"
                            value={sessionIdToLoad}
                            onChange={e => setSessionIdToLoad(e.target.value)}
                        />
                        <button onClick={handleLoadSession}>Load Session</button>
                    </div>
                    <button className="close-btn" onClick={() => setIsSessionModalOpen(false)}>Close</button>
                </div>
            </div>
        )}
        </div>
    );
};

export default App;