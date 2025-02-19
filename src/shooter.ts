import Bubble from "./bubble";

class Shooter extends Bubble {
  public dx: number;
  public dy: number;
  public speed: number;
  public moves: number;

  constructor(color: string, speed?: number) {
    super(color, 0, 0);
    this.dx = 0;
    this.dy = 0;
    this.speed = speed || 7;
    this.moves = 0;
  }

  move(): void {
    this.x += this.dx;
    this.y += this.dy;
  }

  setDirection(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }

  reset(x: number, y: number, color: string): void {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

export default Shooter;
