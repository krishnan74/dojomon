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
  BigNumberish,
  CairoCustomEnum,
  CairoOption,
  CairoOptionVariant,
} from "starknet";
import { useDojoStore } from "./useDojoStore";

export function useLobbyMatchMakingData(
  address: string | undefined,
  clickedBattle: boolean,
  find_lobby_league: CairoOption<League> | undefined,
  find_lobby_level: BigNumberish | undefined
) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  // const [playerData, setPlayerData] = useState<PlayerStats | null>(null);

  const [lobby_code, setLobbyCode] = useState<string | null>(null);

  const [availableLobbies, setAvailableLobbies] = useState(null);

  // const fetchPlayerData = async (address: string) => {
  //   try {
  //     await sdk.getEntities({
  //       query: new QueryBuilder<SchemaType>()
  //         .namespace("dojomon", (n) =>
  //           n.entity("PlayerStats", (e) =>
  //             e.eq("address", addAddressPadding(address))
  //           )
  //         )
  //         .build(),
  //       callback: (resp) => {
  //         if (resp.error) {
  //           console.error("resp.error.message:", resp.error.message);
  //           return;
  //         }
  //         if (resp.data) {
  //           state.setEntities(resp.data as ParsedEntity<SchemaType>[]);
  //           // @ts-expect-error
  //           setPlayerData(resp.data[0].models.dojomon.PlayerStats);
  //         }
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error querying entities:", error);
  //   }
  // };

  useEffect(() => {
    const fetchMatchupLobbies = async () => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) =>
              n.entity("Lobby", (e) => {
                e.eq("lobby_league", find_lobby_league);
                e.eq("lobby_type", "Public");
                e.eq("is_vacant", true);
                e.neq("turn", addAddressPadding(address!));
              })
            )
            .build(),
          callback: (resp) => {
            if (resp.error) {
              console.error("resp.error.message:", resp.error.message);
              return setLobbyCode("No Lobbies Found");
            }
            if (resp.data) {
              state.setEntities(resp.data as ParsedEntity<SchemaType>[]);
              // @ts-expect-error
              setLobbyCode(resp.data[0].models.dojomon.Lobby.lobby_code);

              //@ts-expect-error
              console.log(resp.data[0].models.dojomon.Lobby.lobby_code);
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };

    if (address && clickedBattle) {
      fetchMatchupLobbies();
    }
  }, [address, clickedBattle]);

  return { entityId, lobby_code };
}
