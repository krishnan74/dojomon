import { DojoContext } from "../dojo-sdk-provider";
import { Move, SchemaType } from "../typescript bindings/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { useContext, useEffect, useMemo, useState } from "react";

import { useDojoStore } from "./useDojoStore";

export function useMovesData(dojomon_id: string | undefined) {
  const { sdk } = useContext(DojoContext)!;
  const state = useDojoStore((state) => state);

  const [movesQueryData, setMovesQueryData] = useState<Move[]>([]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) =>
              n.entity("Move", (e) => e.eq("dojomon_id", dojomon_id))
            )
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
              setMovesQueryData(resp.data);
            }
          },
        });
      } catch (error) {
        console.error("Error querying entities:", error);
      }
    };
    fetchEntities();
  }, [dojomon_id]);

  return { movesQueryData };
}
