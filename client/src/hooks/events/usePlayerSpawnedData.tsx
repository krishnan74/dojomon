import { DojoContext } from "../../dojo-sdk-provider";
import {
  Dojomon,
  DojomonType,
  PlayerAttacked,
  PlayerSelectedDojomon,
  PlayerSpawned,
  SchemaType,
} from "../../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { addAddressPadding, CairoOption, CairoOptionVariant } from "starknet";
import { useDojoStore } from "../useDojoStore";

export function usePlayerSpawnedData(address: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);

  const [playerSpawnedSubscribeData, setPlayerSpawnedSubscribeData] =
    useState<PlayerSpawned | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEventQuery({
        query: {
          event_messages_historical: {
            PlayerSpawned: {
              $: {
                where: {
                  player: { $is: addAddressPadding(address!) },
                },
              },
            },
          },
        },
        callback: ({ error, data }) => {
          if (error) {
            console.error("Error setting up entity sync:", error);
          } else if (
            data &&
            (data[0] as ParsedEntity<SchemaType>).entityId !== "0x0"
          ) {
            state.updateEntity(data[0] as ParsedEntity<SchemaType>);

            console.log(data);
            setPlayerSpawnedSubscribeData(
              //@ts-expect-error

              data[0].models.dojomon.PlayerAttacked
            );
          }
        },
      });

      unsubscribe = () => subscription.cancel();
    };

    if (address) {
      subscribe(address);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sdk, address]);

  return {
    playerSpawnedSubscribeData,
  };
}
