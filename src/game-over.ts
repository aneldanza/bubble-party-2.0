import Game from "./game";
import HighestScoreManager from "./highest-score-manager";
import SoundManager from "./sound-manager";

export function setupGameOverScreen(
  game: Game,
  highestScoreManager: HighestScoreManager,
  soundManager: SoundManager
): void {
  const gameOverElement = document.getElementById("game-over")!;
  const restartButton = document.getElementById(
    "play-again"
  ) as HTMLButtonElement;
  const goToStartButton = document.getElementById(
    "go-to-start"
  ) as HTMLButtonElement;
  const highestScoreElement = document.getElementById("highest-score")!;
  const startScreenContainer = document.getElementById(
    "setup-screen-container"
  );

  // Disable the restart button while the lose sound is playing
  const loseSound = soundManager.sounds.gameOver.lose;
  loseSound.addEventListener("play", () => {
    restartButton.classList.add("hidden");
    goToStartButton.classList.add("hidden");
  });
  loseSound.addEventListener("ended", () => {
    restartButton.classList.remove("hidden");
    goToStartButton.classList.remove("hidden");
  });

  restartButton.addEventListener("click", () => {
    gameOverElement.style.display = "none";
    game.reset();
    game.start();
  });

  game.view.isOver.subscribe(async (value) => {
    if (value) {
      const score = game.score.value;
      const highScore = highestScoreManager.highestScore;
      if (highScore == null || score > highScore) {
        await highestScoreManager.setHighScore(score);
      }
      gameOverElement.style.display = "flex";
      highestScoreElement.textContent = highestScoreManager.highestScore
        ? highestScoreManager.highestScore.toString()
        : "0";
    } else {
      gameOverElement.style.display = "none";
      restartButton.classList.add("hidden");
      goToStartButton.classList.add("hidden");
    }
  });

  goToStartButton.addEventListener("click", () => {
    game.reset();
    if (startScreenContainer) {
      startScreenContainer.style.visibility = "visible";
    } else {
      // setupStartScreen(game);
    }
  });
}
