import { asGridCoord, nextPosition } from "@/lib/utils"; // Assuming nextPosition utility is imported
import { GameObject } from "./GameObject";

interface OverworldMapConfig {
  walls: Record<string, boolean>;
  gameObjects: Record<string, GameObject>;
}

class OverworldMap {
  walls: Record<string, boolean> = {};
  gameObjects: Record<string, GameObject>;

  constructor(config: OverworldMapConfig) {
    this.walls = config.walls || {};
    this.gameObjects = config.gameObjects;
  }

  isSpaceTaken(currentX: number, currentY: number, direction: string): boolean {
    // Use nextPosition to calculate the new target position
    const { x, y } = nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  addWall(x: number, y: number): void {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x: number, y: number): void {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX: number, wasY: number, direction: string): void {
    this.removeWall(wasX, wasY);
    const { x, y } = nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }

  isPlayerAtFarm(x: number, y: number, farmCoords: { x: number; y: number }): boolean {
    return x === farmCoords.x && y === farmCoords.y;
  }

  
}

export { OverworldMap };
