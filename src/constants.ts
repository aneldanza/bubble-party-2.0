export const COLORS: string[] = [
  "#FF69B4", // pink
  "#4169E1", // royal blue
  "#32CD32", // lime green
  "#FFD700", // gold
  "#9370DB", // medium purple
  "#FF4500", // red-orange
];

export const OFFSET_RELATIVE_POSITIONS = [
  { ROW: 0, COL: -1 },
  { ROW: 0, COL: 1 },
  { ROW: 1, COL: 1 },
  { ROW: 1, COL: 0 },
  { ROW: -1, COL: 0 },
  { ROW: -1, COL: 1 },
];

export const RELATIVE_POSITIONS = [
  { ROW: 0, COL: -1 },
  { ROW: 0, COL: 1 },
  { ROW: -1, COL: -1 },
  { ROW: -1, COL: 0 },
  { ROW: 1, COL: -1 },
  { ROW: 1, COL: 0 },
];

export const SOUNDS: { [key: string]: string } = {
  hit: "/sounds/hit.mp3",
  pop: "/sounds/bubble_burst.mp3",
  wow: "/sounds/wow.mp3",
  uhOh: "/sounds/uh-oh.mp3",
  lose: "/sounds/game_over.mp3",
  theme: "/sounds/Honolulu-March.mp3",
};
