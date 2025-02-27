import Bubble from "./bubble";
import GameView from "./game-view";
import Shooter from "./shooter";
import Observer from "./observer";
import { hitSideType } from "./types";

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
    // console.log("top border collision");
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
      // this.handleBubbleCollision(targetBubbleSpot);
      console.warn("bubble already exists at position 0," + col);
      debugger;
    }

    // notify observers that a new bubble has been formed
    this.newBubbleFormed.value = true;
  }

  determineHitSide(hitBubble: Bubble): hitSideType {
    return (
      this.isBottomCollision(this.shooter.x, this.shooter.y, hitBubble) ||
      this.isSideCollision(this.shooter.x, hitBubble)
    );
  }

  isBottomCollision(
    shooterX: number,
    shooterY: number,
    hitBubble: Bubble
  ): "bottom-left" | "bottom-right" | "" {
    if (shooterY > hitBubble.y + this.view.radius / 2) {
      return shooterX < hitBubble.x ? "bottom-left" : "bottom-right";
    }
    return "";
  }

  isSideCollision(shooterX: number, hitBubble: Bubble): "left" | "right" {
    return shooterX > hitBubble.x ? "right" : "left";
  }

  handleBubbleCollision(hitBubble: Bubble, hitSide: hitSideType): void {
    const isOffsetRow = hitBubble.isOffset;
    const isFirstCol = hitBubble.col === 0;

    this._newBubble = new Bubble("active", 0, 0, this.shooter.color);
    this._newBubble.setPos(this.shooter.x, this.shooter.y);

    const isLastCol = isOffsetRow
      ? hitBubble.col + 1 === this.view.maxCols - 1
      : hitBubble.col + 1 === this.view.maxCols;

    if (hitSide === "bottom-left" || hitSide === "bottom-right") {
      this.handleBottomCollision(
        hitBubble,
        isOffsetRow,
        isFirstCol,
        isLastCol,
        hitSide
      );
    } else if (hitSide === "left") {
      this.handleLeftCollision(hitBubble, isFirstCol, isLastCol);
    } else if (hitSide === "right") {
      this.handleRightCollision(hitBubble, isLastCol);
    }

    // notify observers that a new bubble has been formed
    this.newBubbleFormed.value = true;
  }

  isValidAndAvailablePosition(row: number, col: number): boolean {
    return (
      this.bubbles[row] &&
      this.bubbles[row][col] &&
      this.bubbles[row][col].status === "inactive"
    );
  }

  handleInvalidPosition(row: number, col: number): void {
    const targetBubble = this.bubbles[row][col];
    if (targetBubble) {
      if (targetBubble.status === "active") {
        console.error(
          "can't insert new bubble at occupied position " + row + "," + col
        );
      }
    } else {
      console.error("no valid bubble at position " + row + "," + col);
    }
  }

  handleBottomCollision(
    hitBubble: Bubble,
    isOffsetRow: boolean,
    isFirstCol: boolean,
    isLastCol: boolean,
    hitSide: "bottom-left" | "bottom-right"
  ): void {
    const row = hitBubble.row + 1;
    let col = hitBubble.col;

    // if bubble is hit at the bottom-left corner
    if (hitSide === "bottom-left") {
      if (!isOffsetRow && !isFirstCol) {
        col = hitBubble.col - 1;
      }
      // if bubble is hit at the right-bottom corner
    } else {
      if (isOffsetRow) {
        col = hitBubble.col + 1;
      } else if (isLastCol) {
        col = hitBubble.col - 1;
      }
    }

    this.setBubbleParams(row, col, !isOffsetRow);

    // insert new bubble into the bubbles array if it exists
    if (this.bubbles[row]) {
      if (!this.isValidAndAvailablePosition(row, col)) {
        this.handleInvalidPosition(row, col);
        return;
      }
      this.bubbles[row][col] = this._newBubble;
    } else {
      // create new row if it doesn't exist
      const isNewRowOffset = !isOffsetRow;
      const newRow = this.createNewEmptyRow(isNewRowOffset, row);

      // insert new bubble into the new row and add it to the bubbles array
      newRow[col] = this._newBubble;
      this.bubbles.push(newRow);
    }
  }

  createNewEmptyRow(isOffset: boolean, row: number): Bubble[] {
    const newRowLength = isOffset ? this.view.maxCols - 1 : this.view.maxCols;

    const newRow = Array(newRowLength)
      .fill(new Bubble("inactive", 0, 0))
      .map((bubble, index) => {
        bubble.col = index;
        bubble.row = row;
        bubble.isOffset = isOffset;
        return bubble;
      });

    return newRow;
  }

  handleLeftCollision(
    hitBubble: Bubble,
    isFirstCol: boolean,
    isLastCol: boolean
  ): void {
    if (isFirstCol) {
      this.handleBottomCollision(
        hitBubble,
        hitBubble.isOffset,
        isFirstCol,
        isLastCol,
        "bottom-left"
      );
    } else {
      if (!this.isValidAndAvailablePosition(hitBubble.row, hitBubble.col - 1)) {
        this.handleInvalidPosition(hitBubble.row, hitBubble.col - 1);
        return;
      }

      this.setBubbleParams(
        hitBubble.row,
        hitBubble.col - 1,
        hitBubble.isOffset
      );
      this.bubbles[hitBubble.row][hitBubble.col - 1] = this._newBubble;
    }
  }

  handleRightCollision(hitBubble: Bubble, isLastCol: boolean): void {
    // console.log("right side collision");
    if (isLastCol) {
      this.handleBottomCollision(
        hitBubble,
        hitBubble.isOffset,
        false,
        isLastCol,
        "bottom-right"
      );
    } else {
      if (!this.isValidAndAvailablePosition(hitBubble.row, hitBubble.col + 1)) {
        this.handleInvalidPosition(hitBubble.row, hitBubble.col + 1);
        return;
      }
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
