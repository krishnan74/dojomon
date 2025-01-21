import { Position } from "./interfaces";
import gsap from "gsap";
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

interface PlayerOptions {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames?: { max: number, val?: number, elapsed?: number, hold?: number };
  width?: number;
  height?: number;
  animate?: boolean;
  isEnemy?: boolean;
  sprites: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };
}


export class MySprite {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames: { max: number, val: number, elapsed: number, hold: number };
  width: number;
  height: number;
  moving: boolean = false;
  sprites: { up: HTMLImageElement; left: HTMLImageElement; right: HTMLImageElement; down: HTMLImageElement };

  constructor({ position, image, frames = { max: 1 }, sprites }: PlayerOptions) {
    this.position = position;
    // this.velocity = velocity;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0, hold: 0 };
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

    if (!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.moving && this.frames.elapsed % 10 === 0) {
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
  health: number;
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

  attack({ attack, recipient, renderedSpritesBattle }:
    {
      attack: { name: string, damage: number, type: string },
      recipient: Monster,
      renderedSpritesBattle: MySprite[]
    }) {

      let healthBar = "#enemy-health-bar";
      if (this.isEnemy) healthBar = "#player-health-bar";

    recipient.health -= attack.damage
    console.log("attack", attack);

    switch (attack.name) {
      case 'Fireball': {
        const fireballImage = new Image();
        fireballImage.src = '../assets/game-assets/fireball.png';
        const fireball = new MySprite({
          position: { x: this.position.x, y: this.position.y },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          sprites: {
            up: fireballImage,
            left: fireballImage,
            right: fireballImage,
            down: fireballImage
          },
          animate: true
        });

        renderedSpritesBattle.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            gsap.to(healthBar, {
              width: `${recipient.health}%`
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            });

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            });

            renderedSpritesBattle.splice(1, 1);
          }
        });

        break;
      }
      case 'Waterball': {
        const fireballImage = new Image();
        fireballImage.src = '../assets/game-assets/waterball.png';
        const fireball = new MySprite({
          position: { x: this.position.x, y: this.position.y },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          sprites: {
            up: fireballImage,
            left: fireballImage,
            right: fireballImage,
            down: fireballImage
          },
          animate: true
        });

        renderedSpritesBattle.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            gsap.to(healthBar, {
              width: `${recipient.health}%`
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            });

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            });

            renderedSpritesBattle.splice(1, 1);
          }
        });

        break;
      }

      case 'Tackle': {
        const tl = gsap.timeline();

        console.log(" health after attack", recipient.health);

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        const healthElement = document.querySelector(healthBar) as HTMLElement;
        if (healthElement) {
          gsap.to(healthElement, {
            width: `${recipient.health}%`
          });
        }

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              });

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              });
            }
          })
          .to(this.position, {
            x: this.position.x
          });
        break;
      }
    }

  }

  faint() {

    gsap.to(this.position, {
      y: this.position.y + 20,
      duration: 1
    })
    gsap.to(this, {
      opacity: 0
    })

  }


}