import Shooter from "./shooter";

interface Controls {
  canvas: HTMLCanvasElement;
  draw(): void;
  drawBubble(x: number, y: number): void;
}

class GameView implements Controls {
  public colors: string[];
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public radius!: number;
  private shooter!: Shooter;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.colors = colors;
    this.canvas = canvas;
    this.ctx = ctx;
    this.setBubbleRadius();

    window.addEventListener("resize", this.resizeCanvas.bind(this));
  }

  init(shooter: Shooter): void {
    this.shooter = shooter;
  }

  resizeCanvas(): void {
    this.setBubbleRadius();
    this.draw();
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
  }

  draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBubble(this.shooter.x, this.shooter.y);
  }

  drawBubble(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.colors[0];
    this.ctx.fill();
    this.ctx.closePath();
  }
}

export default GameView;
