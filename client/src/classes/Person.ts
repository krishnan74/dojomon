import { GameObject } from "./GameObject";

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
    const speedMultiplier = 0.25;

    this.directionUpdate = {
      up: ["y", -1 * speedMultiplier],
      down: ["y", 1 * speedMultiplier],
      left: ["x", -1 * speedMultiplier],
      right: ["x", 1 * speedMultiplier],
    };
  }

  update(state: { arrow?: string }): void {
    this.updatePosition();

    if (this.isPlayerControlled && this.movingProgressRemaining === 0 && state.arrow) {
      this.direction = state.arrow; // No type conflict
      this.movingProgressRemaining = 12;
    }
  }

  updatePosition(): void {
    if (this.movingProgressRemaining > 0) {
      const [property, change] = this.directionUpdate[this.direction];
      (this as any)[property] += change; // Handle dynamic property access
      this.movingProgressRemaining -= 12;
    }
  }

  updateSprite(state:{ arrow?: string }): void{

    if (this.isPlayerControlled && this.movingProgressRemaining === 0 && !state.arrow) {
      this.sprite.setAnimation("idle-"+this.direction);

      return;
    }

    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
      console.log("walk"+this.direction)
    }
  }
}

export { Person };
