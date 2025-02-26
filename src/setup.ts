import Game from "./game";

export function setupStartScreen(game: Game): void {
  fetch("./views/setup-screen.html")
    .then((response) => response.text())
    .then((html) => {
      const setupScreenContainer = document.createElement("div");
      setupScreenContainer.id = "setup-screen-container";
      document.body.appendChild(setupScreenContainer);
      setupScreenContainer.innerHTML = html;

      const startButton = document.getElementById("start-game")!;

      startButton.addEventListener("click", () => {
        setupScreenContainer.style.display = "none";
        game.start();
      });
    })
    .catch((error) => {
      console.error("Error loading setup-screen.html:", error);
    });
}
