import React, { useContext, useState, useEffect, useRef } from "react";
import { useAccount } from "@starknet-react/core";
import { useParams, useLocation } from "react-router-dom";
import { DojoContext } from "@/dojo-sdk-provider";
import { useLobbyData } from "@/hooks/useLobbyData";
import { useMyDojomonData } from "@/hooks/useMyDojomonData";
import { useOpponentDojomonData } from "@/hooks/useOpponentDojomonData";
import { useMovesData } from "@/hooks/useMovesData";
import { felt252ToString, getRandomInt } from "@/lib/utils";
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
  const isAgainstAI = query.get("ai");

  const { lobbySubscribeData, lobbyQueryData } = useLobbyData(
    address,
    lobbyCode
  );

  // States for player stats and battle management
  const [myStats, setMyStats] = useState<Player | null>(null);
  const [opponentStats, setOpponentStats] = useState<Player | null>(null);
  const [attacked, setAttacked] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [gameOver, setGameOver] = useState<string | null>(null); // Track game result

  // Fetch Dojomon and Moves data
  const { myDojomonQueryData, myDojomonSubscribeData } = useMyDojomonData(
    address,
    selected_dojomon_id
  );
  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(address, opponent_dojomon_id);
  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

  const myDojomonMaxHealth = myDojomonQueryData?.health;
  const opponentDojomonMaxHealth = opponentDojomonQueryData?.health;

  const [turn, setTurn] = useState("player");

  // Canvas setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const battleAnimationIdRef = useRef<number | null>(null);
  const viewportSize = { width: 1200, height: 650 };

  // Effect to sync lobby and player stats
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

  // Effect to track data loading
  useEffect(() => {
    if (myDojomonQueryData && opponentDojomonQueryData && movesQueryData) {
      setIsDataLoaded(true);
    }
  }, [myDojomonQueryData, opponentDojomonQueryData, movesQueryData]);

  // Game Over logic
  useEffect(() => {
    if (myDojomonQueryData?.health === 0) {
      setGameOver("You Lost!");
    }
    if (opponentDojomonQueryData?.health === 0) {
      setGameOver("You Won!");
    }
  }, [myDojomonQueryData, opponentDojomonQueryData]);

  // Battle Animation logic
  useEffect(() => {
    if (!isDataLoaded) return;

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
      if (turn == "player" && attacked) {
        setTimeout(() => {
          myPet.attack({
            attack: { name: "Fireball", damage: 25, type: "Fire" },
            recipient: enemy,
            //@ts-expect-error
            renderedSpritesBattle,
          });
        }, 3000);

        setTurn("enemy");

        setAttacked(false);
      }

      if (isAgainstAI === "true" && turn == "enemy" && attacked) {
        setTimeout(() => {
          enemy.attack({
            attack: { name: "Fireball", damage: 25, type: "Fire" },
            recipient: myPet,
            //@ts-expect-error
            renderedSpritesBattle,
          });
        }, 3000);

        setTurn("enemy");

        setAttacked(false);
      }
    };

    if (isAgainstAI === "true" && turn == "enemy") {
      client.battle.attack(
        account!,
        lobbyCode!,
        opponentDojomonQueryData?.dojomon_id!,
        myDojomonQueryData?.dojomon_id!,
        //@ts-expect-error
        movesQueryData[getRandomInt(0, movesQueryData.length - 1)].models
          .dojomon.Move.id,
        true
      );
    }

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
  }, [isDataLoaded, attacked]);

  if (!isDataLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-4xl">{gameOver}</h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Player Stats */}
      <div className="absolute bg-white h-[120px] w-[20%] border-4 border-black top-12 left-12 p-3">
        <h1 className="font-bold">
          {felt252ToString(myDojomonQueryData?.name)}
        </h1>
        <p>Level: {myDojomonQueryData?.level.toString()}</p>
        <div className="relative mt-2">
          <div
            className="h-2 bg-gray-300 rounded-full absolute"
            style={{ width: "100%" }}
          ></div>
          <div
            className="h-2 bg-green-500 rounded-full absolute"
            style={{
              width: `${
                (Number(myDojomonSubscribeData?.health ?? myDojomonMaxHealth) /
                  Number(myDojomonMaxHealth)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Opponent Stats */}
      <div className="absolute bg-white h-[120px] w-[20%] border-4 border-black top-12 right-12 p-3">
        <h1 className="font-bold">
          {felt252ToString(opponentDojomonQueryData?.name)}
        </h1>
        <p>Level: {opponentDojomonQueryData?.level.toString()}</p>
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
                  opponentDojomonSubscribeData?.health ??
                    opponentDojomonMaxHealth
                ) /
                  Number(opponentDojomonMaxHealth)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Moves */}
      <div className="absolute w-full h-[150px] bottom-0 bg-white flex border-t-4 border-black">
        {movesQueryData?.map((move_model, index) => (
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
        ))}
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
