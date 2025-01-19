import { DojoContext } from "../dojo-sdk-provider";
import {
  League,
  Lobby,
  PlayerStats,
  SchemaType,
} from "../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  addAddressPadding,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
} from "starknet";
import { useDojoStore } from "./useDojoStore";

export function usePlayerData(address: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [playerQueryData, setPlayerQueryData] = useState<PlayerStats>({
    address: "",
    name: "",
    gold: 0,
    exp: 0,
    level: 0,
    league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
    food: 0,
    trophies: 0,
  });

  const [playerSubscribeData, setPlayerSubscribeData] = useState<PlayerStats>({
    address: "",
    name: "",
    gold: 0,
    exp: 0,
    level: 0,
    league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
    food: 0,
    trophies: 0,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojomon", (n) =>
            n.entity("PlayerStats", (e) =>
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
            setPlayerSubscribeData(data[0].models.dojomon.PlayerStats);
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
              n.entity("PlayerStats", (e) =>
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

              // @ts-expect-error
              setPlayerQueryData(resp.data[0].models.dojomon.PlayerStats);
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

  return { entityId, playerQueryData, playerSubscribeData };
}
