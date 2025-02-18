import { COLORS } from "./constants";
import "./style.css";
import GameView from "./game-view";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const gameView = new GameView(canvas, ctx, COLORS);

  requestAnimationFrame(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameView.draw();
  });
});
