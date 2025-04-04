import { COLORS, SOUNDS } from "./constants";
import "./style.css";
import Game from "./game";
import SoundManager from "./sound-manager";
import HighestScoreManager from "./highest-score-manager";
import { setupGameOverScreen } from "./game-over";
import { setupStartScreen } from "./setup";
import BackgroundAnimations from "./background-animations";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const soundManager = new SoundManager(SOUNDS);
  const highestScoreManager = new HighestScoreManager();
  const game = new Game(canvas, ctx, COLORS, soundManager);
  const animations = new BackgroundAnimations();

  setupStartScreen(game, animations);
  setupGameOverScreen(game, highestScoreManager);

  const scoreElements = document.getElementsByClassName("score-value");
  const toggleMuteButton = document.getElementById("toggle-mute")!;
  const muteToolTip = document.getElementById("mute-tooltip")!;
  const quitButton = document.getElementById("quit")!;
  const pauseButtonsCollection =
    document.getElementsByClassName("toggle-pause")!;
  const resumeScreen = document.getElementById("resume-screen")!;

  game.score.subscribe((value) => {
    for (let i = 0; i < scoreElements.length; i++) {
      scoreElements[i].textContent = value.toString();
    }
  });

  game.isPaused.subscribe((value) => {
    if (value) {
      resumeScreen.style.display = "flex";
    } else {
      resumeScreen.style.display = "none";
    }
  });

  toggleMuteButton.addEventListener("click", (e: MouseEvent) => {
    soundManager.toggleMuteAll();

    const element = e.target;
    if (element instanceof HTMLImageElement) {
      if (soundManager.isMuted) {
        element.src = "/volume-mute.svg";
        muteToolTip.textContent = "Unmute";
      } else {
        element.src = "/volume-loud.svg";
        muteToolTip.textContent = "Mute";
      }
    } else {
      console.error("Element is not an HTMLImageElement or HTMLButtonElement");
    }
  });

  quitButton.addEventListener("click", () => {
    game.view.isOver.value = true;
  });

  for (let i = 0; i < pauseButtonsCollection.length; i++) {
    const button = pauseButtonsCollection[i] as HTMLButtonElement;
    button.addEventListener("click", () => {
      game.isPaused.value = !game.isPaused.value;
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      game.isPaused.value = true;
    }
  });
});
