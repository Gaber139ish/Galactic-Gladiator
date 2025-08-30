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

const ProgressBar: React.FC<{ value: number; max: number; colorClass: string; label: string }> = ({ value, max, colorClass, label }) => (
    <div>
        <div className="flex justify-between text-sm font-medium text-slate-300">
            <span>{label}</span>
            <span>{value} / {max}</span>
        </div>
        <div className="w-full progress-bar-track mt-1">
            <div className={`h-full progress-bar-fill ${colorClass}`} style={{ width: `${(value / max) * 100}%` }}></div>
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
        <div className="lg:col-span-1 hud-card p-6 rounded-lg flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-orbitron text-white">{player.name}</h3>
                <p className="text-cyan-400">{player.race.name} - {player.playerClass.name}</p>
                <p className="text-slate-300">Level: {player.level}</p>
                <p className="text-yellow-400">Gold: {player.gold} G</p>
                 <div className="space-y-4 mt-4">
                    <ProgressBar value={player.currentHealth} max={player.maxHealth} colorClass="progress-bar-fill-hp" label="Health"/>
                    <ProgressBar value={player.currentMana} max={player.maxMana} colorClass="progress-bar-fill-mp" label="Mana"/>
                    {player.level < 10 && <ProgressBar value={player.xp} max={player.xpToNextLevel} colorClass="progress-bar-fill-xp" label="Experience"/>}
                </div>
            </div>
            <div className="mt-6 space-y-3">
                 <button onClick={() => { soundService.playSound('ui_click'); onViewCharacter(); }} className="w-full btn btn-primary">
                    Character Sheet
                </button>
                 <button onClick={() => { soundService.playSound('ui_click'); onVisitWorkshop(); }} className="w-full btn btn-warning">
                    Workshop
                </button>
                <button onClick={() => { soundService.playSound('ui_click'); onVisitShop(); }} className="w-full btn btn-success">
                    Shop
                </button>
                 <button onClick={() => { soundService.playSound('ui_click'); onVisitTrainer(); }} className="w-full btn btn-info">
                    Skill Trainer
                </button>
                <button onClick={() => { onSave(); }} className="w-full btn btn-secondary mt-2 text-sm !py-2">
                    Save Game
                </button>
                 {player.level >= 10 && (
                     <button onClick={onStartNewGamePlus} className="w-full btn btn-danger mt-2">
                        Start New Game+
                    </button>
                 )}
            </div>
        </div>
        
        {/* Arena Selection */}
        <div className="lg:col-span-2 hud-card p-6 rounded-lg">
             <h3 className="text-2xl font-orbitron text-cyan-400 mb-4 text-center">Select Arena</h3>
             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {availableArenas.map(arena => (
                    <div key={arena.id} className="hud-card p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
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
                        <button onClick={() => { soundService.playSound('start_fight'); onFight(arena); }} className="w-full sm:w-auto btn btn-danger flex-shrink-0">
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