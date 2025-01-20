import { DojoContext } from "../dojo-sdk-provider";
import {
  League,
  Lobby,
  LobbyType,
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

export function useLobbyMatchMakingData(address: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [playerData, setPlayerData] = useState<PlayerStats | null>(null);

  const [lobby_code, setLobbyCode] = useState<string | null>(null);

  const fetchPlayerData = async (address: string) => {
    try {
      await sdk.getEntities({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojomon", (n) =>
            n.entity("PlayerStats", (e) =>
              e.eq("address", addAddressPadding(address))
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
            setPlayerData(resp.data[0].models.dojomon.PlayerStats);
          }
        },
      });
    } catch (error) {
      console.error("Error querying entities:", error);
    }
  };

  useEffect(() => {
    const fetchMatchupLobbies = async () => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) =>
              n.entity("Lobby", (e) => {
                e.eq("lobby_league", playerData?.league);
                e.eq("lobby_type", "Public");
                e.eq("is_vacant", true);
              })
            )
            .build(),
          callback: (resp) => {
            if (resp.error) {
              console.error("resp.error.message:", resp.error.message);
              return;
            }
            if (resp.data) {
              state.setEntities(resp.data as ParsedEntity<SchemaType>[]);
              console.log(resp.data);
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };

    if (address) {
      fetchPlayerData(address!);
    }

    if (playerData) {
      fetchMatchupLobbies();
    }
  }, [sdk, address, playerData]);

  return { entityId, lobby_code };
}
