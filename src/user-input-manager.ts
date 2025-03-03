import Game from "./game";

class UserInputManager {
  private canvas: HTMLCanvasElement;
  private game: Game;
  private isTouchEvent: boolean = false;
  private handleMouseClickRef: (e: MouseEvent) => void = () => {};
  private handleTouchEndRef: (e: TouchEvent) => void = () => {};

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.canvas = canvas;
    this.game = game;

    this.handleMouseClickRef = this.handleMouseClick.bind(this);
    this.handleTouchEndRef = this.handleTouchEnd.bind(this);
  }

  subscribeUserEvents(): void {
    this.canvas.addEventListener(
      "mousemove",
      this.game.view.handleMouseMoveRef
    );
    this.canvas.addEventListener(
      "touchmove",
      this.game.view.handleTouchMoveRef
    );
    this.canvas.addEventListener("click", this.handleMouseClickRef);
    this.canvas.addEventListener("touchend", this.handleTouchEndRef);
  }

  unSubscribeUserEvents(): void {
    this.canvas.removeEventListener(
      "mousemove",
      this.game.view.handleMouseMoveRef
    );
    this.canvas.removeEventListener(
      "touchmove",
      this.game.view.handleTouchMoveRef
    );
    this.canvas.removeEventListener("click", this.handleMouseClickRef);
    this.canvas.removeEventListener("touchend", this.handleTouchEndRef);
  }

  handleMouseClick(): void {
    if (!this.isTouchEvent) {
      console.log("mouse click");
      this.game.shootBubble();
    }
    this.isTouchEvent = false;
  }

  handleTouchEnd(e: TouchEvent): void {
    this.isTouchEvent = true;
    console.log("touch end");
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.changedTouches[0]; // Use changedTouches instead of touches
    this.game.view.mousePosX = touch.clientX - rect.left;
    this.game.view.mousePosY = touch.clientY - rect.top;
    this.game.shootBubble();
  }
}

export default UserInputManager;
