import { DojoContext } from "../dojo-sdk-provider";
import { PlayerStats, SchemaType } from "../typescript bindings/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";

import { useDojoStore } from "./useDojoStore";

export function useLeaderBoardData(address: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);
  const entityId = useMemo(() => {
    if (address) {
      return getEntityIdFromKeys([BigInt(address)]);
    }
    return BigInt(0);
  }, [address]);

  const [leaderboardData, setLeaderboardData] = useState<PlayerStats[]>([]);
  const [hallOfFameData, setHallOfFameData] = useState<PlayerStats[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) => n.entity("PlayerStats", (e) => {}))
            .build(),
          callback: (resp) => {
            if (resp.error) {
              console.error("resp.error.message:", resp.error.message);
              return;
            }
            if (resp.data) {
              state.setEntities(resp.data as ParsedEntity<SchemaType>[]);

              console.log("resp.data:", resp.data);
              // @ts-expect-error
              setLeaderboardData(resp.data);
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };

    if (address) {
      fetchEntities();
    }
  }, [sdk]);

  return { entityId, leaderboardData };
}
