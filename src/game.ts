import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";
import CollisionManager from "./collission-manager";

class Game {
  private view: GameView;
  private collisionManager: CollisionManager;
  private isOver: boolean;
  private shooter: Shooter;
  private bubbles: (Bubble | null)[][];
  public moves: number;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.bubbles = [];
    this.moves = 0;
    this.isOver = false;

    this.view = new GameView(canvas, ctx, colors);
    this.shooter = new Shooter(this.getRandColor());
    this.collisionManager = new CollisionManager(this.view, this.bubbles);

    this.bindEvents();
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
    this.addRow();
    // this.fillBubbles();
  }

  animate(): void {
    if (!this.isOver) {
      this.shooter.move();
      this.handleBorderCollision();
      this.view.draw(this.bubbles, this.shooter);
      this.detectCollision();
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  fillBubbles(): void {
    const interval = setInterval(() => {
      if (this.bubbles.length === this.view.maxRows) {
        clearInterval(interval);
        this.isOver = true;
        return;
      }
      this.addRow();
    }, 2000);
  }

  addRow(): void {
    const row = [];
    const isOffset = this.bubbles.length === 0 || !this.bubbles[0][0]!.isOffset;

    console.log("isOffset", isOffset);

    const colNumber = isOffset ? this.view.maxCols - 1 : this.view.maxCols;

    for (let col = 0; col < colNumber; col++) {
      const color = this.getRandColor();
      const bubble = new Bubble(color, col, this.bubbles.length);
      bubble.isOffset = isOffset;

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

  bindEvents(): void {
    document.addEventListener("click", () => this.handleMouseClick());
  }

  handleMouseClick(): void {
    // calculate the direction of the shooter
    const dx = this.view.mousePosX - this.shooter.x;
    const dy = this.view.mousePosY - this.shooter.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    this.shooter.setDirection(
      (dx / length) * this.shooter.speed,
      (dy / length) * this.shooter.speed
    );

    // increase move count
    this.shooter.moves++;

    // add a new row of bubbles after 5 moves
    if (this.shooter.moves > 2) {
      this.shooter.moves = 0;
      if (this.bubbles.length < this.view.maxRows) {
        setTimeout(() => {
          this.addRow();
        }, 1000);
      } else {
        this.isOver = true;
        console.log("Game Over");
      }
    }
  }

  detectCollision(): void {
    this.bubbles.forEach((row) => {
      row.forEach((bubble) => {
        if (!bubble) {
          return;
        }
        if (bubble.isHit(this.shooter, this.view.radius)) {
          console.log("hit");
          const newBubble = new Bubble(this.shooter.color, 0, 0);
          newBubble.setPos(this.shooter.x, this.shooter.y);

          this.collisionManager.handleCollision(bubble, newBubble);

          // check if new bubble is too low
          if (newBubble.y + this.view.radius > this.view.canvas.height) {
            this.isOver = true;
            console.log("Game Over");
            return;
          }

          // prepare shooter for next move
          this.shooter.reset(
            this.view.canvas.width / 2,
            this.view.canvas.height - this.view.radius,
            this.getRandColor()
          );

          // return early if collision is detected
          return;
        }
      });
    });
  }
}

export default Game;
