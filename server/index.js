const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL/HeatWave connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3389,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to get skills by class
function getSkillsByClass(charClass) {
  const skillMap = {
    'Mage': { 
      magic: [
        { name: 'Fireball', power: 6 },
        { name: 'Magic missile', power: 4 },
        { name: 'Teleport', power: 0 },
        { name: 'Magic Shield', power: 5 }
      ], 
      nonMagic: [
        { name: 'Alchemy', power: 3 },
        { name: 'Appraisal', power: 0 },
        { name: 'Secret knowledge', power: 0 }
      ] 
    },
    'Cleric': { 
      magic: [
        { name: 'Heal', power: 10 },
        { name: 'Bless', power: 3 },
        { name: 'Protection', power: 4 },
        { name: 'Turn undead', power: 8 }
      ], 
      nonMagic: [
        { name: 'Medicine', power: 5 },
        { name: 'Diplomacy', power: 0 }
      ] 
    },
    'Barbarian': { 
      magic: [
        { name: 'Berserk', power: 7 },
        { name: 'Battle Cry', power: 2 }
      ], 
      nonMagic: [
        { name: 'Athletics', power: 0 },
        { name: 'Survival', power: 0 },
        { name: 'Intimidation', power: 0 }
      ] 
    },
    'Ranger': { 
      magic: [
        { name: 'Animal companion', power: 0 },
        { name: 'Natures Blessing', power: 6 }
      ], 
      nonMagic: [
        { name: 'Archery', power: 0 },
        { name: 'Stealth', power: 0 },
        { name: 'Herbalism', power: 0 },
        { name: 'Tracking', power: 0 },
        { name: 'Survival', power: 0 }
      ] 
    }
  };
  return skillMap[charClass] || { magic: [], nonMagic: [] };
}

