import Bubble from "./bubble";
import GameView from "./game-view";
import Shooter from "./shooter";

const OFFSET_RELATIVE_POSITIONS = [
  { ROW: 0, COL: -1 },
  { ROW: 0, COL: 1 },
  { ROW: 1, COL: 1 },
  { ROW: 1, COL: 0 },
  { ROW: -1, COL: 0 },
  { ROW: -1, COL: 1 },
];

const RELATIVE_POSITIONS = [
  { ROW: 0, COL: -1 },
  { ROW: 0, COL: 1 },
  { ROW: -1, COL: -1 },
  { ROW: -1, COL: 0 },
  { ROW: 1, COL: -1 },
  { ROW: 1, COL: 0 },
];

class CollisionManager {
  private view: GameView;
  private bubbles: (Bubble | null)[][] = [];
  private shooter: Shooter;
  public newBubble: Bubble;

  constructor(view: GameView, bubbles: (Bubble | null)[][], shooter: Shooter) {
    this.view = view;
    this.bubbles = bubbles;
    this.shooter = shooter;
    this.newBubble = new Bubble(this.shooter.color, 0, 0);
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
      this.shooter.dy = -this.shooter.dy;
    }
  }

  handleCollision(hitBubble: Bubble): void {
    const isOffsetRow = hitBubble.isOffset;
    const isFirstCol = hitBubble.col === 0;
    this.newBubble = new Bubble(this.shooter.color, 0, 0);
    this.newBubble.setPos(this.shooter.x, this.shooter.y);

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
      console.log("no side or bottom collision");
      debugger;
    }
  }

  isLeftCollision(hitBubble: Bubble): boolean {
    return (
      this.newBubble.x < hitBubble.x &&
      this.newBubble.y > hitBubble.y - this.view.radius &&
      this.newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isRightCollision(hitBubble: Bubble): boolean {
    return (
      this.newBubble.x > hitBubble.x &&
      this.newBubble.y > hitBubble.y - this.view.radius &&
      this.newBubble.y < hitBubble.y + this.view.radius
    );
  }

  isBottomCollision(hitBubble: Bubble): boolean {
    return (
      this.newBubble.y > hitBubble.y &&
      this.newBubble.y <
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
    if (this.newBubble.x < hitBubble.x) {
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
      if (targetBubble !== null) {
        this.handleCollision(targetBubble);
        return;
      }

      this.bubbles[row][col] = this.newBubble;

      // create new row if it doesn't exist
    } else {
      const isNewRowOffset = !isOffsetRow;
      const newRowLength = isNewRowOffset
        ? this.view.maxCols - 1
        : this.view.maxCols;
      const newRow = Array(newRowLength).fill(null);
      newRow[col] = this.newBubble;
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
      this.bubbles[hitBubble.row][hitBubble.col - 1] = this.newBubble;
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
      this.bubbles[this.newBubble.row][this.newBubble.col] = this.newBubble;
    }
  }

  setBubbleParams(row: number, col: number, isOffset: boolean) {
    if (!this.newBubble) {
      return;
    }
    this.newBubble.row = row;
    this.newBubble.col = col;
    this.newBubble.isOffset = isOffset;
  }

  findBubbleCluster() {
    const visited = new Set<string>();
    const queue = [this.newBubble];
    const cluster = [];

    while (queue.length) {
      const currentBubble = queue.shift() as Bubble;
      const key = `${currentBubble.row}-${currentBubble.col}`;

      if (visited.has(key)) {
        continue;
      }

      visited.add(key);

      if (currentBubble.color === this.newBubble.color) {
        cluster.push(currentBubble);
        const neighbors = this.findNeighbors(currentBubble);
        queue.push(...neighbors);
      }
    }

    return cluster;
  }

  findNeighbors(bubble: Bubble): Bubble[] {
    const relativePositions = bubble.isOffset
      ? OFFSET_RELATIVE_POSITIONS
      : RELATIVE_POSITIONS;

    return relativePositions
      .map(({ ROW, COL }) => {
        const row = bubble.row + ROW;
        const col = bubble.col + COL;

        if (
          row < 0 ||
          col < 0 ||
          !this.bubbles[row] ||
          !this.bubbles[row][col]
        ) {
          return null;
        }

        return this.bubbles[row][col] as Bubble;
      })
      .filter((bubble) => bubble !== null);
  }
}

export default CollisionManager;
