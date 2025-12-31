import React from 'react';
import '../App.css';

interface GameLogProps {
    logs: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
    return (
        <div className="panel" style={{ minHeight: '200px' }}>
            <h2 className="section-title">Game Log</h2>
            <div className="game-log-container">
                {logs.map((log, index) => (
                    <div key={index} className="log-entry">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
};