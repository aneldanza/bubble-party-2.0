import Game from "./game";
import { PlayMode } from "./types";
import { setUpAnimations } from "./background-animations";

export function setupStartScreen(game: Game): void {
  const setupScreenContainer = document.getElementById(
    "setup-screen-container"
  )!;

  const startButton = document.getElementById("start-game")!;
  const playModeButtons = document.getElementsByClassName("play-mode");
  const selectedSVGs = document.getElementsByClassName("mode-svg");

  startButton.addEventListener("click", () => {
    setupScreenContainer.style.visibility = "hidden";
    game.start();
    setUpAnimations();
  });

  for (let i = 0; i < playModeButtons.length; i++) {
    const button = playModeButtons[i];

    button.addEventListener("click", () => {
      game.playMode.value = button.id as PlayMode;
    });
  }

  function updateSelectedButton() {
    for (let i = 0; i < selectedSVGs.length; i++) {
      const button = selectedSVGs[i] as HTMLElement;

      if (button.getAttribute("data-mode") === game.playMode.value) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    }
  }

  game.playMode.subscribe(() => {
    updateSelectedButton();
  });

  updateSelectedButton();
}
