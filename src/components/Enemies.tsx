import React from 'react';
import { Enemy, EnemyType, EnemyTypes } from '../types/gameTypes';

interface EnemiesProps {
    enemies: Enemy[];
}

const Enemies: React.FC<EnemiesProps> = ({ enemies }) => {
    const getEnemyColor = (type?: string) => {
        switch (type) {
            case 'Dragon': return 'var(--red)';
            case 'Troll': return 'var(--green)';
            case 'Goblin': return 'var(--blue)';
            default: return 'var(--gold)';
        }
    };

    const getEnemyIcon = (type?: string) => {
        switch (type) {
            case 'Dragon': return '🐉';
            case 'Troll': return '👹';
            case 'Goblin': return '👺';
            default: return '👾';
        }
    };

    return (
        <div className="panel">
            <h2 className="section-title">Enemies</h2>
            {enemies.length === 0 ? (
                <div style={{ color: '#888', fontStyle: 'italic', padding: '12px 0' }}>No enemies present.</div>
            ) : (
                enemies.map((enemy) => {
                    // Try to get maxHp from EnemyTypes, fallback to 100
                    let maxHp = EnemyTypes[enemy.type as EnemyType]?.hp || 100;
                    const percent = Math.max(0, Math.min(100, (enemy.hp / maxHp) * 100));
                    return (
                        <div
                            key={enemy.id}
                            className="enemy-card"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-secondary)',
                                borderRadius: 8,
                                padding: '12px 16px',
                                borderLeft: `5px solid ${getEnemyColor(enemy.type)}`,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                                marginBottom: 4
                            }}
                        >
                            <span style={{ fontSize: '2rem', marginRight: 16 }}>{getEnemyIcon(enemy.type)}</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginRight: 16, minWidth: 90 }}>{enemy.name || enemy.type}</span>
                            <div style={{ flex: 1, height: 12, background: '#333', borderRadius: 6, marginRight: 12, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${percent}%`,
                                        background: `linear-gradient(90deg, ${getEnemyColor(enemy.type)}, #fbbf24)`,
                                        transition: 'width 0.3s'
                                    }}
                                />
                            </div>
                            <span style={{ color: 'var(--gold)', fontSize: '0.95rem', minWidth: 80, textAlign: 'right' }}>{enemy.hp} HP</span>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Enemies;