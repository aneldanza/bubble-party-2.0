import Shooter from "./shooter";

type BubbleStatus = "active" | "inactive";

class Bubble {
  public x!: number;
  public y!: number;
  public color: string;
  public col: number;
  public row: number;
  public isOffset: boolean;
  public status: BubbleStatus = "inactive";

  constructor(
    status: BubbleStatus,
    col: number,
    row: number,
    color: string = "transparent"
  ) {
    this.status = status;
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

  nullify(): void {
    this.color = "transparent";
    this.status = "inactive";
  }

  activate(color: string): void {
    this.color = color;
    this.status = "active";
  }
}

export default Bubble;
