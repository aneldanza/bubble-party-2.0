import Shooter from "./shooter";
import Bubble from "./bubble";

interface Controls {
  canvas: HTMLCanvasElement;
  drawBubble(bubble: Bubble): void;
}

class GameView implements Controls {
  public colors: string[];
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public radius!: number;
  private shooter!: Shooter;
  public mousePosX: number;
  public mousePosY: number;
  public maxRows: number;
  public maxCols: number;
  public bubbleMargin: number;

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

    this.setBubbleRadius();

    this.bindEvents();
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

  bindEvents(): void {
    window.addEventListener("resize", this.resizeCanvas.bind(this));
    document.addEventListener("mousemove", (e) => this.handleMouseMove(e));
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
    this.drawBubble(this.shooter);
    this.drawBubbles(bubbles);

    // Draw aim line only if shooter is not moving
    if (this.shooter.dx === 0 && this.shooter.dy === 0) {
      this.drawAimLine();
    }
  }

  drawBubble(bubble: Bubble): void {
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = bubble.color;
    this.ctx.fill();
    // draw number of row inside the bubble

    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    // make the text color black
    this.ctx.fillStyle = "black";
    this.ctx.fillText(`${bubble.row}`, bubble.x, bubble.y, this.radius * 2);

    // draw border
    if (bubble.status === "active") {
      this.ctx.strokeStyle = bubble.color;
    } else {
      this.ctx.strokeStyle = "black";
    }
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawAimLine(): void {
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 15]);
    this.ctx.moveTo(this.shooter.x, this.shooter.y);
    this.ctx.lineTo(this.mousePosX, this.mousePosY);
    this.ctx.strokeStyle = this.shooter.color;
    this.ctx.stroke();
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
      }
    }
  }

  handleMouseMove(e: MouseEvent): void {
    this.mousePosX = e.x - this.canvas.offsetLeft;
    this.mousePosY = e.y - this.canvas.offsetTop;
  }
}

export default GameView;
