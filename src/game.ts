import GameView from "./game-view";
import Shooter from "./shooter";
// import Bubble from "./bubble";

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
      this.view.canvas.width / 2,
      this.view.canvas.height - this.view.radius * 2,
      colors[0]
    );
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
  }

  animate(): void {
    if (!this.isOver) {
      this.view.draw();
      this.shooter.move();
      this.handleBorderCollision();
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  handleBorderCollision(): void {
    // check if shooter hits the left or right border
    if (
      this.shooter.x - this.view.radius < 0 ||
      this.shooter.x + this.view.radius > this.view.canvas.width
    ) {
      // reverse the direction of the shooter
      this.shooter.dx = -this.shooter.dx;
    }

    // check if shooter hits the bottom border
    if (this.shooter.y + this.view.radius > this.view.canvas.height) {
      // reverse the direction of the shooter
      this.shooter.dy = -this.shooter.dy;
    }

    // check if shooter hits the top border
    if (this.shooter.y - this.view.radius < 0) {
      // reverse the direction of the shooter
      this.shooter.dy = -this.shooter.dy;
    }
  }
}

export default Game;
