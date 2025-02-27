import Game from "./game";
import HighestScoreManager from "./highest-score-manager";

export function setupGameOverScreen(
  game: Game,
  highestScoreManager: HighestScoreManager
): void {
  const gameOverContainer = document.createElement("div");
  gameOverContainer.id = "game-over-container";
  document.body.appendChild(gameOverContainer);

  fetch("./views/game-over.html")
    .then((response) => response.text())
    .then((html) => {
      gameOverContainer.innerHTML = html;

      const restartButton = document.getElementById("play-again")!;
      const gameOverElement = document.getElementById("game-over")!;
      const highestScoreElement = document.getElementById("highest-score")!;

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
            highestScoreManager.setHighScore(score);
          }
          gameOverElement.style.display = "flex";
          highestScoreElement.textContent = highScore.toString();
        }
      });
    })
    .catch((error) => {
      console.error("Error loading game-over.html:", error);
    });
}
