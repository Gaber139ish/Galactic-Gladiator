import React, { useState, useMemo } from 'react';
import { Player, Item, ItemSlot, Stats, SkillType, Skill, DamageType, Resistances, ItemRarity } from '../types';
import { SKILL_TREES, ALL_SKILLS_LOOKUP } from '../constants';
import { soundService } from '../services/soundService';

interface CharacterSheetScreenProps {
  player: Player;
  onBack: () => void;
  onEquipItem: (item: Item, index: number) => void;
  onLearnSkill: (skillId: string) => void;
  onSortInventory: () => void;
  onOptimizeGear: () => void;
}

const ItemDisplay: React.FC<{ item: Item }> = ({ item }) => {
    const rarityColor = {
        [ItemRarity.COMMON]: 'text-slate-300',
        [ItemRarity.UNCOMMON]: 'text-green-400',
        [ItemRarity.RARE]: 'text-blue-400',
        [ItemRarity.EPIC]: 'text-purple-400',
    }[item.rarity];

    const renderDamage = (damage: Item['damage']) => {
        if (!damage) return null;
        const color = {
            [DamageType.KINETIC]: 'text-orange-400',
            [DamageType.ENERGY]: 'text-cyan-400',
            [DamageType.MAGIC]: 'text-purple-400',
            [DamageType.EXPLOSIVE]: 'text-red-500',
            [DamageType.FIRE]: 'text-orange-600',
            [DamageType.ICE]: 'text-blue-300',
            [DamageType.LIGHTNING]: 'text-yellow-400',
        }[damage.type];
        return <p className={`text-xs ${color}`}>Damage: {damage.amount} ({damage.type})</p>;
    };

    const renderResistances = (resistances: Item['resistances']) => {
        if (!resistances) return null;
        return (
            <p className="text-xs text-blue-300">
                Resist: {Object.entries(resistances).map(([type, value]) => `${type} ${value * 100}%`).join(', ')}
            </p>
        );
    };

    return (
        <div>
            <p className={`font-bold ${rarityColor}`}>{item.name} <span className="text-xs font-normal text-slate-400">({item.type})</span></p>
             {item.category === 'Gear' && <p className="text-xs text-slate-400">{item.description}</p> }
            {renderDamage(item.damage)}
            {renderResistances(item.resistances)}
            {item.effects && item.effects.length > 0 && (
                <div className="mt-1">
                    {item.effects.map((effect, i) => (
                        <p key={i} className="text-xs text-green-400 italic">{effect.description}</p>
                    ))}
                </div>
            )}
        </div>
    );
};


