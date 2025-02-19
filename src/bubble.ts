import Shooter from "./shooter";

class Bubble {
  public x!: number;
  public y!: number;
  public color: string;
  public col: number;
  public row: number;
  public radius: number;
  public isOffset: boolean;

  constructor(color: string, col: number, row: number) {
    this.color = color;
    this.col = col;
    this.row = row;
    this.radius = 20;
    this.isOffset = false;
  }

  setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  isHit(shooter: Shooter): boolean {
    const dx = this.x - shooter.x;
    const dy = this.y - shooter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < this.radius + shooter.radius;
  }
}

export default Bubble;
