import React from 'react';
import { Enemy } from '../types/gameTypes';
import { Panel, SectionTitle } from '../styles/GlobalStyles';

interface EnemiesProps {
    enemies: Enemy[];
}

export const Enemies: React.FC<EnemiesProps> = ({ enemies }) => {
    if (enemies.length === 0) {
        return null;
    }

    return (
        <Panel>
            <SectionTitle>Enemies</SectionTitle>
            {enemies.map((enemy) => (
                <div key={enemy.id} style={{ marginBottom: '10px' }}>
                    <strong>{enemy.type}</strong> - HP: {enemy.hp}/{enemy.maxHp} - Attack: {enemy.attack} - Defense: {enemy.defence}
                </div>
            ))}
        </Panel>
    );
};