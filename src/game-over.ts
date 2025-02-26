import Game from "./game";

export function setupGameOverScreen(game: Game): void {
  const gameOverContainer = document.createElement("div");
  gameOverContainer.id = "game-over-container";
  document.body.appendChild(gameOverContainer);

  fetch("game-over.html")
    .then((response) => response.text())
    .then((html) => {
      gameOverContainer.innerHTML = html;

      const restartButton = document.getElementById("play-again")!;
      const gameOverElement = document.getElementById("game-over")!;

      restartButton.addEventListener("click", () => {
        gameOverElement.style.display = "none";
        game.reset();
        game.start();
      });

      game.view.isOver.subscribe((value) => {
        if (value) {
          gameOverElement.style.display = "flex";
        }
      });
    })
    .catch((error) => {
      console.error("Error loading game-over.html:", error);
    });
}
