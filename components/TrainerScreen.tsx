import React from 'react';
import { Player, Skill } from '../types';
import { ALL_SKILLS_LOOKUP } from '../constants';
import { soundService } from '../services/soundService';

interface TrainerScreenProps {
  player: Player;
  trainerSkills: Skill[];
  onLearnSkill: (skill: Skill) => void;
  onBack: () => void;
}

const TrainerScreen: React.FC<TrainerScreenProps> = ({ player, trainerSkills, onLearnSkill, onBack }) => {

    const SkillCard = ({ skill }: { skill: Skill; }) => {
        const isLearned = player.skills.includes(skill.id);
        const canAfford = player.gold >= (skill.cost || 0);
        const meetsLevel = player.level >= skill.levelRequired;
        const hasPrerequisites = skill.prerequisites?.every(req => player.skills.includes(req)) ?? true;
        const canLearn = !isLearned && canAfford && meetsLevel && hasPrerequisites;

        return (
            <div className={`bg-slate-800 p-4 rounded-lg flex flex-col justify-between border border-slate-700 ${!canLearn && !isLearned ? 'opacity-60' : ''} ${isLearned ? 'border-green-500/50' : ''}`}>
                <div>
                    <p className="font-bold text-lg text-cyan-300">{skill.name}</p>
                    <p className="text-xs text-yellow-400 mb-2">({skill.type})</p>
                    <p className="text-sm text-slate-400">{skill.description}</p>
                    <div className="text-xs text-slate-500 mt-2">
                        <p>Requires Level: {skill.levelRequired}</p>
                        {skill.prerequisites && <p>Requires: {skill.prerequisites.map(id => ALL_SKILLS_LOOKUP[id]?.name).join(', ')}</p>}
                    </div>
                </div>
                <div className="mt-4">
                    {isLearned ? (
                         <p className="font-bold text-green-400 text-center">Learned</p>
                    ) : (
                        <button 
                            onClick={() => onLearnSkill(skill)}
                            disabled={!canLearn}
                            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                        >
                            Learn ({skill.cost} G)
                        </button>
                    )}
                </div>
            </div>
        );
    };

  return (
    <div className="animate-fade-in p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-orbitron text-cyan-300">Skill Trainer</h2>
          <p className="text-yellow-400 font-bold">Your Gold: {player.gold} G</p>
        </div>
        <button onClick={() => { soundService.playSound('ui_click'); onBack(); }} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Back to Hub
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
            {trainerSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
            ))}
            {trainerSkills.length === 0 && (
                 <p className="text-slate-500 md:col-span-3 text-center">The trainer has nothing to teach you right now.</p>
            )}
      </div>

    </div>
  );
};

export default TrainerScreen;