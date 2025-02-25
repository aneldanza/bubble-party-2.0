import { COLORS, SOUNDS } from "./constants";
import "./style.css";
import Game from "./game";
import SoundManager from "./sound-manager";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const soundManager = new SoundManager(SOUNDS);
  const game = new Game(canvas, ctx, COLORS, soundManager);

  const gameOverContainer = document.createElement("div");
  gameOverContainer.id = "game-over-container";
  document.body.appendChild(gameOverContainer);

  fetch("game-over.html")
    .then((response) => response.text())
    .then((html) => {
      gameOverContainer.innerHTML = html;

      const restartButton = document.getElementById("play-again")!;
      const gameOverElement = document.getElementById("game-over")!;

      restartButton.addEventListener("click", () => {
        gameOverElement.style.display = "none";
        game.reset();
        game.start();
      });

      game.view.isOver.subscribe((value) => {
        if (value) {
          gameOverElement.style.display = "flex";
        }
      });
    })
    .catch((error) => {
      console.error("Error loading game-over.html:", error);
    });

  const scoreElements = document.getElementsByClassName("score-value");
  const toggleMuteButton = document.getElementById("toggle-mute")!;

  game.score.subscribe((value) => {
    for (let i = 0; i < scoreElements.length; i++) {
      scoreElements[i].textContent = value.toString();
    }
  });

  toggleMuteButton.addEventListener("click", () => {
    soundManager.muteMusic();
    soundManager.muteSpecEffect();
  });

  game.start();
});
