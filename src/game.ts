import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";

class Game {
  private view: GameView;
  private isOver: boolean;
  private shooter: Shooter;
  private bubbles: (Bubble | null)[][];
  public moves: number;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.view = new GameView(canvas, ctx, colors);
    this.isOver = false;
    this.shooter = new Shooter(this.getRandColor());
    this.bubbles = [];
    this.moves = 0;
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

          this.handleCollision(bubble, newBubble);

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

  handleCollision(hitBubble: Bubble, newBubble: Bubble): void {
    if (this.isBottomCollision(hitBubble, newBubble)) {
      this.handleBottomCollision(hitBubble, newBubble);
      return;
    }
  }

  getNewBubbleRowCol(
    hitBubble: Bubble,
    newBubble: Bubble
  ): { row: number; col: number } {
    let row = hitBubble.row;
    let col = hitBubble.col;

    if (this.isBottomCollision(hitBubble, newBubble)) {
      row = hitBubble.row + 1;
      col = hitBubble.col;
    } else {
      // check if the bubble was hit on the left side
      if (newBubble.x < hitBubble.x) {
        col = hitBubble.col - 1;
        if (hitBubble.isOffset) {
          row = hitBubble.row + 1;
        }
      } else {
        col = hitBubble.col + 1;
        if (!hitBubble.isOffset) {
          row = hitBubble.row + 1;
        }
      }
    }

    return { row, col };
  }

  isBottomCollision(hitBubble: Bubble, newBubble: Bubble): boolean {
    return (
      newBubble.x >
        hitBubble.x - this.view.radius - this.view.bubbleMargin / 2 &&
      newBubble.x <
        hitBubble.x + this.view.radius + this.view.bubbleMargin / 2 &&
      newBubble.y > hitBubble.y &&
      newBubble.y <
        hitBubble.y + this.view.radius * 2 + this.view.bubbleMargin / 2
    );
  }

  handleBottomCollision(hitBubble: Bubble, newBubble: Bubble): void {
    const isOffsetRow = hitBubble.isOffset;
    const isFirstCol = hitBubble.col === 0;

    const isLastCol = isOffsetRow
      ? hitBubble.col === this.view.maxCols - 1
      : hitBubble.col === this.view.maxCols;

    const row = hitBubble.row + 1;
    let col = hitBubble.col;
    console.log("hitBubble", hitBubble.col);

    // if bubble is hit at the left-bottom corner
    if (newBubble.x < hitBubble.x) {
      //   if (isOffsetRow && !isFirstCol) {
      //     col = hitBubble.col - 1;
      //   }
      // if bubble is hit at the right-bottom corner
    } else {
      //   if (!isOffsetRow && !isLastCol) {
      col = hitBubble.col + 1;
      //   }
    }

    newBubble.col = col;
    newBubble.row = row;
    newBubble.isOffset = !isOffsetRow;

    // insert new bubble into the bubbles array if it exists
    if (this.bubbles[row]) {
      const targetBubble = this.bubbles[row][col];
      //   if (targetBubble !== null) {
      //     this.handleCollision(targetBubble, newBubble);
      //     return;
      //   }
      if (targetBubble !== null) {
        console.log("targetBubble", targetBubble);
        return;
      }
      this.bubbles[row][col] = newBubble;

      // create new row if it doesn't exist
    } else {
      const isNewRowOffset = !isOffsetRow;
      const newRowLength = isNewRowOffset
        ? this.view.maxCols - 1
        : this.view.maxCols;
      const newRow = Array(newRowLength).fill(null);
      newRow[col] = newBubble;
      this.bubbles.push(newRow);
    }
  }
}

export default Game;
