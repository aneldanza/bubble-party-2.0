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
  public shooter?: Shooter;

  constructor(
    status: BubbleStatus,
    col: number,
    row: number,
    color: string = "transparent",
    shooter?: Shooter
  ) {
    this.status = status;
    this.color = color;
    this.col = col;
    this.row = row;
    this.isOffset = false;
    this.shooter = shooter;
  }

  setPos(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  isHit(shooterX: number, shooterY: number, radius: number): boolean {
    const dx = this.x - shooterX;
    const dy = this.y - shooterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= radius * 2;
  }

  checkIfHit(
    shooterX: number,
    shooterY: number,
    radius: number,
    bubbleMargin: number
  ): "" | "bottom-left" | "bottom-right" | "right" | "left" {
    // const dx = this.x - shooterX;
    // const dy = this.y - shooterY;
    // const distance = Math.sqrt(dx * dx + dy * dy);

    // if (distance < radius * 1.8) {
    return this.determineHitSide(shooterX, shooterY, radius, bubbleMargin);
    // }

    // return "";
  }

  determineHitSide(
    shooterX: number,
    shooterY: number,
    radius: number,
    bubbleMargin: number
  ): "" | "bottom-left" | "bottom-right" | "right" | "left" {
    return (
      this.isRightSideCollision(shooterX, shooterY, radius, bubbleMargin) ||
      this.isLeftSideCollision(shooterX, shooterY, radius, bubbleMargin) ||
      this.isBottomCollision(shooterX, shooterY, radius, bubbleMargin)
    );
  }

  isBottomCollision(
    shooterX: number,
    shooterY: number,
    radius: number,
    bubbleMargin: number
  ): "bottom-left" | "bottom-right" | "" {
    if (
      this.status === "active" &&
      shooterX > this.x - radius * 2 &&
      shooterX < this.x + radius * 2 &&
      shooterY > this.y &&
      shooterY <= this.y + (bubbleMargin / 2) * radius + 2
    ) {
      return shooterX < this.x ? "bottom-left" : "bottom-right";
    }
    return "";
  }

  isRightSideCollision(
    shooterX: number,
    shooterY: number,
    radius: number,
    bubbleMargin: number
  ): "right" | "" {
    if (
      this.status === "active" &&
      shooterY > this.y - radius &&
      shooterY < this.y + radius &&
      shooterX > this.x &&
      shooterX <= this.x + 2 * radius - bubbleMargin / 2
    ) {
      return "right";
    }
    return "";
  }

  isLeftSideCollision(
    shooterX: number,
    shooterY: number,
    radius: number,
    bubbleMargin: number
  ): "left" | "" {
    if (
      this.status === "active" &&
      shooterY > this.y - radius &&
      shooterY < this.y + radius &&
      shooterX < this.x &&
      shooterX >= this.x - 2 * radius + bubbleMargin / 2
    ) {
      return "left";
    }
    return "";
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
