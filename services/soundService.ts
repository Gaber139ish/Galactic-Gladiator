// This is a placeholder service for sound effects and music.
// In a real application, this would integrate with an audio library like Howler.js or the Web Audio API.

interface SoundService {
  playSound: (soundName: string) => void;
  playMusic: (trackName: string) => void;
  stopMusic: () => void;
}

let currentTrack = '';

export const soundService: SoundService = {
  /**
   * Plays a one-shot sound effect.
   * @param soundName - The identifier for the sound effect (e.g., 'ui_click', 'player_attack').
   */
  playSound: (soundName: string) => {
    console.log(`[AUDIO] Playing sound: ${soundName}`);
  },

  /**
   * Plays a music track, stopping the previously playing one.
   * @param trackName - The identifier for the music track (e.g., 'main_menu_theme', 'combat_music').
   */
  playMusic: (trackName: string) => {
    if (currentTrack !== trackName) {
      if (currentTrack) {
        console.log(`[AUDIO] Stopping music: ${currentTrack}`);
      }
      console.log(`[AUDIO] Playing music: ${trackName}`);
      currentTrack = trackName;
    }
  },

  /**
   * Stops the currently playing music track.
   */
  stopMusic: () => {
    if (currentTrack) {
        console.log(`[AUDIO] Stopping music: ${currentTrack}`);
        currentTrack = '';
    }
  }
};
