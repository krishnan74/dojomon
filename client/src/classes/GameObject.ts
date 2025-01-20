import { Sprite } from "./Sprite";

export class GameObject {
  x: number;
  y: number;
  direction: string;
  sprite: Sprite;

  constructor(config: { x?: number; y?: number; src?: string }) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "../assets/characters/boy_run.png",
    });
  }

  
}
