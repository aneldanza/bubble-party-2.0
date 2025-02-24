import { COLORS } from "./constants";
import "./style.css";
import Game from "./game";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const game = new Game(canvas, ctx, COLORS);

  const scoreElements = document.getElementsByClassName("score-value");
  const gameOverElement = document.getElementById("game-over")!;

  game.score.subscribe((value) => {
    for (let i = 0; i < scoreElements.length; i++) {
      scoreElements[i].textContent = value.toString();
    }
  });

  game.view.isOver.subscribe((value) => {
    if (value) {
      gameOverElement.style.display = "flex";
    }
  });

  const restartButton = document.getElementById("play-again")!;

  restartButton.addEventListener("click", () => {
    game.start();
    gameOverElement.style.display = "none";
  });

  game.start();
});
