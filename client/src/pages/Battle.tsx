import React, { useContext, useState, useEffect, useRef } from "react";
import { useDojomonData } from "@/hooks/useDojomonData";
import { useAccount } from "@starknet-react/core";
import DojomonCard from "@/components/DojomonCard";
import { DojoContext } from "@/dojo-sdk-provider";
import { useParams } from "react-router-dom";
import { useLobbyData } from "@/hooks/useLobbyData";
import { BigNumberish } from "starknet";
import { felt252ToString } from "@/lib/utils";
import { Dojomon, DojomonStruct, Move } from "@/typescript/models.gen";
import { useMovesData } from "@/hooks/useMovesData";
import MoveCard from "@/components/MoveCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { usePlayerAttackedData } from "@/hooks/usePlayerAttackedData";
import { useOpponentDojomonData } from "@/hooks/useOpponentDojomonData";
import { useMyDojomonData } from "@/hooks/useMyDojomonData";
import { Monster } from "@/interfaces";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
  const { client } = useContext(DojoContext); // Access the Dojo SDK client
  const { address, account } = useAccount(); // Get user account details
  const { lobbyCode } = useParams<{ lobbyCode: string }>(); // Extract lobby code from URL params
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const battleAnimationIdRef = useRef<number | null>(null);

  let query = useQuery();
  let selected_dojomon_id = query.get("my_dojomon_id");
  let opponent_dojomon_id = query.get("opponent_dojomon_id");

  console.log(selected_dojomon_id, opponent_dojomon_id);
  

  const { lobbySubscribeData, lobbyQueryData } = useLobbyData(
    account?.address,
    lobbyCode
  ); // Fetch lobby data

  const [myStats, setMyStats] = useState<Player | null>(null);
  const [opponentStats, setOpponentStats] = useState<Player | null>(null);

  const { myDojomonQueryData, myDojomonSubscribeData } = useMyDojomonData(
    account?.address,
    selected_dojomon_id
  );

  console.log(myDojomonQueryData);
  
  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(account?.address, opponent_dojomon_id);

  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

  const viewportSize = {
    width: 1200,
    height: 600,
  };


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

    if (account) updateBattleState();
  }, [lobbyQueryData, lobbySubscribeData, address, account]);


  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;


    canvas.width = viewportSize.width;
    canvas.height = viewportSize.height;

    const myPetImage = new Image();
    myPetImage.src = "../assets/embySprite.png  ";

    const enemyImage = new Image();
    enemyImage.src = "../assets/draggleSprite.png";

    const battleZoneImage = new Image();
    battleZoneImage.src = "../assets/battleBackground.png";

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

    const renderedSpritesBattle = [myPet, enemy];

    const move = "test";
    const updateBattle = () => {

      if (myPet.health <= 0 || enemy.health <= 0) {
        myPet.faint();

        return;
      }
      if (move !== null) {
        enemy.attack({
          attack: {
            name: 'Fireball',
            damage: 25,
            type: 'Fire',

          },
          recipient: myPet,
          renderedSpritesBattle: renderedSpritesBattle
        });
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
      battleAnimationIdRef.current = requestAnimationFrame(gameBattleLoop);
      // console.log("battleAnimationId", battleAnimationIdRef.current);
    };

    battleZoneImage.onload = () => {
      gameBattleLoop();
    };


  }, []);

  const renderPlayerInfo = (
    stats: Player | null,
    dojomon_stats: Dojomon | null,
    isOpponent: boolean
  ) => (
    <div className={`flex flex-col items-center space-y-4 w-[50%]`}>
      <div
        className={`w-24 h-24 flex items-center justify-center font-bold text-3xl ${stats ? (isOpponent ? "bg-red-500" : "bg-green-500") : "bg-gray-500"
          }`}
      >
        {stats ? felt252ToString(stats.name) : "???"}
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-white">
          {stats ? felt252ToString(stats.name) : "Waiting..."}
        </p>
        <p className="text-gray-300">{isOpponent ? "Opponent" : "You"}</p>
      </div>

      <DojomonCard
        dojomon={dojomon_stats} // Pass Dojomon data to card
      />
    </div>
  );

  const playerStatsInfo =() => (
    <div className="absolute bg-white h-[80px] w-[200px] border-4 border-black top-12 left-12 p-3">
          <h1 className="font-bold font-pixel">{felt252ToString(myDojomonQueryData.name)}</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div id="enemy-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
          </div>
        </div>
  )

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-gray-800 to-gray-900">

      <div className="absolute h-[600px] w-[1200px]">

        {
         felt252ToString(myDojomonQueryData.name)
        }

        {/* <div className="absolute bg-white h-[80px] w-[200px] border-4 border-black top-12 left-12 p-3">
          <h1 className="font-bold font-pixel">Draggle</h1>
          <div className="relative mt-2">
            <div className="h-2 bg-slate-400"></div>
            <div id="enemy-health-bar" className="h-2 bg-green-500 absolute top-0 right-0 left-0"></div>
          </div>
        </div> */}

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
            // onClick={handleTackle}
            >
              Tackle
            </button>
            <button className="w-1/2 h-full bg-red-500 text-white font-bold hover:bg-red-700 font-pixel"
            // onClick={handleAttack}
            >
              Attack
            </button>
          </div>
          <div className="w-1/5 flex items-center justify-center bg-gray-200 border-l-2 border-black">
            <h1 className="text-center font-bold text-lg font-pixel">Attack Type</h1>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef}
        style={{
          width: viewportSize.width,
          height: viewportSize.height,
        }} />

    </div>


  );
};

export default Battle;