// Helper function to get class-specific interpreter prompt
function getInterpreterPromptByClass(charClass) {
  const promptMap = {
    'Mage': "Analyze the user action and return only the appropriate tags only from: MSKILL:FIREBALL, MSKILL:MAGIC_MISSILE, MSKILL:TELEPORT, MSKILL:MAGIC_SHIELD, OSKILL:ALCHEMY, OSKILL:APPRAISAL, OSKILL:SECRET_KNOWLEDGE, ITEM:HEALTH_POTION, ITEM:STAFF, ITEM:SPELLBOOK, ATTACK. If none match, return NONE. User action: ",
    'Cleric': "Analyze the user action and return only the appropriate tags only from: MSKILL:HEAL, MSKILL:BLESS, MSKILL:PROTECTION, MSKILL:TURN_UNDEAD, OSKILL:MEDICINE, OSKILL:DIPLOMACY, ITEM:HEALTH_POTION, ITEM:HOLY_SYMBOL, ITEM:MACE, ITEM:HEALING_KIT, ATTACK. If none match, return NONE. User action: ",
    'Barbarian': "Analyze the user action and return only the appropriate tags only from: MSKILL:BERSERK, MSKILL:BATTLE_CRY, OSKILL:ATHLETICS, OSKILL:SURVIVAL, OSKILL:INTIMIDATION, ITEM:RATIONS, ITEM:GREAT_AXE, ITEM:TROPHY_NECKLACE, ATTACK. If none match, return NONE. User action: ",
    'Ranger': "Analyze the user action and return only the appropriate tags only from: MSKILL:ANIMAL_COMPANION, MSKILL:NATURES_BLESSING, OSKILL:ARCHERY, OSKILL:STEALTH, OSKILL:HERBALISM, OSKILL:TRACKING, OSKILL:SURVIVAL, ITEM:ARROWS, ITEM:CLOAK, ITEM:LONGBOW, ITEM:HERBS, ATTACK. If none match, return NONE. User action: "
  };
  return promptMap[charClass] || promptMap['Mage']; // Default to Mage if class not found
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Example endpoint to get a specific character by ID
app.get('/api/characters/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching character with ID:', id);
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, s.strength, s.charisma, s.faith, s.intelligence, s.constitution, s.luck, s.defence, s.dexterity
      FROM characters c
      LEFT JOIN stats s ON c.stats_id = s.ID
      WHERE c.id = ?
    `, [parseInt(id)]);
    console.log('Query result rows:', rows.length);
    if (rows.length === 0) {
      console.log('No character found for ID:', id);
      return res.status(404).json({ error: 'Character not found' });
    }

    const row = rows[0];
    const character = {
      id: row.id,
      name: row.name,
      age: row.age,
      class: row.class,
      description: row.description,
      hp: row.hp,
      stats: {
        strength: row.strength || 0,
        charisma: row.charisma || 0,
        faith: row.faith || 0,
        intelligence: row.intelligence || 0,
        constitution: row.constitution || 0,
        luck: row.luck || 0,
        defence: row.defence || 0,
        dexterity: row.dexterity || 0
      },
      skills: getSkillsByClass(row.class),
      inventory: JSON.parse(row.inventory || '[]')
    };
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// AI Action endpoint
app.post('/api/action', async (req, res) => {
  console.log('Received action:', req.body);
  const { action, characterId, gameLog } = req.body;
  if (!characterId) {
    console.log('No character ID provided');
    return res.status(400).json({ error: 'Character ID is required' });
  }

  let mechanicsInfo = '';
  try {
    console.log('Fetching character data for ID:', characterId);
    // Fetch current character
    const [charRows] = await pool.execute(`
      SELECT hp, inventory, class FROM characters WHERE id = ?
    `, [characterId]);
    if (charRows.length === 0) {
      console.log('Character not found');
      throw new Error('Character not found');
    }

    let currentHp = charRows[0].hp;
    let inventory = JSON.parse(charRows[0].inventory || '[]');
    let characterClass = charRows[0].class;
    console.log('Character data fetched: HP=', currentHp, 'Class=', characterClass, 'Inventory=', inventory);
    // Interpreter step
    const interpreterPrompt = getInterpreterPromptByClass(characterClass);
    const interpreterQuery = interpreterPrompt + action;
    
    await pool.execute('SET @query = ?', [interpreterQuery]);
    console.log('Interpreter query set:', interpreterQuery);
    const [interpreterRows] = await pool.execute(`SELECT sys.ML_GENERATE(@query, JSON_OBJECT("task", "generation", "model_id", "llama3.2-3b-instruct-v1", "language", "en")) AS response`);
    console.log('Interpreter query executed');
    let interpreterResponse = interpreterRows[0]?.response;
    console.log('Interpreter response:', interpreterResponse);
    interpreterResponse = interpreterResponse["text"]?.toString();
    console.log('Parsed interpreter response text:', interpreterResponse);

    // Parse interpreter response for tags
    let interpretedAction = action; // default to original
    const tags = interpreterResponse.trim().split(/\s+/).filter(tag => tag !== 'NONE');
    if (tags.length > 0) {
      // Fish out the first relevant tag
      const firstTag = tags[0];
      let skillOrItem = null;
      if (firstTag.startsWith('MSKILL:') || firstTag.startsWith('OSKILL:') || firstTag.startsWith('ITEM:') || firstTag === 'ATTACK') {
        skillOrItem = firstTag.split(':')[1] || firstTag; // for ATTACK, it's just ATTACK
      }

      if (skillOrItem) {
        // Handle mechanics
        if (skillOrItem === 'HEALTH_POTION') {
          const potionIndex = inventory.findIndex(item => item.name === 'Health potion');
          if (potionIndex !== -1 && inventory[potionIndex].quantity > 0) {
            inventory[potionIndex].quantity -= 1;
            currentHp = Math.min(currentHp + 10, 100); // assume max 100
            mechanicsInfo = 'You drink a health potion and recover 10 HP.';
          } else {
            mechanicsInfo = 'You have no health potions.';
          }
        } else if (skillOrItem === 'ALCHEMY') {
          const potionIndex = inventory.findIndex(item => item.name === 'Health potion');
          if (potionIndex !== -1) {
            inventory[potionIndex].quantity += 1;
          } else {
            inventory.push({ id: '3', name: 'Health potion', type: 'consumable', quantity: 1 });
          }

          mechanicsInfo = 'You brew a health potion.';
        } else if (firstTag === 'ATTACK') {
          // Basic combat handling
          // For demo, assume one enemy present (extend as needed)
          let enemy = null;
          if (Array.isArray(req.body.enemies) && req.body.enemies.length > 0) {
            enemy = req.body.enemies[0];
          }

          // Fallback: try to find enemy in gameLog or elsewhere if needed
          if (!enemy) {
            // No enemy provided, skip combat
            mechanicsInfo = 'No enemy present to attack.';
          } else {
            // Player stats
            const playerStats = [currentHp, 10]; // [hp, baseDMG], extend as needed
            // Weapon DMG: find equipped weapon
            let weaponDMG = 5;
            const weapon = inventory.find(item => item.type === 'weapon' && item.equipped);
            if (weapon && weapon.dmg) weaponDMG = weapon.dmg;
            // Monster stats
            const monsterStats = [enemy.hp, enemy.attack, enemy.hitChance || 10];
            // Roll
            const playerRoll = Math.floor(Math.random() * 19) + 1;
            const playerDMG = playerStats[0] + weaponDMG;
            const monsterDMG = monsterStats[0];
            const hitChance = monsterStats[1];
            if (playerRoll >= hitChance) {
              enemy.hp -= playerDMG;
              mechanicsInfo = `You attack the ${enemy.type} and deal ${playerDMG} damage!`;
              if (enemy.hp <= 0) {
                mechanicsInfo += ` The ${enemy.type} is defeated!`;
              }
            } else {
              mechanicsInfo = `You attack the ${enemy.type} but miss!`;
            }
          }
        } else if (firstTag.startsWith('MSKILL:')) {
          // Spell attack (simplified)
          let enemy = null;
          if (Array.isArray(req.body.enemies) && req.body.enemies.length > 0) {
            enemy = req.body.enemies[0];
          }

          if (!enemy) {
            mechanicsInfo = 'No enemy present to cast spell on.';
          } else {
            // For demo, spell power = 8
            const spellPower = 8;
            enemy.hp -= spellPower;
            mechanicsInfo = `You cast ${skillOrItem} on the ${enemy.type} and deal ${spellPower} damage!`;
            if (enemy.hp <= 0) {
              mechanicsInfo += ` The ${enemy.type} is defeated!`;
            }
          }
        }

        // Modify the action for the game AI
        interpretedAction = `Player uses ${skillOrItem}: ${action}`;
        console.log('Interpreted action:', interpretedAction);
      }
    };

    //Update character in DB
    await pool.execute(
      'UPDATE characters SET hp = ?, inventory = ? WHERE id = ?',
      [currentHp, JSON.stringify(inventory), characterId]
    );
    
    // Game AI step
    const gamePrompt = `You are a narrator for a fantasy RPG game. Based on given user prompts and information about the game state, generate a short yet engaging narrative description. If a new enemy is present or the character is approached by a new enemy, add either ENEMY:GOBLIN, ENEMY:TROLL, or ENEMY:DRAGON tag at the end of your response in this exact format.\n\nGame State: `;
    const gameStateInfo = `Game Log: ${JSON.stringify(gameLog || [])}\nUser Action: ${interpretedAction}`;
    const gameQuery = mechanicsInfo ? `${gamePrompt}${gameStateInfo}\n\n${mechanicsInfo}` : `${gamePrompt}${gameStateInfo}`;
    
    console.log('Game query:', gameQuery);
    await pool.execute('SET @query = ?', [gameQuery]);
    const [gameRows] = await pool.execute(`SELECT sys.ML_GENERATE(@query, JSON_OBJECT("task", "generation", "model_id", "llama3.2-3b-instruct-v1", "language", "en")) AS response`);
    console.log('Game AI query executed');
    let gameResponse = gameRows[0]?.response;
    console.log('Raw game response:', gameResponse);
    gameResponse = gameResponse["text"]?.toString();

    if (typeof gameResponse !== 'string') {
      gameResponse = 'The AI could not generate a response.';
    }

    console.log('Final game response:', gameResponse);

    // Parse for enemy tags in format ENEMY:GOBLIN, ENEMY:TROLL, ENEMY:DRAGON
    let enemy = null;
    const enemyTypes = {
      'GOBLIN': { name: 'Goblin', hp: 30, attack: 5, defence: 2 },
      'TROLL': { name: 'Troll', hp: 60, attack: 10, defence: 5 },
      'DRAGON': { name: 'Dragon', hp: 150, attack: 20, defence: 10 }
    };
    // Extract only the first enemy tag from response
    const enemyTagRegex = /\s*ENEMY:(GOBLIN|TROLL|DRAGON)\s*/i;
    const tagMatch = gameResponse.match(enemyTagRegex);
    if (tagMatch) {
      const tagType = tagMatch[1].toUpperCase();
      const enemyData = enemyTypes[tagType];
      if (enemyData) {
        enemy = {
          id: `enemy_${Date.now()}_${Math.random()}`,
          type: enemyData.name,
          hp: enemyData.hp,
          maxHp: enemyData.hp,
          attack: enemyData.attack,
          defence: enemyData.defence
        };
      }
    }
    // Remove enemy tags from response before displaying
    const cleanedGameResponse = gameResponse.replace(/\s*ENEMY:(GOBLIN|TROLL|DRAGON)\s*/gi, '').trim();
    console.log('Cleaned game response (tags removed):', cleanedGameResponse);
    res.json({
      scene: cleanedGameResponse,
      choices: [],
      gameLog: [cleanedGameResponse],
      updatedHp: currentHp,
      updatedInventory: inventory,
      enemy: enemy // Only one enemy per encounter
    });
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

// Example endpoint to save character
app.post('/api/characters', async (req, res) => {
  const { name, class: charClass, stats, inventory, age, description } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert stats
    const [statsResult] = await connection.execute(
      'INSERT INTO stats (strength, charisma, faith, intelligence, constitution, luck, defence, dexterity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [stats.strength, stats.charisma, stats.faith, stats.intelligence, stats.constitution, stats.luck, stats.defence, stats.dexterity]
    );
    const statsId = statsResult.insertId;

    // Insert character
    const [charResult] = await connection.execute(
      'INSERT INTO characters (name, age, class, description, stats_id, inventory) VALUES (?, ?, ?, ?, ?, ?)',
      [name, parseInt(age) || 25, charClass, description || '', statsId, JSON.stringify(inventory || [])]
    );

    await connection.commit();
    res.json({ id: charResult.insertId, message: 'Character saved' });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving character:', error);
    res.status(500).json({ error: 'Failed to save character' });
  } finally {
    connection.release();
  }
});

// Add this function before app.listen
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Example endpoint to save game session
app.post('/api/game-sessions', async (req, res) => {
  const { characterId, gameLog, currentScene } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO game_sessions (character_id, game_log, current_scene) VALUES (?, ?, ?)',
      [characterId, JSON.stringify(gameLog), currentScene]
    );
    res.json({ id: result.insertId, message: 'Game session saved' });
  } catch (error) {
    console.error('Error saving game session:', error);
    res.status(500).json({ error: 'Failed to save game session' });
  }
});

// Example endpoint to get a specific game session by ID
app.get('/api/game-sessions/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM game_sessions WHERE id = ?', [parseInt(sessionId)]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({ error: 'Failed to fetch game session' });
  }
});

// Example endpoint to update character
app.put('/api/characters/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, class: charClass, description, hp, inventory } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update character
    await connection.execute(
      'UPDATE characters SET name = ?, age = ?, class = ?, description = ?, hp = ?, inventory = ? WHERE id = ?',
      [name, age, charClass, description, hp || 100, JSON.stringify(inventory || []), id]
    );

    await connection.commit();
    res.json({ message: 'Character updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  } finally {
    connection.release();
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testConnection();
});