import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Enemy, Item, ItemSlot, Stats, Skill, SkillType, PlayerClass, Arena, CraftingRecipe, ModificationRecipe } from './types';
import { ENEMIES, LEVEL_XP_REQUIREMENTS, SHOP_INVENTORY, ALL_SKILLS_LOOKUP, SKILL_TREES, ARENAS, ALL_ITEMS_MAP, CRAFTING_RECIPES, MODIFICATION_RECIPES } from './constants';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import HubScreen from './components/HubScreen';
import CombatScreen from './components/CombatScreen';
import CharacterSheetScreen from './components/CharacterSheetScreen';
import ShopScreen from './components/ShopScreen';
import MainMenuScreen from './components/MainMenuScreen';
import TrainerScreen from './components/TrainerScreen';
import WorkshopScreen from './components/WorkshopScreen';
import { soundService } from './services/soundService';

const SAVE_KEY = 'galactic-gladiator-save';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MAIN_MENU);
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [currentArena, setCurrentArena] = useState<Arena | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [saveExists, setSaveExists] = useState(false);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      setSaveExists(!!savedData);
      soundService.playMusic('main_menu_theme');
    } catch (error) {
      console.error("Could not access local storage:", error);
      setSaveExists(false);
    }
  }, []);

  const changeGameState = (newState: GameState) => {
    // Play music based on state
    switch(newState) {
        case GameState.HUB:
        case GameState.CHARACTER_SHEET:
        case GameState.SHOP:
        case GameState.TRAINER:
        case GameState.WORKSHOP:
            soundService.playMusic('hub_theme');
            break;
        case GameState.COMBAT:
            soundService.playMusic('combat_music');
            break;
        case GameState.MAIN_MENU:
        case GameState.CHARACTER_CREATION:
            soundService.playMusic('main_menu_theme');
            break;
    }
    setGameState(newState);
  };

  const saveGame = useCallback(() => {
    if (player) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(player));
        setSaveExists(true);
        soundService.playSound('save_game');
        alert("Game Saved!");
      } catch (error) {
        console.error("Failed to save game:", error);
        alert("Error: Could not save game.");
      }
    }
  }, [player]);

  const loadGame = useCallback(() => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        setPlayer(JSON.parse(savedData));
        changeGameState(GameState.HUB);
      } else {
        alert("No save data found.");
        changeGameState(GameState.CHARACTER_CREATION);
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      alert("Error: Could not load save data.");
      changeGameState(GameState.CHARACTER_CREATION);
    }
  }, []);
  
  const deleteSaveAndStartNew = useCallback(() => {
    try {
        localStorage.removeItem(SAVE_KEY);
        setSaveExists(false);
    } catch (error) {
        console.error("Could not remove save data:", error);
    }
    setPlayer(null);
    changeGameState(GameState.CHARACTER_CREATION);
  }, []);

  const handleCharacterCreate = useCallback((createdPlayer: Omit<Player, 'currentHealth' | 'maxHealth' | 'xpToNextLevel' | 'equipment' | 'inventory'| 'skills' | 'skillPoints' | 'currentMana' | 'maxMana' | 'statusEffects' | 'ngPlus' >) => {
    const maxHealth = 50 + createdPlayer.stats.constitution * 10;
    const maxMana = 20 + createdPlayer.stats.intelligence * 5;
    const newPlayer: Player = {
      ...createdPlayer,
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_XP_REQUIREMENTS[1],
      gold: 50,
      currentHealth: maxHealth,
      maxHealth: maxHealth,
      currentMana: maxMana,
      maxMana: maxMana,
      equipment: {
        [ItemSlot.WEAPON]: ALL_ITEMS_MAP['item_weapon_001'],
        [ItemSlot.ARMOR]: ALL_ITEMS_MAP['item_armor_001'],
      },
      inventory: [],
      backstory: createdPlayer.backstory || "A mysterious warrior with a past yet to be written.",
      skills: [],
      skillPoints: 0,
      statusEffects: [],
      ngPlus: 0,
    };
    setPlayer(newPlayer);
    changeGameState(GameState.HUB);
  }, []);

  const handleStartFight = useCallback((arena: Arena) => {
    if (!player) return;
    
    const scale = 1 + (player.ngPlus * 0.75); // Increased NG+ scaling

    const enemyId = arena.possibleEnemies[Math.floor(Math.random() * arena.possibleEnemies.length)];
    const enemyTemplate = ENEMIES.find(e => e.id === enemyId) || ENEMIES[0];
    
    const scaledMaxHealth = Math.floor((enemyTemplate.stats.constitution * 10) * scale);
    const newEnemy: Enemy = {
      ...enemyTemplate,
      stats: {
          strength: Math.floor(enemyTemplate.stats.strength * scale),
          dexterity: Math.floor(enemyTemplate.stats.dexterity * scale),
          intelligence: Math.floor(enemyTemplate.stats.intelligence * scale),
          constitution: Math.floor(enemyTemplate.stats.constitution * scale),
          luck: Math.floor(enemyTemplate.stats.luck * scale),
      },
      damage: { ...enemyTemplate.damage, amount: Math.floor(enemyTemplate.damage.amount * scale)},
      maxHealth: scaledMaxHealth,
      currentHealth: scaledMaxHealth,
      goldDrop: { 
          min: Math.floor(enemyTemplate.goldDrop.min * scale),
          max: Math.floor(enemyTemplate.goldDrop.max * scale),
      },
      xpValue: Math.floor(enemyTemplate.xpValue * scale),
      statusEffects: [],
    };
    setCurrentEnemy(newEnemy);
    setCurrentArena(arena);
    setCombatLog([`Entering ${arena.name}... A wild ${newEnemy.name} appears!${player.ngPlus > 0 ? ` (NG+ ${player.ngPlus})` : ''}`]);
    changeGameState(GameState.COMBAT);
  }, [player]);
  
  const handleStartNewGamePlus = useCallback(() => {
    if (!player || player.level < 10) return;
    
    if(!window.confirm("Are you sure you want to start New Game+? You will restart at level 1 but keep your skills. The galaxy will become much more dangerous.")) {
        return;
    }
    soundService.playSound('ng_plus_start');

    const newPlayer: Player = {
      ...player,
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_XP_REQUIREMENTS[1],
      gold: 100, // Start with a bit of gold
      stats: {
        strength: 5 + (player.race.statBonuses.strength || 0) + (player.playerClass.statBonuses.strength || 0),
        dexterity: 5 + (player.race.statBonuses.dexterity || 0) + (player.playerClass.statBonuses.dexterity || 0),
        intelligence: 5 + (player.race.statBonuses.intelligence || 0) + (player.playerClass.statBonuses.intelligence || 0),
        constitution: 5 + (player.race.statBonuses.constitution || 0) + (player.playerClass.statBonuses.constitution || 0),
        luck: 5 + (player.race.statBonuses.luck || 0) + (player.playerClass.statBonuses.luck || 0),
      },
      equipment: {
        [ItemSlot.WEAPON]: ALL_ITEMS_MAP['item_weapon_001'],
        [ItemSlot.ARMOR]: ALL_ITEMS_MAP['item_armor_001'],
      },
      inventory: [],
      ngPlus: player.ngPlus + 1,
    };
    // Recalculate health and mana for level 1
    newPlayer.maxHealth = 50 + (newPlayer.stats.constitution || 0) * 10;
    newPlayer.currentHealth = newPlayer.maxHealth;
    newPlayer.maxMana = 20 + (newPlayer.stats.intelligence || 0) * 5;
    newPlayer.currentMana = newPlayer.maxMana;
    
    setPlayer(newPlayer);
    changeGameState(GameState.HUB);

  }, [player]);

  const handleCombatEnd = useCallback((win: boolean, loot: Item[], gold: number, xp: number) => {
    if (!player) return;
    
    let updatedPlayer = { ...player, currentHealth: player.currentHealth <= 0 ? 1 : player.currentHealth, statusEffects: [] }; // Revive with 1 hp if defeated, clear effects

    if (win) {
      updatedPlayer.gold += gold;
      
      const newInventory = [...updatedPlayer.inventory];
      loot.forEach(item => {
        const existingItem = newInventory.find(i => i.id === item.id);
        if (existingItem && item.category === 'Material') {
            // Materials don't stack in this simple inventory, so just add them
            newInventory.push(item);
        } else {
            newInventory.push(item);
        }
      });
      updatedPlayer.inventory = newInventory;
      
      let newXp = updatedPlayer.xp + xp;
      let newLevel = updatedPlayer.level;
      let newXpToNextLevel = updatedPlayer.xpToNextLevel;
      let newSkillPoints = updatedPlayer.skillPoints;

      while (newXp >= newXpToNextLevel && newLevel < 10) {
        soundService.playSound('level_up');
        newLevel++;
        newXp -= newXpToNextLevel;
        newXpToNextLevel = LEVEL_XP_REQUIREMENTS[newLevel] || 999999;
        newSkillPoints += 1;
        // Level up stat increases
        updatedPlayer.stats.strength += 1;
        updatedPlayer.stats.dexterity += 1;
        updatedPlayer.stats.intelligence += 1;
        updatedPlayer.stats.constitution += 1;
        updatedPlayer.stats.luck += 1;
        updatedPlayer.maxHealth += 10;
        updatedPlayer.maxMana += 5;
        updatedPlayer.currentHealth = updatedPlayer.maxHealth;
        updatedPlayer.currentMana = updatedPlayer.maxMana;
      }

      updatedPlayer = {
        ...updatedPlayer,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        skillPoints: newSkillPoints,
      };
    }
    
    setPlayer(updatedPlayer);
    setCurrentEnemy(null);
    setCurrentArena(null);
    changeGameState(GameState.HUB);
  }, [player]);

  const trainStat = useCallback((stat: keyof Player['stats']) => {
    if(!player) return;
    const cost = player.level * 50;
    if(player.gold >= cost) {
        soundService.playSound('train_stat');
        const newPlayer = {...player, stats: {...player.stats}};
        newPlayer.gold -= cost;
        newPlayer.stats[stat] += 1;
        if (stat === 'constitution') {
            newPlayer.maxHealth += 10;
            newPlayer.currentHealth += 10;
        }
        if (stat === 'intelligence') {
            newPlayer.maxMana += 5;
            newPlayer.currentMana += 5;
        }
        setPlayer(newPlayer);
    } else {
        alert("Not enough gold to train!");
    }
  }, [player]);
  
  const recalculateHealthAndMana = (playerState: Player, oldEquipment: Player['equipment'], newEquipment: Player['equipment']): { maxHealth: number, currentHealth: number, maxMana: number, currentMana: number } => {
      const oldConstitutionBonus = Object.values(oldEquipment).reduce((acc, item) => acc + (item?.stats.constitution || 0), 0);
      const newConstitutionBonus = Object.values(newEquipment).reduce((acc, item) => acc + (item?.stats.constitution || 0), 0);
      const constitutionDiff = newConstitutionBonus - oldConstitutionBonus;
      const newMaxHealth = playerState.maxHealth + (constitutionDiff * 10);
      let newCurrentHealth = playerState.currentHealth + (constitutionDiff * 10);
      
      const oldIntelligenceBonus = Object.values(oldEquipment).reduce((acc, item) => acc + (item?.stats.intelligence || 0), 0);
      const newIntelligenceBonus = Object.values(newEquipment).reduce((acc, item) => acc + (item?.stats.intelligence || 0), 0);
      const intelligenceDiff = newIntelligenceBonus - oldIntelligenceBonus;
      const newMaxMana = playerState.maxMana + (intelligenceDiff * 5);
      let newCurrentMana = playerState.currentMana + (intelligenceDiff * 5);


      if (newCurrentHealth > newMaxHealth) newCurrentHealth = newMaxHealth;
      if (newCurrentHealth <= 0) newCurrentHealth = 1;
      if (newCurrentMana > newMaxMana) newCurrentMana = newMaxMana;
      if (newCurrentMana < 0) newCurrentMana = 0;


      return { maxHealth: newMaxHealth, currentHealth: newCurrentHealth, maxMana: newMaxMana, currentMana: newCurrentMana };
  }

  const equipItem = useCallback((itemToEquip: Item, inventoryIndex: number) => {
    if (!player) return;

    const newPlayer = { ...player, inventory: [...player.inventory], equipment: { ...player.equipment } };
    
    // Get the currently equipped item in the target slot.
    const currentlyEquippedItem = newPlayer.equipment[itemToEquip.slot!];
    const oldEquipment = { ...player.equipment };

    // 1. Remove the new item from its specific inventory slot.
    // This is done before other modifications to ensure the index is correct.
    newPlayer.inventory.splice(inventoryIndex, 1);
    
    // 2. Add the old item (if any) back to the inventory.
    if (currentlyEquippedItem) {
      newPlayer.inventory.push(currentlyEquippedItem);
    }
    
    // 3. Equip the new item.
    newPlayer.equipment[itemToEquip.slot!] = itemToEquip;
    
    const { maxHealth, currentHealth, maxMana, currentMana } = recalculateHealthAndMana(newPlayer, oldEquipment, newPlayer.equipment);
    newPlayer.maxHealth = maxHealth;
    newPlayer.currentHealth = currentHealth;
    newPlayer.maxMana = maxMana;
    newPlayer.currentMana = currentMana;

    soundService.playSound('equip_item');
    setPlayer(newPlayer);
  }, [player]);

  const buyItem = useCallback((itemToBuy: Item) => {
    if (!player) return;
    if (player.gold >= itemToBuy.cost) {
      soundService.playSound('buy_item');
      setPlayer(p => p && {
        ...p,
        gold: p.gold - itemToBuy.cost,
        inventory: [...p.inventory, itemToBuy],
      });
    } else {
      alert("Not enough gold!");
    }
  }, [player]);

  const sellItem = useCallback((itemToSell: Item, index: number) => {
    if (!player) return;
    const sellPrice = Math.floor(itemToSell.cost / 2);
    const newInventory = [...player.inventory];
    newInventory.splice(index, 1);
    soundService.playSound('sell_item');
    setPlayer(p => p && {
      ...p,
      gold: p.gold + sellPrice,
      inventory: newInventory,
    });
  }, [player]);

  const learnSkill = useCallback((skillId: string) => {
    if (!player || player.skillPoints < 1) return;
    const skill = ALL_SKILLS_LOOKUP[skillId];
    if (!skill || player.skills.includes(skillId)) return;

    const hasPrerequisites = skill.prerequisites?.every(req => player.skills.includes(req)) ?? true;
    if (player.level >= skill.levelRequired && hasPrerequisites) {
      soundService.playSound('learn_skill');
      const newPlayer = {...player, stats: {...player.stats}, skills: [...player.skills]};
      newPlayer.skillPoints -= 1;
      newPlayer.skills.push(skillId);
      
      if (skill.type === SkillType.PASSIVE && skill.effect.statBonus) {
        (Object.keys(skill.effect.statBonus) as Array<keyof Stats>).forEach(stat => {
          const bonus = skill.effect.statBonus![stat] || 0;
          newPlayer.stats[stat] += bonus;
           if (stat === 'constitution') {
            newPlayer.maxHealth += bonus * 10;
            newPlayer.currentHealth += bonus * 10;
           }
           if (stat === 'intelligence') {
             newPlayer.maxMana += bonus * 5;
             newPlayer.currentMana += bonus * 5;
           }
        });
      }
      setPlayer(newPlayer);

    } else {
      alert("Requirements not met to learn this skill.");
    }
  }, [player]);

  const learnTrainedSkill = useCallback((skillToLearn: Skill) => {
    if (!player) return;
    const cost = skillToLearn.cost || 0;
    if (player.gold < cost) {
      alert("Not enough gold!");
      return;
    }
    if (player.skills.includes(skillToLearn.id)) {
      alert("You already know this skill.");
      return;
    }
    if (player.level < skillToLearn.levelRequired) {
      alert(`You must be level ${skillToLearn.levelRequired} to learn this.`);
      return;
    }
    const hasPrerequisites = skillToLearn.prerequisites?.every(req => player.skills.includes(req)) ?? true;
    if (!hasPrerequisites) {
        alert("You don't meet the prerequisites for this skill.");
        return;
    }
    soundService.playSound('learn_skill');
    const newPlayer = {...player, stats: {...player.stats}, skills: [...player.skills]};
    newPlayer.gold -= cost;
    newPlayer.skills.push(skillToLearn.id);
    
    if (skillToLearn.type === SkillType.PASSIVE && skillToLearn.effect.statBonus) {
      (Object.keys(skillToLearn.effect.statBonus) as Array<keyof Stats>).forEach(stat => {
        const bonus = skillToLearn.effect.statBonus![stat] || 0;
        newPlayer.stats[stat] += bonus;
         if (stat === 'constitution') {
          newPlayer.maxHealth += bonus * 10;
          newPlayer.currentHealth += bonus * 10;
         }
         if (stat === 'intelligence') {
            newPlayer.maxMana += bonus * 5;
            newPlayer.currentMana += bonus * 5;
         }
      });
    }
    setPlayer(newPlayer);
    alert(`Learned ${skillToLearn.name}!`);
  }, [player]);

  const handleCraftItem = useCallback((recipe: CraftingRecipe | ModificationRecipe) => {
    if (!player) return;
    
    // Check cost
    if (player.gold < recipe.cost) {
        alert('Not enough gold!');
        return;
    }

    const newInventory = [...player.inventory];
    let baseItemIndex = -1;

    // Check for Modification base item
    if ('baseItem' in recipe) {
        baseItemIndex = newInventory.findIndex(i => i.id === recipe.baseItem);
        if (baseItemIndex === -1) {
            alert(`You need a ${ALL_ITEMS_MAP[recipe.baseItem].name} to perform this modification.`);
            return;
        }
    }

    // Check materials
    for (const [materialId, requiredCount] of Object.entries(recipe.materials)) {
        const count = newInventory.filter(i => i.id === materialId).length;
        if (count < requiredCount) {
            alert(`You need ${requiredCount}x ${ALL_ITEMS_MAP[materialId].name}. You only have ${count}.`);
            return;
        }
    }

    // All checks passed, perform craft/modification
    soundService.playSound('craft_item');
    let updatedPlayer = { ...player, gold: player.gold - recipe.cost };
    
    // Consume materials
    let tempInventory = [...newInventory];
    for (const [materialId, requiredCount] of Object.entries(recipe.materials)) {
        for (let i = 0; i < requiredCount; i++) {
            const indexToRemove = tempInventory.findIndex(item => item.id === materialId);
            if (indexToRemove > -1) {
                tempInventory.splice(indexToRemove, 1);
            }
        }
    }

    // Consume base item for modification
    if ('baseItem' in recipe && baseItemIndex > -1) {
        // Find index in temp inventory, which may have shifted
        const tempBaseItemIndex = tempInventory.findIndex(i => i.id === recipe.baseItem);
        if(tempBaseItemIndex > -1) tempInventory.splice(tempBaseItemIndex, 1);
    }

    // Add result
    tempInventory.push(ALL_ITEMS_MAP[recipe.result]);

    updatedPlayer.inventory = tempInventory;
    setPlayer(updatedPlayer);
    alert(`Successfully created ${ALL_ITEMS_MAP[recipe.result].name}!`);

  }, [player]);

  const sortInventory = useCallback(() => {
    if (!player) return;
    soundService.playSound('ui_click');
    const sorted = [...player.inventory].sort((a, b) => {
        if (a.category !== b.category) {
            return a.category === 'Gear' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
    setPlayer({ ...player, inventory: sorted });
  }, [player]);

  const optimizeGear = useCallback(() => {
    if (!player) return;
    soundService.playSound('ui_click');

    const allItems = [...player.inventory.filter(i => i.category === 'Gear'), ...Object.values(player.equipment).filter((i): i is Item => !!i)];
    const newEquipment: Player['equipment'] = {};

    for (const slot of Object.values(ItemSlot)) {
      const itemsForSlot = allItems.filter(item => item.slot === slot);
      if (itemsForSlot.length > 0) {
        const bestItem = itemsForSlot.reduce((best, current) => {
          const bestScore = Object.values(best.stats).reduce((sum, val = 0) => sum + val, 0) + (best.damage?.amount || 0);
          const currentScore = Object.values(current.stats).reduce((sum, val = 0) => sum + val, 0) + (current.damage?.amount || 0);
          return currentScore > bestScore ? current : best;
        });
        newEquipment[slot] = bestItem;
      }
    }

    const equippedItemIdsToRemove = Object.values(newEquipment).map(i => i!.id);
    const newInventory = [...allItems];
    for (const idToRemove of equippedItemIdsToRemove) {
        const index = newInventory.findIndex(item => item.id === idToRemove);
        if (index > -1) {
            newInventory.splice(index, 1);
        }
    }
    
    const tempPlayer = { ...player, equipment: newEquipment, inventory: [...newInventory, ...player.inventory.filter(i=>i.category === 'Material')] };
    const { maxHealth, currentHealth, maxMana, currentMana } = recalculateHealthAndMana(player, player.equipment, newEquipment);
    tempPlayer.maxHealth = maxHealth;
    tempPlayer.currentHealth = currentHealth;
    tempPlayer.maxMana = maxMana;
    tempPlayer.currentMana = currentMana;


    setPlayer(tempPlayer);
  }, [player]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.MAIN_MENU:
        return <MainMenuScreen saveExists={saveExists} onContinue={loadGame} onNewGame={deleteSaveAndStartNew} />;
      case GameState.CHARACTER_CREATION:
        return <CharacterCreationScreen onCharacterCreate={handleCharacterCreate} />;
      case GameState.HUB:
        if (!player) return null;
        return <HubScreen player={player} arenas={ARENAS} onFight={handleStartFight} onViewCharacter={() => changeGameState(GameState.CHARACTER_SHEET)} onTrainStat={trainStat} onVisitShop={() => changeGameState(GameState.SHOP)} onVisitTrainer={() => changeGameState(GameState.TRAINER)} onVisitWorkshop={() => changeGameState(GameState.WORKSHOP)} onSave={saveGame} onStartNewGamePlus={handleStartNewGamePlus}/>;
      case GameState.COMBAT:
        if (!player || !currentEnemy || !currentArena) return null;
        return <CombatScreen player={player} setPlayer={setPlayer} enemy={currentEnemy} arena={currentArena} onCombatEnd={handleCombatEnd} log={combatLog} setLog={setCombatLog} />;
      case GameState.CHARACTER_SHEET:
        if (!player) return null;
        return <CharacterSheetScreen player={player} onBack={() => changeGameState(GameState.HUB)} onEquipItem={equipItem} onLearnSkill={learnSkill} onSortInventory={sortInventory} onOptimizeGear={optimizeGear}/>;
      case GameState.SHOP:
        if (!player) return null;
        return <ShopScreen player={player} shopInventory={SHOP_INVENTORY} onBuyItem={buyItem} onSellItem={sellItem} onBack={() => changeGameState(GameState.HUB)} />;
      case GameState.TRAINER:
        if (!player) return null;
        const trainerSkills = SKILL_TREES.find(tree => tree.class === 'Trainer')?.skills || [];
        return <TrainerScreen player={player} trainerSkills={trainerSkills} onLearnSkill={learnTrainedSkill} onBack={() => changeGameState(GameState.HUB)} />;
      case GameState.WORKSHOP:
        if (!player) return null;
        return <WorkshopScreen player={player} craftingRecipes={CRAFTING_RECIPES} modificationRecipes={MODIFICATION_RECIPES} onCraft={handleCraftItem} onBack={() => changeGameState(GameState.HUB)} />;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-orbitron mb-4 title-glow">
        Galactic Gladiator
      </h1>
      <div className="w-full max-w-6xl mx-auto hud-container rounded-xl p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;