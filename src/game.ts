import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";

class Game {
  private view: GameView;
  private isOver: boolean;
  private shooter: Shooter;
  private bubbles: Bubble[][];

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.view = new GameView(canvas, ctx, colors);
    this.isOver = false;
    this.shooter = new Shooter(
      this.view.canvas.width / 2,
      this.view.canvas.height - this.view.radius,
      this.getRandColor()
    );
    this.bubbles = [];
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
    this.fillBubbles();
  }

  animate(): void {
    if (!this.isOver) {
      this.shooter.move();
      this.handleBorderCollision();
      this.view.draw(this.bubbles, this.shooter);
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  fillBubbles(): void {
    this.addRow();
    const interval = setInterval(() => {
      if (this.bubbles.length === this.view.maxRows) {
        clearInterval(interval);
        this.isOver = true;
        return;
      }
      this.addRow();
    }, 20000);
  }

  addRow(): void {
    const row = [];
    for (let col = 0; col < this.view.maxCols; col++) {
      const x = col * this.view.radius * 2 + this.view.radius;
      const y = this.view.radius;
      const color = this.getRandColor();
      const bubble = new Bubble(
        x,
        y,
        color,
        col,
        this.bubbles.length,
        "visible"
      );

      row.push(bubble);
    }
    this.bubbles.unshift(row);
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

  getRandColor(): string {
    return this.view.colors[
      Math.floor(Math.random() * this.view.colors.length)
    ];
  }
}

export default Game;
