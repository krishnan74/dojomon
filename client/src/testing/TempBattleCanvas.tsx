import React, { useEffect, useRef, useState } from "react";
import { Monster } from "../classes";

const TempBattleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [move, setMove] = React.useState<string | null>(null);
  const [isCatching, setIsCatching] = useState<boolean>(false);

  const myDojomonImage = "../assets/dojomons/back/";
  const opponentDojomonImage = "../assets/dojomons/front/";

  let isAnimating = false;

  const attacks = {
    Tackle: {
      name: "Tackle",
      damage: 10,
      type: "Normal",
    },
    Fireball: {
      name: "Fireball",
      damage: 25,
      type: "Fire",
    },
    Waterball: {
      name: "Waterball",
      damage: 25,
      type: "Water",
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

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
        down: myPetImage,
      },
      animate: true,
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
        down: enemyImage,
      },
      animate: true,
      isEnemy: true,
    });

    const renderedSpritesBattle = [myDojomon, enemyDojomon];

    // Animation for catching Dojomon
    const catchAnimation = () => {
      let ballSize = 20;
      let ballX = canvas.width / 2 - ballSize / 2;
      let ballY = canvas.height - 80;
      let targetX = enemyDojomon.position.x + 20; // Slight offset from enemy
      let targetY = enemyDojomon.position.y + 20;

      const animateCatch = () => {
        if (!isCatching) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(battleZoneImage, 0, 0);

        // Draw Pokéball (animated catching ball)
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
        ctx.fillStyle = "#ff0000"; // Pokéball color (red)
        ctx.fill();
        ctx.stroke();

        // Move the ball towards the enemy
        if (ballX < targetX) ballX += 5;
        if (ballY < targetY) ballY += 5;
        if (ballSize < 40) ballSize += 1;

        // If ball reaches enemy, simulate capture and stop animation
        if (ballX >= targetX && ballY >= targetY) {
          setIsCatching(false);
          setMove(null); // Reset move state
          // Simulate catch completion
          alert("Dojomon Caught!");
        }

        requestAnimationFrame(animateCatch);
      };
      animateCatch();
    };

    const updateBattle = () => {
      if (move !== null) {
        if (isAnimating) return;
        isAnimating = true;
        const attack = attacks[move as keyof typeof attacks];
        myDojomon.attack({
          attack: attack,
          recipient: enemyDojomon,
          renderedSpritesBattle: renderedSpritesBattle,
        });
        setTimeout(() => {
          isAnimating = false;
          setMove(null);
        }, 1000);
      }
    };

    const renderBattle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(battleZoneImage, 0, 0);
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
  }, [move, isCatching]);

  const handleTackle = () => {
    if (move === null) {
      setMove("Tackle");
    }
  };

  const handleAttack = () => {
    if (move === null) {
      setMove("Fireball");
    }
  };

  const handleAttackWater = () => {
    if (move === null) {
      setMove("Waterball");
    }
  };

  const handleCatch = () => {
    if (move === null && !isCatching) {
      setIsCatching(true); // Start the catch animation
      catchAnimation(); // Trigger the catch animation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500">
      <>
        <div className="absolute bg-white h-[80px] w-[200px] border-4 border-black top-12 left-12 p-3">
          <h1 className="font-bold font-pixel">Draggle</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div
              id="enemy-health-bar"
              className="h-2 bg-green-500 absolute top-0 right-0 left-0"
            ></div>
          </div>
        </div>

        <div className="absolute  bg-white h-[80px] w-[200px] border-4 border-black bottom-32 right-12 p-3">
          <h1 className="font-bold font-pixel">Emby</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div
              id="player-health-bar"
              className="h-2 bg-green-500 absolute top-0 right-0 left-0"
            ></div>
          </div>
        </div>

        <div className="bg-white border-2 border-black absolute w-full h-[150px] bottom-0 left-0 flex">
          <div className="w-4/5 flex">
            <button
              className="w-1/2 h-full bg-green-500 text-white font-bold hover:bg-blue-700 font-pixel"
              onClick={handleTackle}
            >
              Tackle
            </button>
            <button
              className="w-1/2 h-full bg-red-500 text-white font-bold hover:bg-red-700 font-pixel"
              onClick={handleAttack}
            >
              Attack
            </button>
            <button
              className="w-1/2 h-full bg-blue-500 text-white font-bold hover:bg-red-700 font-pixel"
              onClick={handleAttackWater}
            >
              Attack Water
            </button>
            <button
              className="w-1/2 h-full bg-yellow-500 text-white font-bold hover:bg-red-700 font-pixel"
              onClick={handleCatch}
            >
              Catch Dojomon
            </button>
          </div>
        </div>
      </>
      <canvas ref={canvasRef} className="" />
    </div>
  );
};

export default TempBattleCanvas;
