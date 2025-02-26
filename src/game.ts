import GameView from "./game-view";
import Shooter from "./shooter";
import Bubble from "./bubble";
import Observer from "./observer";
import CollisionManager from "./collission-manager";
import SoundManager from "./sound-manager";
import { OFFSET_RELATIVE_POSITIONS, RELATIVE_POSITIONS } from "./constants";

class Game {
  public view: GameView;
  private collisionManager: CollisionManager;

  private shooter: Shooter;
  private bubbles: Bubble[][];
  public moves: number;
  public score: Observer<number>;
  private canvas: HTMLCanvasElement;
  private soundManager: SoundManager;
  public isPaused: Observer<boolean>;
  private handleMouseClickRef: (e: MouseEvent) => void = () => {};

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[],
    soundManager: SoundManager
  ) {
    this.soundManager = soundManager;
    this.canvas = canvas;
    this.bubbles = [];
    this.moves = 0;

    this.score = new Observer<number>(0);
    this.isPaused = new Observer<boolean>(false);

    this.view = new GameView(canvas, ctx, colors);
    this.shooter = new Shooter(this.view.getRandColor(), 15);
    this.collisionManager = new CollisionManager(
      this.view,
      this.bubbles,
      this.shooter
    );

    this.handleMouseClickRef = this.handleMouseClick.bind(this);
    this.subscribeObserverEvents();
  }

  reset(): void {
    this.resetShooter();
    this.bubbles.forEach((row) => row.forEach((bubble) => bubble.nullify()));
    this.score.value = 0;
    this.moves = 0;
    this.view.isOver.value = false;
    this.isPaused.value = false;
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
    this.addRow();
    this.subscribeUserEvents();
    this.soundManager.playTheme();
  }

  gameOver(): void {
    console.log("GAME OVER");
    this.soundManager.gameOver();

    this.unSubscribeUserEvents();

    this.shooter.stop();
  }

  handlePause(): void {
    if (this.isPaused.value) {
      this.unSubscribeUserEvents();
    } else {
      this.subscribeUserEvents();
    }
    this.soundManager.pauseGameSounds(this.isPaused.value);
  }

  animate(): void {
    if (!this.view.isOver.value) {
      this.shooter.move();

      this.collisionManager.handleBorderCollision();
      this.view.draw(this.bubbles, this.shooter);
      if (!(this.shooter.dx === 0 && this.shooter.dy === 0)) {
        this.detectBubbleCollision();
      }

      requestAnimationFrame(this.animate.bind(this));
    }
  }

  fillBubbles(): void {
    const interval = setInterval(() => {
      if (this.view.isOver.value) {
        clearInterval(interval);
        return;
      }

      this.addRow();
    }, 2000);
  }

  addRow(): void {
    const row = [];
    const isOffset = this.bubbles.length === 0 || !this.bubbles[0][0]!.isOffset;

    const colNumber = isOffset ? this.view.maxCols - 1 : this.view.maxCols;

    for (let col = 0; col < colNumber; col++) {
      const color = this.view.getRandColor();
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

        console.log(
          "cluster",
          cluster.map((b) => b.row + "," + b.col)
        );

        console.log(
          "floatingBubbles",
          floatingBubbles.map((b) => b.row + "," + b.col)
        );

        const bubblesToDropLength = clusterLength + floatingBubbles.length;

        this.dropBubbles(floatingBubbles);

        console.log("bubblesToDropLength", bubblesToDropLength);
        this.score.value += bubblesToDropLength;

        this.soundManager.bubbleBurst(bubblesToDropLength);
      }
    } else {
      throw new Error("new bubble was not created on collision");
    }

    this.resetShooter();

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

        if (bubble.isHit(shooterX, shooterY, this.view.radius)) {
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
      this.soundManager.play("specEffects", "hit");

      const hitSide = this.collisionManager.determineHitSide(hitBubble);

      console.log("hitSide", hitSide);
      console.log("hitBubble", hitBubble.row, hitBubble.col);

      this.collisionManager.handleBubbleCollision(hitBubble, hitSide);

      this.resetShooter();
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

  resetShooter(): void {
    this.shooter.reset(
      this.view.canvas.width / 2,
      this.view.canvas.height - this.view.radius,
      this.view.getRandColor()
    );
  }

  subscribeObserverEvents(): void {
    this.collisionManager.newBubbleFormed.subscribe(() => {
      if (this.collisionManager.newBubbleFormed.value) {
        this.handleNewBubble();
      }
    });

    this.view.isOver.subscribe(() => {
      if (this.view.isOver.value) {
        this.gameOver();
      }
    });

    this.isPaused.subscribe(() => {
      this.handlePause();
    });
  }

  subscribeUserEvents(): void {
    this.canvas.addEventListener("mousemove", this.view.handleMouseMoveRef);
    this.canvas.addEventListener("touchmove", this.view.handleTouchMoveRef);
    this.canvas.addEventListener("click", this.handleMouseClickRef);
  }

  unSubscribeUserEvents(): void {
    this.canvas.removeEventListener("mousemove", this.view.handleMouseMoveRef);
    this.canvas.removeEventListener("touchmove", this.view.handleTouchMoveRef);
    this.canvas.removeEventListener("click", this.handleMouseClickRef);
  }

  handleMouseClick(): void {
    console.clear();
    console.log("CLICKED!");
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
    if (this.shooter.moves > 3) {
      this.shooter.moves = 0;
      this.addRow();
    }
  }
}

export default Game;
