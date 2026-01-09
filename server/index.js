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
    'Mage': "Classify the user action and return only the corresponding tag from this list. Return only the tag, no explanation or other text.\n\nTags:\nATTACK - for attacking or fighting an enemy\nMSKILL:FIREBALL - for casting fireball spell\nMSKILL:MAGIC_MISSILE - for casting magic missile spell\nMSKILL:TELEPORT - for teleporting\nMSKILL:MAGIC_SHIELD - for casting magic shield\nOSKILL:ALCHEMY - for performing alchemy\nOSKILL:APPRAISAL - for appraising items\nOSKILL:SECRET_KNOWLEDGE - for using secret knowledge\nITEM:HEALTH_POTION - for using or drinking health potion\nITEM:STAFF - for using staff\nITEM:SPELLBOOK - for using spellbook\n\nIf none match, return NONE.\n\nUser action: ",
    'Cleric': "Classify the user action and return only the corresponding tag from this list. Return only the tag, no explanation or other text.\n\nTags:\nATTACK - for attacking or fighting an enemy\nMSKILL:HEAL - for casting heal spell\nMSKILL:BLESS - for casting bless spell\nMSKILL:PROTECTION - for casting protection spell\nMSKILL:TURN_UNDEAD - for turning undead\nOSKILL:MEDICINE - for performing medicine\nOSKILL:DIPLOMACY - for diplomacy\nITEM:HEALTH_POTION - for using or drinking health potion\nITEM:HOLY_SYMBOL - for using holy symbol\nITEM:MACE - for using mace\nITEM:HEALING_KIT - for using healing kit\n\nIf none match, return NONE.\n\nUser action: ",
    'Barbarian': "Classify the user action and return only the corresponding tag from this list. Return only the tag, no explanation or other text.\n\nTags:\nATTACK - for attacking or fighting an enemy\nMSKILL:BERSERK - for going berserk\nMSKILL:BATTLE_CRY - for battle cry\nOSKILL:ATHLETICS - for athletics\nOSKILL:SURVIVAL - for survival\nOSKILL:INTIMIDATION - for intimidation\nITEM:RATIONS - for using rations\nITEM:GREAT_AXE - for using great axe\nITEM:TROPHY_NECKLACE - for using trophy necklace\n\nIf none match, return NONE.\n\nUser action: ",
    'Ranger': "Classify the user action and return only the corresponding tag from this list. Return only the tag, no explanation or other text.\n\nTags:\nATTACK - for attacking or fighting an enemy\nMSKILL:ANIMAL_COMPANION - for animal companion\nMSKILL:NATURES_BLESSING - for nature's blessing\nOSKILL:ARCHERY - for archery\nOSKILL:STEALTH - for stealth\nOSKILL:HERBALISM - for herbalism\nOSKILL:TRACKING - for tracking\nOSKILL:SURVIVAL - for survival\nITEM:ARROWS - for using arrows\nITEM:CLOAK - for using cloak\nITEM:LONGBOW - for using longbow\nITEM:HERBS - for using herbs\n\nIf none match, return NONE.\n\nUser action: ",
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
  const { action, characterId, gameLog, enemies } = req.body;
  if (!characterId) {
    console.log('No character ID provided');
    return res.status(400).json({ error: 'Character ID is required' });
  }

  let mechanicsInfo = '';
  let currentEnemy = enemies && enemies.length > 0 ? enemies[0] : null; // Get enemy from request
  
  try {
    console.log('Fetching character data for ID:', characterId);
    // Fetch current character
    const [charRows] = await pool.execute(
      'SELECT hp, inventory, class FROM characters WHERE id = ?',
      [characterId]
    );
    if (charRows.length === 0) {
      console.log('Character not found');
      throw new Error('Character not found');
    }

    let currentHp = charRows[0].hp;
    let inventory = JSON.parse(charRows[0].inventory || '[]');
    let characterClass = charRows[0].class;
    console.log('Character data fetched: HP=', currentHp, 'Class=', characterClass, 'Inventory=', inventory);

    // Player dexterity for defense
    let dex;
    switch(characterClass) {
      case 'Mage': dex = 1; break;
      case 'Cleric': dex = 2; break;
      case 'Barbarian': dex = 4; break;
      case 'Ranger': dex = 7; break;
      default: dex = 5;
    }

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
    const tags = interpreterResponse ? interpreterResponse.trim().split(/\s+/).filter(tag => tag !== 'NONE') : [];
    let skillOrItem = null;
    let firstTag = null;
    
    if (tags.length > 0) {
      // Fish out the first relevant tag
      firstTag = tags[0];
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
          if (!currentEnemy) {
            mechanicsInfo = 'No enemy present to attack.';
          } else {
            // Player stats
            let dmg;
            switch(characterClass) {
              case 'Mage':
                dmg = 8; // Intelligence-based
                break;
              case 'Cleric':
                dmg = 6; // Faith-based  
                break;
              case 'Barbarian':
                dmg = 12; // Strength-based
                break;
              case 'Ranger':
                dmg = 9; // Dexterity-based
                break;
              default:
                dmg = 5;
            }
            
            // Weapon DMG: find equipped weapon
            let weaponDMG = 5;
            const weapon = inventory.find(item => item.type === 'weapon' && item.equipped);
            if (weapon && weapon.dmg) weaponDMG = weapon.dmg;
            
            const playerDMG = dmg + weaponDMG;
            const hitChance = currentEnemy.defence || 10;
            const playerRoll = Math.floor(Math.random() * 20) + 1;
            
            if (playerRoll >= hitChance) {
              currentEnemy.hp -= playerDMG;
              mechanicsInfo = `You attack the ${currentEnemy.name || currentEnemy.type} and deal ${playerDMG} damage!`;
              
              if (currentEnemy.hp <= 0) {
                mechanicsInfo += ` The ${currentEnemy.name || currentEnemy.type} is defeated!`;
              }
            } else {
              mechanicsInfo = `You attack the ${currentEnemy.name || currentEnemy.type} but miss!`;
            }
            
            interpretedAction = `Player attacks: ${action}`;
          }
        } else if (firstTag.startsWith('MSKILL:')) {
          // Spell attack
          if (!currentEnemy) {
            mechanicsInfo = 'No enemy present to cast spell on.';
          } else {
            const spellPower = 8;
            currentEnemy.hp -= spellPower;
            mechanicsInfo = `You cast ${skillOrItem} on the ${currentEnemy.name || currentEnemy.type} and deal ${spellPower} damage!`;
            if (currentEnemy.hp <= 0) {
              mechanicsInfo += ` The ${currentEnemy.name || currentEnemy.type} is defeated!`;
            }
            interpretedAction = `Player uses ${skillOrItem}: ${action}`;
          }
        } else {
          interpretedAction = `Player uses ${skillOrItem}: ${action}`;
        }
        console.log('Interpreted action:', interpretedAction);
      }
    }

    // Enemy counterattack if alive and player damaged it
    if (currentEnemy && currentEnemy.hp > 0 && firstTag && (firstTag === 'ATTACK' || firstTag.startsWith('MSKILL:'))) {
      // Enemy retaliates
      const enemyRoll = Math.floor(Math.random() * 7) + 1;
      if (enemyRoll >= dex) {
        const damage = currentEnemy.attack || 5; // Default to 5 if undefined
        currentHp -= damage;
        mechanicsInfo += ` The ${currentEnemy.name || currentEnemy.type} attacks you back and deals ${damage} damage!`;
        if (currentHp <= 0) {
          mechanicsInfo += ` You have been defeated by the ${currentEnemy.name || currentEnemy.type}!`;
        }
      } else {
        mechanicsInfo += ` The ${currentEnemy.name || currentEnemy.type} attacks you back but misses!`;
      }
    }

    // Update character in DB
    await pool.execute(
      'UPDATE characters SET hp = ?, inventory = ? WHERE id = ?',
      [currentHp, JSON.stringify(inventory), characterId]
    );

    // Game AI step
    const gamePrompt = `You are a narrator for a fantasy RPG game. Based on the current user action and game state, generate a short, engaging narrative description. Only add ENEMY:GOBLIN, ENEMY:TROLL, or ENEMY:DRAGON tag at the end of your response if the user action explicitly indicates searching for or wanting to encounter an enemy, there is no current enemy, and no enemy was just defeated in this action. Do it only once.\n\nGame State: `;
    const gameStateInfo = `Current Enemy: ${currentEnemy ? `${currentEnemy.name} (${currentEnemy.hp} HP)` : 'None'}\nUser Action: ${interpretedAction}`;
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

    // Parse for enemy tags - only create new enemy if none exists and tag is present
    let enemyToReturn = currentEnemy;
    const enemyTypes = {
      'GOBLIN': { name: 'Goblin', hp: 20, attack: 5, defence: 2 },
      'TROLL': { name: 'Troll', hp: 30, attack: 10, defence: 5 },
      'DRAGON': { name: 'Dragon', hp: 40, attack: 20, defence: 10 }
    };

    // Check for new enemy tag only if no current enemy exists and no enemy was just defeated
    if (!enemyToReturn && !mechanicsInfo.includes('defeated') && !mechanicsInfo.includes('Defeated')) {
      const enemyTagRegex = /\s*ENEMY:(GOBLIN|TROLL|DRAGON)\s*/i;
      const tagMatch = gameResponse.match(enemyTagRegex);
      if (tagMatch) {
        console.log("Enemy tag found:", tagMatch[1]);
        const tagType = tagMatch[1].toUpperCase();
        const enemyData = enemyTypes[tagType];
        if (enemyData) {
          enemyToReturn = {
            id: `enemy_${Date.now()}_${Math.random()}`,
            type: enemyData.name,
            name: enemyData.name,
            hp: enemyData.hp,
            attack: enemyData.attack,
            defence: enemyData.defence
          };
          console.log("New enemy created:", enemyToReturn);
        }
      }
    }

    // Remove enemy tags from response before displaying
    const cleanedGameResponse = gameResponse.replace(/\s*ENEMY:(GOBLIN|TROLL|DRAGON)\s*/gi, '').trim();
    console.log('Cleaned game response (tags removed):', cleanedGameResponse);
    
    // Always include the mechanics info in the response
    const finalGameLog = mechanicsInfo ? [`${mechanicsInfo} ${cleanedGameResponse}`] : [cleanedGameResponse];
    
    res.json({
      scene: cleanedGameResponse,
      choices: [],
      gameLog: finalGameLog, // Make sure this is a flat array of strings
      updatedHp: currentHp,
      updatedInventory: inventory,
      enemy: enemyToReturn // This can be null if no enemy
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
  await testConnection(); });