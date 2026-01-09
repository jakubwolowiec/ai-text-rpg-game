-- Database schema for AI Text RPG Game
-- Compatible with Oracle HeatWave (MySQL)

CREATE DATABASE IF NOT EXISTS rpg_game;
USE rpg_game;


-- Stats table
CREATE TABLE IF NOT EXISTS`stats` (
  `strength` int NOT NULL DEFAULT '0',
  `charisma` int NOT NULL DEFAULT '0',
  `faith` int NOT NULL DEFAULT '0',
  `intelligence` int NOT NULL DEFAULT '0',
  `constitution` int NOT NULL DEFAULT '0',
  `luck` int NOT NULL DEFAULT '0',
  `defence` int NOT NULL DEFAULT '0',
  `dexterity` int NOT NULL DEFAULT '0',
  `ID` int NOT NULL AUTO_INCREMENT,
  `char_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Characters table
CREATE TABLE IF NOT EXISTS `characters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `age` int DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `description` text,
  `level` int DEFAULT '1',
  `hp` int DEFAULT '100',
  `inventory` text,
  `stats_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `characters_stats_FK` (`stats_id`),
  CONSTRAINT `characters_stats_FK` FOREIGN KEY (`stats_id`) REFERENCES `stats` (`ID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Game sessions table (for future use)
CREATE TABLE IF NOT EXISTS  `game_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `character_id` int DEFAULT NULL,
  `game_log` json DEFAULT NULL,
  `current_scene` varchar(888) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `game_sessions_characters_FK` (`character_id`),
  CONSTRAINT `game_sessions_characters_FK` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for performance
CREATE INDEX idx_characters_class ON characters(class);
CREATE INDEX idx_game_sessions_character_id ON game_sessions(character_id);