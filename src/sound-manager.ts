class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement };
  public isSpecEffectMuted: boolean;
  public isMusicMuted: boolean;

  constructor(sounds: { [key: string]: string }) {
    this.sounds = {};
    for (const key in sounds) {
      this.sounds[key] = new Audio(sounds[key]);
    }

    this.isSpecEffectMuted = false;
    this.isMusicMuted = false;
  }

  play(sound: string): void {
    this.sounds[sound].play();
  }

  gameOver(): void {
    if (this.isSpecEffectMuted) {
      return;
    }
    this.sounds.theme.pause();
    this.play("uhOh");
    this.sounds.uhOh.onended = () => this.play("lose");
  }

  bubbleBurst(numOfBubbles: number): void {
    if (this.isSpecEffectMuted) {
      return;
    }

    this.play("pop");

    if (numOfBubbles > 4) {
      this.play("wow");
    }
  }

  playTheme(): void {
    if (this.isMusicMuted) {
      return;
    }
    this.sounds.theme.loop = true;
    this.sounds.theme.volume = 0.3;
    this.sounds.theme.play();
  }

  muteMusic() {
    this.isMusicMuted = !this.isMusicMuted;
  }

  muteSpecEffect() {
    this.isSpecEffectMuted = !this.isSpecEffectMuted;
  }
}

export default SoundManager;
