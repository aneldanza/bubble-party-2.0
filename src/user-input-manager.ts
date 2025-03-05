import Game from "./game";

class UserInputManager {
  private canvas: HTMLCanvasElement;
  private game: Game;
  private isTouchEvent: boolean = false;
  private handleMouseClickRef: (e: MouseEvent) => void = () => {};
  private handleTouchEndRef: (e: TouchEvent) => void = () => {};
  public handleMouseMoveRef: (e: MouseEvent) => void = () => {};
  public handleTouchMoveRef: (e: TouchEvent) => void = () => {};

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.canvas = canvas;
    this.game = game;

    this.bindUserEvents();
  }

  bindUserEvents(): void {
    this.handleMouseClickRef = this.handleMouseClick.bind(this);
    this.handleTouchEndRef = this.handleTouchEnd.bind(this);
    this.handleMouseMoveRef = this.handleMouseMove.bind(this);
    this.handleTouchMoveRef = this.handleTouchMove.bind(this);
  }

  subscribeUserEvents(): void {
    this.canvas.addEventListener("mousemove", this.handleMouseMoveRef);
    this.canvas.addEventListener("touchmove", this.handleTouchMoveRef);
    this.canvas.addEventListener("click", this.handleMouseClickRef);
    this.canvas.addEventListener("touchend", this.handleTouchEndRef);
  }

  unSubscribeUserEvents(): void {
    this.canvas.removeEventListener("mousemove", this.handleMouseMoveRef);
    this.canvas.removeEventListener("touchmove", this.handleTouchMoveRef);
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

  handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.game.view.mousePosX = e.clientX - rect.left;
    this.game.view.mousePosY = e.clientY - rect.top;
  }

  handleTouchMove(e: TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.game.view.mousePosX = e.touches[0].clientX - rect.left;
    this.game.view.mousePosY = e.touches[0].clientY - rect.top;
  }
}

export default UserInputManager;
