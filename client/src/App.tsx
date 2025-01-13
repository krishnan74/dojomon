import { useEffect, useMemo } from "react";
import {
  ParsedEntity,
  QueryBuilder,
  SDK,
  createDojoStore,
} from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { AccountInterface, addAddressPadding } from "starknet";

import {
  DojomonType,
  DojoBallType,
  ModelsMapping,
  SchemaType,
} from "./typescript/models.gen.ts";
import { useDojo } from "./useDojo.tsx";
import useModel from "./useModel.tsx";
import { useSystemCalls } from "./useSystemCalls.ts";
import { useAccount } from "@starknet-react/core";
import { WalletAccount } from "./wallet-account.tsx";
import { HistoricalEvents } from "./historical-events.tsx";

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
function App({ sdk }: { sdk: SDK<SchemaType> }) {
  const {
    setup: { client },
  } = useDojo();
  const { account } = useAccount();
  const state = useDojoStore((state) => state);
  const entities = useDojoStore((state) => state.entities);

  const { spawn } = useSystemCalls();

  const entityId = useMemo(() => {
    if (account) {
      return getEntityIdFromKeys([BigInt(account.address)]);
    }
    return BigInt(0);
  }, [account]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (account: AccountInterface) => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojo_starter", (n) =>
            n.entity("PlayerStats", (e) =>
              e.is("player", addAddressPadding(account.address))
            )
          )
          .build(),
        callback: ({ error, data }) => {
          if (error) {
            console.error("Error setting up entity sync:", error);
          } else if (
            data &&
            (data[0] as ParsedEntity<SchemaType>).entityId !== "0x0"
          ) {
            state.updateEntity(data[0] as ParsedEntity<SchemaType>);
          }
        },
      });

      unsubscribe = () => subscription.cancel();
    };

    if (account) {
      subscribe(account);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sdk, account]);

  useEffect(() => {
    const fetchEntities = async (account: AccountInterface) => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojo_starter", (n) =>
              n.entity("PlayerStats", (e) =>
                e.is("player", addAddressPadding(account.address))
              )
            )
            .build(),
          callback: (resp) => {
            if (resp.error) {
              console.error("resp.error.message:", resp.error.message);
              return;
            }
            if (resp.data) {
              state.setEntities(resp.data as ParsedEntity<SchemaType>[]);
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };

    if (account) {
      fetchEntities(account);
    }
  }, [sdk, account]);

  const playerStats = useModel(entityId as string, ModelsMapping.PlayerStats);

  console.log(playerStats);

  return (
    <div className="bg-black min-h-screen w-full p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <WalletAccount />

        <div>
          <button
            className="bg-white text-black px-3 py-1"
            onClick={async () =>
              await client.actions.spawnPlayer(account!, DojomonType.Fire)
            }
          >
            Spawn Player
          </button>
        </div>

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

        {/* // Here sdk is passed as props but this can be done via contexts */}
        <HistoricalEvents sdk={sdk} />
      </div>
    </div>
  );
}

export default App;
