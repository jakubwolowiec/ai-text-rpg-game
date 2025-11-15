// @ts-ignore
import React from "react";
import {Character} from "../types/gameTypes";
import {Panel, SectionTitle} from "../styles/GlobalStyles";

interface CharacterPanelProps {
    character: Character;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ character }) => {
    return (
        <Panel>
            <SectionTitle>Character</SectionTitle>
            <div style={{marginBottom: '15px'}}>
                <div><strong>Name:</strong> {character.name}</div>
                <div><strong>Age:</strong> {character.age}</div>
            </div>
            <div>
                <strong>Description:</strong>
                <p style={{marginTop: '10px', fontStyle: 'italic'}}>
                    {character.decription}
                </p>
            </div>
        </Panel>
    )

};