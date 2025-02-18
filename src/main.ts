import { COLORS } from "./constants";
import "./style.css";
import Game from "./game";

// check if page is loaded
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const game = new Game(canvas, ctx, COLORS);

  game.animate();
});
