//@ts-ignore
import React from "react";
import {Panel, SectionTitle} from "../styles/GlobalStyles";

interface GameLogProps {
    logs: string[];
}

export const GameLog: React.FC<GameLogProps> = ({logs}) => {
    return (
        <Panel style={{gridColumn: '1 / -1', minHeight: '200px'}}>
            <SectionTitle>Game Log</SectionTitle>
            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                {logs.map((log, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '8px 0',
                            borderBottom: '1px solid #444',
                            fontFamily: 'monospace'
                        }}>
                        {log}
                    </div>
                ))}
            </div>
        </Panel>
    );
};