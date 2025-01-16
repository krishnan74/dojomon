import { useRef, useEffect, useState } from "react";
import { Boundary, Monster, Player, Position } from "./interfaces";
import { Collision } from "../assets/collisionData";
import { BattleZoneData } from "../assets/battleZoneData";

const GameCanvas = ({ pokeballPosition }: { pokeballPosition: Position }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = { w: false, a: false, s: false, d: false }; // External keys object
  const backgroundPosition = { x: -430, y: -480 }; // External position object
  const offset = { x: -430, y: -480 }; // External offset object
  const battleBackgroundPosition = { x: 0, y: 0 }; // External battle position object
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [battleZone, setBattleZone] = useState<Boundary[]>([]);
  const [battle, setBattle] = useState({ initiate: false });
  const [move, setMove] = useState<string | null>(null);

  let animationId: number;
  let battleAnimationId :number;
  let isAnimating = false;
  // let battle = { initiate: false }


  useEffect(() => {
    const collisionMap: number[][] = [];
    for (let i = 0; i < Collision.length; i += 160) {
      collisionMap.push(Collision.slice(i, i + 160));
    }
    const boundaryInstances: Boundary[] = [];
    collisionMap.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1025) {
          boundaryInstances.push(
            new Boundary({
              position: {
                x: colIndex * Boundary.width + offset.x,
                y: rowIndex * Boundary.height + offset.y,
              },
            })
          );
        }
      });
    });


    const battleMap: number[][] = [];
    for (let i = 0; i < BattleZoneData.length; i += 160) {
      battleMap.push(BattleZoneData.slice(i, i + 160));
    }

    const battleZoneInstances: Boundary[] = [];
    battleMap.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1025) {
          battleZoneInstances.push(
            new Boundary({
              position: {
                x: colIndex * Boundary.width + offset.x,
                y: rowIndex * Boundary.height + offset.y,
              },
            })
          );
        }
      });
    });
    setBoundaries(boundaryInstances);
    setBattleZone(battleZoneInstances);
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const viewportSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const backgroundImage = new Image();
    backgroundImage.src = "../assets/dojomon-base-map.png";

    const playerImage = new Image();
    playerImage.src = "../assets/playerSprites/playerUp.png";

    const playerDown = new Image();
    playerDown.src = "../assets/playerSprites/playerDown.png";

    const playerLeft = new Image();
    playerLeft.src = "../assets/playerSprites/playerLeft.png";

    const playerRight = new Image();
    playerRight.src = "../assets/playerSprites/playerRight.png";

    const pokeballImage = new Image();
    pokeballImage.src = "../assets/pokeball.png";

    const battleZoneImage = new Image();
    battleZoneImage.src = "../assets/battleBackground.png";

    const myPetImage = new Image();
    myPetImage.src = "../assets/embySprite.png  ";

    const enemyImage = new Image();
    enemyImage.src = "../assets/draggleSprite.png";

    const player = new Player({
      position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2,
      },
      image: playerDown,
      frames: { max: 4 },
      sprites: {
        up: playerImage,
        left: playerLeft,
        right: playerRight,
        down: playerDown
      },
    });

    const myPet = new Monster({
      position: {
        x: canvas.width / 3.5,
        y: canvas.height / 2 + 50,
      },
      image: myPetImage,
      frames: { max: 4 },
      sprites: {
        up: myPetImage,
        left: myPetImage,
        right: myPetImage,
        down: myPetImage
      },
      animate: true
    });

    const enemy = new Monster({
      position: {
        x: canvas.width / 1.3,
        y: canvas.height / 5,
      },
      image: enemyImage,
      frames: { max: 4 },
      sprites: {
        up: enemyImage,
        left: enemyImage,
        right: enemyImage,
        down: enemyImage
      },
      animate: true,
      isEnemy: true
    });
    // Handle player movement
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys] !== undefined)
        keys[e.key as keyof typeof keys] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys[e.key as keyof typeof keys] !== undefined)
        keys[e.key as keyof typeof keys] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const testBoundary = new Boundary({ position: { x: 830, y: 780 } });

    const movables = [
      { position: backgroundPosition },
      ...boundaries.map((boundary) => ({ position: boundary.position })),
      ...battleZone.map((battleZone) => ({ position: battleZone.position })),
      testBoundary,
    ]

    function rectangularCollision({
      rectangle1,
      rectangle2,
    }: {
      rectangle1: { position: { x: number; y: number }; width: number; height: number };
      rectangle2: { position: { x: number; y: number }; width: number; height: number };
    }): boolean {
      return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
      );
    }


    const update = () => {
      let moving = true;
      player.moving = false;

      if (!battle.initiate) {
        for (let i = 0; i < battleZone.length; i++) {
          const battleZoneSq = battleZone[i];
          const overlappingArea = (Math.min(
            player.position.x + player.width,
            battleZoneSq.position.x + battleZoneSq.width
          ) -
            Math.max(player.position.x, battleZoneSq.position.x)) *
            (Math.min(
              player.position.y + player.height,
              battleZoneSq.position.y + battleZoneSq.height
            ) -
              Math.max(player.position.y, battleZoneSq.position.y))
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: battleZoneSq
            })
            && overlappingArea > (player.width * player.height) / 2
          ) {
            console.log("collision with battleZone");
            setBattle({ initiate: true });
            // cancelAnimationFrame(animationId);

            return;
          }
          if (battle.initiate) break;
        }
      }
      const movePlayer = (dx: number, dy: number) => {
        // Check collision with all boundaries
        for (let i = 0; i < boundaries.length; i++) {
          const boundary = boundaries[i];
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {
                ...boundary,
                position: {
                  x: boundary.position.x + dx,
                  y: boundary.position.y + dy,
                },
              },
            })
          ) {

            moving = false;
            break;
          }
        }

        // console.log(animationId);

        // Move if no collision
        if (moving) {
          movables.forEach((movable) => {
            movable.position.x += dx;
            movable.position.y += dy;
          });
        }
      };


      // Movement logic
      if (keys.w) {
        player.moving = true
        player.image = player.sprites.up;
        movePlayer(0, 10)
      } // Move up
      if (keys.a) {
        player.moving = true
        player.image = player.sprites.left;
        movePlayer(10, 0);
      } // Move left
      if (keys.s) {
        player.moving = true
        player.image = player.sprites.down;
        movePlayer(0, -10);
      } // Move down
      if (keys.d) {
        player.moving = true
        player.image = player.sprites.right;
        movePlayer(-10, 0);
      }// Move right
    };


    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);


      // Draw background
      ctx.drawImage(
        backgroundImage,
        backgroundPosition.x,
        backgroundPosition.y
      );

      boundaries.forEach((boundary) => {
        boundary.draw(ctx)
      });

      battleZone.forEach((battleZoneSq) => {
        battleZoneSq.draw(ctx)
      })

      // Draw player
      // ctx.drawImage(
      //   playerImage,
      //   0,
      //   0,
      //   playerImage.width / 4,
      //   playerImage.height,
      //   canvas.width / 2 - playerImage.width / 4 / 2,
      //   canvas.height / 2 - playerImage.height / 2,
      //   playerImage.width / 4,
      //   playerImage.height
      // );
      player.draw(ctx);

      // Draw pokeball
      const pokeballScreenX = pokeballPosition.x + backgroundPosition.x;
      const pokeballScreenY = pokeballPosition.y + backgroundPosition.y;

      ctx.drawImage(
        pokeballImage,
        0,
        0,
        pokeballImage.width,
        pokeballImage.height,
        pokeballScreenX,
        pokeballScreenY,
        pokeballImage.width / 18,
        pokeballImage.height / 18
      );
    };

    const updateBattle = () => {
    
      if (move === "tackle") {
        console.log("Tackle used!");
        if (isAnimating) return; // Avoid triggering another animation while one is running
        isAnimating = true;

        enemy.attack({ attack: {
          name: "tackle",
          damage: 100,
          type: "Normal"
        }, recipient:myPet  });
      }
    };

    const renderBattle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        battleZoneImage,
        battleBackgroundPosition.x,
        battleBackgroundPosition.y,
        canvas.width,
        canvas.height
      );
      myPet.draw(ctx);
      enemy.draw(ctx);
    };

    const gameBattleLoop = () => {
      updateBattle();
      renderBattle();
      battleAnimationId = requestAnimationFrame(gameBattleLoop);
    };

    // MAIN LOOP DONT FORGET TO UNCOMMENT
    // Watch for battle state changes
    if (battle.initiate) {
      battleZoneImage.onload = () => {
        cancelAnimationFrame(animationId); // Stop any previous animation loops
        gameBattleLoop(); // Start battle loop
      };
    } else {
      // Resume normal gameplay if battle is not initiated
      cancelAnimationFrame(battleAnimationId);
      const gameLoop = () => {
        update();
        render();
        animationId = requestAnimationFrame(gameLoop);
      };

      backgroundImage.onload = () => {
        playerImage.onload = () => {
          gameLoop();
        };
      };
    }
    // MAIN LOOP DONT FORGET TO UNCOMMENT

    // battleZoneImage.onload = () => {
    //   // cancelAnimationFrame(animationId); // Stop any previous animation loops
    //   gameBattleLoop(); // Start battle loop
    // };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pokeballPosition, boundaries, battleZone, battle.initiate, move,battle]);

  const handleTackle = () => {
    setMove("tackle");
    console.log("Tackle move initiated");
  }

  return (
    <div className="">
      <div
        className={`w-full h-full absolute pointer-events-none ${battle.initiate ? "flash-box" : ""
          }`}
      ></div>
      <>
      <div className="absolute bg-white h-[80px] w-[200px] border-4 border-black top-12 left-12 p-3">
        <h1 className="font-bold">Draggle</h1>
        <div className="relative mt-2">
          <div className="h-2 bg-slate-400"></div>
          <div id="enemy-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
        </div>
      </div>

      <div className="absolute  bg-white h-[80px] w-[200px] border-4 border-black bottom-32 right-12 p-3">
        <h1 className="font-bold">Emby</h1>
        <div className="relative mt-2">
          <div className="h-2 bg-slate-400"></div>
          <div id="player-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
        </div>
      </div>
  <div className="bg-white border-2 border-black absolute w-full h-[100px] bottom-0 left-0 flex">
        <div className="w-4/5 flex">
          <button className="w-1/2 h-full bg-blue-500 text-white font-bold hover:bg-blue-700"
            onClick={handleTackle}>
            Tackle
          </button>
          <button className="w-1/2 h-full bg-red-500 text-white font-bold hover:bg-red-700">
            Attack
          </button>
        </div>
        <div className="w-1/5 flex items-center justify-center bg-gray-200 border-l-2 border-black">
          <h1 className="text-center font-bold text-lg">Attack Type</h1>
        </div>
      </div>
      </>
      
      <canvas ref={canvasRef} />
    

    </div>
  );

};

export default GameCanvas;
