// @ts-ignore
import React from "react";
import {Skills} from "../types/gameTypes";
import {Panel, SectionTitle} from "../styles/GlobalStyles";

interface SkillsSectionProps {
    skills: Skills;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({skills}) => {
  const SkillList: React.FC<{title: string; skills: string[]}> = ({title, skills}) => (
    <div style={{marginBottom: '20px'}}>
        <h3 style={{color: '#ff6b6b', marginBottom: '10px'}}>{title}</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {skills.map((skill, index)=>(
                <span
                key={index}
                style={{
                    background: '#444',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.9em'
                }}>
                    {skill}
                </span>
            ))}
        </div>
    </div>
  );

  return (
    <Panel>
        <SectionTitle>Skills</SectionTitle>
        <SkillList title={"Magic Skills"} skills={skills.magic}/>
        <SkillList title={"Non-Magic Skills"} skills={skills.nonMagic}/>
    </Panel>
  );
};