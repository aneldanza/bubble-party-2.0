import Shooter from "./shooter";

class Bubble {
  public x!: number;
  public y!: number;
  public color: string;
  public col: number;
  public row: number;
  public isOffset: boolean;

  constructor(color: string, col: number, row: number) {
    this.color = color;
    this.col = col;
    this.row = row;
    this.isOffset = false;
  }

  setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  isHit(shooter: Shooter, radius: number): boolean {
    const dx = this.x - shooter.x;
    const dy = this.y - shooter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < radius * 1.8;
  }
}

export default Bubble;
