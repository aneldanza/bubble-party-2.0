import Bubble from "./bubble";

class Shooter extends Bubble {
  public dx: number;
  public dy: number;
  public speed: number;

  constructor(x: number, y: number, color: string, speed?: number) {
    super(x, y, color, 0, 0, "shooter");
    this.dx = 0;
    this.dy = 0;
    this.speed = speed || 7;
  }

  move(): void {
    this.x += this.dx;
    this.y += this.dy;
  }

  setDirection(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;
  }
}

export default Shooter;
