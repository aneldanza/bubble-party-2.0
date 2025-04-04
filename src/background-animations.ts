class BackgroundAnimations {
  private bubbleContainer: HTMLElement;
  private fish: HTMLElement;
  private schoolOfFish: HTMLElement;
  private fishAnimationTimeouts: NodeJS.Timeout[]; // Store timeout IDs for fish animations
  private bubbleClusterIntervalId: NodeJS.Timeout | null; // Store interval ID for bubble clusters

  constructor() {
    this.bubbleContainer = document.getElementById("bubble-cluster-container")!;
    this.fish = document.getElementById("floating-fish")!;
    this.schoolOfFish = document.getElementById("school-of-fish")!;
    this.fishAnimationTimeouts = []; // Initialize the timeout storage
    this.bubbleClusterIntervalId = null; // Initialize the interval ID
  }

  public startFishAnimation() {
    this.startTravelingAnimation(this.fish, true); // Start fish moving left-to-right
    setTimeout(() => {
      this.startTravelingAnimation(this.schoolOfFish, false); // Start school of fish moving right-to-left
    }, 3000); // Delay the start of the school of fish animation
  }

  public stopFishAnimation() {
    // Clear all timeouts for fish animations
    this.fishAnimationTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.fishAnimationTimeouts = []; // Reset the timeout storage

    // Optionally reset fish positions
    this.fish.style.transition = "none";
    this.fish.style.transform = "translateX(0)";
    this.schoolOfFish.style.transition = "none";
    this.schoolOfFish.style.transform = "translateX(0)";
  }

  public startBubbleClusters() {
    this.bubbleClusterIntervalId = setInterval(() => {
      this.createBubbleCluster();
    }, Math.random() * 2000 + 3000); // Generate clusters every 10 to 30 seconds
  }

  public stopBubbleClusters() {
    if (this.bubbleClusterIntervalId) {
      clearInterval(this.bubbleClusterIntervalId); // Clear the interval
      this.bubbleClusterIntervalId = null; // Reset the interval ID
    }
  }

  private startTravelingAnimation(obj: HTMLElement, isLeftToRight: boolean) {
    const duration = Math.random() * 5 + 20; // Random duration between 20 and 25 seconds
    const randomTop = Math.random() * 70 + 10; // Random vertical position (10% to 80%)

    obj.style.transition = `transform ${duration}s linear, top ${duration}s linear`;
    obj.style.transform = isLeftToRight
      ? "translateX(100vw)" // Move to the right
      : "translateX(-100vw)"; // Move to the left
    obj.style.top = `${randomTop}vh`;

    const timeoutId = setTimeout(() => {
      obj.style.transition = "none";
      obj.style.transform = isLeftToRight
        ? "translateX(-100%)" // Reset to the left
        : "translateX(100%)"; // Reset to the right

      const nextTimeoutId = setTimeout(() => {
        this.startTravelingAnimation(obj, !isLeftToRight); // Start the next animation
      }, 50); // Small delay to allow reset

      this.fishAnimationTimeouts.push(nextTimeoutId); // Store the timeout ID
    }, duration * 1000);

    this.fishAnimationTimeouts.push(timeoutId); // Store the timeout ID
  }

  private createBubbleCluster() {
    const cluster = document.createElement("div");
    cluster.classList.add("bubble-cluster");
    cluster.style.left = `${Math.random() * 90}vw`;
    cluster.style.position = "absolute";
    cluster.style.bottom = "0";

    const bubbleCount = Math.floor(Math.random() * 5) + 3; // 3 to 7 bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = this.generateBubble();
      cluster.appendChild(bubble);
    }

    this.bubbleContainer.appendChild(cluster);

    setTimeout(() => {
      this.bubbleContainer.removeChild(cluster);
    }, 10000); // Match the animation duration
  }

  private generateBubble(): HTMLElement {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.style.width = `${Math.random() * 20 + 10}px`; // Random size between 10px and 30px
    bubble.style.height = bubble.style.width;
    bubble.style.backgroundColor = `rgba(30, 144, 255, ${
      Math.random() * 0.5 + 0.5
    })`; // Random blue color
    bubble.style.position = "absolute";
    bubble.style.bottom = `${Math.random() * 50}px`; // Random vertical offset (0px to 50px)
    bubble.style.left = `${Math.random() * 50}px`; // Random horizontal offset (0px to 50px)
    bubble.style.boxShadow = `0 4px 8px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(255, 255, 255, 0.5)`; // 3D effect
    return bubble;
  }
}

export default BackgroundAnimations;
