import Bubble from "./bubble";
import GameView from "./game-view";

class CollisionManager {
  private view: GameView;
  private bubbles: (Bubble | null)[][] = [];

  constructor(view: GameView, bubbles: (Bubble | null)[][]) {
    this.view = view;
    this.bubbles = bubbles;
  }

  handleCollision(hitBubble: Bubble, newBubble: Bubble): void {
    const isOffsetRow = hitBubble.isOffset;
    const isFirstCol = hitBubble.col === 0;

    const isLastCol = isOffsetRow
      ? hitBubble.col + 1 === this.view.maxCols - 1
      : hitBubble.col + 1 === this.view.maxCols;

    if (this.isLeftCollision(hitBubble, newBubble)) {
      this.handleLeftCollision(hitBubble, newBubble, isFirstCol);
    } else if (this.isRightCollision(hitBubble, newBubble)) {
      this.handleRightCollision(hitBubble, newBubble, isLastCol);
    } else if (this.isBottomCollision(hitBubble, newBubble)) {
      this.handleBottomCollision(hitBubble, newBubble, isOffsetRow, isFirstCol);
    } else {
      console.log("no side or bottom collision");
      debugger;
    }
  }

  isLeftCollision(hitBubble: Bubble, newBubble: Bubble): boolean {
    return (
      newBubble.x < hitBubble.x &&
      newBubble.y > hitBubble.y - this.view.radius &&
      newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isRightCollision(hitBubble: Bubble, newBubble: Bubble): boolean {
    return (
      newBubble.x > hitBubble.x &&
      newBubble.y > hitBubble.y - this.view.radius &&
      newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isBottomCollision(hitBubble: Bubble, newBubble: Bubble): boolean {
    return (
      newBubble.y > hitBubble.y &&
      newBubble.y <
        hitBubble.y + this.view.radius * 2 + this.view.bubbleMargin / 2
    );
  }

  handleBottomCollision(
    hitBubble: Bubble,
    newBubble: Bubble,
    isOffsetRow: boolean,
    isFirstCol: boolean
  ): void {
    const row = hitBubble.row + 1;
    let col = hitBubble.col;
    console.log("hitBubble", hitBubble.col);
    console.log("bottom collision");

    // if bubble is hit at the left-bottom corner
    if (newBubble.x < hitBubble.x) {
      if (!isOffsetRow && !isFirstCol) {
        col = hitBubble.col - 1;
      }
      // if bubble is hit at the right-bottom corner
    } else {
      if (isOffsetRow) {
        col = hitBubble.col + 1;
      }
    }

    newBubble.col = col;
    newBubble.row = row;
    newBubble.isOffset = !isOffsetRow;

    // insert new bubble into the bubbles array if it exists
    if (this.bubbles[row]) {
      const targetBubble = this.bubbles[row][col];
      if (targetBubble !== null) {
        this.handleCollision(targetBubble, newBubble);
        return;
      }

      this.bubbles[row][col] = newBubble;

      // create new row if it doesn't exist
    } else {
      const isNewRowOffset = !isOffsetRow;
      const newRowLength = isNewRowOffset
        ? this.view.maxCols - 1
        : this.view.maxCols;
      const newRow = Array(newRowLength).fill(null);
      newRow[col] = newBubble;
      this.bubbles.push(newRow);
    }
  }

  handleLeftCollision(
    hitBubble: Bubble,
    newBubble: Bubble,
    isFirstCol: boolean
  ): void {
    console.log("left side collision");
    if (isFirstCol) {
      this.handleBottomCollision(
        hitBubble,
        newBubble,
        hitBubble.isOffset,
        isFirstCol
      );
    } else {
      newBubble.col = hitBubble.col - 1;
      newBubble.row = hitBubble.row;
      newBubble.isOffset = hitBubble.isOffset;
      this.bubbles[hitBubble.row][hitBubble.col - 1] = newBubble;
    }
  }

  handleRightCollision(
    hitBubble: Bubble,
    newBubble: Bubble,
    isLastCol: boolean
  ): void {
    console.log("right side collision");
    if (isLastCol) {
      this.handleBottomCollision(
        hitBubble,
        newBubble,
        hitBubble.isOffset,
        false
      );
    } else {
      newBubble.col = hitBubble.col + 1;
      newBubble.row = hitBubble.row;
      newBubble.isOffset = hitBubble.isOffset;
      this.bubbles[hitBubble.row][hitBubble.col + 1] = newBubble;
    }
  }
}

export default CollisionManager;
