import { DojoProvider } from "@dojoengine/core";
import {
  Account,
  AccountInterface,
  BigNumberish,
  CairoCustomEnum,
  addAddressPadding,
} from "starknet";
import * as models from "./models.gen";
import {
  build_actions_spawn_calldata,
  build_shop_buyDojoBall_calldata,
  build_lobby_createLobby_calldata,
  build_lobby_joinLobby_calldata,
  build_friendSystem_sendFriendRequest_calldata,
  build_friendSystem_acceptFriendRequest_calldata,
  build_actions_createDojomon_calldata,
  build_actions_feedDojomon_calldata,
  build_lobby_selectDojomon_calldata,
  build_lobby_readyForBattle_calldata,
  build_battle_attack_calldata,
} from "./calldata.gen.ts";

export function setupWorld(provider: DojoProvider) {
  const actions_spawn = async (
    snAccount: Account | AccountInterface,
    name: string,
    dojomon_type: models.DojomonType
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_spawn_calldata(snAccount.address, name, dojomon_type),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const actions_createDojomon = async (
    snAccount: Account | AccountInterface,
    name: string,
    health: BigNumberish,
    attack: BigNumberish,
    defense: BigNumberish,
    speed: BigNumberish,
    evolution: BigNumberish,
    dojomon_type: models.DojomonType,
    position: models.Position,
    is_free: boolean,
    is_being_caught: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_createDojomon_calldata(
          snAccount.address,

          name,
          health,
          attack,
          defense,
          speed,
          evolution,
          dojomon_type,
          position,
          is_free,
          is_being_caught
        ),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const actions_buyDojoBall = async (
    snAccount: Account | AccountInterface,
    dojoball_type: models.DojoBallType,
    quantity: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_shop_buyDojoBall_calldata(dojoball_type, quantity),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const actions_feedDojomon = async (
    snAccount: Account | AccountInterface,
    dojomon_id: BigNumberish,
    quantity: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_actions_feedDojomon_calldata(dojomon_id, quantity),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const lobby_createLobby = async (
    snAccount: Account | AccountInterface,
    lobby_type: models.LobbyType
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_lobby_createLobby_calldata(lobby_type),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const lobby_joinLobby = async (
    snAccount: Account | AccountInterface,
    lobby_code: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_lobby_joinLobby_calldata(lobby_code),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const lobby_selectDojomon = async (
    snAccount: Account | AccountInterface,
    lobby_code: BigNumberish,
    dojomon_id: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_lobby_selectDojomon_calldata(lobby_code, dojomon_id),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const lobby_readyForBattle = async (
    snAccount: Account | AccountInterface,
    lobby_code: BigNumberish
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_lobby_readyForBattle_calldata(lobby_code),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const battle_attack = async (
    snAccount: Account | AccountInterface,
    lobby_code: BigNumberish,
    attacker_dojomon_id: BigNumberish,
    defender_dojomon_id: BigNumberish,
    move_id: BigNumberish,
    against_AI: boolean
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_battle_attack_calldata(
          lobby_code,
          attacker_dojomon_id,
          defender_dojomon_id,
          move_id,
          against_AI
        ),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const friendSystem_sendFriendRequest = async (
    snAccount: Account | AccountInterface,
    receiver: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_friendSystem_sendFriendRequest_calldata(receiver),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const friendSystem_acceptFriendRequest = async (
    snAccount: Account | AccountInterface,
    sender: string
  ) => {
    try {
      return await provider.execute(
        snAccount,
        build_friendSystem_acceptFriendRequest_calldata(sender),
        "dojomon"
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    actions: {
      spawnPlayer: actions_spawn,
      createDojomon: actions_createDojomon,
      feedDojomon: actions_feedDojomon,
      catchDojomon: actions_createDojomon,
    },
    shop: {
      buyDojoBall: actions_buyDojoBall,
    },
    lobby: {
      createLobby: lobby_createLobby,
      joinLobby: lobby_joinLobby,
      selectDojomon: lobby_selectDojomon,
      readyForBattle: lobby_readyForBattle,
    },
    battle: {
      attack: battle_attack,
    },
    friendSystem: {
      sendFriendRequest: friendSystem_sendFriendRequest,
      acceptFriendRequest: friendSystem_acceptFriendRequest,
    },
  };
}
