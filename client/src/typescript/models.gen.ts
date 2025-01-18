import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoOption, CairoOptionVariant, BigNumberish } from "starknet";

type WithFieldOrder<T> = T & { fieldOrder: string[] };

// Type definition for `dojomon::models::PlayerStats` struct
export interface PlayerStats {
  player: string;
  name: string;
  gold: BigNumberish;
  level: BigNumberish;
  exp: BigNumberish;
  food: BigNumberish;
  trophies: BigNumberish;
  league: CairoOption<League>;
}

export interface Lobby {
  lobby_code: BigNumberish;
  host_player: string;
  guest_player: string;
  host_ready: boolean;
  guest_ready: boolean;
  host_dojomon_id: BigNumberish;
  guest_dojomon_id: BigNumberish;
  is_vaceant: boolean;
  lobby_type: CairoOption<LobbyType>;
  turn: string;

  lobby_league: CairoOption<League>;
  lobby_exp: BigNumberish;
  lobby_level: BigNumberish;
}

export interface Friend {
  player: string;
  friend: string;
}

export interface ReceiverFriendRequest {
  receiver: string;
  sender: string;
  active: boolean;
  accepted: boolean;
}

// Type definition for `dojomon::models::DojoMon` struct
export interface DojoMon {
  dojomon_id: BigNumberish;
  player: string;
  name: string;
  health: BigNumberish;
  attack: BigNumberish;
  defense: BigNumberish;
  speed: BigNumberish;
  level: BigNumberish;
  exp: BigNumberish;
  evolution: BigNumberish;
  dojomon_type: CairoOption<DojomonType>;
  position: Position;
  is_free: boolean;
  is_being_caught: boolean;
}

// Type definition for `dojomon::models::DojoBall` struct
export interface DojoBall {
  dojoball_id: BigNumberish;
  player: string;
  dojomon_id: BigNumberish;
  position: Position;
  dojoball_type: CairoOption<DojoBallType>;
  has_dojomon: boolean;
}

// Type definition for `dojomon::models::Counter` struct
export interface Counter {
  counter: BigNumberish;
  player_count: BigNumberish;
  dojoball_count: BigNumberish;
  dojomon_count: BigNumberish;
}

export interface Move {
  id: BigNumberish;
  name: string;
  description: string;
  power: BigNumberish;
  accuracy: BigNumberish;
  move_type: CairoOption<DojoBallType>;
  effect: CairoOption<MoveEffect>;
}

// Type definition for `dojomon::models::Position` struct
export interface Position {
  x: BigNumberish;
  y: BigNumberish;
}

export enum MoveEffect {
  Burn,
  Paralyze,
  Confuse,
  LowerSpecialDefense,
  Flinch,
  Freeze,
}

// Type definition for `dojomon::models::LobbyType` enum
export enum LobbyType {
  Public,
  Private,
}

// Type definition for `dojomon::models::DojomonType` enum
export enum DojomonType {
  Fire,
  Water,
  Grass,
  Electric,
  Normal,
  Flying,
  Rock,
  Ground,
  Ice,
  Bug,
  Psychic,
  Dark,
  Steel,
  Dragon,
  Fairy,
  Ghost,
  Poison,
  Fighting,
}

// Type definition for `dojomon::models::DojoBallType` enum
export enum DojoBallType {
  Dojoball,
  Greatball,
  Ultraball,
  Masterball,
}

// Type definition for `dojomon::models::League` enum
export enum League {
  Bronze,
  Silver,
  Gold,
  Platinum,
  Diamond,
  Master,
  Grandmaster,
}

export interface SchemaType extends ISchemaType {
  dojomon: {
    PlayerStats: WithFieldOrder<PlayerStats>;
    Lobby: WithFieldOrder<Lobby>;
    Friend: WithFieldOrder<Friend>;
    ReceiverFriendRequest: WithFieldOrder<ReceiverFriendRequest>;
    DojoMon: WithFieldOrder<DojoMon>;
    DojoBall: WithFieldOrder<DojoBall>;
    Counter: WithFieldOrder<Counter>;
    Position: WithFieldOrder<Position>;
    Move: WithFieldOrder<Move>;
  };
}

