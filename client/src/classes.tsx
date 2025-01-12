import { Position } from "./interfaces";

export class Sprite {
  position: Position;
  image: HTMLImageElement;

  constructor({
    position,
    image,
  }: {
    position: Position;
    image: HTMLImageElement;
  }) {
    this.position = position;
    this.image = image;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }

  move(dx: number, dy: number) {
    this.position.x += dx;
    this.position.y += dy;
  }
}
