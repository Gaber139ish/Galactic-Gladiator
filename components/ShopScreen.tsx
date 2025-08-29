import React, { useState } from 'react';
import { Player, Item, DamageType, ItemRarity } from '../types';
import { soundService } from '../services/soundService';

interface ShopScreenProps {
  player: Player;
  shopInventory: Item[];
  onBuyItem: (item: Item) => void;
  onSellItem: (item: Item, index: number) => void;
  onBack: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ player, shopInventory, onBuyItem, onSellItem, onBack }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

    const ItemCard = ({ item, onAction, actionLabel }: { item: Item; onAction: () => void; actionLabel: string; }) => {
        const sellPrice = Math.floor(item.cost / 2);
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
            <div className="bg-slate-800 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                <div>
                    <p className={`font-bold ${rarityColor}`}>{item.name} <span className="text-xs font-normal text-slate-400">({item.type})</span></p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        {Object.entries(item.stats).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value}`).join(', ')}
                    </p>
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
                <div className="text-right">
                    <p className="font-bold text-yellow-400">{actionLabel === "Buy" ? `${item.cost} G` : `${sellPrice} G`}</p>
                    <button 
                        onClick={onAction}
                        className={`mt-1 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors ${actionLabel === 'Buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-700 hover:bg-yellow-600'}`}
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        );
    };

  return (
    <div className="animate-fade-in p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-orbitron text-cyan-300">Galactic Emporium</h2>
          <p className="text-yellow-400 font-bold">Your Gold: {player.gold} G</p>
        </div>
        <button onClick={() => { soundService.playSound('ui_click'); onBack(); }} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Back to Hub
        </button>
      </div>

      <div className="flex space-x-2 mt-2 border-b border-slate-700">
          <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('buy'); }} className={`py-2 px-4 font-bold ${activeTab === 'buy' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Buy</button>
          <button onClick={() => { soundService.playSound('ui_click'); setActiveTab('sell'); }} className={`py-2 px-4 font-bold ${activeTab === 'sell' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'}`}>Sell</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'buy' && shopInventory.map((item, index) => (
                <ItemCard key={`${item.id}-${index}`} item={item} onAction={() => onBuyItem(item)} actionLabel="Buy" />
            ))}
            {activeTab === 'sell' && player.inventory.filter(i => i.category === 'Gear').length > 0 ? player.inventory.filter(i => i.category === 'Gear').map((item, index) => (
                <ItemCard key={`${item.id}-${index}`} item={item} onAction={() => onSellItem(item, index)} actionLabel="Sell" />
            )) : activeTab === 'sell' && (
                <p className="text-slate-500 md:col-span-2 text-center">Your inventory has no gear to sell.</p>
            )}
      </div>

    </div>
  );
};

export default ShopScreen;