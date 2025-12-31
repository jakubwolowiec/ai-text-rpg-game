import React from 'react';
import { Skills, CharacterClass } from '../types/gameTypes';
import '../App.css';

interface SkillsSectionProps {
    skills: Skills;
    characterClass?: CharacterClass;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
                                                                skills
                                                            }) => {

    return (
        <div className="panel">
            <h2 className="section-title">Skills</h2>

            <div className={`mb-6 p-4 border-l-4 border-l-purple`}>
                <h3 className="text-lg font-bold mb-3 text-purple flex items-center gap-2">
                    <span>🔮</span> Magic Skills
                </h3>
                <div className="skill-container">
                    {skills.magic.map((skill, index) => (
                        <span key={index} className="skill-chip magic">
              {skill}
            </span>
                    ))}
                </div>
            </div>

            <div className={`p-4 border-l-4 border-l-gold`}>
                <h3 className="text-lg font-bold mb-3 text-gold flex items-center gap-2">
                    <span>⚔️</span> Non-Magic Skills
                </h3>
                <div className="skill-container">
                    {skills.nonMagic.map((skill, index) => (
                        <span key={index} className="skill-chip non-magic">
              {skill}
            </span>
                    ))}
                </div>
            </div>
        </div>
    );
};