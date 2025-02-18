class Bubble {
  public x: number;
  public y: number;
  public color: string;
  public col: number;
  public row: number;
  public status: string;
  public radius: number;

  constructor(
    x: number,
    y: number,
    color: string,
    col: number,
    row: number,
    status: string
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.col = col;
    this.row = row;
    this.status = status;
    this.radius = 20;
  }

  isAvailable() {
    if (this.status === "placeholder" && this.isValid()) {
      return true;
    }
    return false;
  }

  isValid() {
    if (this.col < 14 && this.col >= 0 && this.row < 12 && this.row >= 0) {
      return true;
    }
    return false;
  }
}

export default Bubble;
