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
        this.sounds[section][sound].preload = "auto";
        this.sounds[section][sound].volume = 0.1;
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

    this.play("gameOver", "uhOh");
  }

  bubbleBurst(numOfBubbles: number): void {
    if (this.isMuted) return;

    this.play("specEffects", "pop");

    if (numOfBubbles > 4) {
      this.play("specEffects", "wow");
    }
  }

  playTheme(): void {
    if (this.isMuted) return;
    this.sounds.theme.main.loop = true;
    this.sounds.theme.main.volume = 0.05;
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
