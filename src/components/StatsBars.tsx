// @ts-ignore
import React from "react";
import {Stats} from "../types/gameTypes";
import {Panel, SectionTitle} from "../styles/GlobalStyles";

interface StatsBarsProps {
    stats: Stats;
}

export const StatsBars: React.FC<StatsBarsProps> = ({ stats }) => {
    const StatsBar: React.FC<{label: string; value: number}> = ({label, value}) => (
        <div style={{marginBottom: '10px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
            <span>{label}:</span>
            <span>{value}/10</span>
            </div>
            <div style={{
                background: '#444',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#ffd700',
                    height: '100%',
                    width: `${(value / 10)*100}%`,
                    transition: 'width 0.3s ease'
                }
                }/>
            </div>
        </div>
    );

    return (
        <Panel>
            <SectionTitle>Stats</SectionTitle>
            <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                    <StatsBar label={"Strenght"} value={stats.strength}/>
                    <StatsBar label={"Charisma"} value={stats.charisma}/>
                    <StatsBar label={"Wisdom"} value={stats.wisdom}/>
                    <StatsBar label={"Intelligence"} value={stats.intelligence}/>
                </div>
                <div>
                    <StatsBar label={"Constitution"} value={stats.constitution}/>
                    <StatsBar label={"Dexterity"} value={stats.dexterity}/>
                    <StatsBar label={"Defence"} value={stats.defence}/>
                    <StatsBar label={"Luck"} value={stats.luck}/>
                </div>
            </div>
        </Panel>
    )
};