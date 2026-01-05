# AI Coding Agent Instructions for AI Text RPG Game

## Architecture Overview
This is a React TypeScript application for an AI-powered text-based RPG game with a Node.js/Express backend for MySQL/Oracle HeatWave database integration. The app uses simple state management with React hooks, no external state libraries.+

**Key Structure:**
- `src/App.tsx`: Main component managing global game state (character, stats, inventory, game log)
- `src/components/`: UI components for character panel, stats bars, inventory, etc.
- `src/types/gameTypes.ts`: Core data types including `Character`, `GameState`, `CharacterClasses` with predefined stats/skills/inventory
- `src/services/apiService.ts`: Axios-based API client for AI responses and database operations
- `src/styles/`: Mix of CSS classes (`App.css`) and styled-components (`GlobalStyles.ts`)
- `server/index.js`: Express server with MySQL/HeatWave connection pool
- `db/schema.sql`: Database schema for characters and game sessions

## Backend Integration
- Express server on port 5000 with MySQL2 connection to Oracle HeatWave
- API endpoints: `/api/characters` and `/api/game-sessions` for CRUD operations
- Database schema: Separate tables for characters, stats, and game sessions
- Environment variables in `.env` for database credentials
- Proxy configured in `package.json` for development

**Example:** Character saves trigger `ApiService.saveCharacter()` and `ApiService.saveGameSession()` calls to persist data in HeatWave.

## State Management Pattern
Game state is centralized in `App.tsx` using `useState<GameState>`. Components receive data via props and call callbacks to update state.

**Example:** Character class changes update stats/skills/inventory from `CharacterClasses[charClass]` data.

## Component Patterns
- Functional components with TypeScript interfaces for props
- CSS classes for styling (e.g., `panel`, `section-title`, `edit-btn`)
- Class-specific styling using enums (e.g., `class-mage`, `class-barbarian`)

**Example:** `CharacterPanel` uses `getClassColor()` and `getClassIcon()` for dynamic class badges.

## Data Flow
- Character creation/editing triggers full state reset from class templates
- Actions append to `gameLog` array, currently simulated with `setTimeout`
- Inventory and skills are arrays/objects updated immutably

## Styling Conventions
- Dark theme (#1a1a1a background, #e0e0e0 text)
- Monospace font for game-like feel
- Grid layout: 300px sidebar + flexible main content
- Styled-components for reusable elements like `Panel` and `SectionTitle`

## Development Workflow
- `npm start`: Runs React dev server (CRA)
- `npm run server`: Runs Express backend server
- `npm run dev`: Runs both client and server concurrently
- `npm test`: Runs Jest with React Testing Library
- `npm run build`: Production build
- Database setup: Run `db/schema.sql` on HeatWave instance

## Key Files to Reference
- `src/types/gameTypes.ts`: Understand character classes, stats, and game state structure
- `src/App.tsx`: See state management and component integration
- `src/styles/GlobalStyles.ts`: View styled-components patterns
- `src/components/CharacterPanel.tsx`: Example of class-specific UI logic
- `server/index.js`: Backend server and database connection setup
- `db/schema.sql`: Database table definitions (characters, stats, game_sessions)

## Integration Points
- API service ready for external AI backend (enable via `REACT_APP_ENABLE_CLAUDE_HAIKU=true`)
- Currently uses mock responses in `handleAction` for development
- Axios for HTTP requests with error handling

## Testing Approach
- Uses `@testing-library/react` for component testing
- No custom test utilities; standard setup
- Focus on user interactions and state changes</content>
<parameter name="filePath">.github/copilot-instructions.md