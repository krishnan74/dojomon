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
    this.walls = {
            [asGridCoord(79, 37)]: true,
            [asGridCoord(55, 28)]: true,
            [asGridCoord(56, 26)]: true,
            [asGridCoord(56, 25)]: true,
          }
    this.gameObjects = config.gameObjects;
  }

  isSpaceTaken(currentX: number, currentY: number, direction: string): boolean {
    const { x, y } = nextPosition(currentX, currentY, direction);
    console.log("x",x,"y",y)
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

 
}

export { OverworldMap };
