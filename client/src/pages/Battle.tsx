import React, { useContext, useState, useEffect, useRef } from "react";
import { useAccount } from "@starknet-react/core";
import { useParams, useLocation } from "react-router-dom";
import { DojoContext } from "@/dojo-sdk-provider";
import { useMyDojomonData } from "@/hooks/useMyDojomonData";
import { useOpponentDojomonData } from "@/hooks/useOpponentDojomonData";
import { useMovesData } from "@/hooks/useMovesData";
import { felt252ToString, formatWithLeadingZeros } from "@/lib/utils";
import MoveCard from "@/components/MoveCard";
import { Monster } from "@/interfaces";
import { usePlayerAttackedData } from "@/hooks/events/usePlayerAttackedData";
import { Howl } from "howler";
import { useSpring, animated } from "react-spring";
import { useBattleEndedData } from "@/hooks/events/useBattleEndedData";
import { Move } from "@/typescript/models.gen";

// Custom hook to parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HealthBar = ({
  currentHealth,
  maxHealth,
}: {
  currentHealth: number;
  maxHealth: number;
}) => {
  console.log("currentHealth", currentHealth);
  console.log("maxHealth", maxHealth);
  const healthPercentage = (currentHealth / maxHealth) * 100;

  const animatedWidth = useSpring({
    width: `${healthPercentage}%`,
    from: { width: "100%" },
    config: { tension: 120, friction: 14 },
  });

  return (
    <div className="relative mt-2 h-2 bg-gray-300 rounded-full">
      <animated.div
        className="h-2 bg-green-500 rounded-full absolute"
        style={animatedWidth}
      />
    </div>
  );
};

