import { withGrid } from "@/lib/utils";
import { GameObject } from "./GameObject";

export class FarmManager {
  cropSprite: GameObject | null = null;
  xc: { start: number; end: number };
  yc: { start: number; end: number };
  isFarming: boolean = false;
  hasInteracted: boolean = false; // Tracks if interaction has occurred

  constructor(
    xc: { start: number; end: number },
    yc: { start: number; end: number }
  ) {
    this.xc = xc;
    this.yc = yc;
  }

  // Check if the player is within the farming area
  isPlayerAtFarm(x: number, y: number): boolean {
    return (
      x >= this.xc.start && x <= this.xc.end &&  // x coordinate in range
      y >= this.yc.start && y <= this.yc.end     // y coordinate in range
    );
  }

  // Start farming interaction
  startFarming(ctx: CanvasRenderingContext2D, renderedCrops: GameObject[]): void {
    if (!this.isFarming) {
      this.isFarming = true;

      // Use a for loop to create multiple crop sprites in the farming area
      for (let x = this.xc.start; x <= this.xc.end; x += withGrid(1)) {
        for (let y = this.yc.start; y <= this.yc.end; y += withGrid(1)) {
          const cropSprite = new GameObject({
            x: x,
            y: y,
            src: "../assets/game-assets/crop4.png" 
          });
          renderedCrops.push(cropSprite);  // Add each crop sprite to the rendered list
        }
      }

    }
  }

  // Remove crop sprites on harvest
  harvest(ctx: CanvasRenderingContext2D, renderedCrops: GameObject[]): void {
    // Clear the area where crops are and reset the renderedCrops list
    renderedCrops.forEach(crop => {
      ctx.clearRect(crop.x, crop.y, 32, 32);  // Clear the area where crops are
    });

    // Reset the farming state and interaction state
    this.isFarming = false;
    this.hasInteracted = false;

    // Optionally clear the rendered crops list
    renderedCrops.length = 0;  // Empty the array (reset the rendered crops list)
  }
}
