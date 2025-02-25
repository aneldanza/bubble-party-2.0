import { sounds } from "./constants";

class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement };

  constructor() {
    this.sounds = {};
    for (const key in sounds) {
      this.sounds[key] = new Audio(sounds[key]);
    }
  }

  play(sound: string): void {
    this.sounds[sound].play();
  }

  gameOver(): void {
    this.play("uhOh");
    this.sounds.uhOh.onended = () => this.play("lose");
  }

  bubbleBurst(numOfBubbles: number): void {
    this.play("pop");

    if (numOfBubbles > 4) {
      this.play("wow");
    }
  }
}

export default SoundManager;
