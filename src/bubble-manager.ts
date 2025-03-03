import Bubble from "./bubble";
import Shooter from "./shooter";
import CollisionManager from "./collission-manager";
import Game from "./game";
import { OFFSET_RELATIVE_POSITIONS, RELATIVE_POSITIONS } from "./constants";

class BubbleManager {
  public bubbles: Bubble[][];
  private game: Game;
  private shooter: Shooter;
  public collisionManager: CollisionManager;

  constructor(
    game: Game,
    shooter: Shooter
    // collisionManager: CollisionManager
  ) {
    this.game = game;
    this.shooter = shooter;
    this.bubbles = [];
    this.collisionManager = new CollisionManager(
      this.game.view,
      this.bubbles,
      this.shooter
    );

    this.subscribeObserverEvents();
  }

  subscribeObserverEvents(): void {
    this.collisionManager.newBubbleFormed.subscribe(() => {
      if (this.collisionManager.newBubbleFormed.value) {
        this.handleNewBubble();
      }
    });
  }

  resetBubbles(): void {
    this.bubbles.forEach((row) => row.forEach((bubble) => bubble.nullify()));
  }

  fillBubbles(): void {
    const interval = setInterval(() => {
      if (this.game.view.isOver.value) {
        clearInterval(interval);
        return;
      }

      this.addRow();
    }, 10000);
  }

  addRow(): void {
    const row = [];

    const isOffset = this.bubbles.length > 0 && !this.bubbles[0][0]!.isOffset;

    const colNumber = isOffset
      ? this.game.view.maxColsWithOffset
      : this.game.view.maxCols;

    for (let col = 0; col < colNumber; col++) {
      const color = this.game.view.getRandColor();
      const bubble = new Bubble(
        "active",
        col,
        this.bubbles.length,
        color,
        this.shooter
      );
      bubble.isOffset = isOffset;

      row.push(bubble);
    }
    this.bubbles.unshift(row);
  }

  handleNewBubble(): void {
    const newBubble = this.collisionManager.newBubble;

    if (newBubble) {
      const cluster = this.findBubbleCluster(newBubble);

      if (cluster.length > 2) {
        const clusterLength = cluster.length;
        this.dropBubbles(cluster);

        const floatingBubbles = this.findFloatingBubbles();

        const bubblesToDropLength = clusterLength + floatingBubbles.length;

        this.dropBubbles(floatingBubbles);

        this.game.score.value += bubblesToDropLength;

        this.game.soundManager.bubbleBurst(bubblesToDropLength);
      }
    } else {
      throw new Error("new bubble was not created on collision");
    }

    this.game.resetShooter();

    // reset new bubble flag
    this.collisionManager.newBubbleFormed.value = false;
  }

  findHitBubble(): Bubble | null {
    const shooterX = this.shooter.x;
    const shooterY = this.shooter.y;

    for (const row of this.bubbles) {
      for (const bubble of row) {
        if (bubble.status === "inactive") {
          continue;
        }

        if (bubble.isHit(shooterX, shooterY, this.game.view.radius)) {
          this.shooter.stop();
          return bubble;
        }
      }
    }

    return null;
  }

  detectBubbleCollision(): void {
    const hitBubble = this.findHitBubble();

    if (hitBubble) {
      this.game.soundManager.play("specEffects", "hit");

      const hitSide = this.collisionManager.determineHitSide(hitBubble);

      this.collisionManager.handleBubbleCollision(hitBubble, hitSide);

      this.game.resetShooter();
    }
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
          !this.bubbles[row][col] ||
          this.bubbles[row][col].status === "inactive"
        ) {
          return null;
        }

        return this.bubbles[row][col] as Bubble;
      })
      .filter((bubble) => bubble !== null);
  }

  dropBubbles(cluster: Bubble[]): void {
    cluster.forEach((bubble) => {
      this.bubbles[bubble.row][bubble.col].nullify();
    });
  }

  findFloatingBubbles(): Bubble[] {
    const visited: boolean[][] = this.bubbles.map((row) =>
      row.map(() => false)
    );
    const queue: Bubble[] = [];
    const floatingBubbles: Bubble[] = [];

    // initialize queue with all of the bubbles in the top row
    for (let col = 0; col < this.bubbles[0].length; col++) {
      const bubble = this.bubbles[0][col];
      if (bubble.status === "active") {
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
        if (bubble.status === "active" && !visited[row][col]) {
          floatingBubbles.push(bubble);
        }
      }
    }

    return floatingBubbles;
  }
}

export default BubbleManager;
