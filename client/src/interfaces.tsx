import { gsap } from "gsap";
export interface GameCanvasProps {
  playerPosition: { x: number; y: number };
  items: { id: number; x: number; y: number }[];
  mapWidth: number;
  mapHeight: number;
}

export interface Position {
  x: number;
  y: number;
}

export class Boundary {
  static width = 60;
  static height = 60;

  position: { x: number; y: number };
  width: number;
  height: number;

  constructor({ position }: { position: { x: number; y: number } }) {
    this.position = position;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
interface PlayerOptions {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames?: { max: number };
  width?: number;
  height?: number;
  animate?: boolean;
  isEnemy?: boolean;
  sprites: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };
}

export class Player {
  position: { x: number; y: number };
  // velocity: { x: number; y: number };
  image: HTMLImageElement;
  frames: { max: number, val: number , elapsed: number};
  width: number;
  height: number;
  moving: boolean = false;  
  sprites: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };

  constructor({ position, image, frames = { max: 1 }, sprites }: PlayerOptions) {
    this.position = position;
    // this.velocity = velocity;
    this.image = image;
    this.frames = { ...frames, val: 0 , elapsed: 0};
    this.width = 48;
    this.height = 48;
    this.sprites = sprites;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );

    if(!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if(this.moving && this.frames.elapsed%10 === 0){
    if (this.frames.val < this.frames.max - 1) {
      this.frames.val++;
    } else this.frames.val = 0;
  }
  }
}
export class Monster {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames: { max: number; val: number; elapsed: number };
  width: number;
  height: number;
  animate: boolean = false;
  opacity: number;
  health:number;
  sprites: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };
  isEnemy: boolean = true;

  constructor({
    position,
    image,
    frames = { max: 1 },
    sprites,
    animate = false,
    isEnemy = false,
  }: PlayerOptions) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = this.image?.width / 4;
    this.height = this.image?.height;
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.health = 100;
    this.isEnemy = isEnemy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );
    ctx.restore();

    if (!this.animate) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.animate && this.frames.elapsed % 10 === 0) {
      if (this.frames.val < this.frames.max - 1) {
        this.frames.val++;
      } else this.frames.val = 0;
    }
  }

  attack({attack,recipient}) {
    const tl = gsap.timeline();

    this.health -= attack.damage;

    let movementDistance = 20;
    if(this.isEnemy) movementDistance = -20;
    
    let healthBar = '#enemy-health-bar';
    if(this.isEnemy) healthBar = '#player-health-bar';
   
    tl.to(this.position, {
      x: this.position.x - movementDistance
    })
      .to(this.position, {
        x: this.position.x + movementDistance * 2,
        duration: 0.1,
        onComplete: () => {
          // Enemy actually gets hit
          // audio.tackleHit.play()
          gsap.to(healthBar, {
            width: this.health - attack.damage + '%'
          })
  
          gsap.to(recipient.position, {
            x: recipient.position.x + 10,
            yoyo: true,
            repeat: 5,
            duration: 0.08
          })
  
          gsap.to(recipient, {
            opacity: 0,
            repeat: 5,
            yoyo: true,
            duration: 0.08
          })
        }
      })
      .to(this.position, {
        x: this.position.x
      })
    
    }
  
  
}
