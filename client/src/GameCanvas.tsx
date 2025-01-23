import { useRef, useEffect, useState } from "react";
import { Boundary, Crop, Monster, Player, Position, Sprite } from "./interfaces";
import { Collision } from "../public/assets/collisionData";
import { BattleZoneData } from "../public/assets/battleZoneData";
import { FarmZoneData } from "../public/assets/farmData";
import Profile from "../assets/pfp.jpg"
import Trophy from "../assets/trophy.png";
import Gold from "../assets/gold.png";
import PokemonPfp from "../assets/pokemon_profile.png"
import BattleLogo from "../assets/battle.png"

const GameCanvas = ({ pokeballPosition }: { pokeballPosition: Position }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keys = { w: false, a: false, s: false, d: false }; // External keys object
  const backgroundPosition = { x: -400, y: -480 }; // External position object
  const offset = { x: -400, y: -480 }; // External offset object
  const battleBackgroundPosition = { x: 0, y: 0 }; // External battle position object
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [battleZone, setBattleZone] = useState<Boundary[]>([]);
  const [farmZone, setFarmZone] = useState<Crop[]>([]);
  const [battle, setBattle] = useState({ initiate: false });
  const [move, setMove] = useState<string | null>(null);
  const [isPokemonTabOpened, setIsPokemonTabOpened] = useState(false);
  const battleAnimationIdRef = useRef<number | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [farm, setFarm] = useState({ initiate: false });  

  let isAnimating = false;
  const renderedSpritesGame: Sprite[] = [];

  const attacks = {
    Tackle: {
      name: 'Tackle',
      damage: 10,
      type: 'Normal',
      
    },
    Fireball: {
      name: 'Fireball',
      damage: 25,
      type: 'Fire',
      
    }
  }


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

    const farmMap: number[][] = [];
    for (let i = 0; i < FarmZoneData.length; i += 160) {
      farmMap.push(FarmZoneData.slice(i, i + 160));
    }

    const farmZoneInstances: Crop[] = [];
    farmMap.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1025) {
          farmZoneInstances.push(
            new Crop({
              position: {
                x: colIndex * Crop.width + offset.x,
                y: rowIndex * Crop.height + offset.y,
              },
            })
          );
        }
      });
    });


    setBoundaries(boundaryInstances);
    setBattleZone(battleZoneInstances);
    setFarmZone(farmZoneInstances);
  }, [battle.initiate,farm.initiate]);


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
   
    const movables = [
      { position: backgroundPosition },
      ...boundaries.map((boundary) => ({ position: boundary.position })),
      ...battleZone.map((battleZone) => ({ position: battleZone.position })),
      ...farmZone.map((farmZone) => ({ position: farmZone.position })),
      ...renderedSpritesGame.map((sprite) => ({ position: sprite.position })),
    ]

    const renderedSpritesBattle = [myPet, enemy];
   


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
      console.log("battle", battle.initiate);
      let moving = true;
      player.moving = false;
      if(farm.initiate){
        // for (let i = 0; i < farmZone.length; i++) {
        //   const farmZoneSq = farmZone[i];
        //   const overlappingArea = (Math.min(
        //     player.position.x + player.width,
        //     farmZoneSq.position.x + farmZoneSq.width
        //   ) - Math.max(player.position.x, farmZoneSq.position.x)) *
        //     (Math.min(
        //       player.position.y + player.height,
        //       farmZoneSq.position.y + farmZoneSq.height
        //     ) - Math.max(player.position.y, farmZoneSq.position.y))
        //   if (
        //     rectangularCollision({
        //       rectangle1: player,
        //       rectangle2: farmZoneSq
        //     })
        //     && overlappingArea > (player.width * player.height) / 2
        //   ) {
        //     console.log("collision with farmZone");
        //     setFarm({ initiate: false });
        //     return;
        //   }
        // }

       
        // setFarm({initiate:false});
        
      }
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
            // if (animationIdRef.current !== null) {
            cancelAnimationFrame(animationIdRef.current);
            // }

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

      renderedSpritesGame.forEach((sprite) => {
        sprite.draw(ctx); 
      });

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
      // console.log(battle.initiate);
      if (!battle.initiate)
        return;
      if(myPet.health<=0 || enemy.health<=0){
        myPet.faint();
        setTimeout(() => {
          setBattle({initiate:false});
        },5000);
        return;
      }
      if (move!==null) {
        console.log("Tackle used!");
        if (isAnimating) return;
        isAnimating = true;
        // setBattle({ initiate: false });
        // setMove(null);
        const attack = attacks[move as keyof typeof attacks];
        console.log("attack game", attack);
        enemy.attack({
          attack:attack,
          recipient: myPet,
          renderedSpritesBattle: renderedSpritesBattle
        });
        setTimeout(() => {
          // Reset animation state after a delay
          isAnimating = false;
          // setBattle({ initiate: false });
          setMove(null); // Reset move
        }, 1000); // Adjust delay duration as per your animation timing
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
      renderedSpritesBattle.forEach((sprite) => {
        sprite.draw(ctx);
      });
    };

    const gameBattleLoop = () => {
      updateBattle();
      renderBattle();
      battleAnimationIdRef.current = requestAnimationFrame(gameBattleLoop);
      // console.log("battleAnimationId", battleAnimationIdRef.current);
    };

    // MAIN LOOP DONT FORGET TO UNCOMMENT
    // Watch for battle state changes
    if (battle.initiate) {
      battleZoneImage.onload = () => {
        // if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current); // Stop any previous animation loops
        // }
        gameBattleLoop(); // Start battle loop
      };
    } else {
      // Resume normal gameplay if battle is not initiated
      if (battleAnimationIdRef.current !== null) {
        cancelAnimationFrame(battleAnimationIdRef.current);
      }
      const gameLoop = () => {
        update();
        render();
        animationIdRef.current = requestAnimationFrame(gameLoop);
        // console.log("animationId", animationIdRef.current);

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
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      cancelAnimationFrame(battleAnimationIdRef.current);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pokeballPosition, boundaries, battleZone, battle.initiate, move]);

  const handleTackle = () => {
    if (move === null) { // Allow only when no ongoing attack
      setMove("Tackle");
      console.log("Tackle move initiated");
    }
  };

  const handleAttack = () => {
    if (move === null) { // Allow only when no ongoing attack
      setMove("Fireball");
      console.log("Attack move initiated");
    }
  }

  const handleFarm = () => {
    setFarm({ initiate: true });
    farmZone.forEach((farmZoneSq) => {
      farmZoneSq.grow(
        {renderedSpritesGame: renderedSpritesGame});
    });
    console.log("Farm initiated");
  }

  const handleHarvest = () => {
    farmZone.forEach((farmZoneSq) => {
      farmZoneSq.harvest(
        {renderedSpritesGame: renderedSpritesGame});
    });
    console.log("Harvest initiated");}

  return (
    <div className="">
      <div
        className={`w-full h-full absolute pointer-events-none ${battle.initiate ? "flash-box" : ""
          }`}
      ></div>
      {isPokemonTabOpened && (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="relative bg-white p-4 w-[700px] h-[400px] border-2 border-black overflow-auto">
      {/* Close Button */}
      <div className="absolute top-3 right-3 cursor-pointer" onClick={() => setIsPokemonTabOpened(false)}>
        <h1 className="font-black text-2xl font-pixel">X</h1>
      </div>

      {/* Content */}
      <div className="flex justify-center items-center space-x-4">
        <img
          src={PokemonPfp}
          className="h-[100px] w-[100px] rounded-full border-2 border-black object-cover"
          alt="Pokemon Profile"
        />
        <img
          src={PokemonPfp}
          className="h-[100px] w-[100px] rounded-full border-2 border-black object-cover"
          alt="Pokemon Profile"
        />
        <img
          src={PokemonPfp}
          className="h-[100px] w-[100px] rounded-full border-2 border-black object-cover"
          alt="Pokemon Profile"
        />
        <img
          src={PokemonPfp}
          className="h-[100px] w-[100px] rounded-full border-2 border-black object-cover"
          alt="Pokemon Profile"
        />
      </div>
    </div>
  </div>
)}

      {
        !battle.initiate &&
        <div>
          {/* Top Left */}
          <div className="absolute top-0 left-0 p-3 m-3 h-[70px] w-1/4 flex items-center bg-white border-2 border-black">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img src={Profile} alt="Profile" width={50} className="rounded-md" />
            </div>

            {/* Info Section */}
            <div className="ml-3 w-full">
              {/* Health Bar */}
              <div className="relative h-2 bg-slate-300  overflow-hidden mb-2">
                <div
                  className="absolute h-full bg-green-500"
                  style={{ width: '70%' }}
                ></div>
              </div>

              {/* Stats */}
              <div className="flex space-x-4 items-center">
                {/* Gold */}
                <div className="flex items-center space-x-1">
                  <img src={Gold} alt="Gold" width={20} />
                  <h2 className="text-sm font-medium font-pixel">20</h2>
                </div>
                {/* Trophy */}
                <div className="flex items-center space-x-1">
                  <img src={Trophy} alt="Trophy" width={18} />
                  <h2 className="text-sm font-medium font-pixel">20</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right */}
          <div className="absolute top-0 right-0 p-3 m-3 h-[70px] flex items-center">
            <div>
              <div className="" onClick={() => setIsPokemonTabOpened(!isPokemonTabOpened)}>
                <img src={PokemonPfp} width={70} className="rounded-full border-2 border-black" alt="" />
              </div>
              <div></div>
            </div>
          </div>

          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 p-3 m-3 h-[70px] flex items-center">
            <div>
              <img src={BattleLogo} alt="" width={70} className="bg-blue-500 border-2 border-black" />
            </div>
            <div className="bg-white p-2 ml-2">
              <button onClick={handleFarm}>Farm</button>
            </div>
            <div className="bg-white p-2 ml-2">
              <button onClick={handleHarvest}>Harvest</button>
            </div>
          </div>

        </div>
      }

      {battle.initiate && <>
        <div className="absolute bg-white h-[80px] w-[200px] border-4 border-black top-12 left-12 p-3">
          <h1 className="font-bold font-pixel">Draggle</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div id="enemy-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
          </div>
        </div>

        <div className="absolute  bg-white h-[80px] w-[200px] border-4 border-black bottom-32 right-12 p-3">
          <h1 className="font-bold font-pixel">Emby</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div id="player-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
          </div>
        </div>
        <div className="bg-white border-2 border-black absolute w-full h-[100px] bottom-0 left-0 flex">
          <div className="w-4/5 flex">
            <button className="w-1/2 h-full bg-blue-500 text-white font-bold hover:bg-blue-700 font-pixel"
              onClick={handleTackle}>
              Tackle
            </button>
            <button className="w-1/2 h-full bg-red-500 text-white font-bold hover:bg-red-700 font-pixel"
            onClick={handleAttack}>
              Attack
            </button>
          </div>
          <div className="w-1/5 flex items-center justify-center bg-gray-200 border-l-2 border-black">
            <h1 className="text-center font-bold text-lg font-pixel">Attack Type</h1>
          </div>
        </div>
      </>}

      <canvas ref={canvasRef} />

    </div>
  );

};

export default GameCanvas;
