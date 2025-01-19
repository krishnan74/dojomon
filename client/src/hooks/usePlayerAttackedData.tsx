import { DojoContext } from "../dojo-sdk-provider";
import {
  Dojomon,
  DojomonType,
  PlayerAttacked,
  PlayerSelectedDojomon,
  SchemaType,
} from "../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { addAddressPadding, CairoOption, CairoOptionVariant } from "starknet";
import { useDojoStore } from "./useDojoStore";

export function usePlayerAttackedData(
  address: string | undefined,
  lobby_code: string | undefined,
  dojomon_id: string | null
) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [dojomonSubscribeData, setDojomonSubscribeData] = useState<Dojomon>({
    dojomon_id: 0,
    player: "",
    name: "",
    health: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    level: 0,
    exp: 0,
    evolution: 0,
    dojomon_type: new CairoOption<DojomonType>(CairoOptionVariant.None),
    position: { x: 0, y: 0 },
    is_free: true,
    is_being_caught: false,
  });

  const [attackEventSubscribeData, setAttackEventSubscribeData] =
    useState<PlayerAttacked>();

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
            //setAttackEventSubscribeData(data[0].models.dojomon.PlayerAttacked);
            console.log(data);
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
              n.entity("Dojomon", (e) =>
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
              //console.log(resp.data);

              //setDojomonQueryData(resp.data);
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
  }, [sdk, address, dojomon_id]);

  return {
    entityId,
    dojomonSubscribeData,
  };
}
