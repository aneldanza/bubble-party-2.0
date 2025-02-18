import GameView from "./game-view";
class Game {
  private view: GameView;
  private isOver: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[]
  ) {
    this.view = new GameView(canvas, ctx, colors);
    this.isOver = false;
  }

  animate(): void {
    if (!this.isOver) {
      this.view.draw();
      requestAnimationFrame(this.animate.bind(this));
    }
  }
}

export default Game;
