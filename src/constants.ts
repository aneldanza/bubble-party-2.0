import { SoundsObject } from "./types";

export const COLORS: string[] = [
  "#FFD700", // Saturated Bright Yellow
  "#FF1493", // Deep Pink (vibrant)
  "#32CD32", // Lime Green (super bright)
  "#8A2BE2", // Blue Violet (rich purple)
  "#1E90FF", // Dodger Blue (bright blue)
  "#FF4500", // Orange Red (bright and bold)
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

export const SOUNDS: SoundsObject = {
  specEffects: {
    hit: "/sounds/hit.mp3",
    pop: "/sounds/bubble_burst.mp3",
    wow: "/sounds/wow.mp3",
  },
  gameOver: {
    uhOh: "/sounds/uh-oh.mp3",
    lose: "/sounds/game_over.mp3",
  },
  theme: {
    main: "/sounds/Honolulu-March.mp3",
  },
};
