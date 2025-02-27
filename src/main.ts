import { COLORS, SOUNDS } from "./constants";
import "./style.css";
import Game from "./game";
import SoundManager from "./sound-manager";
import HighestScoreManager from "./highest-score-manager";
import { setupGameOverScreen } from "./game-over";
import { setupStartScreen } from "./setup";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const soundManager = new SoundManager(SOUNDS);
  const highestScoreManager = new HighestScoreManager();
  const game = new Game(canvas, ctx, COLORS, soundManager);

  // setupStartScreen(game);
  setupGameOverScreen(game, highestScoreManager);

  const scoreElements = document.getElementsByClassName("score-value");
  const toggleMuteButton = document.getElementById("toggle-mute")!;
  const quitButton = document.getElementById("quit")!;
  const pauseButton = document.getElementById("toggle-pause")!;

  game.score.subscribe((value) => {
    for (let i = 0; i < scoreElements.length; i++) {
      scoreElements[i].textContent = value.toString();
    }
  });

  game.isPaused.subscribe((value) => {
    value
      ? (pauseButton.textContent = "Resume")
      : (pauseButton.textContent = "Pause");
  });

  toggleMuteButton.addEventListener("click", (e: MouseEvent) => {
    soundManager.toggleMuteAll();

    const button = e.target as HTMLButtonElement;
    button.textContent = soundManager.isMuted ? "Unmute" : "Mute";
  });

  quitButton.addEventListener("click", () => {
    game.view.isOver.value = true;
  });

  pauseButton.addEventListener("click", () => {
    game.isPaused.value = !game.isPaused.value;
  });

  game.start();
});
