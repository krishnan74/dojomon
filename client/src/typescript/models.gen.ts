import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoOption, CairoOptionVariant, BigNumberish } from "starknet";

type WithFieldOrder<T> = T & { fieldOrder: string[] };

// Type definition for `dojo_starter::models::PlayerStats` struct
export interface PlayerStats {
  player: string;
  gold: BigNumberish;
  level: BigNumberish;
  exp: BigNumberish;
  food: BigNumberish;
  trophies: BigNumberish;
  league: CairoOption<League>;
  host_lobby_code: string;
}

export interface Lobby {
  lobby_code: string;
  host_player: string;
  guest_player: string;
  host_ready: boolean;
  guest_ready: boolean;
  host_dojomon_id: string;
  guest_dojomon_id: string;
  can_join: boolean;
}

export interface Friend {
  player: string;
  friend: string;
}

export interface ReceiverFriendRequest {
  sender: string;
  receiver: string;
  active: boolean;
  accepted: boolean;
}

// Type definition for `dojo_starter::models::DojoMon` struct
export interface DojoMon {
  dojomon_id: string;
  player: string;
  name: string;
  health: BigNumberish;
  attack: BigNumberish;
  defense: BigNumberish;
  speed: BigNumberish;
  level: BigNumberish;
  exp: BigNumberish;
  dojomon_type: CairoOption<DojomonType>;
  position: Position;
}

// Type definition for `dojo_starter::models::DojoBall` struct
export interface DojoBall {
  dojoball_id: string;
  player: string;
  dojomon_id: string;
  position: Position;
  dojoball_type: CairoOption<DojoBallType>;
  has_dojomon: boolean;
}

// Type definition for `dojo_starter::models::Counter` struct
export interface Counter {
  counter: BigNumberish;
  player_count: BigNumberish;
  dojoball_count: BigNumberish;
  dojomon_count: BigNumberish;
}

// Type definition for `dojo_starter::models::Position` struct
export interface Position {
  x: BigNumberish;
  y: BigNumberish;
}

// Type definition for `dojo_starter::models::DojomonType` enum
export enum DojomonType {
  Fire,
  Water,
  Grass,
}

// Type definition for `dojo_starter::models::DojoBallType` enum
export enum DojoBallType {
  Dojoball,
  Greatball,
  Ultraball,
  Masterball,
}

// Type definition for `dojo_starter::models::League` enum
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
  dojo_starter: {
    PlayerStats: WithFieldOrder<PlayerStats>;
    Lobby: WithFieldOrder<Lobby>;
    Friend: WithFieldOrder<Friend>;
    ReceiverFriendRequest: WithFieldOrder<ReceiverFriendRequest>;
    DojoMon: WithFieldOrder<DojoMon>;
    DojoBall: WithFieldOrder<DojoBall>;
    Counter: WithFieldOrder<Counter>;
    Position: WithFieldOrder<Position>;
  };
}

export const schema: SchemaType = {
  dojo_starter: {
    PlayerStats: {
      fieldOrder: [
        "player",
        "gold",
        "level",
        "exp",
        "food",
        "trophies",
        "league",
        "host_lobby_code",
      ],
      player: "",
      gold: 0,
      level: 0,
      exp: 0,
      food: 0,
      trophies: 0,
      league: new CairoOption<League>(CairoOptionVariant.None),
      host_lobby_code: "",
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
        "can_join",
      ],
      lobby_code: "",
      host_player: "",
      guest_player: "",
      host_ready: false,
      guest_ready: false,
      host_dojomon_id: "",
      guest_dojomon_id: "",
      can_join: false,
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
        "dojomon_type",
        "position",
      ],
      dojomon_id: "",
      player: "",
      name: "",
      health: 0,
      attack: 0,
      defense: 0,
      speed: 0,
      level: 0,
      exp: 0,
      dojomon_type: new CairoOption<DojomonType>(CairoOptionVariant.None),
      position: { x: 0, y: 0 },
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
  },
};
export enum ModelsMapping {
  PlayerStats = "dojo_starter-PlayerStats",
  Lobby = "dojo_starter-Lobby",
  Friend = "dojo_starter-Friend",
  SenderFriendRequest = "dojo_starter-SenderFriendRequest",
  ReceiverFriendRequest = "dojo_starter-ReceiverFriendRequest",
  DojoMon = "dojo_starter-DojoMon",
  DojoBall = "dojo_starter-DojoBall",
  Counter = "dojo_starter-Counter",
  Position = "dojo_starter-Position",
  DojomonType = "dojo_starter-DojomonType",
  DojoBallType = "dojo_starter-DojoBallType",
  League = "dojo_starter-League",
}
