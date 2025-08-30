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
              className="w-full btn btn-primary text-xl"
            >
              Continue
            </button>
          )}
          <button
            onClick={() => {
                soundService.playSound('ui_click');
                onNewGame();
            }}
            className="w-full btn btn-secondary text-xl"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;