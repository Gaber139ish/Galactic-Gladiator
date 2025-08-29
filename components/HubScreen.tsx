import React from 'react';
import { Player, Stats, Arena } from '../types';
import { soundService } from '../services/soundService';

interface HubScreenProps {
  player: Player;
  arenas: Arena[];
  onFight: (arena: Arena) => void;
  onViewCharacter: () => void;
  onTrainStat: (stat: keyof Stats) => void;
  onVisitShop: () => void;
  onVisitTrainer: () => void;
  onVisitWorkshop: () => void;
  onSave: () => void;
  onStartNewGamePlus: () => void;
}

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => (
    <div>
        <div className="flex justify-between text-sm font-medium text-slate-300">
            <span>{label}</span>
            <span>{value} / {max}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
        </div>
    </div>
);

const HubScreen: React.FC<HubScreenProps> = ({ player, arenas, onFight, onViewCharacter, onTrainStat, onVisitShop, onVisitTrainer, onVisitWorkshop, onSave, onStartNewGamePlus }) => {
  const availableArenas = arenas.filter(arena => player.level >= arena.levelRange[0]);
  
  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-orbitron text-cyan-300">Gladiator Hub</h2>
        <p className="text-slate-400">Welcome, {player.name}. The crowd awaits. {player.ngPlus > 0 && `(NG+ ${player.ngPlus})`}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Status & Actions */}
        <div className="lg:col-span-1 bg-slate-900/50 p-6 rounded-lg border border-slate-700 flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-orbitron text-white">{player.name}</h3>
                <p className="text-cyan-400">{player.race.name} - {player.playerClass.name}</p>
                <p className="text-slate-300">Level: {player.level}</p>
                <p className="text-yellow-400">Gold: {player.gold} G</p>
                 <div className="space-y-4 mt-4">
                    <ProgressBar value={player.currentHealth} max={player.maxHealth} color="bg-red-500" label="Health"/>
                    <ProgressBar value={player.currentMana} max={player.maxMana} color="bg-blue-500" label="Mana"/>
                    {player.level < 10 && <ProgressBar value={player.xp} max={player.xpToNextLevel} color="bg-yellow-500" label="Experience"/>}
                </div>
            </div>
            <div className="mt-6 space-y-3">
                 <button onClick={() => { soundService.playSound('ui_click'); onViewCharacter(); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg font-orbitron transition-colors">
                    Character Sheet
                </button>
                 <button onClick={() => { soundService.playSound('ui_click'); onVisitWorkshop(); }} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-lg text-lg font-orbitron transition-colors">
                    Workshop
                </button>
                <button onClick={() => { soundService.playSound('ui_click'); onVisitShop(); }} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg text-lg font-orbitron transition-colors">
                    Shop
                </button>
                 <button onClick={() => { soundService.playSound('ui_click'); onVisitTrainer(); }} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg text-lg font-orbitron transition-colors">
                    Skill Trainer
                </button>
                <button onClick={() => { onSave(); }} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-md font-orbitron transition-colors mt-2">
                    Save Game
                </button>
                 {player.level >= 10 && (
                     <button onClick={onStartNewGamePlus} className="w-full bg-purple-800 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg text-lg font-orbitron transition-all mt-2">
                        Start New Game+
                    </button>
                 )}
            </div>
        </div>
        
        {/* Arena Selection */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-lg border border-slate-700">
             <h3 className="text-2xl font-orbitron text-cyan-400 mb-4 text-center">Select Arena</h3>
             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {availableArenas.map(arena => (
                    <div key={arena.id} className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h4 className="text-xl font-orbitron text-white">{arena.name}</h4>
                            <p className="text-slate-400 text-sm italic">{arena.description}</p>
                            <p className="text-slate-300 text-sm font-bold">Recommended Level: {arena.levelRange[0]}-{arena.levelRange[1]}</p>
                            <div className="mt-2">
                                {arena.environmentalEffects.map(effect => (
                                    <p key={effect.description} className="text-xs text-cyan-300">{`- ${effect.description}`}</p>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => { soundService.playSound('start_fight'); onFight(arena); }} className="w-full sm:w-auto bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-lg font-orbitron transition-all transform hover:scale-105 flex-shrink-0">
                           FIGHT!
                        </button>
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default HubScreen;