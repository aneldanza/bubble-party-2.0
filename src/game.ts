import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";
import CollisionManager from "./collission-manager";
import { OFFSET_RELATIVE_POSITIONS, RELATIVE_POSITIONS } from "./constants";

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
    this.shooter = new Shooter(this.getRandColor(), 10);
    this.collisionManager = new CollisionManager(
      this.view,
      this.bubbles,
      this.shooter
    );

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
      this.collisionManager.handleBorderCollision();
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

          this.collisionManager.handleCollision(bubble);
          const newBubble = this.collisionManager.newBubble;

          if (newBubble) {
            const cluster = this.findBubbleCluster(newBubble);

            if (cluster.length > 2) {
              const clusterLength = cluster.length;
              this.dropBubbles(cluster);
              const highestRowinCluster = Math.min(
                ...cluster.map((b) => b.row)
              );
              console.log("highestRowinCluster", highestRowinCluster);

              const floatingBubbles =
                this.findFloatingBubbles(highestRowinCluster);
              console.log(
                "cluster",
                cluster.map((b) => b.row + "," + b.col)
              );

              console.log(
                "floatingBubbles",
                floatingBubbles.map((b) => b.row + "," + b.col)
              );

              const bubblesToDropLength =
                clusterLength + floatingBubbles.length;

              this.dropBubbles(floatingBubbles);

              console.log("bubblesToDropLength", bubblesToDropLength);
            }

            // check if new bubble is too low
            if (newBubble.y + this.view.radius > this.view.canvas.height) {
              this.isOver = true;
              console.log("Game Over");
              return;
            }
          } else {
            throw new Error("new bubble was not created on collision");
          }

          // prepare shooter for next move
          this.resetShooter();

          // return early if collision is detected
          return;
        }
      });
    });
  }

  findBubbleCluster(bubble: Bubble): Bubble[] {
    const visited = new Set<string>();
    const queue = [bubble];
    const cluster = [];

    while (queue.length) {
      const currentBubble = queue.shift() as Bubble;
      const key = `${currentBubble.row}-${currentBubble.col}`;

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      if (currentBubble.color === bubble.color) {
        cluster.push(currentBubble);
        const neighbors = this.findNeighbors(currentBubble);
        queue.push(...neighbors);
      }
    }

    return cluster;
  }

  findNeighbors(bubble: Bubble): Bubble[] {
    const relativePositions = bubble.isOffset
      ? OFFSET_RELATIVE_POSITIONS
      : RELATIVE_POSITIONS;

    return relativePositions
      .map(({ ROW, COL }) => {
        const row = bubble.row + ROW;
        const col = bubble.col + COL;

        if (
          row < 0 ||
          col < 0 ||
          !this.bubbles[row] ||
          !this.bubbles[row][col]
        ) {
          return null;
        }

        return this.bubbles[row][col] as Bubble;
      })
      .filter((bubble) => bubble !== null);
  }

  dropBubbles(cluster: Bubble[]): void {
    cluster.forEach((bubble) => {
      this.bubbles[bubble.row][bubble.col] = null;
    });
  }

  findFloatingBubbles(startRow: number): Bubble[] {
    const visited: boolean[][] = this.bubbles.map((row) =>
      row.map(() => false)
    );
    const queue: Bubble[] = [];
    const floatingBubbles: Bubble[] = [];

    // initialize queue with all of the bubbles in the top row
    for (let col = 0; col < this.view.maxCols; col++) {
      const bubble = this.bubbles[startRow][col];
      if (bubble) {
        queue.push(bubble);
        visited[bubble.row][bubble.col] = true;
      }
    }

    // BFS for all connected bubbles to the top row
    while (queue.length) {
      const bubble = queue.shift() as Bubble;

      const neighbors = this.findNeighbors(bubble);
      neighbors.forEach((neighbor) => {
        if (neighbor && !visited[neighbor.row][neighbor.col]) {
          visited[neighbor.row][neighbor.col] = true;
          queue.push(neighbor);
        }
      });
    }

    // find all floating bubbles, excluding bubbles in the row with index 0
    for (let row = 1; row < this.bubbles.length; row++) {
      for (let col = 0; col < this.bubbles[row].length; col++) {
        const bubble = this.bubbles[row][col];
        if (bubble && !visited[row][col]) {
          floatingBubbles.push(bubble);
        }
      }
    }

    return floatingBubbles;
  }

  hasNeighbors(bubble: Bubble): boolean {
    const neighbors = this.findNeighbors(bubble);
    return neighbors.length > 0;
  }

  resetShooter(): void {
    this.shooter.reset(
      this.view.canvas.width / 2,
      this.view.canvas.height - this.view.radius,
      this.getRandColor()
    );
  }
}

export default Game;