export const schema: SchemaType = {
  dojomon: {
    PlayerStats: {
      fieldOrder: [
        "player",
        "name",
        "gold",
        "level",
        "exp",
        "food",
        "trophies",
        "league",
      ],
      player: "",
      name: "",
      gold: 0,
      level: 0,
      exp: 0,
      food: 0,
      trophies: 0,
      league: new CairoOption<League>(CairoOptionVariant.None),
    },

    Lobby: {
      fieldOrder: [
        "lobby_code",
        "host_player",
        "guest_player",
        "host_ready",
        "guest_ready",
        "host_dojomon_id",
        "guest_dojomon_id",
        "is_vaceant",
        "lobby_type",
        "turn",
        "lobby_league",
        "lobby_exp",
        "lobby_level",
      ],
      lobby_code: 0,
      host_player: "",
      guest_player: "",
      host_ready: false,
      guest_ready: false,
      host_dojomon_id: 0,
      guest_dojomon_id: 0,
      is_vaceant: false,
      lobby_type: new CairoOption<LobbyType>(CairoOptionVariant.None),
      turn: "",
      lobby_league: new CairoOption<League>(CairoOptionVariant.None),
      lobby_exp: 0,
      lobby_level: 0,
    },

    Friend: {
      fieldOrder: ["player", "friend"],
      player: "",
      friend: "",
    },

    ReceiverFriendRequest: {
      fieldOrder: ["sender", "receiver", "active", "accepted"],
      sender: "",
      receiver: "",
      active: false,
      accepted: false,
    },

    DojoMon: {
      fieldOrder: [
        "dojomon_id",
        "player",
        "name",
        "health",
        "attack",
        "defense",
        "speed",
        "level",
        "exp",
        "evolution",
        "dojomon_type",
        "position",
        "is_free",
        "is_being_caught",
      ],
      dojomon_id: 0,
      player: "",
      name: "",
      health: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      level: 0,
      exp: 0,
      evolution: 0,
      dojomon_type: new CairoOption<DojomonType>(CairoOptionVariant.None),
      position: { x: 0, y: 0 },
      is_free: true,
      is_being_caught: false,
    },

    DojoBall: {
      fieldOrder: [
        "dojoball_id",
        "player",
        "dojomon_id",
        "position",
        "dojoball_type",
        "has_dojomon",
      ],
      dojoball_id: "",
      player: "",
      dojomon_id: "",
      position: { x: 0, y: 0 },
      dojoball_type: new CairoOption<DojoBallType>(CairoOptionVariant.None),
      has_dojomon: false,
    },

    Counter: {
      fieldOrder: [
        "counter",
        "player_count",
        "dojoball_count",
        "dojomon_count",
      ],
      counter: 0,
      player_count: 0,
      dojoball_count: 0,
      dojomon_count: 0,
    },

    Position: {
      fieldOrder: ["x", "y"],
      x: 0,
      y: 0,
    },

    Move: {
      fieldOrder: [
        "id",
        "name",
        "description",
        "power",
        "accuracy",
        "move_type",
        "effect",
      ],
      id: 0,
      name: "",
      description: "",
      power: 0,
      accuracy: 0,
      move_type: new CairoOption<DojoBallType>(CairoOptionVariant.None),
      effect: new CairoOption<MoveEffect>(CairoOptionVariant.None),
    },
  },
};
export enum ModelsMapping {
  PlayerStats = "dojomon-PlayerStats",
  Lobby = "dojomon-Lobby",
  Friend = "dojomon-Friend",
  SenderFriendRequest = "dojomon-SenderFriendRequest",
  ReceiverFriendRequest = "dojomon-ReceiverFriendRequest",
  DojoMon = "dojomon-DojoMon",
  DojoBall = "dojomon-DojoBall",
  Counter = "dojomon-Counter",
  Position = "dojomon-Position",
  DojomonType = "dojomon-DojomonType",
  DojoBallType = "dojomon-DojoBallType",
  League = "dojomon-League",
  Move = "dojomon-Move",
}
