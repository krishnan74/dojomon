import { DojoContext } from "../../dojo-sdk-provider";
import {
  BattleEnded,
  Dojomon,
  DojomonType,
  PlayerAttacked,
  PlayerSelectedDojomon,
  SchemaType,
} from "../../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { addAddressPadding, CairoOption, CairoOptionVariant } from "starknet";
import { useDojoStore } from "../useDojoStore";

export function useLobbyCreatedData(
  address: string | undefined,
  lobby_code: string | undefined
) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [lobbyCreatedEventData, setLobbyCreatedEventData] =
    useState<BattleEnded | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEventQuery({
        query: {
          event_messages_historical: {
            LobbyCreated: {
              $: {
                where: {
                  player: { $is: addAddressPadding(address) },
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
            //@ts-expect-error
            setLobbyCreatedEventData(data[0].models.dojomon.LobbyCreated);
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
    entityId,
    lobbyCreatedEventData,
  };
}
