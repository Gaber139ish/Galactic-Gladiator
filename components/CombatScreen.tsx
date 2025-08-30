import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, Enemy, Item, ItemSlot, Skill, SkillType, ItemEffect, ItemEffectTrigger, Stats, DamageType, Resistances, StatusEffect, StatusEffectType, Arena, EnvironmentalEffect, ItemRarity } from '../types';
import { ALL_SKILLS_LOOKUP, ALL_ITEMS_MAP } from '../constants';
import { soundService } from '../services/soundService';

interface CombatScreenProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  enemy: Enemy;
  arena: Arena;
  onCombatEnd: (win: boolean, loot: Item[], gold: number, xp: number) => void;
  log: string[];
  setLog: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProgressBar: React.FC<{ value: number; max: number; colorClass: string; }> = ({ value, max, colorClass }) => (
    <div className="w-full progress-bar-track">
        <div className={`h-full progress-bar-fill ${colorClass}`} style={{ width: `${Math.max(0, value / max) * 100}%` }}></div>
    </div>
);

const getStatusEffectIcon = (type: StatusEffectType) => {
    switch(type) {
        case StatusEffectType.POISON: return '☠️';
        case StatusEffectType.BURN: return '🔥';
        case StatusEffectType.STUN: return '😵';
        case StatusEffectType.REGEN: return '💚';
        case StatusEffectType.DEFENSE_UP: return '🛡️';
        default: return '❔';
    }
}

const GladiatorCard: React.FC<{ entity: Player | Enemy, currentHealth: number, currentMana?: number, statusEffects: StatusEffect[], animation: string | null }> = ({ entity, currentHealth, currentMana, statusEffects, animation }) => {
    const isPlayer = 'playerClass' in entity;
    let statusAnimation = '';
    if(statusEffects.some(e => e.type === StatusEffectType.POISON)) statusAnimation = 'animate-poison';
    if(statusEffects.some(e => e.type === StatusEffectType.STUN)) statusAnimation = 'animate-stun';

    return (
    <div className={`relative hud-card p-6 rounded-lg text-center transition-transform duration-200 ${animation} ${statusAnimation}`}>
        <h3 className="text-3xl font-orbitron">{entity.name}</h3>
        <p className="text-slate-400">Level {entity.level}</p>
        <div className="my-4 space-y-2">
            <ProgressBar value={currentHealth} max={entity.maxHealth} colorClass={'progress-bar-fill-hp'} />
            <p className="text-center mt-1 font-mono text-sm">{currentHealth} / {entity.maxHealth} HP</p>
            {isPlayer && currentMana !== undefined && (
                <>
                <ProgressBar value={currentMana} max={(entity as Player).maxMana} colorClass={'progress-bar-fill-mp'} />
                <p className="text-center mt-1 font-mono text-sm">{currentMana} / {(entity as Player).maxMana} MP</p>
                </>
            )}
        </div>
        
        <div className={`gladiator-sprite ${isPlayer ? 'player-sprite' : 'enemy-sprite'}`}>
            <div className="gladiator-sprite-inner"></div>
        </div>

        <div className="absolute top-2 right-2 flex gap-2">
            {statusEffects.map(effect => (
                <div key={effect.type} className="bg-slate-900/80 rounded-full p-2 border border-slate-600" title={`${effect.type} (${effect.duration} turns left)`}>
                   <span>{getStatusEffectIcon(effect.type)}</span>
                   <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold">{effect.duration}</span>
                </div>
            ))}
        </div>
    </div>
)};

