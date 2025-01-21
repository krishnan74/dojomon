import React, { useContext, useState, useEffect, useRef } from "react";
import { useAccount } from "@starknet-react/core";
import { useParams, useLocation } from "react-router-dom";
import { DojoContext } from "@/dojo-sdk-provider";
import { useMyDojomonData } from "@/hooks/useMyDojomonData";
import { useOpponentDojomonData } from "@/hooks/useOpponentDojomonData";
import { useMovesData } from "@/hooks/useMovesData";
import { felt252ToString } from "@/lib/utils";
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

  const { myDojomonQueryData, myDojomonSubscribeData } = useMyDojomonData(
    address,
    selected_dojomon_id
  );
  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(address, opponent_dojomon_id);

  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

  const [moves, setMoves] = useState<Move[]>([]);

  const { battleEndedSubscribeData } = useBattleEndedData(address, lobbyCode);

  const battleZoneImage = "../assets/game-assets/battleBackground.png";

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

  // Handle battle messages
  useEffect(() => {
    if (attacked) {
      setBattleMessage("Your Dojomon used Fireball!");
      setTimeout(() => setBattleMessage(null), 1500);
    }
  }, [attacked]);

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500">
      {/* Player Stats */}
      <div className="absolute bg-white h-[120px] w-[20%] border-4 border-black top-12 left-12 p-3 z-10">
        <h1 className="font-bold">
          {felt252ToString(myDojomonQueryData?.name)}
        </h1>
        <p>Level: {myDojomonQueryData?.level.toString()}</p>
        <HealthBar
          currentHealth={Number(
            myDojomonSubscribeData?.health ?? myDojomonSubscribeData?.max_health
          )}
          maxHealth={Number(myDojomonSubscribeData?.max_health)}
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
              opponentDojomonSubscribeData?.max_health
          )}
          maxHealth={Number(opponentDojomonSubscribeData?.max_health)}
        />
      </div>

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

      {/* Battle Canvas */}
      <canvas
        style={{
          width: "1200px",
          height: "650px",
          zIndex: 0,
          backgroundImage: `url(${battleZoneImage})`,
        }}
      />

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
