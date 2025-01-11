import { DojoProvider } from "@dojoengine/core";
import { Account, AccountInterface, CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {
    const build_actions_move_calldata = (direction: models.Direction) => {

        const directionToString = {
      0: 'Left',
      1: 'Right',
      2: 'Up',
      3: 'Down',
    }

        return {
            contractName: "actions",
            entrypoint: "move",
            calldata: [new CairoCustomEnum({ [directionToString[direction]]: '()' })],
        };
    };

    const actions_move = async (
        snAccount: Account | AccountInterface,
        direction: models.Direction
    ) => {
        try {
            return await provider.execute(
                snAccount,
                build_actions_move_calldata(direction),
                "dojo_starter"
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const build_actions_spawn_calldata = () => {
        return {
            contractName: "actions",
            entrypoint: "spawn",
            calldata: [],
        };
    };

    const actions_spawn = async (snAccount: Account | AccountInterface) => {
        try {
            return await provider.execute(
                snAccount,
                build_actions_spawn_calldata(),
                "dojo_starter"
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const build_actions_upgradeSpeed_calldata = () => {
        return {
            contractName: "actions",
            entrypoint: "upgradeSpeed",
            calldata: [],
        };
    }

    const actions_upgradeSpeed = async (snAccount: Account | AccountInterface) => {
        try {
            return await provider.execute(
                snAccount,
                build_actions_upgradeSpeed_calldata(),
                "dojo_starter"
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    return {
        actions: {
            move: actions_move,
            buildMoveCalldata: build_actions_move_calldata,
            spawn: actions_spawn,
            buildSpawnCalldata: build_actions_spawn_calldata,
            upgradeSpeed: actions_upgradeSpeed,
        },
    };
}
