import { BigNumberish, CairoCustomEnum } from "starknet";
import * as models from "./models.gen";

const dojomonTypeToString = {
  0: "Fire",
  1: "Water",
  2: "Grass",
  3: "Electric",
  4: "Normal",
  5: "Flying",
  6: "Rock",
  7: "Ground",
  8: "Ice",
  9: "Bug",
  10: "Psychic",
  11: "Dark",
  12: "Steel",
  13: "Dragon",
  14: "Fairy",
  15: "Ghost",
  16: "Poison",
  17: "Fighting",
};

const dojoballTypeToString = {
  0: "Dojoball",
  1: "Greatball",
  2: "Ultraball",
  3: "Masterball",
};

export const build_actions_spawn_calldata = (
  address: string,
  name: string,
  dojomon_type: models.DojomonType
) => {
  return {
    contractName: "actions",
    entrypoint: "spawnPlayer",
    calldata: [
      address,
      name,
      new CairoCustomEnum({ [dojomonTypeToString[dojomon_type]]: "()" }),
    ],
  };
};

export const build_actions_createDojomon_calldata = (
  address: string,
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
  return {
    contractName: "actions",
    entrypoint: "createDojomon",
    calldata: [
      address,
      name,
      health,
      attack,
      defense,
      speed,
      evolution,
      new CairoCustomEnum({ [dojomonTypeToString[dojomon_type]]: "()" }),
      position,
      is_free,
      is_being_caught,
    ],
  };
};

export const build_actions_buyDojoBall_calldata = (
  dojoball_type: models.DojoBallType,
  quantity: BigNumberish,
  dojomon_id: BigNumberish,
  has_dojomon: boolean
) => {
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

export const build_actions_feedDojomon_calldata = (
  dojomon_id: BigNumberish,
  quantity: BigNumberish
) => {
  return {
    contractName: "actions",
    entrypoint: "feedDojomon",
    calldata: [dojomon_id, quantity],
  };
};

export const build_lobby_createLobby_calldata = (
  lobby_type: models.LobbyType
) => {
  const lobbyTypeToString = {
    0: "Public",
    1: "Private",
  };

  return {
    contractName: "lobby",
    entrypoint: "createLobby",
    calldata: [new CairoCustomEnum({ [lobbyTypeToString[lobby_type]]: "()" })],
  };
};

export const build_lobby_joinLobby_calldata = (lobby_code: BigNumberish) => {
  return {
    contractName: "lobby",
    entrypoint: "joinLobby",
    calldata: [lobby_code],
  };
};

export const build_lobby_selectDojomon_calldata = (
  lobby_code: BigNumberish,
  dojomon_id: BigNumberish
) => {
  return {
    contractName: "lobby",
    entrypoint: "selectDojomon",
    calldata: [lobby_code, dojomon_id],
  };
};

export const build_lobby_readyForBattle_calldata = (
  lobby_code: BigNumberish
) => {
  return {
    contractName: "lobby",
    entrypoint: "readyForBattle",
    calldata: [lobby_code],
  };
};

export const build_battle_attack_calldata = (
  lobby_code: BigNumberish,
  attacker_dojomon_id: BigNumberish,
  defender_dojomon_id: BigNumberish,
  move_id: BigNumberish,
  against_AI: boolean
) => {
  return {
    contractName: "battle",
    entrypoint: "attack",
    calldata: [
      lobby_code,
      attacker_dojomon_id,
      defender_dojomon_id,
      move_id,
      against_AI,
    ],
  };
};

export const build_battle_endBattle_calldata = (
  lobby_code: BigNumberish,
  lost_player_address: string,
  won_player_address: string,
  lost_dojomon_id: BigNumberish,
  won_dojomon_id: BigNumberish
) => {
  return {
    contractName: "battle",
    entrypoint: "endBattle",
    calldata: [
      lobby_code,
      lost_player_address,
      won_player_address,
      lost_dojomon_id,
      won_dojomon_id,
    ],
  };
};

export const build_friendSystem_sendFriendRequest_calldata = (
  receiver: string
) => {
  return {
    contractName: "friendSystem",
    entrypoint: "sendFriendRequest",
    calldata: [receiver],
  };
};

export const build_friendSystem_acceptFriendRequest_calldata = (
  sender: string
) => {
  return {
    contractName: "friendSystem",
    entrypoint: "acceptFriendRequest",
    calldata: [sender],
  };
};
