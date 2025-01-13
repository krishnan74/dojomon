import { DojoProvider } from "@dojoengine/core";
import {
  Account,
  AccountInterface,
  BigNumberish,
  CairoCustomEnum,
} from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {
  const build_actions_spawn_calldata = (dojomon_type: models.DojomonType) => {
    const dojomonTypeToString = {
      0: "Fire",
      1: "Water",
      2: "Grass",
    };

    return {
      contractName: "actions",
      entrypoint: "spawnPlayer",
      calldata: [
        new CairoCustomEnum({ [dojomonTypeToString[dojomon_type]]: "()" }),
      ],
    };
  };

  const actions_spawn = async (
    snAccount: Account | AccountInterface,
    dojoball_type: models.DojomonType
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_spawn_calldata(dojoball_type),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_createDojomon_calldata = (
    name: string,
    health: BigNumberish,
    attack: BigNumberish,
    defense: BigNumberish,
    speed: BigNumberish,
    dojomon_type: models.DojomonType,
    position: models.Position
  ) => {
    const dojomonTypeToString = {
      0: "Fire",
      1: "Water",
      2: "Grass",
    };

    return {
      contractName: "actions",
      entrypoint: "createDojomon",
      calldata: [
        name,
        health,
        attack,
        defense,
        speed,
        new CairoCustomEnum({ [dojomonTypeToString[dojomon_type]]: "()" }),
        position,
      ],
    };
  };

  const actions_createDojomon = async (
    snAccount: Account | AccountInterface,
    name: string,
    health: BigNumberish,
    attack: BigNumberish,
    defense: BigNumberish,
    speed: BigNumberish,
    dojomon_type: models.DojomonType,
    position: models.Position
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_createDojomon_calldata(
          name,
          health,
          attack,
          defense,
          speed,
          dojomon_type,
          position
        ),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    actions: {
      spawnPlayer: actions_spawn,
      buildSpawnCalldata: build_actions_spawn_calldata,
      createDojomon: actions_createDojomon,
      buildCreateDojomonCalldata: build_actions_createDojomon_calldata,
    },
  };
}