const CombatScreen: React.FC<CombatScreenProps> = ({ player, setPlayer, enemy, arena, onCombatEnd, log, setLog }) => {
  const [playerHealth, setPlayerHealth] = useState(player.currentHealth);
  const [playerMana, setPlayerMana] = useState(player.currentMana);
  const [enemyHealth, setEnemyHealth] = useState(enemy.currentHealth);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isCombatOver, setIsCombatOver] = useState(false);
  const [combatResult, setCombatResult] = useState<{win: boolean, loot: Item[], gold: number, xp: number} | null>(null);
  const [playerAnimation, setPlayerAnimation] = useState<string | null>(null);
  const [enemyAnimation, setEnemyAnimation] = useState<string | null>(null);
  const [skillCooldowns, setSkillCooldowns] = useState<{ [key: string]: number }>({});
  const [enemyDebuffs, setEnemyDebuffs] = useState<Partial<Stats>>({});

  const [playerStatusEffects, setPlayerStatusEffects] = useState<StatusEffect[]>([]);
  const [enemyStatusEffects, setEnemyStatusEffects] = useState<StatusEffect[]>([]);
  
  const logRef = useRef<HTMLDivElement>(null);
  
  const playerSkills = player.skills.map(id => ALL_SKILLS_LOOKUP[id]).filter(s => s && s.type === SkillType.ACTIVE);

  const getPlayerEffects = useCallback((trigger: ItemEffectTrigger): ItemEffect[] => {
      return Object.values(player.equipment)
          .filter((i): i is Item => !!i)
          .flatMap(i => i.effects || [])
          .filter(effect => effect.trigger === trigger);
  }, [player.equipment]);

  const getPlayerResistances = useCallback((): Resistances => {
    return Object.values(player.equipment)
      .filter((i): i is Item => !!i && !!i.resistances)
      .reduce((totalRes, item) => {
        for (const [type, value] of Object.entries(item.resistances!)) {
          totalRes[type as DamageType] = (totalRes[type as DamageType] || 0) + value;
        }
        return totalRes;
      }, {} as Resistances);
  }, [player.equipment]);

  useEffect(() => {
    // Initialize cooldowns
    const initialCooldowns: { [key: string]: number } = {};
    playerSkills.forEach(skill => {
        initialCooldowns[skill.id] = 0;
    });
    setSkillCooldowns(initialCooldowns);
    setEnemyDebuffs({});
    setPlayerStatusEffects([]);
    setEnemyStatusEffects([]);
  }, [playerSkills]);

  useEffect(() => {
    if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const addLogMessage = useCallback((message: string) => {
    setLog(prev => [...prev, message]);
  }, [setLog]);

  const addStatusEffect = useCallback((target: 'player' | 'enemy', effect: StatusEffect) => {
    const setEffects = target === 'player' ? setPlayerStatusEffects : setEnemyStatusEffects;
    setEffects(prev => {
        const existing = prev.find(e => e.type === effect.type);
        if (existing) {
            return prev.map(e => e.type === effect.type ? { ...e, duration: Math.max(e.duration, effect.duration) } : e);
        }
        return [...prev, effect];
    });
    addLogMessage(`${target === 'player' ? player.name : enemy.name} is afflicted with ${effect.type}!`);
    soundService.playSound(`status_${effect.type.toLowerCase()}`);
  }, [addLogMessage, player.name, enemy.name]);

  const endPlayerTurn = useCallback(() => {
    const newCooldowns = {...skillCooldowns};
    Object.keys(newCooldowns).forEach(id => {
        if(newCooldowns[id] > 0) newCooldowns[id]--;
    });
    setSkillCooldowns(newCooldowns);
    setIsPlayerTurn(false);
  }, [skillCooldowns]);


  const triggerAnimation = (target: 'player' | 'enemy', type: 'hit' | 'attack') => {
      let animationClass = '';
      let duration = 400; // Default attack duration

      if (type === 'hit') {
          animationClass = 'animate-shake';
          duration = 500; // Hit animation is 0.5s
      } else if (type === 'attack') {
          animationClass = target === 'player' ? 'animate-attack-player' : 'animate-attack-enemy';
          duration = 400; // Attack animation is 0.4s
      }
      
      const setAnimation = target === 'player' ? setPlayerAnimation : setEnemyAnimation;
      setAnimation(animationClass);
      setTimeout(() => setAnimation(null), duration);
  }
  
  const handleWin = useCallback(() => {
      soundService.playSound('victory');
      const playerLuck = player.stats.luck + Object.values(player.equipment).reduce((acc, item) => acc + (item?.stats.luck || 0), 0);
      const goldBonus = 1 + (playerLuck / 100);
      const gold = Math.floor((Math.random() * (enemy.goldDrop.max - enemy.goldDrop.min + 1) + enemy.goldDrop.min) * goldBonus);
      
      const loot: Item[] = [];
      enemy.lootTable.forEach(l => {
        if (Math.random() < (l.dropChance * (1 + playerLuck / 50))) {
            const quantity = Math.floor(Math.random() * (l.quantity[1] - l.quantity[0] + 1)) + l.quantity[0];
            for (let i = 0; i < quantity; i++) {
                loot.push(ALL_ITEMS_MAP[l.itemId]);
            }
        }
      });
      
      const xpBonusEffects = getPlayerEffects(ItemEffectTrigger.PASSIVE).filter(e => e.type === 'bonus_xp');
      const totalXpBonus = xpBonusEffects.reduce((acc, effect) => acc + effect.value, 0);
      const finalXp = Math.floor(enemy.xpValue * (1 + totalXpBonus));
      if (totalXpBonus > 0) {
        addLogMessage(`Gained bonus XP from equipment!`);
      }
      
      setCombatResult({ win: true, loot, gold, xp: finalXp });
      setIsCombatOver(true);
  }, [player, enemy, addLogMessage, getPlayerEffects]);

  const calculateDamage = (baseDamage: number, damageType: DamageType, targetResistances: Resistances, attackerStats: Stats): number => {
    let statModifier = 0;
    if ([DamageType.KINETIC, DamageType.EXPLOSIVE].includes(damageType)) {
        statModifier = Math.floor(attackerStats.strength / 2);
    } else if ([DamageType.ENERGY, DamageType.MAGIC, DamageType.FIRE, DamageType.ICE, DamageType.LIGHTNING].includes(damageType)) {
        statModifier = Math.floor(attackerStats.intelligence / 2);
    }

    let rawDamage = baseDamage + statModifier;

    // Arena Effects
    const arenaMod = arena.environmentalEffects.find(e => e.type === 'damage_mod' && e.damageType === damageType);
    if (arenaMod) {
        rawDamage *= arenaMod.modifier!;
    }
    
    const resistance = targetResistances[damageType] || 0;
    const finalDamage = Math.max(1, Math.floor(rawDamage * (1 - resistance)));

    if (resistance > 0.01) addLogMessage('The attack was not very effective...');
    if (resistance < -0.01) addLogMessage('The attack was super effective!');

    return finalDamage;
  };

  const handlePlayerAttack = useCallback(() => {
    if (!isPlayerTurn || isCombatOver) return;
    soundService.playSound('player_attack');
    triggerAnimation('player', 'attack');
    
    const weapon = player.equipment[ItemSlot.WEAPON];
    const attackDamage = weapon?.damage || { type: DamageType.KINETIC, amount: 2 }; // Unarmed attack

    const playerLuck = player.stats.luck + Object.values(player.equipment).reduce((acc, item) => acc + (item?.stats.luck || 0), 0);
    const isCrit = Math.random() < (playerLuck / 200);

    const enemyDefense = Math.floor((enemy.stats.dexterity - (enemyDebuffs.dexterity || 0)) / 2);
    let damage = calculateDamage(attackDamage.amount, attackDamage.type, enemy.resistances, player.stats) - enemyDefense;
    damage = Math.max(1, damage);

    if (isCrit) {
        damage = Math.floor(damage * 1.5);
    }
    
    addLogMessage(`${player.name} attacks ${enemy.name} for ${damage} damage!${isCrit ? ' (CRITICAL HIT!)' : ''}`);
    
    soundService.playSound('enemy_hit');
    triggerAnimation('enemy', 'hit');
    let newEnemyHealth = Math.max(0, enemyHealth - damage);

    // On-Hit Effects
    const onHitEffects = getPlayerEffects(ItemEffectTrigger.ON_HIT);
    onHitEffects.forEach(effect => {
        if(effect.chance && Math.random() > effect.chance) return;

        switch(effect.type) {
            case 'lifesteal':
                const healedAmount = Math.ceil(damage * effect.value);
                addLogMessage(`${player.name} leeches ${healedAmount} health!`);
                setPlayerHealth(h => Math.min(player.maxHealth, h + healedAmount));
                break;
            case 'armor_shred':
                addLogMessage(`${enemy.name}'s defense was shredded!`);
                setEnemyDebuffs(prev => ({...prev, dexterity: (prev.dexterity || 0) + effect.value}));
                break;
            case 'status_effect':
                if (effect.statusEffect) addStatusEffect('enemy', effect.statusEffect);
                break;
        }
    });
    
    setEnemyHealth(newEnemyHealth);

    if (newEnemyHealth <= 0) {
      addLogMessage(`${enemy.name} has been defeated!`);
      handleWin();
    } else {
      endPlayerTurn();
    }
  }, [isPlayerTurn, isCombatOver, player, enemy, enemyHealth, addLogMessage, endPlayerTurn, getPlayerEffects, enemyDebuffs, handleWin, arena, addStatusEffect]);

  const handleUseSkill = useCallback((skill: Skill) => {
    if (!isPlayerTurn || isCombatOver || (skill.cooldown && skillCooldowns[skill.id] > 0)) return;
    if(skill.manaCost && playerMana < skill.manaCost) {
        addLogMessage("Not enough mana!");
        return;
    }
    soundService.playSound(`skill_${skill.id}`);
    triggerAnimation('player', 'attack');
    addLogMessage(`${player.name} uses ${skill.name}!`);

    if (skill.manaCost) {
        setPlayerMana(m => m - skill.manaCost!);
    }
    
    let newEnemyHealth = enemyHealth;
    let newPlayerHealth = playerHealth;

    if (skill.effect.damageType) {
        let baseDamage = 0;
        if(skill.id === 'mana_bolt') {
            baseDamage = Math.floor(player.stats.intelligence * 1.2);
        } else if (skill.id === 'demolition_charge') {
            baseDamage = Math.floor(player.stats.strength * 1.2);
        } else if (skill.id === 'mind_wrack') {
            baseDamage = Math.floor(player.stats.intelligence * 0.5); // Lower damage for utility
        } else {
            const weapon = player.equipment[ItemSlot.WEAPON];
            const weaponDamage = weapon?.damage?.amount || 2;
            baseDamage = Math.floor(weaponDamage * (skill.effect.damageMultiplier || 1));
        }

        const enemyDefense = Math.floor((enemy.stats.dexterity - (enemyDebuffs.dexterity || 0)) / 2);
        let damage = calculateDamage(baseDamage, skill.effect.damageType, enemy.resistances, player.stats) - enemyDefense;
        damage = Math.max(1, damage);

        addLogMessage(`It hits ${enemy.name} for ${damage} damage!`);
        soundService.playSound('enemy_hit');
        triggerAnimation('enemy', 'hit');
        newEnemyHealth = Math.max(0, enemyHealth - damage);
        setEnemyHealth(newEnemyHealth);
    }
    
    if (skill.effect.healAmount) {
      const heal = skill.effect.healAmount;
      addLogMessage(`${player.name} heals for ${heal} health.`);
      newPlayerHealth = Math.min(player.maxHealth, playerHealth + heal);
      setPlayerHealth(newPlayerHealth);
      setPlayer(p => p ? { ...p, currentHealth: newPlayerHealth } : null);
    }
    
    if (skill.effect.statusEffect) {
        addStatusEffect(skill.effect.statusEffect.target, skill.effect.statusEffect.effect);
    }

    setSkillCooldowns(prev => ({...prev, [skill.id]: skill.cooldown || 0}));
    
    if (newEnemyHealth <= 0) {
       addLogMessage(`${enemy.name} has been defeated!`);
       handleWin();
    } else {
      endPlayerTurn();
    }

  }, [isPlayerTurn, isCombatOver, player, enemy, enemyHealth, playerHealth, playerMana, skillCooldowns, addLogMessage, setPlayer, endPlayerTurn, enemyDebuffs, handleWin, arena, addStatusEffect]);

    const processStatusEffects = useCallback((target: 'player' | 'enemy') => {
        const isPlayer = target === 'player';
        const effects = isPlayer ? playerStatusEffects : enemyStatusEffects;
        const setEffects = isPlayer ? setPlayerStatusEffects : setEnemyStatusEffects;
        const setHealth = isPlayer ? setPlayerHealth : setEnemyHealth;
        const name = isPlayer ? player.name : enemy.name;
        let isStunned = false;
        let healthChange = 0;

        const nextEffects: StatusEffect[] = [];

        effects.forEach(effect => {
            switch(effect.type) {
                case StatusEffectType.POISON:
                case StatusEffectType.BURN:
                    const damage = effect.value || 0;
                    healthChange -= damage;
                    addLogMessage(`${name} takes ${damage} damage from ${effect.type}!`);
                    break;
                case StatusEffectType.REGEN:
                    const healing = effect.value || 0;
                    healthChange += healing;
                    addLogMessage(`${name} regenerates ${healing} health!`);
                    break;
                case StatusEffectType.STUN:
                    isStunned = true;
                    addLogMessage(`${name} is stunned!`);
                    break;
            }

            if (effect.duration > 1) {
                nextEffects.push({ ...effect, duration: effect.duration - 1 });
            } else {
                 addLogMessage(`${name}'s ${effect.type} has worn off.`);
            }
        });
        
        setHealth(h => Math.max(0, h + healthChange));
        setEffects(nextEffects);

        return { isStunned, newHealth: (isPlayer ? playerHealth : enemyHealth) + healthChange };

    }, [playerStatusEffects, enemyStatusEffects, player.name, enemy.name, playerHealth, enemyHealth, addLogMessage]);

    const processArenaEffects = useCallback(() => {
        arena.environmentalEffects.forEach(effect => {
            if (effect.type === 'turn_effect' && effect.chance && Math.random() < effect.chance) {
                addLogMessage(`The arena's environment affects everyone!`);
                if (effect.statusEffect) {
                    addStatusEffect('player', effect.statusEffect);
                    addStatusEffect('enemy', effect.statusEffect);
                }
            }
        });
    }, [arena, addStatusEffect]);

  useEffect(() => {
    let turnTimeout: NodeJS.Timeout;

    if (isCombatOver) return;

    if (isPlayerTurn) {
        processArenaEffects();
        const { isStunned, newHealth } = processStatusEffects('player');
        if(isStunned) {
            endPlayerTurn();
            return;
        }
        if (newHealth <= 0) {
            addLogMessage(`${player.name} has been defeated!`);
            soundService.playSound('defeat');
            setPlayer(p => p ? { ...p, currentHealth: 0 } : null);
            setCombatResult({ win: false, loot: [], gold: 0, xp: 0 });
            setIsCombatOver(true);
        }
    } else { // Enemy's turn
      turnTimeout = setTimeout(() => {
        const { isStunned, newHealth } = processStatusEffects('enemy');
        if (newHealth <= 0) {
            addLogMessage(`${enemy.name} has been defeated!`);
            handleWin();
            return;
        }
        if (isStunned) {
            setIsPlayerTurn(true);
            return;
        }

        soundService.playSound('enemy_attack');
        triggerAnimation('enemy', 'attack');
        
        const playerTotalDexterity = player.stats.dexterity + Object.values(player.equipment).reduce((acc, item) => acc + (item?.stats.dexterity || 0), 0);
        const playerDefense = Math.floor(playerTotalDexterity / 2);
        
        const isCrit = Math.random() < (enemy.stats.luck / 200);

        let baseDamage = calculateDamage(enemy.damage.amount, enemy.damage.type, getPlayerResistances(), enemy.stats) - playerDefense;
        baseDamage = Math.max(1, baseDamage);

        const damage = isCrit ? Math.floor(baseDamage * 1.5) : baseDamage;

        addLogMessage(`${enemy.name} attacks ${player.name} for ${damage} damage!${isCrit ? ' (CRITICAL HIT!)' : ''}`);
        soundService.playSound('player_hit');
        triggerAnimation('player', 'hit');

        if(enemy.statusEffectOnHit && Math.random() < 0.3) {
            addStatusEffect('player', enemy.statusEffectOnHit);
        }

        let currentEnemyHealth = enemyHealth;
        const reflectEffects = getPlayerEffects(ItemEffectTrigger.PASSIVE).filter(e => e.type === 'damage_reflect');
        if (reflectEffects.length > 0) {
            const totalReflectValue = reflectEffects.reduce((acc, effect) => acc + effect.value, 0);
            const reflectedDamage = Math.floor(damage * totalReflectValue);
            if(reflectedDamage > 0) {
                addLogMessage(`${player.name}'s gear reflects ${reflectedDamage} damage!`);
                currentEnemyHealth = Math.max(0, enemyHealth - reflectedDamage);
                setEnemyHealth(currentEnemyHealth);
            }
        }

        if (currentEnemyHealth <= 0) {
            addLogMessage(`${enemy.name} was defeated by reflected damage!`);
            handleWin();
            return;
        }

        const newPlayerHealth = playerHealth - damage;
        setPlayerHealth(newPlayerHealth);

        if (newPlayerHealth <= 0) {
          addLogMessage(`${player.name} has been defeated!`);
          soundService.playSound('defeat');
          setPlayer(p => p ? { ...p, currentHealth: 0 } : null);
          setCombatResult({ win: false, loot: [], gold: 0, xp: 0 });
          setIsCombatOver(true);
        } else {
          setPlayer(p => p ? { ...p, currentHealth: newPlayerHealth } : null);
          setIsPlayerTurn(true);
        }
      }, 1000);
    }
    return () => clearTimeout(turnTimeout);
  }, [isPlayerTurn, isCombatOver, processStatusEffects, processArenaEffects]);

  const rarityColorMap: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: 'text-slate-300',
    [ItemRarity.UNCOMMON]: 'text-green-400',
    [ItemRarity.RARE]: 'text-blue-400',
    [ItemRarity.EPIC]: 'text-purple-400',
  };

  return (
    <div className="animate-fade-in">
        <div className="text-center mb-4 hud-card p-2 rounded-lg">
            <h2 className="text-2xl font-orbitron text-cyan-300">{arena.name}</h2>
            <div className="flex justify-center gap-4 text-xs text-cyan-400">
                {arena.environmentalEffects.map(e => <span key={e.description}>{e.description}</span>)}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <GladiatorCard entity={player} currentHealth={playerHealth} currentMana={playerMana} statusEffects={playerStatusEffects} animation={playerAnimation} />
            <GladiatorCard entity={enemy} currentHealth={enemyHealth} statusEffects={enemyStatusEffects} animation={enemyAnimation} />
        </div>
        
        <div className="mt-6 hud-card rounded-lg p-4 h-40 overflow-y-auto" ref={logRef}>
            {log.map((msg, i) => (
                <p key={i} className="font-mono text-sm text-slate-300">{`> ${msg}`}</p>
            ))}
        </div>

        {!isCombatOver && (
            <div className="mt-6 text-center">
                <div className="flex flex-wrap justify-center gap-4">
                    <button 
                        onClick={handlePlayerAttack} 
                        disabled={!isPlayerTurn} 
                        className="btn btn-danger">
                        Attack
                    </button>
                    {playerSkills.map(skill => (
                        <button
                            key={skill.id}
                            onClick={() => handleUseSkill(skill)}
                            disabled={!isPlayerTurn || (skill.cooldown && skillCooldowns[skill.id] > 0) || (skill.manaCost && playerMana < skill.manaCost)}
                            className="btn btn-primary"
                            title={skill.manaCost ? `${skill.manaCost} Mana` : undefined}
                        >
                            {skill.name} {skill.cooldown && skillCooldowns[skill.id] > 0 ? `(${skillCooldowns[skill.id]})` : ''}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {isCombatOver && combatResult && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="hud-container p-8 rounded-xl text-center animate-jump-in">
                    <h2 className="text-4xl font-orbitron mb-4">{combatResult.win ? 'Victory!' : 'Defeated!'}</h2>
                    {combatResult.win && (
                        <div className="space-y-2 text-lg">
                            <p>Gold Found: <span className="text-yellow-400">{combatResult.gold} G</span></p>
                            <p>XP Gained: <span className="text-yellow-400">{combatResult.xp}</span></p>
                            {combatResult.loot.length > 0 && (
                                <div>
                                    <p>Loot Found:</p>
                                    <ul className="list-none">
                                        {combatResult.loot.map((item, index) => <li key={`${item.id}-${index}`} className={rarityColorMap[item.rarity]}>{item.name}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    <button 
                        onClick={() => onCombatEnd(combatResult.win, combatResult.loot, combatResult.gold, combatResult.xp)} 
                        className="mt-6 btn btn-primary">
                        Return to Hub
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default CombatScreen;