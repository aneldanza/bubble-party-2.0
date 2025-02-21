import Bubble from "./bubble";
import GameView from "./game-view";
import Shooter from "./shooter";
import Observer from "./observer";

class CollisionManager {
  private view: GameView;
  private bubbles: Bubble[][] = [];
  private shooter: Shooter;
  private _newBubble: Bubble;
  public newBubbleFormed: Observer<boolean>;

  constructor(view: GameView, bubbles: Bubble[][], shooter: Shooter) {
    this.view = view;
    this.bubbles = bubbles;
    this.shooter = shooter;
    this._newBubble = new Bubble("inactive", 0, 0);
    this.newBubbleFormed = new Observer<boolean>(false);
  }

  get newBubble(): Bubble | null {
    if (this._newBubble.color === "transparent") {
      return null;
    }
    return this._newBubble;
  }

  handleBorderCollision(): void {
    // check if shooter hits the left or right border
    if (
      this.shooter.x - this.view.radius < 0 ||
      this.shooter.x + this.view.radius > this.view.canvas.width
    ) {
      // reverse the direction of the shooter
      this.shooter.dx = -this.shooter.dx;
    }

    // check if shooter hits the bottom border
    if (this.shooter.y + this.view.radius > this.view.canvas.height) {
      // reverse the direction of the shooter
      this.shooter.dy = -this.shooter.dy;
    }

    // check if shooter hits the top border
    if (this.shooter.y - this.view.radius < 0) {
      // reverse the direction of the shooter
      this.handleTopBorderCollision();
    }
  }

  handleTopBorderCollision(): void {
    console.log("top border collision");
    // create a new bubble
    this._newBubble = new Bubble("active", 0, 0, this.shooter.color);
    this._newBubble.setPos(this.shooter.x, this.shooter.y);

    // calculate x and y positions for each bubble in the first row
    const row = this.bubbles[0];
    const x = this._newBubble.x;

    // check if the first row is offset
    const isOffset = row.length < this.view.maxCols;

    // calculate the column index for the new bubble
    const bubbleWidthWithMargin = this.view.radius * 2 + this.view.bubbleMargin;
    let col = Math.floor(x / bubbleWidthWithMargin);
    if (isOffset) {
      col = Math.floor((x - this.view.radius) / bubbleWidthWithMargin);
    }

    // insert the new bubble into the bubbles array
    const targetBubbleSpot = this.bubbles[0][col];
    if (targetBubbleSpot && targetBubbleSpot.status === "inactive") {
      this.setBubbleParams(0, col, isOffset);
      row[col] = this._newBubble;
    } else {
      this.handleBubbleCollision(targetBubbleSpot);
    }

    // notify observers that a new bubble has been formed
    this.newBubbleFormed.value = true;
  }

  handleBubbleCollision(hitBubble: Bubble): void {
    const isOffsetRow = hitBubble.isOffset;
    const isFirstCol = hitBubble.col === 0;
    this._newBubble = new Bubble("active", 0, 0, this.shooter.color);
    this._newBubble.setPos(this.shooter.x, this.shooter.y);

    const isLastCol = isOffsetRow
      ? hitBubble.col + 1 === this.view.maxCols - 1
      : hitBubble.col + 1 === this.view.maxCols;

    if (this.isLeftCollision(hitBubble)) {
      this.handleLeftCollision(hitBubble, isFirstCol);
    } else if (this.isRightCollision(hitBubble)) {
      this.handleRightCollision(hitBubble, isLastCol);
    } else if (this.isBottomCollision(hitBubble)) {
      this.handleBottomCollision(hitBubble, isOffsetRow, isFirstCol);
    } else {
      console.warn(
        "no side or bottom collision, defaulting to bottom collision handler"
      );
      this.handleBottomCollision(hitBubble, isOffsetRow, isFirstCol);
    }

    // notify observers that a new bubble has been formed
    this.newBubbleFormed.value = true;
  }

  isLeftCollision(hitBubble: Bubble): boolean {
    return (
      this._newBubble.x < hitBubble.x &&
      this._newBubble.y > hitBubble.y - this.view.radius &&
      this._newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isRightCollision(hitBubble: Bubble): boolean {
    return (
      this._newBubble.x > hitBubble.x &&
      this._newBubble.y > hitBubble.y - this.view.radius &&
      this._newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isBottomCollision(hitBubble: Bubble): boolean {
    return (
      this._newBubble.y > hitBubble.y &&
      this._newBubble.y <
        hitBubble.y + this.view.radius * 2 + this.view.bubbleMargin / 2
    );
  }

  handleBottomCollision(
    hitBubble: Bubble,
    isOffsetRow: boolean,
    isFirstCol: boolean
  ): void {
    const row = hitBubble.row + 1;
    let col = hitBubble.col;
    console.log("hitBubble", hitBubble.col);
    console.log("bottom collision");

    // if bubble is hit at the left-bottom corner
    if (this._newBubble.x < hitBubble.x) {
      if (!isOffsetRow && !isFirstCol) {
        col = hitBubble.col - 1;
      }
      // if bubble is hit at the right-bottom corner
    } else {
      if (isOffsetRow) {
        col = hitBubble.col + 1;
      }
    }

    this.setBubbleParams(row, col, !isOffsetRow);

    // insert new bubble into the bubbles array if it exists
    if (this.bubbles[row]) {
      const targetBubble = this.bubbles[row][col];
      if (targetBubble) {
        if (targetBubble.status === "active") {
          this.handleBubbleCollision(targetBubble);
          return;
        }

        this.bubbles[row][col] = this._newBubble;
      } else {
        console.log("no target bubble at position " + row + "," + col);
        debugger;
      }

      // create new row if it doesn't exist
    } else {
      const isNewRowOffset = !isOffsetRow;
      const newRowLength = isNewRowOffset
        ? this.view.maxCols - 1
        : this.view.maxCols;
      const newRow = Array(newRowLength)
        .fill(new Bubble("inactive", 0, 0))
        .map((bubble, index) => {
          bubble.col = index;
          bubble.row = row;
          bubble.isOffset = isNewRowOffset;
          return bubble;
        });
      newRow[col] = this._newBubble;
      this.bubbles.push(newRow);
    }
  }

  handleLeftCollision(hitBubble: Bubble, isFirstCol: boolean): void {
    console.log("left side collision");
    if (isFirstCol) {
      this.handleBottomCollision(
        hitBubble,

        hitBubble.isOffset,
        isFirstCol
      );
    } else {
      this.setBubbleParams(
        hitBubble.row,
        hitBubble.col - 1,
        hitBubble.isOffset
      );
      this.bubbles[hitBubble.row][hitBubble.col - 1] = this._newBubble;
    }
  }

  handleRightCollision(hitBubble: Bubble, isLastCol: boolean): void {
    console.log("right side collision");
    if (isLastCol) {
      this.handleBottomCollision(hitBubble, hitBubble.isOffset, false);
    } else {
      this.setBubbleParams(
        hitBubble.row,
        hitBubble.col + 1,
        hitBubble.isOffset
      );
      this.bubbles[this._newBubble.row][this._newBubble.col] = this._newBubble;
    }
  }

  setBubbleParams(row: number, col: number, isOffset: boolean) {
    if (!this._newBubble) {
      return;
    }
    this._newBubble.row = row;
    this._newBubble.col = col;
    this._newBubble.isOffset = isOffset;
  }
}

export default CollisionManager;
