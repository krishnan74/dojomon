import { GameObject } from "./GameObject";
import { OverworldMap } from "./OverworldMap";

interface PersonConfig {
  isPlayerControlled?: boolean;
  direction?: string;
  x?: number;
  y?: number;
  src?: string;
}

class Person extends GameObject {
  movingProgressRemaining: number;
  isPlayerControlled: boolean;
  direction: string;
  directionUpdate: Record<string, [string, number]>;

  constructor(config: PersonConfig) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.direction = config.direction || "down"; // Provide a default value
    const speedMultiplier = 10;

    this.directionUpdate = {
      up: ["y", -1 * speedMultiplier],
      down: ["y", 1 * speedMultiplier],
      left: ["x", -1 * speedMultiplier],
      right: ["x", 1 * speedMultiplier],
    };
  }

  update(state: { arrow?: string; map: OverworldMap }): void {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition(); // Update the player's position if they are moving
    } else {
      if (this.isPlayerControlled && state.arrow) {
        // Start behavior if the player controls the character and an arrow is pressed
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state); // Update sprite based on the player's state (idle or walking)
    }
  }

  startBehavior(
    state: { arrow?: string; map: OverworldMap },
    behavior: { type: string; direction: string }
  ): void {
    // Set character direction to the specified direction in the behavior
    this.direction = behavior.direction;

    if (behavior.type === "walk") {
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        return;
      }

      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 12; // Set progress to move the character
    }
  }

  updatePosition(): void {
    if (this.movingProgressRemaining > 0) {
      const [property, change] = this.directionUpdate[this.direction];
      (this as any)[property] += change; // Handle dynamic property access
      this.movingProgressRemaining -= 12;
    }
  }

  updateSprite(state: { arrow?: string }): void {
    if (
      this.isPlayerControlled &&
      this.movingProgressRemaining === 0 &&
      !state.arrow
    ) {
      this.sprite.setAnimation("idle-" + this.direction);

      return;
    }

    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      // console.log("walk"+this.direction)
    }
  }
}

export { Person };
