import React, { useContext, useState, useEffect } from "react";
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
  let query = useQuery();
  let selected_dojomon_id = query.get("my_dojomon_id");
  let opponent_dojomon_id = query.get("opponent_dojomon_id");

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

  const { opponentDojomonQueryData, opponentDojomonSubscribeData } =
    useOpponentDojomonData(account?.address, opponent_dojomon_id);

  const { movesQueryData } = useMovesData(selected_dojomon_id || "");

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

  const renderPlayerInfo = (
    stats: Player | null,
    dojomon_stats: Dojomon | null,
    isOpponent: boolean
  ) => (
    <div className={`flex flex-col items-center space-y-4 w-[50%]`}>
      <div
        className={`w-24 h-24 flex items-center justify-center font-bold text-3xl ${
          stats ? (isOpponent ? "bg-red-500" : "bg-green-500") : "bg-gray-500"
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="relative w-full max-w-4xl flex items-center justify-between p-8">
        {/* Left Section: Player Info */}
        {renderPlayerInfo(
          myStats,
          myDojomonSubscribeData ? myDojomonSubscribeData : myDojomonQueryData,
          false
        )}

        {/* Center Section: Loader or VS Image */}
        <div className="flex flex-col items-center">
          {!opponentStats ? (
            <div className="w-16 h-16 border-4 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
          ) : (
            <img
              src="../assets/website-design/vs.png"
              alt="VS"
              className="w-24 h-24"
            />
          )}
        </div>

        {/* Right Section: Opponent Info */}
        {renderPlayerInfo(
          opponentStats,
          opponentDojomonSubscribeData
            ? opponentDojomonSubscribeData
            : opponentDojomonQueryData,
          true
        )}
      </div>

      {/* Moves Section */}
      <div className="flex flex-col items-center mt-8">
        {movesQueryData &&
        myDojomonQueryData &&
        opponentDojomonQueryData &&
        lobbyCode ? (
          movesQueryData.map((move_model, index) => (
            <MoveCard
              key={index}
              //@ts-expect-error
              move={move_model.models.dojomon.Move}
              client={client}
              account={account}
              lobby_code={lobbyCode}
              myDojomonId={myDojomonQueryData.dojomon_id}
              opponentDojomonId={opponentDojomonQueryData.dojomon_id}
              in_battle={true}
            />
          ))
        ) : (
          <p className="text-white text-center">Loading Moves...</p>
        )}
      </div>

      <Button
        onClick={() => client.battle.attack(account!, 9, 0, 10, 4, false)}
      >
        Attack
      </Button>
    </div>
  );
};

export default Battle;
