import axios from "axios";

 const API_BASE_URL = '';

 export interface GameResponse {
     scene: string;
     choices: string[];
     character?: any;
     inventory?: any[];
     gameLog: string[];
 }

 export class ApiService {
     // @ts-ignore
     static async sendAction(action: string): Promise<GameResponse> {
         try {
             const response = await axios.post(`${API_BASE_URL}/action`, {
                 action,
                 timestamp: new Date().toISOString()
             });
             return response.data;
         } catch (error) {
             console.error('API Error: ', error)
             throw new Error('Failed to communicate with the AI service');
         }
     }

     // @ts-ignore
     static async initializeGame(characterData: any): Promise<GameResponse> {
         try {
             const response = await axios.post(`${API_BASE_URL}/initialize`, characterData);
             return response.data;
         } catch (error) {
             console.error('Initialization Error: ', error);
             throw new Error('Failed to initialize the game');
         }
     }
 }