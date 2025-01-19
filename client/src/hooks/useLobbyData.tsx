import { DojoContext } from "../dojo-sdk-provider";
import { League, Lobby, LobbyType, SchemaType } from "../typescript/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { addAddressPadding, CairoOption, CairoOptionVariant } from "starknet";
import { useDojoStore } from "./useDojoStore";

export function useLobbyData(
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

  const [lobbySubscribeData, setLobbySubscribeData] = useState<Lobby>({
    lobby_code: 0,
    host_player: {
      address: "",
      name: "",
      gold: 0,
      exp: 0,
      level: 0,
      league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
      food: 0,
      trophies: 0,
    },
    guest_player: {
      address: "",
      name: "",
      gold: 0,
      exp: 0,
      level: 0,
      league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
      food: 0,
      trophies: 0,
    },
    host_ready: false,
    guest_ready: false,
    host_dojomon_id: 0,
    guest_dojomon_id: 0,
    is_vacant: false,
    lobby_type: new CairoOption<LobbyType>(
      CairoOptionVariant.Some,
      LobbyType.Public
    ),
    turn: "",
    lobby_league: new CairoOption<League>(
      CairoOptionVariant.Some,
      League.Bronze
    ),
    lobby_exp: 0,
    lobby_level: 0,
  });

  const [lobbyQueryData, setLobbyQueryData] = useState<Lobby>({
    lobby_code: 0,
    host_player: {
      address: "",
      name: "",
      gold: 0,
      exp: 0,
      level: 0,
      league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
      food: 0,
      trophies: 0,
    },
    guest_player: {
      address: "",
      name: "",
      gold: 0,
      exp: 0,
      level: 0,
      league: new CairoOption<League>(CairoOptionVariant.Some, League.Bronze),
      food: 0,
      trophies: 0,
    },
    host_ready: false,
    guest_ready: false,
    host_dojomon_id: 0,
    guest_dojomon_id: 0,
    is_vacant: false,
    lobby_type: new CairoOption<LobbyType>(
      CairoOptionVariant.Some,
      LobbyType.Public
    ),
    turn: "",
    lobby_league: new CairoOption<League>(
      CairoOptionVariant.Some,
      League.Bronze
    ),
    lobby_exp: 0,
    lobby_level: 0,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async (address: string) => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojomon", (n) =>
            n.entity("Lobby", (e) => e.eq("lobby_code", lobby_code))
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
            setLobbySubscribeData(data[0].models.dojomon.Lobby);
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
              n.entity("Lobby", (e) => e.eq("lobby_code", lobby_code))
            )
            .build(),
          callback: (resp) => {
            if (resp.error) {
              console.error("resp.error.message:", resp.error.message);
              return;
            }
            if (resp.data) {
              state.setEntities(resp.data as ParsedEntity<SchemaType>[]);
              console.log(resp);
              console.log(address);
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

  return { entityId, lobbySubscribeData, lobbyQueryData };
}
