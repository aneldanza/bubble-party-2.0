import GameView from "./game-view";
import Shooter from "./shooter";
import Observer from "./observer";
import SoundManager from "./sound-manager";
import { PlayMode } from "./types";
import UserInputManager from "./user-input-manager";
import BubbleManager from "./bubble-manager";

class Game {
  public view: GameView;
  private shooter: Shooter;
  public score: Observer<number>;
  public playMode: Observer<PlayMode>;
  public soundManager: SoundManager;
  public isPaused: Observer<boolean>;
  private userInputManager: UserInputManager;
  private bubbleManager: BubbleManager;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    colors: string[],
    soundManager: SoundManager
  ) {
    this.soundManager = soundManager;
    this.score = new Observer<number>(0);
    this.isPaused = new Observer<boolean>(false);
    this.playMode = new Observer<PlayMode>("relaxed");

    this.view = new GameView(canvas, ctx, colors);
    this.shooter = new Shooter(this.view.getRandColor(), 15);
    this.userInputManager = new UserInputManager(canvas, this);
    this.bubbleManager = new BubbleManager(this, this.shooter);

    this.subscribeObserverEvents();
  }

  reset(): void {
    this.view.resetShooter();
    this.bubbleManager.resetBubbles();
    this.score.value = 0;
    this.shooter.moves = 0;
    this.view.isOver.value = false;
    this.isPaused.value = false;
  }

  start(): void {
    this.view.init(this.shooter);
    this.animate();
    this.bubbleManager.addRow();
    this.userInputManager.subscribeUserEvents();
    this.soundManager.playTheme();
    if (this.playMode.value == "time-limit") {
      this.bubbleManager.fillBubbles();
    }
  }

  gameOver(): void {
    console.log("GAME OVER");
    this.soundManager.gameOver();

    this.userInputManager.unSubscribeUserEvents();

    this.shooter.stop();
  }

  handlePause(): void {
    if (this.isPaused.value) {
      this.userInputManager.unSubscribeUserEvents();
    } else {
      this.userInputManager.subscribeUserEvents();
    }
    this.soundManager.pauseGameSounds(this.isPaused.value);
  }

  setPlayMode(mode: PlayMode): void {
    this.playMode.value = mode;
  }

  animate(): void {
    if (!this.view.isOver.value) {
      this.shooter.move();

      this.bubbleManager.collisionManager.handleBorderCollision();
      this.view.draw(this.bubbleManager.bubbles, this.shooter);
      if (!(this.shooter.dx === 0 && this.shooter.dy === 0)) {
        this.bubbleManager.detectBubbleCollision();
      }

      requestAnimationFrame(this.animate.bind(this));
    }
  }

  // resetShooter(): void {
  //   this.shooter.reset(
  //     this.view.canvas.width / 2,
  //     this.view.canvas.height - this.view.radius,
  //     this.view.getRandColor()
  //   );
  // }

  subscribeObserverEvents(): void {
    this.view.isOver.subscribe(() => {
      if (this.view.isOver.value) {
        this.gameOver();
      }
    });

    this.isPaused.subscribe(() => {
      this.handlePause();
    });
  }

  shootBubble(): void {
    // calculate the direction of the shooter
    const dx = this.view.mousePosX - this.shooter.x;
    const dy = this.view.mousePosY - this.shooter.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    this.shooter.setDirection(
      (dx / length) * this.shooter.speed,
      (dy / length) * this.shooter.speed
    );

    if (this.playMode.value === "relaxed") {
      // increase move count
      this.shooter.moves++;
      console.log("number of moves " + this.shooter.moves);

      // add a new row of bubbles after 5 moves
      if (this.shooter.moves > 3) {
        this.shooter.moves = 0;
        setTimeout(() => {
          this.bubbleManager.addRow();
        }, 1000);
      }
    }
  }
}

export default Game;
