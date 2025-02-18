import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";

class Game {
  private view: GameView;
  private isOver: boolean;
  private shooter: Shooter;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.view = new GameView(canvas, ctx, colors);
    this.isOver = false;
    this.shooter = new Shooter(
      canvas.width / 2,
      canvas.height - this.view.radius * 2,
      colors[0],
      0,
      0,
      "active"
    );
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
  }

  animate(): void {
    if (!this.isOver) {
      this.view.draw();
      requestAnimationFrame(this.animate.bind(this));
    }
  }
}

export default Game;
