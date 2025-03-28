import Shooter from "./shooter";
import Bubble from "./bubble";
import Observer from "./observer";

interface Controls {
  canvas: HTMLCanvasElement;
  drawBubble(bubble: Bubble): void;
}

class GameView implements Controls {
  public colors: string[];
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public radius!: number;
  private shooter!: Shooter;
  public mousePosX: number;
  public mousePosY: number;
  public maxRows: number;
  public maxCols: number;
  public maxColsWithOffset: number;
  public bubbleMargin: number;
  public isOver: Observer<boolean>;
  private nextBubble!: Bubble;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.colors = colors;
    this.canvas = canvas;
    this.ctx = ctx;
    this.maxCols = 0;
    this.maxColsWithOffset = 0;
    this.maxRows = 0;
    this.bubbleMargin = 3;
    this.isOver = new Observer<boolean>(false);

    this.nextBubble = new Bubble("active", 0, 0, this.getRandColor());

    this.setBubbleRadius();

    // this.handleMouseMoveRef = this.handleMouseMove.bind(this);
    // this.handleTouchMoveRef = this.handleTouchMove.bind(this);

    this.subscribeWindowEvents();
  }

  init(shooter: Shooter): void {
    this.shooter = shooter;
    this.resizeCanvas();
    this.setInitialPositions();

    this.calculateMaxRowsAndCols();
  }

  setInitialPositions(): void {
    this.shooter.setPos(
      this.canvas.width / 2,
      this.canvas.height - this.radius - this.bubbleMargin
    );

    this.nextBubble.setPos(
      this.canvas.width / 5,
      this.canvas.height - this.radius - this.bubbleMargin
    );
  }

  calculateMaxRowsAndCols(): void {
    const bubbleDiameter = this.radius * 2;

    this.maxCols = Math.floor(
      this.canvas.width / (bubbleDiameter + this.bubbleMargin)
    );
    this.maxRows = Math.floor(
      this.canvas.height / (bubbleDiameter + this.bubbleMargin)
    );

    // Calculatee maxCols for offset rows
    this.maxColsWithOffset = this.maxCols - 1;
  }

  resizeCanvas(): void {
    this.setBubbleRadius();
    this.calculateMaxRowsAndCols();
    this.setInitialPositions();
  }

  subscribeWindowEvents(): void {
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    window.addEventListener("orientationchange", this.resizeCanvas.bind(this));
  }

  resetShooter(): void {
    this.shooter.reset(
      this.canvas.width / 2,
      this.canvas.height - this.radius - this.bubbleMargin,
      this.nextBubble.color
    );

    this.nextBubble.color = this.getRandColor();
  }

  setBubbleRadius(): void {
    const navbar = document.getElementById("navbar")!;
    const gameControls = document.getElementById("game-controls")!;

    // get bounding client rect for navbar and canvas
    const navbarRect = navbar.getBoundingClientRect();
    const gameControlsRect = gameControls.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    // set canvas with and height dynamically
    this.canvas.width = canvasRect.width;
    this.canvas.height = Math.min(
      canvasRect.height,
      bodyRect.height - (navbarRect.height + gameControlsRect.height)
    );

    const minRadius = Math.min(this.canvas.width, this.canvas.height) * 0.03; // 3% of the smaller dimension

    let r = minRadius;
    let bestRadius = r;
    let bestBubbleMargin = r * 0.1;
    const numCols = Math.floor(this.canvas.width / (2 * r + bestBubbleMargin));

    while (true) {
      const bubbleMargin = r * 0.1;
      const totalBubbleWidth = numCols * (2 * r + bubbleMargin);

      if (totalBubbleWidth > this.canvas.width) {
        break;
      }

      bestRadius = r;
      bestBubbleMargin = bubbleMargin;

      r += 0.1;
    }

    this.radius = bestRadius;
    this.bubbleMargin = bestBubbleMargin;
  }

  draw(bubbles: Bubble[][], shooter: Shooter): void {
    this.shooter = shooter;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw aim line only if shooter is not moving
    if (this.shooter.dx === 0 && this.shooter.dy === 0) {
      this.drawAimLine();
    }

    this.drawBubble(this.shooter);
    this.drawNextBubblePreviewSection();
    this.drawBubbles(bubbles);
  }

  hexToRgb(hex: string, alpha: number): string {
    let r = 0,
      g = 0,
      b = 0;

    // 3 digits
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      // 6 digits
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  addGradient(bubble: Bubble, bubbleRadius: number): void {
    const gradient = this.ctx.createRadialGradient(
      bubble.x - bubbleRadius / 4,
      bubble.y - bubbleRadius / 4,
      bubbleRadius / 80,
      bubble.x,
      bubble.y,
      bubbleRadius
    );

    if (bubble.color === "#FFD700") {
      gradient.addColorStop(0, "rgba(255, 255, 204, 1)");
    } else {
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    }
    gradient.addColorStop(1, bubble.color);
    this.ctx.fillStyle = gradient;
  }

  addShadow(): void {
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;
  }

  drawBubble(bubble: Bubble): void {
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = bubble.color;

    if (bubble.status === "active") {
      this.addGradient(bubble, this.radius);

      this.addShadow();
    }
    this.ctx.fill();
  }

  drawNextBubblePreviewSection(): void {
    this.drawBubble(this.nextBubble);
  }

  drawAimLine(): void {
    const dx = this.mousePosX - this.shooter.x;
    const dy = this.mousePosY - this.shooter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const step = this.radius * 2; // Distance between each small bubble
    const steps = Math.floor(distance / step);

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = this.shooter.x + t * dx;
      const y = this.shooter.y + t * dy;

      this.ctx.beginPath();
      this.ctx.arc(x, y, this.radius / 8, 0, Math.PI * 2); // Small bubble radius
      this.ctx.fillStyle = this.shooter.color;

      this.ctx.fill();
    }
  }

  drawBubbles(bubbles: Bubble[][]): void {
    for (let row = bubbles.length - 1; row >= 0; row--) {
      for (let col = 0; col < bubbles[row].length; col++) {
        const bubble = bubbles[row][col];
        if (!bubble) {
          continue;
        }
        let x =
          col * (this.radius * 2 + this.bubbleMargin) +
          this.radius +
          this.bubbleMargin;

        if (bubble.isOffset) {
          x += this.radius;
        }

        const y = this.radius + row * (this.radius * 2 + this.bubbleMargin);

        bubble.setPos(x, y);
        bubble.row = row;
        bubble.col = col;

        this.drawBubble(bubble);

        // check if bubble is touching the bottom border
        if (
          bubble.status === "active" &&
          bubble.y + this.radius >= this.canvas.height - this.radius * 2
        ) {
          this.isOver.value = true;
          return;
        }
      }
    }
  }

  getRandColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}

export default GameView;
