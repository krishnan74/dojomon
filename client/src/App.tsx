import { useContext, useState } from "react";
import { createDojoStore } from "@dojoengine/sdk";

import {
  DojomonType,
  DojoBallType,
  //ModelsMapping,
  SchemaType,
} from "./typescript/models.gen.ts";

import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "./wallet-account.tsx";
import { DojoContext } from "./dojo-sdk-provider.tsx";

// import useModel from "./hooks/useModel.tsx";
// import { useSystemCalls } from "./hooks/useSystemCalls.ts";
// import { HistoricalEvents } from "./historical-events.tsx";
// import { usePlayerActions } from "./hooks/usePlayerActions.tsx";

/**
 * Global store for managing Dojo game state.
 */
export const useDojoStore = createDojoStore<SchemaType>();

/**
 * Main application component that provides game functionality and UI.
 * Handles entity subscriptions, state management, and user interactions.
 *
 * @param props.sdk - The Dojo SDK instance configured with the game schema
 */
function App() {
  const { account } = useAccount();
  const entities = useDojoStore((state) => state.entities);
  //const entityId = usePlayerActions(address);

  const { client } = useContext(DojoContext);

  //const { spawn: spawnCallback } = useSystemCalls(entityId);

  //const playerStats = useModel(entityId as string, ModelsMapping.PlayerStats);

  const [enterLobbyCode, setEnterLobbyCode] = useState("");
  const [friendAddress, setfriendAddress] = useState("");

  return (
    <div className=" min-h-screen w-full p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <WalletAccount />

        <div>
          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              await client.actions.spawnPlayer(account!, DojomonType.Fire);
            }}
          >
            Spawn Player
          </button>
        </div>

        <div>
          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              const lobbyCode = await client.actions.createLobby(account!);
              console.log(lobbyCode); // This will log the returned string (lobby ID)
            }}
          >
            Create Lobby
          </button>
        </div>

        <div className="p-5 border-black border ">
          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              await client.actions.joinLobby(account!, enterLobbyCode);
            }}
          >
            Join Lobby
          </button>

          <input
            type="text"
            value={enterLobbyCode}
            onChange={(e) => setEnterLobbyCode(e.target.value)}
          />
        </div>

        <div className="p-5 border-black border ">
          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              await client.actions.sendFriendRequest(account!, friendAddress);
            }}
          >
            Send Friend Req
          </button>

          <input
            type="text"
            value={friendAddress}
            className="border-black border text-black px-3 py-1"
            onChange={(e) => setfriendAddress(e.target.value)}
          />
        </div>

        <button
          className="border-black border text-black px-3 py-1"
          onClick={async () => {
            await client.actions.buyDojoBall(
              account!,
              DojoBallType.Dojoball,
              1,
              "0",
              false
            );
          }}
        >
          Buy DojoBall
        </button>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-700 p-2">Entity ID</th>

                <th className="border border-gray-700 p-2">Player</th>

                <th className="border border-gray-700 p-2">Gold</th>

                <th className="border border-gray-700 p-2">Level</th>
                <th className="border border-gray-700 p-2">Exp</th>
                <th className="border border-gray-700 p-2">Food</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(entities).map(([entityId, entity]) => {
                const player_stats = entity.models.dojo_starter.PlayerStats;

                return (
                  <tr key={entityId} className="text-gray-300">
                    <td className="border border-gray-700 p-2">{entityId}</td>

                    <td className="border border-gray-700 p-2">
                      {player_stats?.player ?? "N/A"}
                    </td>
                    <td className="border border-gray-700 p-2">
                      {player_stats?.gold?.toString() ?? "N/A"}
                    </td>
                    <td className="border border-gray-700 p-2">
                      {player_stats?.level?.toString() ?? "N/A"}
                    </td>
                    <td className="border border-gray-700 p-2">
                      {player_stats?.exp?.toString() ?? "N/A"}
                    </td>
                    <td className="border border-gray-700 p-2">
                      {player_stats?.food?.toString() ?? "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