const Battle = () => {
  const { client } = useContext(DojoContext);
  const { address, account } = useAccount();
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const query = useQuery();
  const selected_dojomon_id = query.get("my_dojomon_id");
  const opponent_dojomon_id = query.get("opponent_dojomon_id");

  const [attacked, setAttacked] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [battleMessage, setBattleMessage] = useState<string | null>(null);

  const { attackEventSubscribeData } = usePlayerAttackedData(
    address,
    lobbyCode
  );

  const { myDojomonQueryData, myDojomonSubscribeData } = useMyDojomonData(
    address,
    selected_dojomon_id
  );
  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(address, opponent_dojomon_id);

  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

  const [moves, setMoves] = useState<Move[]>([]);

  const { battleEndedSubscribeData } = useBattleEndedData(address, lobbyCode);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const myDojomonImage = "../assets/dojomons/back/"
  const opponentDojomonImage = "../assets/dojomons/front/"

  // Sound effects
  const moveSound = new Howl({
    src: ["../assets/audio/Battle ability.ogg"],
    volume: 0.7,
  });
  const victorySound = new Howl({
    src: ["../assets/audio/Battle victory.ogg"],
    volume: 0.7,
  });
  const defeatSound = new Howl({ src: ["/sounds/defeat.mp3"], volume: 0.7 });

  // Track loading status
  useEffect(() => {
    if (myDojomonQueryData && opponentDojomonQueryData && movesQueryData) {
      setIsDataLoaded(true);
      setMoves(movesQueryData);
    }
  }, [myDojomonQueryData, opponentDojomonQueryData, movesQueryData]);

  useEffect(() => {
    if (attackEventSubscribeData) {
      setAttacked(true);
      setBattleMessage(felt252ToString(attackEventSubscribeData.move.name));
      setTimeout(() => setBattleMessage(null), 1500);
    }
  }, [attackEventSubscribeData]);


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
      myPetImage.src = `${myDojomonImage}${formatWithLeadingZeros(myDojomonQueryData?.image_id)}.png`;
  
      const enemyImage = new Image();
      enemyImage.src = `${opponentDojomonImage}${formatWithLeadingZeros(opponentDojomonQueryData?.image_id)}.png`;

      // console.log("myPetImage", enemyImage);
  
      const myDojomon = new Monster({
        position: {
          x: canvas.width / 3.6,
          y: canvas.height / 2 -10,
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
        if(formatWithLeadingZeros(myDojomonQueryData?.health)<=0){        
          myDojomon.faint();
          return;
        }
        if(formatWithLeadingZeros(opponentDojomonQueryData?.health)<=0){
          enemyDojomon.faint();
          return;
        }

        if (attackEventSubscribeData) {
          setAttacked(true);

          
          // setBattleMessage(felt252ToString(attackEventSubscribeData.move.name));
          // setTimeout(() => setBattleMessage(null), 1500);

          // IF enemy move
          enemyDojomon.attack({
            // attack:attackEventSubscribeData.move,
            attack:{
              name: "Fireball",
              damage: 40,
              type: "normal"
            },
            recipient: myDojomon,
            // @ts-expect-error
            renderedSpritesBattle: renderedSpritesBattle
          });

          // IF player move
           myDojomon.attack({
            // attack:attackEventSubscribeData.move,
            attack:{
              name: "Fireball",
              damage: 40,
              type: "normal"
            },
            recipient: enemyDojomon,
            // @ts-expect-error
            renderedSpritesBattle: renderedSpritesBattle
           });
        }
  
      };
  
      const renderBattle = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          battleZoneImage,
        0,0
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
  
  
    }, [myDojomonQueryData, opponentDojomonQueryData,movesQueryData,isDataLoaded,attackEventSubscribeData]);

  // Handle game over logic
  useEffect(() => {
    if (battleEndedSubscribeData?.won_dojomon_id === selected_dojomon_id) {
      setGameOver("You Won!");
      defeatSound.play();
    } else if (
      battleEndedSubscribeData?.lost_dojomon_id === selected_dojomon_id
    ) {
      setGameOver("You Lost!");
    }
  }, [battleEndedSubscribeData]);

  if (!isDataLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black to-gray-800 text-white text-center">
        <h1 className="text-4xl font-bold mb-6 animate-bounce">{gameOver}</h1>
        <button
          className="px-6 py-3 bg-green-500 text-black rounded-lg font-bold hover:bg-green-400"
          onClick={() => "/game"} // Or navigate back to main menu
        >
          Back to Town
        </button>
      </div>
    );
  }

  // console.log(myDojomonQueryData)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500">
      <canvas ref={canvasRef} className="z-10"/>
      {/* Player Stats */}
      <div className="absolute bg-white h-[120px] w-[20%] border-4 border-black top-12 left-12 p-3 z-10">
        <h1 className="font-bold">
          {felt252ToString(myDojomonQueryData?.name)}
        </h1>
        <p>Level: {myDojomonQueryData?.level.toString()}</p>
        <HealthBar
          currentHealth={Number(
            myDojomonSubscribeData?.health ?? myDojomonQueryData?.health
          )}
          maxHealth={Number(
            myDojomonSubscribeData?.max_health ?? myDojomonQueryData?.max_health
          )}
        />
      </div>

      {/* Opponent Stats */}
      <div className="absolute bg-white h-[120px] w-[20%] border-4 border-black bottom-[170px] right-12 p-3 z-10">
        <h1 className="font-bold">
          {felt252ToString(opponentDojomonQueryData?.name)}
        </h1>
        <p>Level: {opponentDojomonQueryData?.level.toString()}</p>
        <HealthBar
          currentHealth={Number(
            opponentDojomonSubscribeData?.health ??
              opponentDojomonQueryData?.health
          )}
          maxHealth={Number(
            opponentDojomonSubscribeData?.max_health ??
              opponentDojomonQueryData?.max_health
          )}
        />
      </div>

      {/* <img
        src={`https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${formatWithLeadingZeros(
          myDojomonQueryData?.image_id ?? 0
        )}.png`}
        alt=""
      /> */}
      

      {/* Moves */}
      <div className="absolute w-full h-[150px] bottom-0 bg-white flex border-t-4 border-black z-10">
        {moves?.map((move_model, index) => (
          <MoveCard
            // @ts-expect-error
            move={move_model.models.dojomon.Move}
            client={client}
            account={account}
            lobby_code={lobbyCode!}
            myDojomonId={myDojomonQueryData?.dojomon_id!}
            opponentDojomonId={opponentDojomonQueryData?.dojomon_id!}
            in_battle={true}
            setAttacked={() => {
              setAttacked(true);
              moveSound.play();
            }}
          />
        ))}
      </div>

      {/* Battle Messages */}
      {battleMessage && (
        <div className="absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] bg-black bg-opacity-70 text-white px-6 py-4 rounded-lg text-xl animate-pulse z-20">
          {battleMessage}
        </div>
      )}

    </div>
  );
};

export default Battle;
