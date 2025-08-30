import React, { useState, useMemo, useCallback } from 'react';
import { Player, Race, PlayerClass, Stats, Gender } from '../types';
import { RACES, CLASSES } from '../constants';
import { generateBackstory } from '../services/geminiService';
import { soundService } from '../services/soundService';

interface CharacterCreationScreenProps {
  onCharacterCreate: (player: Omit<Player, 'currentHealth' | 'maxHealth' | 'xpToNextLevel' | 'equipment' | 'inventory' | 'skills' | 'skillPoints' | 'currentMana' | 'maxMana' | 'statusEffects' | 'ngPlus'>) => void;
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onCharacterCreate }) => {
  const [name, setName] = useState('');
  const [selectedRaceIndex, setSelectedRaceIndex] = useState(0);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ strength: 5, dexterity: 5, intelligence: 5, constitution: 5, luck: 5 });
  const [points, setPoints] = useState(5);
  const [backstory, setBackstory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);

  const selectedRace = RACES[selectedRaceIndex];
  const selectedClass = CLASSES[selectedClassIndex];

  const totalStats = useMemo<Stats>(() => {
    const combined: Stats = { ...stats };
    (Object.keys(selectedRace.statBonuses) as Array<keyof Stats>).forEach(key => {
      combined[key] += selectedRace.statBonuses[key] || 0;
    });
    (Object.keys(selectedClass.statBonuses || {}) as Array<keyof Stats>).forEach(key => {
      combined[key] += selectedClass.statBonuses?.[key] || 0;
    });
    return combined;
  }, [stats, selectedRace, selectedClass]);

  const handleStatChange = (stat: keyof Stats, amount: number) => {
    if (amount > 0 && points > 0) {
      soundService.playSound('stat_increase');
      setStats(s => ({ ...s, [stat]: s[stat] + amount }));
      setPoints(p => p - amount);
    } else if (amount < 0 && stats[stat] > 1) {
      soundService.playSound('stat_decrease');
      setStats(s => ({ ...s, [stat]: s[stat] + amount }));
      setPoints(p => p - amount);
    }
  };
  
  const handleGenerateBackstory = useCallback(async () => {
    if (!name.trim()) {
      alert("Please enter a name for your gladiator first.");
      return;
    }
    soundService.playSound('ui_click');
    setIsGenerating(true);
    const generated = await generateBackstory(selectedRace.name, selectedClass.name, name, gender);
    setBackstory(generated);
    setIsGenerating(false);
  }, [name, selectedRace, selectedClass, gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a name.');
      return;
    }
    soundService.playSound('character_created');
    onCharacterCreate({
      name,
      gender,
      race: selectedRace,
      playerClass: selectedClass,
      stats: totalStats,
      level: 1,
      xp: 0,
      gold: 0,
      backstory,
    });
  };

  const Card: React.FC<{title: string; children: React.ReactNode;}> = ({ title, children }) => (
    <div className="hud-card p-4 rounded-lg h-full">{children}</div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-orbitron text-cyan-300">Create Your Gladiator</h2>
        <p className="text-slate-400">Forge your legend in the cosmic arena.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name and Backstory */}
        <div className="space-y-4">
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Gladiator Name"
            className="w-full hud-input"
            required
            />
             <div>
                <div className="flex gap-2">
                    {Object.values(Gender).map((g) => (
                        <button
                            type="button"
                            key={g}
                            onClick={() => {
                                soundService.playSound('ui_click');
                                setGender(g);
                            }}
                            className={`flex-1 p-2 rounded-lg border-2 cursor-pointer transition-all ${gender === g ? 'border-cyan-400 bg-cyan-900/40' : 'border-slate-700 bg-slate-900/50'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>
             <textarea
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Generate or write your backstory here..."
                rows={5}
                className="w-full hud-input"
            />
            <button type="button" onClick={handleGenerateBackstory} disabled={isGenerating} className="w-full btn btn-info">
            {isGenerating ? 'Generating...' : 'Generate Backstory with AI'}
          </button>
        </div>

        {/* Stats Allocation */}
        <Card title="Attributes">
          <h3 className="font-orbitron text-xl mb-2 text-cyan-400">Allocate Points</h3>
          <p className="text-slate-400 mb-4">Points Remaining: <span className="font-bold text-white">{points}</span></p>
          {Object.keys(stats).map(statKey => {
            const key = statKey as keyof Stats;
            return (
              <div key={key} className="flex justify-between items-center mb-2 capitalize">
                <span>{key}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleStatChange(key, -1)} className="bg-slate-700 hover:bg-slate-600 w-6 h-6 rounded transition-colors">-</button>
                  <span className="w-16 text-center font-bold">{totalStats[key]} <span className="text-xs text-cyan-400">(Base: {stats[key]})</span></span>
                  <button type="button" onClick={() => handleStatChange(key, 1)} className="bg-slate-700 hover:bg-slate-600 w-6 h-6 rounded transition-colors">+</button>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Race Selection */}
       <div>
        <h3 className="font-orbitron text-xl mb-2 text-cyan-400">Choose Race</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RACES.map((race, index) => (
            <div key={race.name} onClick={() => { soundService.playSound('ui_click'); setSelectedRaceIndex(index); }} className={`hud-card hud-card-interactive p-4 rounded-lg cursor-pointer ${selectedRaceIndex === index ? 'border-cyan-400' : 'border-transparent'}`}>
              <h4 className="font-bold text-lg">{race.name}</h4>
              <p className="text-sm text-slate-400">{race.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Class Selection */}
      <div>
        <h3 className="font-orbitron text-xl mb-2 text-cyan-400">Choose Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CLASSES.map((bg, index) => (
            <div key={bg.name} onClick={() => { soundService.playSound('ui_click'); setSelectedClassIndex(index); }} className={`hud-card hud-card-interactive p-4 rounded-lg cursor-pointer ${selectedClassIndex === index ? 'border-cyan-400' : 'border-transparent'}`}>
              <h4 className="font-bold text-lg">{bg.name}</h4>
              <p className="text-sm text-slate-400">{bg.description}</p>
              <p className="text-sm text-cyan-400 mt-1">{bg.startingBonusText}</p>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full btn btn-primary text-xl">
        Enter the Arena
      </button>
    </form>
  );
};

export default CharacterCreationScreen;