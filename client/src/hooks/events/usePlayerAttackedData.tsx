import { DojoContext } from "../../dojo-sdk-provider";
import {
  PlayerAttacked,
  SchemaType,
} from "../../typescript bindings/models.gen";
import { ParsedEntity } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDojoStore } from "../useDojoStore";

export function usePlayerAttackedData(
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

  const [attackEventSubscribeData, setAttackEventSubscribeData] =
    useState<PlayerAttacked | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEventQuery({
        query: {
          event_messages_historical: {
            PlayerAttacked: {
              $: {
                where: {
                  lobby_code: { $is: lobby_code },
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
            setAttackEventSubscribeData(data[0].models.dojomon.PlayerAttacked);
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
    attackEventSubscribeData,
  };
}
