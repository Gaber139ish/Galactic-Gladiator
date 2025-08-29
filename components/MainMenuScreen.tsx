import React from 'react';
import { soundService } from '../services/soundService';

interface MainMenuScreenProps {
  saveExists: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ saveExists, onContinue, onNewGame }) => {
  return (
    <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
      <div className="text-center space-y-6">
        <p className="text-xl text-slate-300">Your cosmic journey awaits.</p>
        <div className="flex flex-col space-y-4 w-64">
          {saveExists && (
            <button
              onClick={() => {
                soundService.playSound('ui_click_confirm');
                onContinue();
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg text-xl font-orbitron transition-colors"
            >
              Continue
            </button>
          )}
          <button
            onClick={() => {
                soundService.playSound('ui_click');
                onNewGame();
            }}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg text-xl font-orbitron transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;