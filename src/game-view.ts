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
  public bubbleMargin: number;
  public isOver: Observer<boolean>;
  public handleMouseMoveRef: (e: MouseEvent) => void;
  public handleTouchMoveRef: (e: TouchEvent) => void;

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
    this.maxRows = 0;
    this.bubbleMargin = 3;
    this.isOver = new Observer<boolean>(false);

    this.setBubbleRadius();

    this.handleMouseMoveRef = this.handleMouseMove.bind(this);
    this.handleTouchMoveRef = this.handleTouchMove.bind(this);

    this.subscribeWindowEvents();
  }

  init(shooter: Shooter): void {
    this.shooter = shooter;
    this.shooter.setPos(
      this.canvas.width / 2,
      this.canvas.height - this.radius
    );
    this.calculateMaxRowsAndCols();
  }

  calculateMaxRowsAndCols(): void {
    const bubbleDiameter = this.radius * 2;

    this.maxCols = Math.floor(
      this.canvas.width / (bubbleDiameter + this.bubbleMargin)
    );
    this.maxRows = Math.floor(
      this.canvas.height / (bubbleDiameter + this.bubbleMargin)
    );

    console.log("max rows " + this.maxRows);
  }

  resizeCanvas(): void {
    this.setBubbleRadius();
    this.calculateMaxRowsAndCols();
  }

  subscribeWindowEvents(): void {
    window.addEventListener("resize", this.resizeCanvas.bind(this));
  }

  setBubbleRadius(): void {
    const navbar = document.getElementById("navbar")!;

    // get bounding client rect for navbar and canvas
    const navbarRect = navbar.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    // set canvas with and height dynamically
    this.canvas.width = canvasRect.width;
    this.canvas.height = Math.min(
      canvasRect.height,
      window.innerHeight - navbarRect.height * 2
    );

    // calculate bubble radius based on canvas height
    const bubbleRadius = this.canvas.height * 0.03;

    this.radius = bubbleRadius;
    this.bubbleMargin = bubbleRadius * 0.15;
  }

  draw(bubbles: Bubble[][], shooter: Shooter): void {
    this.shooter = shooter;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw aim line only if shooter is not moving
    if (this.shooter.dx === 0 && this.shooter.dy === 0) {
      this.drawAimLine();
    }

    this.drawBubble(this.shooter);
    this.drawBubbles(bubbles);
  }

  addGradient(bubble: Bubble, bubbleRadius: number): void {
    const gradient = this.ctx.createRadialGradient(
      bubble.x - bubbleRadius / 4,
      bubble.y - bubbleRadius / 4,
      bubbleRadius / 10,
      bubble.x,
      bubble.y,
      bubbleRadius
    );
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, bubble.color);
    this.ctx.fillStyle = gradient;
  }

  drawBubble(bubble: Bubble): void {
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = bubble.color;

    if (bubble.status === "active") {
      this.addGradient(bubble, this.radius);
    }
    this.ctx.fill();
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
          bubble.y + this.radius >= this.canvas.height
        ) {
          console.log("TRIGGER GAME OVER FROM VIEW");
          this.isOver.value = true;
          return;
        }
      }
    }
  }

  getRandColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosX = e.clientX - rect.left;
    this.mousePosY = e.clientY - rect.top;
  }

  handleTouchMove(e: TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosX = e.touches[0].clientX - rect.left;
    this.mousePosY = e.touches[0].clientY - rect.top;
  }
}

export default GameView;
