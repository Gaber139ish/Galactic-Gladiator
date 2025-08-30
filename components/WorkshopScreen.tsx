import React, { useState, useMemo } from 'react';
import { Player, Item, CraftingRecipe, ModificationRecipe, ItemType, DamageType, ItemRarity } from '../types';
import { ALL_ITEMS_MAP } from '../constants';
import { soundService } from '../services/soundService';

interface WorkshopScreenProps {
  player: Player;
  craftingRecipes: CraftingRecipe[];
  modificationRecipes: ModificationRecipe[];
  onCraft: (recipe: CraftingRecipe | ModificationRecipe) => void;
  onBack: () => void;
}

const WorkshopScreen: React.FC<WorkshopScreenProps> = ({ player, craftingRecipes, modificationRecipes, onCraft, onBack }) => {
    const [activeTab, setActiveTab] = useState<'craft' | 'modify'>('craft');

    const playerMaterials = useMemo(() => {
        const counts: Record<string, number> = {};
        player.inventory.forEach(item => {
            if (item.category === 'Material') {
                counts[item.id] = (counts[item.id] || 0) + 1;
            }
        });
        return counts;
    }, [player.inventory]);
    
    const RecipeCard = ({ recipe }: { recipe: CraftingRecipe | ModificationRecipe }) => {
        const resultItem = ALL_ITEMS_MAP[recipe.result];
        const hasMaterials = Object.entries(recipe.materials).every(([matId, count]) => (playerMaterials[matId] || 0) >= count);
        const hasGold = player.gold >= recipe.cost;
        
        const rarityColor = {
            [ItemRarity.COMMON]: 'text-slate-300',
            [ItemRarity.UNCOMMON]: 'text-green-400',
            [ItemRarity.RARE]: 'text-blue-400',
            [ItemRarity.EPIC]: 'text-purple-400',
        }[resultItem.rarity];
        
        let hasBaseItem = true;
        let baseItem = null;
        if ('baseItem' in recipe) {
            baseItem = ALL_ITEMS_MAP[recipe.baseItem];
            hasBaseItem = player.inventory.some(i => i.id === recipe.baseItem);
        }

        const canCraft = hasMaterials && hasGold && hasBaseItem;

        return (
            <div className={`hud-card p-4 rounded-lg flex flex-col justify-between ${!canCraft ? 'opacity-60' : ''}`}>
                <div>
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-white">Produce: <span className={rarityColor}>{resultItem.name}</span></h4>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                        <p className="font-semibold text-slate-300">Requires:</p>
                        <ul className="list-disc list-inside text-slate-400">
                           {baseItem && (
                                <li className={hasBaseItem ? 'text-green-400' : 'text-red-400'}>
                                    1x {baseItem.name} {hasBaseItem ? `(Owned)` : `(Missing)`}
                                </li>
                           )}
                           {Object.entries(recipe.materials).map(([matId, count]) => {
                                const hasCount = (playerMaterials[matId] || 0);
                                const owned = hasCount >= count;
                                return (
                                    <li key={matId} className={owned ? 'text-green-400' : 'text-red-400'}>
                                       {count}x {ALL_ITEMS_MAP[matId].name} ({hasCount}/{count})
                                    </li>
                                );
                           })}
                           <li className={hasGold ? 'text-green-400' : 'text-red-400'}>
                                {recipe.cost} Gold ({player.gold} G)
                           </li>
                        </ul>
                    </div>
                </div>
                <button onClick={() => onCraft(recipe)} disabled={!canCraft} className="w-full mt-4 btn btn-success !py-2">
                    {baseItem ? 'Modify' : 'Craft'}
                </button>
            </div>
        )
    };

    return (
        <div className="animate-fade-in p-4 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-orbitron text-cyan-300">Workshop</h2>
                    <p className="text-yellow-400 font-bold">Your Gold: {player.gold} G</p>
                </div>
                <button onClick={() => { soundService.playSound('ui_click'); onBack(); }} className="btn btn-secondary">
                Back
                </button>
            </div>

            <div className="flex space-x-2 mt-2 border-b-2 border-cyan-500/20">
                <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('craft'); }} className={`py-2 px-4 font-bold transition-colors ${activeTab === 'craft' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>Crafting</button>
                <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('modify'); }} className={`py-2 px-4 font-bold transition-colors ${activeTab === 'modify' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>Modification</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === 'craft' && craftingRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
                {activeTab === 'modify' && modificationRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
        </div>
    );
};

export default WorkshopScreen;