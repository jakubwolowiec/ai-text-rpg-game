//@ts-ignore
import React, {useState, useEffect} from "react";
import {GlobalStyles} from "./styles/GlobalStyles";
import {CharacterPanel} from "./components/CharacterPanel";
import {StatsBars} from "./components/StatsBars";
import {SkillsSection} from "./components/SkillsSection";
import {Inventory} from "./components/Inventory";
import {GameLog} from "./components/GameLog";
import {ActionInput} from "./components/ActionInput";
import {GameState, Character, Stats, Skills, InventoryItem} from "./types/gameTypes";
import {ApiService} from "./services/apiService";

const initialGameState: GameState = {
    character: {
        name: "Linsat of Steelhorn",
        age: 20,
        decription: "A friend of a friend"
    },
    stats: {
        strength: 4,
        charisma: 8,
        wisdom: 5,
        intelligence: 1,
        constitution: 2,
        luck: 7,
        defence: 0,
        dexterity: 4
    },
    skills: {
        magic: ["Magic Missle", "Freeze", "Biden Blast"],
        nonMagic: ["Gambling", "Piano", "Fishing"]
    },
    inventory: [
        {id: '1', name: 'Knife', type: 'weapon'},
        {id: '2', name: 'Cozy Blanket', type: 'item'},
        {id: '3', name: 'Magic Hat', type:'special'}
    ],
    gameLog: [
        "Welcome to the game adventurer!",
        "Your new adventure begins now...",
        "Type your actions in the input box below."
    ],
    currentScene: "forest"
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [isLoading, setIsLoadind] = useState(false);

    const handleAction = async (action: string) => {
        setIsLoadind(true);

        //Adding player action to log
        setGameState(prev => ({
            ...prev,
            gameLog: [...prev.gameLog, `> ${action}`]
        }));

        try {
            //Sending player action to AI API
            const response = await ApiService.sendAction(action);

            //Updating game state using response
            setGameState(prev => ({
                ...prev,
                gameLog: [...prev.gameLog, ...response.gameLog],
                currentScene: response.scene,
            }));
        }
        catch (error) {
            setGameState(prev =>({
                ...prev,
                gameLog: [...prev.gameLog, "System: Error communicating with the AI service."]
            }));
            } finally {
            setIsLoadind(false);
            }
        };

    return (
    <>
        <GlobalStyles/>
        <div className="app-container">
            <div>
                <CharacterPanel character={gameState.character}/>
                <StatsBars stats={gameState.stats}/>
                <SkillsSection skills={gameState.skills}/>
            </div>

            <div>
                <Inventory inventory={gameState.inventory}/>
                <GameLog logs={gameState.gameLog}/>
                <ActionInput onAction={handleAction} disabled={isLoading}/>
            </div>
        </div>
    </>
    );
};
export default App;