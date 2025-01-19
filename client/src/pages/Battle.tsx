import React, { useContext, useState, useEffect, useRef } from "react";
import { useAccount } from "@starknet-react/core";
import { useParams, useLocation } from "react-router-dom";
import { DojoContext } from "@/dojo-sdk-provider";
import { useLobbyData } from "@/hooks/useLobbyData";
import { useMyDojomonData } from "@/hooks/useMyDojomonData";
import { useOpponentDojomonData } from "@/hooks/useOpponentDojomonData";
import { useMovesData } from "@/hooks/useMovesData";
import { felt252ToString } from "@/lib/utils";
import DojomonCard from "@/components/DojomonCard";
import MoveCard from "@/components/MoveCard";
import { Monster } from "@/interfaces";
import { BigNumberish } from "starknet";
import { Dojomon, Move } from "@/typescript/models.gen";

// Custom hook to parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Player interface
interface Player {
  address: string;
  name: string;
  gold: BigNumberish;
  level: BigNumberish;
  exp: BigNumberish;
  food: BigNumberish;
  trophies: BigNumberish;
}

const Battle = () => {
  const { client } = useContext(DojoContext);
  const { address, account } = useAccount();
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const query = useQuery();
  const selected_dojomon_id = query.get("my_dojomon_id");
  const opponent_dojomon_id = query.get("opponent_dojomon_id");

  const { lobbySubscribeData, lobbyQueryData } = useLobbyData(
    address,
    lobbyCode
  );

  // States for tracking players' stats
  const [myStats, setMyStats] = useState<Player | null>(null);
  const [opponentStats, setOpponentStats] = useState<Player | null>(null);

  // Fetch Dojomon data for the player and opponent
  const { myDojomonQueryData, myDojomonSubscribeData } = useMyDojomonData(
    address,
    selected_dojomon_id
  );
  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(address, opponent_dojomon_id);

  // Max health for Dojomon
  const myDojomonMaxHealth = myDojomonQueryData?.health;
  const opponentDojomonMaxHealth = opponentDojomonQueryData?.health;

  // Moves data for Dojomon actions
  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

  const [attacked, setAttacked] = useState(false);

  // Track when all data is loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // UseEffect for updating battle state based on lobby data
  useEffect(() => {
    const updateBattleState = () => {
      const lobby_data =
        lobbySubscribeData.lobby_code !== 0
          ? lobbySubscribeData
          : lobbyQueryData;

      if (lobby_data) {
        const isHost = lobby_data.host_player.address === address;
        setMyStats(isHost ? lobby_data.host_player : lobby_data.guest_player);
        setOpponentStats(
          isHost ? lobby_data.guest_player : lobby_data.host_player
        );
      }
    };

    if (address) updateBattleState();
  }, [lobbyQueryData, lobbySubscribeData, address]);

  // Data loaded effect
  useEffect(() => {
    if (myDojomonQueryData && opponentDojomonQueryData && movesQueryData) {
      setIsDataLoaded(true); // Set to true when all data is loaded
    }
  }, [myDojomonQueryData, opponentDojomonQueryData, movesQueryData]);

  // Game Over check based on health data
  useEffect(() => {
    if (
      myDojomonQueryData?.health === 0 ||
      opponentDojomonQueryData?.health === 0
    ) {
      console.log("Game Over");
    }
  }, [myDojomonQueryData, opponentDojomonQueryData]);

  // Canvas setup for battle animations
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const battleAnimationIdRef = useRef<number | null>(null);
  const viewportSize = { width: 1200, height: 650 };

  useEffect(() => {
    if (!isDataLoaded) return; // Don't run until data is loaded

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const myPetImage = new Image();
    myPetImage.src = `../assets/dojomons/back/${felt252ToString(
      myDojomonQueryData?.name
    ).toUpperCase()}.png`;

    const enemyImage = new Image();
    enemyImage.src = `../assets/dojomons/front/${felt252ToString(
      opponentDojomonQueryData?.name
    ).toUpperCase()}.png`;

    const battleZoneImage = new Image();
    battleZoneImage.src = "../assets/battleBackground.png";

    const myPet = new Monster({
      position: { x: canvas.width / 3.5, y: canvas.height / 2 + 50 },
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

    const enemy = new Monster({
      position: { x: canvas.width / 1.3, y: canvas.height / 5 },
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

    const renderedSpritesBattle = [myPet, enemy];

    const updateBattle = () => {
      if (enemy.health <= 0) {
        enemy.faint();
        return;
      }
      if (attacked) {
        // Logic to trigger an attack

        setTimeout(() => {
          myPet.attack({
            attack: { name: "Fireball", damage: 25, type: "Fire" },
            recipient: enemy,
            //@ts-expect-error
            renderedSpritesBattle: renderedSpritesBattle,
          });
        }, 3000);

        setAttacked(false);
        // enemy.attack({
        //   attack: { name: "Fireball", damage: 25, type: "Fire" },
        //   recipient: myPet,
        //   renderedSpritesBattle: renderedSpritesBattle,
        // });
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
      battleAnimationIdRef.current = requestAnimationFrame(gameBattleLoop);
    };

    battleZoneImage.onload = () => {
      gameBattleLoop();
    };
  }, [isDataLoaded, attacked]); // Run only when data is fully loaded

  if (!isDataLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Player Health Bars */}
      <div className="absolute bg-white h-[80px] w-[20%] border-4 border-black top-12 left-12 p-3">
        <h1 className="font-bold font-pixel">
          {felt252ToString(myDojomonQueryData?.name)}
        </h1>
        <div className="relative mt-2">
          <div
            className="h-2 bg-gray-300 rounded-full absolute"
            style={{ width: "100%" }}
          ></div>
          <div
            className="h-2 bg-green-500 rounded-full absolute"
            style={{
              width: `${
                (Number(
                  myDojomonSubscribeData
                    ? myDojomonSubscribeData?.health
                    : myDojomonMaxHealth
                ) /
                  Number(myDojomonMaxHealth)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Opponent Health Bars */}
      <div className="absolute bg-white h-[80px] w-[20%] border-4 border-black bottom-[200px] right-12 p-3">
        <h1 className="font-bold font-pixel">
          {felt252ToString(opponentDojomonQueryData?.name)}
        </h1>
        <div className="relative mt-2">
          <div
            className="h-2 bg-gray-300 rounded-full absolute"
            style={{ width: "100%" }}
          ></div>
          <div
            className="h-2  bg-green-500 rounded-full absolute"
            style={{
              width: `${
                (Number(
                  opponentDojomonSubscribeData
                    ? opponentDojomonSubscribeData?.health
                    : opponentDojomonMaxHealth
                ) /
                  Number(opponentDojomonMaxHealth)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Move Cards */}
      <div className="bg-white border-2 border-black absolute w-full h-[150px] bottom-0 left-0 flex">
        {movesQueryData && movesQueryData.length > 0 ? (
          movesQueryData.map((move_model, index) => (
            <MoveCard
              key={index}
              // @ts-expect-error
              move={move_model.models.dojomon.Move}
              client={client}
              account={account}
              lobby_code={lobbyCode!}
              myDojomonId={myDojomonQueryData?.dojomon_id!}
              opponentDojomonId={opponentDojomonQueryData?.dojomon_id!}
              in_battle={true}
              setAttacked={setAttacked}
            />
          ))
        ) : (
          <p className="text-white text-center">Loading Moves...</p>
        )}
      </div>

      {/* Battle Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: viewportSize.width, height: viewportSize.height }}
      />
    </div>
  );
};

export default Battle;
