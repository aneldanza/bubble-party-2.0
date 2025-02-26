import { COLORS, SOUNDS } from "./constants";
import "./style.css";
import Game from "./game";
import SoundManager from "./sound-manager";
import { setupGameOverScreen } from "./game-over";
import { setupStartScreen } from "./setup";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const soundManager = new SoundManager(SOUNDS);
  const game = new Game(canvas, ctx, COLORS, soundManager);

  setupGameOverScreen(game);

  setupStartScreen(game);

  const scoreElements = document.getElementsByClassName("score-value");
  const toggleMuteButton = document.getElementById("toggle-mute")!;

  game.score.subscribe((value) => {
    for (let i = 0; i < scoreElements.length; i++) {
      scoreElements[i].textContent = value.toString();
    }
  });

  toggleMuteButton.addEventListener("click", (e: MouseEvent) => {
    soundManager.muteMusic();
    soundManager.muteSpecEffect();

    const button = e.target as HTMLButtonElement;
    button.textContent = soundManager.sounds.theme.muted ? "Unmute" : "Mute";
  });
});