const CharacterSheetScreen: React.FC<CharacterSheetScreenProps> = ({ player, onBack, onEquipItem, onLearnSkill, onSortInventory, onOptimizeGear }) => {
    const [activeTab, setActiveTab] = useState<'dossier' | 'skills'>('dossier');

    const totalResistances = useMemo((): Resistances => {
        const res: Resistances = {};
        Object.values(player.equipment).forEach(item => {
            if (item && item.resistances) {
                Object.entries(item.resistances).forEach(([type, value]) => {
                    const key = type as DamageType;
                    res[key] = (res[key] || 0) + value;
                });
            }
        });
        return res;
    }, [player.equipment]);

    const renderStatWithBonus = (stat: keyof Stats) => {
        const base = player.stats[stat];
        const equipmentBonus = Object.values(player.equipment).reduce((acc: number, item) => acc + (item?.stats[stat] || 0), 0);
        
        const total = base + equipmentBonus;
        
        if (equipmentBonus > 0) {
            return <span>{total} <span className="text-green-400 text-sm">({base}+{equipmentBonus})</span></span>;
        }
        return <span>{total}</span>;
    }
    
    const DossierView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Bio & Stats */}
            <div className="lg:col-span-1 space-y-6">
                <div className="hud-card p-4 rounded-lg">
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-2">Biography</h3>
                    <p><span className="font-bold">Race:</span> {player.race.name}</p>
                    <p><span className="font-bold">Gender:</span> {player.gender}</p>
                    <p><span className="font-bold">Class:</span> {player.playerClass.name}</p>
                    <p><span className="font-bold">NG+:</span> {player.ngPlus}</p>
                    <p className="mt-2 text-sm text-slate-400 italic">{player.backstory}</p>
                </div>
                <div className="hud-card p-4 rounded-lg">
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-2">Vitals</h3>
                    <p><span className="font-bold">Health:</span> {player.currentHealth} / {player.maxHealth}</p>
                    <p><span className="font-bold">Mana:</span> {player.currentMana} / {player.maxMana}</p>
                </div>
                <div className="hud-card p-4 rounded-lg">
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-2">Attributes</h3>
                    <div className="space-y-2">
                    {(Object.keys(player.stats) as Array<keyof Stats>).map(stat => (
                        <div key={stat} className="flex justify-between capitalize">
                        <span>{stat}</span>
                        <span className="font-bold">{renderStatWithBonus(stat)}</span>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="hud-card p-4 rounded-lg">
                    <h3 className="font-orbitron text-xl text-cyan-400 mb-2">Resistances</h3>
                    <div className="space-y-2">
                    {Object.keys(DamageType).length > 0 && Object.keys(totalResistances).length > 0 ? Object.entries(totalResistances).map(([type, value]) => (
                        <div key={type} className="flex justify-between capitalize">
                        <span>{type}</span>
                        <span className={`font-bold ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(value * 100)}%</span>
                        </div>
                    )) : <p className="text-slate-500">No resistances.</p>}
                    </div>
                </div>
            </div>

            {/* Right Column: Equipment & Inventory */}
            <div className="lg:col-span-2 space-y-6">
            <div className="hud-card p-4 rounded-lg">
                <h3 className="font-orbitron text-xl text-cyan-400 mb-2">Equipment</h3>
                <div className="space-y-3">
                {(Object.values(ItemSlot)).map(slot => (
                    <div key={slot}>
                    <h4 className="font-bold text-slate-400">{slot}</h4>
                    <div className="mt-1 p-3 bg-slate-800/50 rounded-md border border-slate-700 min-h-[60px]">
                        {player.equipment[slot] ? (
                            <ItemDisplay item={player.equipment[slot]!} />
                        ) : (
                        <p className="text-slate-500">- Empty -</p>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="hud-card p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-orbitron text-xl text-cyan-400">Inventory</h3>
                    <div className="space-x-2">
                         <button onClick={onSortInventory} className="btn btn-secondary !py-1 !px-3 text-sm">Sort</button>
                         <button onClick={onOptimizeGear} className="btn btn-success !py-1 !px-3 text-sm">Optimize</button>
                    </div>
                </div>
                {player.inventory.length > 0 ? (
                <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                    {player.inventory.map((item, index) => (
                    <li key={`${item.id}-${index}`} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                        <ItemDisplay item={item} />
                        {item.category === 'Gear' && (
                             <button 
                                onClick={() => onEquipItem(item, index)}
                                className="btn btn-primary !py-1 !px-3 text-sm self-center ml-2">
                                    Equip
                            </button>
                        )}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-slate-500">Your inventory is empty.</p>
                )}
            </div>
            </div>
        </div>
    );
    
    const SkillTreeView = () => {
        const playerSkillTree = SKILL_TREES.find(tree => tree.class === player.playerClass.name);

        return (
             <div>
                <h3 className="font-orbitron text-2xl text-cyan-400 mb-4">Skill Tree</h3>
                <p className="mb-6 text-slate-300">Skill Points Available: <span className="font-bold text-yellow-400 text-xl">{player.skillPoints}</span></p>
                
                {playerSkillTree ? (
                    <div className="space-y-6">
                        <h4 className="font-orbitron text-xl text-cyan-300 mb-3">{playerSkillTree.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {playerSkillTree.skills.map(skill => {
                                const isLearned = player.skills.includes(skill.id);
                                const canLearn = player.level >= skill.levelRequired && (skill.prerequisites?.every(req => player.skills.includes(req)) ?? true);
                                
                                let statusClasses = 'border-slate-700/50';
                                if (isLearned) statusClasses = 'border-green-500/80';
                                else if (canLearn) statusClasses = 'border-cyan-500/80';

                                return (
                                    <div key={skill.id} className={`hud-card p-4 rounded-lg border-2 ${statusClasses} flex flex-col justify-between`}>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{skill.name} <span className={`text-sm font-normal ${skill.type === SkillType.ACTIVE ? 'text-cyan-400' : 'text-yellow-400'}`}>({skill.type})</span></h4>
                                            {skill.manaCost && <p className="text-xs text-blue-400">Cost: {skill.manaCost} Mana</p>}
                                            <p className="text-sm text-slate-400 mt-1">{skill.description}</p>
                                            <div className="text-xs text-slate-500 mt-2">
                                                <p>Requires Level: {skill.levelRequired}</p>
                                                {skill.prerequisites && <p>Requires: {skill.prerequisites.map(id => ALL_SKILLS_LOOKUP[id]?.name).join(', ')}</p>}
                                            </div>
                                        </div>
                                        {!isLearned && canLearn && player.skillPoints > 0 && (
                                            <button onClick={() => onLearnSkill(skill.id)} className="w-full mt-3 btn btn-success !py-1 text-sm">
                                                Learn (1 Point)
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : <p>No skill tree available for this class.</p>}
            </div>
        );
    };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-orbitron text-cyan-300">{player.name}'s Dossier</h2>
            <div className="flex space-x-2 mt-2 border-b-2 border-cyan-500/20">
                <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('dossier'); }} className={`py-2 px-4 font-bold transition-colors ${activeTab === 'dossier' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>Dossier</button>
                <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('skills'); }} className={`py-2 px-4 font-bold transition-colors ${activeTab === 'skills' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>Skills</button>
            </div>
        </div>
        <button onClick={() => { soundService.playSound('ui_click'); onBack(); }} className="btn btn-secondary self-start">
          Back
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'dossier' ? <DossierView /> : <SkillTreeView />}
      </div>
    </div>
  );
};

export default CharacterSheetScreen;