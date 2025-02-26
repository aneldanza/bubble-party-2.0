class SoundManager {
  public sounds: { [key: string]: HTMLAudioElement };

  constructor(sounds: { [key: string]: string }) {
    this.sounds = {};
    for (const key in sounds) {
      this.sounds[key] = new Audio(sounds[key]);
    }
  }

  play(sound: string): void {
    this.sounds[sound].play();
  }

  gameOver(): void {
    this.sounds.theme.pause();
    this.play("uhOh");
    this.sounds.uhOh.onended = () => this.play("lose");
  }

  bubbleBurst(numOfBubbles: number): void {
    this.play("pop");

    if (numOfBubbles > 4) {
      this.play("wow");
    }
  }

  playTheme(): void {
    this.sounds.theme.loop = true;
    this.sounds.theme.volume = 0.3;
    this.sounds.theme.play();
  }

  muteMusic() {
    this.sounds.theme.muted = !this.sounds.theme.muted;
  }

  muteSpecEffect() {
    this.sounds.uhOh.muted = !this.sounds.uhOh.muted;
    this.sounds.pop.muted = !this.sounds.pop.muted;
    this.sounds.wow.muted = !this.sounds.wow.muted;
    this.sounds.lose.muted = !this.sounds.lose.muted;
    this.sounds.hit.muted = !this.sounds.hit.muted;
  }
}

export default SoundManager;
