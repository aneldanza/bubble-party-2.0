import { db } from "./firebase";
import { DatabaseReference, ref, onValue, set, get } from "firebase/database";

class HighestScoreManager {
  highestScore: number | null;
  highScoreRef: DatabaseReference;

  constructor() {
    this.highestScore = 0;
    this.highScoreRef = ref(db, "scores/highest");

    this.subscribeToHighScoreUpdates();
  }

  // Function to set the high score in the database
  async setHighScore(score: number): Promise<void> {
    try {
      await set(this.highScoreRef, score);
    } catch (e) {
      console.log("Error setting high score: ", e);
    }
  }

  // Function to get the high score from the database
  async getHighScore(): Promise<number | null> {
    try {
      const snapshot = await get(this.highScoreRef);
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (e) {
      console.log("Error getting high score: ", e);
      return null;
    }
  }

  // Function to update the highest score in real-time
  subscribeToHighScoreUpdates(): void {
    onValue(this.highScoreRef, (snapshot) => {
      const data = snapshot.val();
      this.highestScore = data;
    });
  }
}

export default HighestScoreManager;
