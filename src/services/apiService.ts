import axios from "axios";

// Enable Claude Haiku 4.5 for all clients when the env var is set to 'true'
const ENABLE_CLAUDE_HAIKU = process.env.REACT_APP_ENABLE_CLAUDE_HAIKU === 'true';
const DEFAULT_MODEL: string | undefined = ENABLE_CLAUDE_HAIKU ? 'claude-haiku-4.5' : undefined;

 export interface GameResponse {
     scene: string;
     choices: string[];
     character?: any;
     inventory?: any[];
     gameLog: string[];
     updatedHp: number;
     updatedInventory: any[];
     enemies?: any[];
     enemy?: any;
 }

 export class ApiService {
     // @ts-ignore
    static async sendAction(action: string, characterId: number, gameLog?: string[], enemies?: any[]): Promise<GameResponse> {
        // Send enemy data including HP to narrator/AI backend for combat resolution
        let enemiesForNarrator = undefined;
        if (enemies && Array.isArray(enemies)) {
            enemiesForNarrator = enemies.map(e => ({
                id: e.id,
                type: e.type,
                name: e.name,
                hp: e.hp
            }));
        }
        console.log('ApiService.sendAction called with:', { action, characterId, gameLog, enemies: enemiesForNarrator });
        try {
            console.log('Making POST request to /api/action with payload:', {
                action,
                characterId,
                gameLog,
                enemies: enemiesForNarrator,
                timestamp: new Date().toISOString()
            });
            const response = await axios.post(`api/action`, {
                action,
                characterId,
                gameLog,
                enemies: enemiesForNarrator,
                timestamp: new Date().toISOString()
            });
            console.log('Received response from /api/action:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Error: ', error)
            throw new Error('Failed to communicate with the AI service');
        }
     }

    // @ts-ignore
    static async initializeGame(characterData: any): Promise<GameResponse> {
        try {
            const payload: any = { ...characterData };
            if (DEFAULT_MODEL) payload.model = DEFAULT_MODEL;

            const response = await axios.post(`api/initialize`, payload);
            return response.data;
        } catch (error) {
            console.error('Initialization Error: ', error);
            throw new Error('Failed to initialize the game');
        }
    }

    // Database operations
    static async saveCharacter(character: any): Promise<any> {
        try {
            const response = await axios.post('/api/characters', character);
            return response.data;
        } catch (error) {
            console.error('Save Character Error: ', error);
            throw new Error('Failed to save character');
        }
    }

    static async getCharacters(): Promise<any[]> {
        try {
            const response = await axios.get('/api/characters');
            return response.data;
        } catch (error) {
            console.error('Get Characters Error: ', error);
            throw new Error('Failed to fetch characters');
        }
    }

    // Game sessions
    static async saveGameSession(characterId: number, gameLog: string[], currentScene: string): Promise<any> {
        try {
            const response = await axios.post('/api/game-sessions', { characterId, gameLog, currentScene });
            return response.data;
        } catch (error) {
            console.error('Save Game Session Error: ', error);
            throw new Error('Failed to save game session');
        }
    }

    static async getGameSessions(characterId: number): Promise<any[]> {
        try {
            const response = await axios.get(`/api/game-sessions/${characterId}`);
            return response.data;
        } catch (error) {
            console.error('Get Game Sessions Error: ', error);
            throw new Error('Failed to fetch game sessions');
        }
    }

    static async getGameSession(sessionId: number): Promise<any> {
        try {
            const response = await axios.get(`/api/game-sessions/session/${sessionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error('Session not found. Please check the session ID.');
            }

            console.error('Get Game Session Error: ', error);
            throw new Error('Failed to fetch game session');
        }
    }

    static async getCharacter(id: number): Promise<any> {
        try {
            const response = await axios.get(`/api/characters/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new Error(`Character with ID ${id} not found.`);
            }

            console.error('Get Character Error: ', error);
            throw new Error('Failed to fetch character');
        }
    }

    static async updateCharacter(id: number, character: any): Promise<any> {
        try {
            const response = await axios.put(`/api/characters/${id}`, character);
            return response.data;
        } catch (error) {
            console.error('Update Character Error: ', error);
            throw new Error('Failed to update character');
        }
    }
}