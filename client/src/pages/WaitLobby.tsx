import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "@/wallet-account";
import { DojoContext } from "@/dojo-sdk-provider";
import { useDojoStore, usePlayerData } from "@/hooks";
import { QueryBuilder, ParsedEntity } from "@dojoengine/sdk";
import { DojomonType, LobbyType, PlayerStats } from "@/typescript/models.gen";
import { felt252ToString } from "@/lib/utils";
import { useLobbyData } from "@/hooks/useLobbyData";
import { Howler } from "howler";
import { BigNumberish } from "starknet";

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

const WaitLobby = () => {
  const [player1, setPlayer1] = useState<Player>();
  const [player2, setPlayer2] = useState<Player>();
  const { client } = useContext(DojoContext);

  const { account, address } = useAccount();

  const { lobbyCode } = useParams<{ lobbyCode: string }>();

  const [userName, setUserName] = useState<string>("");

  const { lobbySubscribeData } = useLobbyData(address, lobbyCode);

  const matchfoundSound = new Howl({
    src: ["../assets/audio/Vs flash.ogg"],
    volume: 0.7,
  });

  useEffect(() => {
    if (lobbySubscribeData) {
      if (lobbySubscribeData.host_player.address === address) {
        setPlayer1(lobbySubscribeData.host_player);
        setPlayer2(lobbySubscribeData.guest_player);
      } else {
        setPlayer1(lobbySubscribeData.guest_player);
        setPlayer2(lobbySubscribeData.host_player);
      }

      if (lobbySubscribeData.guest_player.address !== "") {
        setTimeout(() => {
          matchfoundSound.play();
          window.location.href = `/selectYourDojomon/${lobbyCode}`;
        }, 5000);
      }
    }
  }, [lobbySubscribeData, address]);

  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-gray-800 to-gray-900 ">
      <WalletAccount />

      <div className="p-5 border-black border ">
        <button
          className="border-black border text-black px-3 py-1"
          onClick={async () => {
            await client.lobby.createLobby(account!, LobbyType.Public);
          }}
        >
          Create Lobby
        </button>
        <button
          className="border-black border text-black px-3 py-1"
          onClick={async () => {
            await client.lobby.joinLobby(account!, lobbyCode!);
          }}
        >
          Join Lobby
        </button>

        <div>
          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              await client.actions.spawnPlayer(
                account!,
                userName,
                DojomonType.Water
              );
            }}
          >
            Spawn Player
          </button>

          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
      </div>

      <div className="relative w-full max-w-4xl flex items-center justify-between p-8">
        {/* Left Section: Player 1 */}
        {/* 
        <button
          onClick={() => setPlayer2("Player 2")}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          join
        </button> */}
        <div className="flex flex-col items-center space-y-4 w-[50%]">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-3xl">
            {felt252ToString(player1?.name)}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{}</p>
            <p className="text-gray-300">You</p>
          </div>
        </div>

        {/* Center Section: Loader or VS Image */}
        <div className="flex flex-col items-center">
          {player2?.name == "" ? (
            // Show loader when waiting for Player 2
            <div className="w-16 h-16 border-4 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
          ) : (
            // Show VS Image when Player 2 is connected
            <img
              src="../assets/website-design/vs.png"
              alt="VS"
              className="w-24 h-24"
            />
          )}
        </div>

        {/* Right Section: Player 2 */}
        <div className="flex flex-col items-center space-y-4    w-[50%]">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-black font-bold text-3xl ${
              player2 ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            {player2 ? felt252ToString(player2?.name) : "?"}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {player2?.name || "Waiting..."}
            </p>
            <p className="text-gray-300">
              {player2 ? "Connected" : "Not Connected"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitLobby;
