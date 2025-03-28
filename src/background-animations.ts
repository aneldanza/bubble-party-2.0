export function setUpAnimations() {
  const fish = document.getElementById("floating-fish")!;
  const schoolOfFish = document.getElementById("school-of-fish")!;

  function floatFish(obj: HTMLElement, isLeftToRight: boolean) {
    // Set a random duration for the animation (e.g., 5 to 10 seconds)
    const duration = Math.random() * 5 + 20; // Random duration between 5 and 10 seconds

    // Set a random vertical position for the fish (e.g., 10% to 80% of the screen height)
    const randomTop = Math.random() * 70 + 10; // Random top position between 10% and 80%

    // Apply the animation
    obj.style.transition = `transform ${duration}s linear, top ${duration}s linear`;
    obj.style.transform = isLeftToRight
      ? "translateX(100vw)" // Move to the right
      : "translateX(-100vw)"; // Move to the left
    obj.style.top = `${randomTop}vh`;

    // Reset the object's position after the animation ends
    setTimeout(() => {
      obj.style.transition = "none";
      obj.style.transform = isLeftToRight
        ? "translateX(-100%)" // Reset to the left if it moved to the right
        : "translateX(100%)"; // Reset to the right if it moved to the left

      // Add a small delay before starting the next animation
      setTimeout(() => {
        floatFish(obj, !isLeftToRight); // Start the next animation
      }, 50);
    }, duration * 1000);
  }

  function createBubbleCluster() {
    const container = document.getElementById("bubble-cluster-container")!;

    // Create a cluster div
    const cluster = document.createElement("div");
    cluster.classList.add("bubble-cluster");

    // Set a random horizontal position for the cluster
    cluster.style.left = `${Math.random() * 90}vw`;

    // Generate random bubbles in the cluster
    const bubbleCount = Math.floor(Math.random() * 5) + 3; // 3 to 7 bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = generateBubble();
      cluster.appendChild(bubble);
    }

    // Append the cluster to the container
    container.appendChild(cluster);

    // Remove the cluster after the animation ends
    setTimeout(() => {
      container.removeChild(cluster);
    }, 10000); // Match the animation duration (5s)
  }

  function generateBubble() {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.style.width = `${Math.random() * 20 + 10}px`; // Random size between 10px and 30px
    bubble.style.height = bubble.style.width;
    bubble.style.backgroundColor = `rgba(30, 144, 255, ${
      Math.random() * 0.5 + 0.5
    })`; // Random blue color

    // Set random position within the cluster
    bubble.style.position = "absolute"; // Ensure the bubble is positioned relative to the cluster
    bubble.style.bottom = `${Math.random() * 100}px`; // Random vertical offset within the cluster (0px to 50px)
    bubble.style.left = `${Math.random() * 100}px`; // Random horizontal offset within the cluster (0px to 50px)
    return bubble;
  }

  // Generate bubble clusters at random intervals
  setInterval(createBubbleCluster, Math.random() * 2000 + 2000); // Every 2 to 4 seconds

  // Start the animation
  floatFish(fish, true); // Start fish moving left-to-right
  setTimeout(() => {
    floatFish(schoolOfFish, false); // Start school of fish moving right-to-left
  }, 3000); // Delay the start of the school of fish animation
}
