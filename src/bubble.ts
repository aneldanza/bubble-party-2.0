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
}

export default Bubble;
