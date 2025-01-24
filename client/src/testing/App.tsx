import { useContext, useEffect, useState } from "react";
import { createDojoStore } from "@dojoengine/sdk";

import {
  DojomonType,
  DojoBallType,
  //ModelsMapping,
  SchemaType,
  LobbyType,
  Move,
  MoveEffect,
} from "../typescript bindings/models.gen.ts";

import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "../components/wallet/wallet-account.tsx";
import { DojoContext } from "../dojo-sdk-provider.tsx";
import { usePlayerData } from "../hooks/usePlayerData.tsx";

import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select.tsx";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { felt252ToString, shortenAddress } from "../lib/utils.ts";
import { useLobbyData } from "../hooks/useLobbyData.tsx";
import { useDojomonData } from "../hooks/useDojomonData.tsx";
import { Button } from "../components/ui/button.tsx";
import { CairoOption, CairoOptionVariant } from "starknet";

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

  const { client } = useContext(DojoContext);

  const [name, setName] = useState("Krish");
  const [lobbyType, setLobbyType] = useState<LobbyType>(LobbyType.Public);
  const [enterLobbyCode, setEnterLobbyCode] = useState("");
  const [friendAddress, setfriendAddress] = useState("");
  const [selected_dojomon_id, setSelectedDojomonId] = useState("");

  const movesData = [
    {
      name: "Flame Thrower",
      description: "A powerful fire move",
      power: 100,
      accuracy: 100,
      move_type: new CairoOption<DojomonType>(
        CairoOptionVariant.Some,
        DojomonType.Fire
      ),
      effect: MoveEffect.Burn,
    },

    {
      name: "Fire Blast",
      description: "A powerful fire move",
      power: 60,
      accuracy: 100,
      move_type: new CairoOption<DojomonType>(
        CairoOptionVariant.Some,
        DojomonType.Fire
      ),
      effect: MoveEffect.Burn,
    },
    {
      name: "Fire Punch",
      description: "A powerful fire move",
      power: 50,
      accuracy: 100,
      move_type: new CairoOption<DojomonType>(
        CairoOptionVariant.Some,
        DojomonType.Fire
      ),
      effect: MoveEffect.Burn,
    },
  ];

  const handleCreateMoves = async () => {
    for (let i = 0; i < movesData.length; i++) {
      await client.actions.addMove(
        account!,
        2,
        movesData[i].name,
        movesData[i].description,
        movesData[i].power,
        movesData[i].accuracy,
        DojomonType.Fire,
        movesData[i].effect
      );
    }
  };

  const {
    dojomonSubscribeData,
    dojomonQueryData,
    dojomonSelectedSubscribeData,
  } = useDojomonData(account?.address, selected_dojomon_id);

  return (
    <div className=" min-h-screen w-full p-4 sm:p-8 bg-white">
      <div className="mx-auto">
        <div className="flex gap-x-5 ">
          <WalletAccount />

          <input
            type="text"
            className="border-black border text-black px-3 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="border-black border text-black px-3 py-1"
            onClick={async () => {
              await client.actions.spawnPlayer(
                account!,

                name,
                DojomonType.Fire
              );
            }}
          >
            Spawn Player
          </button>
        </div>

        <div className="flex gap-10 items-start mb-10">
          <div className=" bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-sm font-semibold text-gray-800">
                Your Dojomon Stats
              </h2>
              <div className="text-sm text-gray-600 mt-2">
                {felt252ToString(dojomonSelectedSubscribeData?.name || "") ||
                  "N/A"}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Health:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.health?.toString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Attack:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.attack?.toString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Defense:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.defense?.toString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Speed:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.speed?.toString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Level:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.level?.toString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Exp:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.exp?.toString() || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">Evolution:</span>
                <span className="text-gray-900">
                  {dojomonSelectedSubscribeData?.evolution?.toString() || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="border-black border text-black px-3 py-1"
        onClick={async () => {
          await client.shop.buyDojoBall(account!, DojoBallType.Dojoball, 1);
        }}
      >
        Buy DojoBall
      </button>

      <button
        className="border-black border text-black px-3 py-1"
        onClick={handleCreateMoves}
      >
        CreateMoves
      </button>
    </div>
  );
}

export default App;
