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

  const build_actions_buyDojoBall_calldata = (
    dojoball_type: models.DojoBallType,
    quantity: BigNumberish,
    dojomon_id: string,
    has_dojomon: boolean
  ) => {
    const dojoballTypeToString = {
      0: "Dojoball",
      1: "Greatball",
      2: "Ultraball",
      3: "Masterball",
    };

    return {
      contractName: "actions",
      entrypoint: "buyDojoBall",
      calldata: [
        new CairoCustomEnum({ [dojoballTypeToString[dojoball_type]]: "()" }),
        quantity,
        dojomon_id,
        has_dojomon,
      ],
    };
  };

  const actions_buyDojoBall = async (
    snAccount: Account | AccountInterface,
    dojoball_type: models.DojoBallType,
    quantity: BigNumberish,
    dojomon_id: string,
    has_dojomon: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_buyDojoBall_calldata(
          dojoball_type,
          quantity,
          dojomon_id,
          has_dojomon
        ),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_createLobby_calldata = () => {
    return {
      contractName: "actions",
      entrypoint: "createLobby",
      calldata: [],
    };
  };

  const actions_createLobby = async (snAccount: Account | AccountInterface) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_createLobby_calldata(),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_joinLobby_calldata = (lobby_code: string) => {
    return {
      contractName: "actions",
      entrypoint: "joinLobby",
      calldata: [lobby_code],
    };
  };

  const actions_joinLobby = async (
    snAccount: Account | AccountInterface,
    lobby_code: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_joinLobby_calldata(lobby_code),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_acceptFriendRequest_calldata = (sender: string) => {
    return {
      contractName: "actions",
      entrypoint: "acceptFriendRequest",
      calldata: [sender],
    };
  };

  const actions_acceptFriendRequest = async (
    snAccount: Account | AccountInterface,
    sender: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_acceptFriendRequest_calldata(sender),
        "dojo_starter"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const build_actions_sendFriendRequest_calldata = (receiver: string) => {
    return {
      contractName: "actions",
      entrypoint: "sendFriendRequest",
      calldata: [receiver],
    };
  };

  const actions_sendFriendRequest = async (
    snAccount: Account | AccountInterface,
    receiver: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_sendFriendRequest_calldata(receiver),
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
      buyDojoBall: actions_buyDojoBall,
      createDojomon: actions_createDojomon,
      createLobby: actions_createLobby,
      joinLobby: actions_joinLobby,
      sendFriendRequest: actions_sendFriendRequest,
      acceptFriendRequest: actions_acceptFriendRequest,
    },
  };
}
