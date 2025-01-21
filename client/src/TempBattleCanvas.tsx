import React, { useEffect, useRef } from 'react'
import { Monster } from './classes';

const TempBattleCanvas = () => {


  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [move, setMove] = React.useState<string | null>(null);
  // const [isAnimating, setIsAnimating] = React.useState<boolean>(false);

  const myDojomonImage = "../assets/dojomons/back/"
  const opponentDojomonImage = "../assets/dojomons/front/"

  let isAnimating = false;


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

    },
    Waterball: {
      name: 'Waterball',
      damage: 25,
      type: 'Fire',

    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    console.log("canvas", canvas);
    const viewportSize = {
      width: 1200,
      height: 600,
    };

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const battleZoneImage = new Image();
    battleZoneImage.src = "../assets/game-assets/battleBackground1.png";

    const myPetImage = new Image();
    myPetImage.src = `${myDojomonImage}007.png`;

    const enemyImage = new Image();
    enemyImage.src = `${opponentDojomonImage}004.png`;

    console.log("myPetImage", enemyImage);

    const myDojomon = new Monster({
      position: {
        x: canvas.width / 3.6,
        y: canvas.height / 2 - 10,
      },
      image: myPetImage,
      frames: { max: 1 },
      sprites: {
        up: myPetImage,
        left: myPetImage,
        right: myPetImage,
        down: myPetImage
      },
      animate: true
    });

    const enemyDojomon = new Monster({
      position: {
        x: canvas.width / 1.3,
        y: canvas.height / 10,
      },
      image: enemyImage,
      frames: { max: 1 },
      sprites: {
        up: enemyImage,
        left: enemyImage,
        right: enemyImage,
        down: enemyImage
      },
      animate: true,
      isEnemy: true
    });

    const renderedSpritesBattle = [myDojomon, enemyDojomon];



    const updateBattle = () => {



      if (move !== null) {
        if (isAnimating) return;
        isAnimating = true
        const attack = attacks[move as keyof typeof attacks];
        console.log("attack", attack);
        myDojomon.attack({
          attack: attack,
          recipient: enemyDojomon,
          renderedSpritesBattle: renderedSpritesBattle
        });
        setTimeout(() => {
          // Reset animation state after a delay
          isAnimating = false
          setMove(null); // Reset move
        }, 1000); // Adjust delay duration as per your animation timing
      }

    };

    const renderBattle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        battleZoneImage,
        0, 0
      );
      renderedSpritesBattle.forEach((sprite) => {
        sprite.draw(ctx);
      });
    };

    const gameBattleLoop = () => {
      updateBattle();
      renderBattle();
      requestAnimationFrame(gameBattleLoop);
    };


    battleZoneImage.onload = () => {
      gameBattleLoop();
    };


  }, [move,isAnimating]);

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

  const handleAttackWater = () => {
    if (move === null) { // Allow only when no ongoing attack
      setMove("Waterball");
      console.log("AttackWater move initiated");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500">

      <>
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
        <div className="bg-white border-2 border-black absolute w-full h-[150px] bottom-0 left-0 flex">
          <div className="w-4/5 flex">
            <button className="w-1/2 h-full bg-green-500 text-white font-bold hover:bg-blue-700 font-pixel"
              onClick={handleTackle}>
              Tackle
            </button>
            <button className="w-1/2 h-full bg-red-500 text-white font-bold hover:bg-red-700 font-pixel"
              onClick={handleAttack}>
              Attack
            </button>
            <button className="w-1/2 h-full bg-blue-500 text-white font-bold hover:bg-red-700 font-pixel"
              onClick={handleAttackWater}>
              Attack Water
            </button>
          </div>
          <div className="w-1/5 flex items-center justify-center bg-gray-200 border-l-2 border-black">
            <h1 className="text-center font-bold text-lg font-pixel">Attack Type</h1>
          </div>
        </div>
      </>
      <canvas ref={canvasRef} className="" />
    </div>
  );
};



export default TempBattleCanvas