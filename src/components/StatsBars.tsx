import React from 'react';
import { Stats } from '../types/gameTypes';
import '../App.css';

interface StatusBarsProps {
    stats: Stats;
}

export const StatsBars: React.FC<StatusBarsProps> = ({ stats }) => {
    const StatsBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
        const percentage = Math.min((value / 10) * 100, 100);

        return (
            <div className="status-bar-container">
                <div className="status-bar-label">
                    <span>{label}:</span>
                    <span>{value}/10</span>
                </div>
                <div className="status-bar-bg">
                    <div
                        className="status-bar-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="panel">
            <h2 className="section-title">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <StatsBar label="Strength" value={stats.strength} />
                    <StatsBar label="Charisma" value={stats.charisma} />
                    <StatsBar label="Faith" value={stats.faith} />
                    <StatsBar label="Intelligence" value={stats.intelligence} />
                </div>
                <div>
                    <StatsBar label="Constitution" value={stats.constitution} />
                    <StatsBar label="Luck" value={stats.luck} />
                    <StatsBar label="Defence" value={stats.defence} />
                    <StatsBar label="Dexterity" value={stats.dexterity} />
                </div>
            </div>
        </div>
    );
};