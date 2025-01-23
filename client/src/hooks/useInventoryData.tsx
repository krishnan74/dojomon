import { DojoContext } from "../dojo-sdk-provider";
import {
  Inventory,
  League,
  PlayerStats,
  SchemaType,
} from "../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { addAddressPadding } from "starknet";
import { useDojoStore } from "./useDojoStore";

export function useInventoryData(address: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [playerInventoryQueryData, setPlayerInventoryQueryData] =
    useState<Inventory | null>(null);

  const [playerInventorySubscribeData, setPlayerInventorySubscribeData] =
    useState<Inventory | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojomon", (n) =>
            n.entity("Inventory", (e) =>
              e.eq("player", addAddressPadding(address))
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
            // @ts-expect-error
            setPlayerInventorySubscribeData(data[0].models.dojomon.Inventory);
            console.log(data[0]);
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

  useEffect(() => {
    const fetchEntities = async (address: string) => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) =>
              n.entity("Inventory", (e) =>
                e.eq("player", addAddressPadding(address))
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

              setPlayerInventoryQueryData(
                // @ts-expect-error

                resp.data[0].models.dojomon.Inventory
              );
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };

    if (address) {
      fetchEntities(address);
    }
  }, [sdk, address]);

  return {
    entityId,

    playerInventoryQueryData,

    playerInventorySubscribeData,
  };
}
