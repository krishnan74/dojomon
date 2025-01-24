import { DojoContext } from "../dojo-sdk-provider";
import { Dojomon, SchemaType } from "../typescript bindings/models.gen";
import { ParsedEntity, QueryBuilder } from "@dojoengine/sdk";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDojoStore } from "./useDojoStore";

export function useMyDojomonData(
  address: string | undefined,
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

  const [myDojomonSubscribeData, setDojomonSubscribeData] =
    useState<Dojomon | null>(null);

  const [myDojomonQueryData, setDojomonQueryData] = useState<Dojomon | null>(
    null
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const subscribe = async () => {
      const subscription = await sdk.subscribeEntityQuery({
        query: new QueryBuilder<SchemaType>()
          .namespace("dojomon", (n) =>
            n.entity("Dojomon", (e) => e.eq("dojomon_id", dojomon_id))
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

            console.log(data[0].models.dojomon.Dojomon);
            // @ts-expect-error
            setDojomonSubscribeData(data[0].models.dojomon.Dojomon);
          }
        },
      });

      unsubscribe = () => subscription.cancel();
    };

    if (address) {
      subscribe();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sdk, address]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        await sdk.getEntities({
          query: new QueryBuilder<SchemaType>()
            .namespace("dojomon", (n) =>
              n.entity("Dojomon", (e) => e.eq("dojomon_id", dojomon_id))
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

              // @ts-expect-error
              setDojomonQueryData(resp.data[0].models.dojomon.Dojomon);
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
  }, [sdk, address, dojomon_id]);

  return {
    entityId,
    myDojomonSubscribeData,
    myDojomonQueryData,
  };
}
