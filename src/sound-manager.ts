import { SoundsObject } from "./types";

class SoundManager {
  public sounds: { [key: string]: { [key: string]: HTMLAudioElement } };
  public isMuted: boolean = false;

  constructor(sounds: SoundsObject) {
    this.sounds = {};
    for (const section in sounds) {
      this.sounds[section] = {};
      for (const sound in sounds[section]) {
        this.sounds[section][sound] = new Audio(sounds[section][sound]);
      }
    }
  }

  play(section: string, sound: string): void {
    if (this.isMuted) return;
    this.sounds[section][sound].play();
  }

  gameOver(): void {
    if (this.isMuted) return;
    this.sounds.theme.main.pause();
    const gameOverSection = this.sounds.gameOver;
    gameOverSection.uhOh.play();
    gameOverSection.uhOh.onended = () => gameOverSection.lose.play();
  }

  bubbleBurst(numOfBubbles: number): void {
    if (this.isMuted) return;
    const specEffectsSection = this.sounds.specEffects;
    specEffectsSection.pop.play();

    if (numOfBubbles > 4) {
      specEffectsSection.wow.play();
    }
  }

  playTheme(): void {
    if (this.isMuted) return;
    this.sounds.theme.main.loop = true;
    this.sounds.theme.main.volume = 0.3;
    this.sounds.theme.main.play();
  }

  toggleMuteMusic() {
    this.sounds.theme.main.muted = !this.sounds.theme.main.muted;
  }

  toggleMuteSpecEffect() {
    for (const key in this.sounds.specEffects) {
      this.sounds.specEffects[key].muted = !this.sounds.specEffects[key].muted;
    }
  }

  toggleMuteGameOver() {
    for (const key in this.sounds.gameOver) {
      this.sounds.gameOver[key].muted = !this.sounds.gameOver[key].muted;
    }
  }

  toggleMuteAll() {
    this.isMuted = !this.isMuted;
    this.toggleMuteMusic();
    this.toggleMuteSpecEffect();
    this.toggleMuteGameOver();
  }

  pauseGameSounds(pause: boolean) {
    if (pause) {
      this.sounds.theme.main.pause();
    } else {
      this.sounds.theme.main.play();
    }
  }
}

export default SoundManager;
