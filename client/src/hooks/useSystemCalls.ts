import { useDojoStore } from "../App";
import { DojoContext } from "../dojo-sdk-provider";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { DojomonType, League } from "../typescript/models.gen";
import { CairoOption, CairoOptionVariant, BigNumberish } from "starknet";
import { useCallback, useContext } from "react";

/**
 * Custom hook to handle system calls and state management in the Dojo application.
 * Provides functionality for spawning entities and managing optimistic updates.
 *
 * @returns An object containing system call functions:
 *   - spawn: Function to spawn a new entity with initial moves
 */
export const useSystemCalls = (entityId: BigNumberish) => {
  const state = useDojoStore((state) => state);

  const { client } = useContext(DojoContext);

  const { account } = useAccount();

  const spawn = useCallback(
    async (dojomon_type: DojomonType) => {
      // Generate a unique transaction ID
      const transactionId = uuidv4();

      // The value to update the Moves model with
      const goldCount = 100;
      const levelCount = 1;
      const expCount = 0;
      const foodCount = 100;

      const league = League.Bronze;
      const trophyCount = 0;
      const host_lobby_code = "0x0";

      // Apply an optimistic update to the state
      // this uses immer drafts to update the state
      state.applyOptimisticUpdate(transactionId, (draft) => {
        if (
          draft.entities[entityId.toString()]?.models?.dojo_starter?.PlayerStats
        ) {
          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.gold = 100;

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.level = 1;

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.exp = 0;

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.food = 100;

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.league = new CairoOption<League>(
            CairoOptionVariant.Some,
            League.Bronze
          );

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.trophies = 0;

          // @ts-expect-error
          draft.entities[
            entityId.toString()
          ].models.dojo_starter.PlayerStats.host_lobby_code = "0x0";
        }
      });

      try {
        // Execute the spawn action from the client
        await client.actions.spawnPlayer(account!, dojomon_type);

        // Wait for the entity to be updated with the new state
        await state.waitForEntityChange(entityId.toString(), (entity) => {
          const result =
            entity?.models?.dojo_starter?.PlayerStats?.gold === goldCount &&
            entity?.models?.dojo_starter?.PlayerStats?.level === levelCount &&
            entity?.models?.dojo_starter?.PlayerStats?.exp === expCount &&
            entity?.models?.dojo_starter?.PlayerStats?.food === foodCount &&
            // @ts-expect-error inner enum is not hydrated there
            entity?.models?.dojo_starter?.PlayerStats?.league?.Some ===  league.activeVariant() &&
            entity?.models?.dojo_starter?.PlayerStats?.trophies ===
              trophyCount &&
            entity?.models?.dojo_starter?.PlayerStats?.host_lobby_code ===
              host_lobby_code;

          return !!result;
        });
      } catch (error) {
        // Revert the optimistic update if an error occurs
        state.revertOptimisticUpdate(transactionId);
        console.error("Error executing spawn:", error);
        console.error(error);
        throw error;
      } finally {
        // Confirm the transaction if successful
        state.confirmTransaction(transactionId);
      }
    },
    [state, account, client]
  );

  return {
    spawn,
  };
};
