import { sepolia, mainnet, Chain } from "@starknet-react/chains";

import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";

import type { PropsWithChildren } from "react";
import {
  jsonRpcProvider,
  StarknetConfig,
  voyager,
  starkscan,
} from "@starknet-react/core";
import { dojoConfig } from "../dojoConfig";

import {
  predeployedAccounts,
  PredeployedAccountsConnector,
} from "@dojoengine/predeployed-connector";

let pa: PredeployedAccountsConnector[] = [];
predeployedAccounts({
  rpc: dojoConfig.rpcUrl as string,
  id: "katana",
  name: "Katana",
}).then((p) => (pa = p));

const ACTIONS_ADDRESS =
  "0x0592c4ad898753d3641b868701cfad478d92b07241f40f9698d5c655bb546c2c";

const BATTLE_ADDRESS =
  "0x02520185667f93e25c80c6d57c5144a55bd7db2df437f0a269e54a4b767b62dc";

const FRIEND_ADDRESS =
  "0x074adf429f0484603a007de9f56ff493465241d6e13214e8ef02d65a75c5956c";

const LOBBY_ADDRESS =
  "0x05b0bc305640ed535a46860bfafc3e1a83320edbdc66a2cc05d3ef469c9f94a7";

const SHOP_ADDRESS =
  "0x06c8ff113357e29c53ce5381424e3a8fc649bd0b16cf07571af3d2b34337a0fb";

const policies: SessionPolicies = {
  contracts: {
    [ACTIONS_ADDRESS]: {
      methods: [
        {
          name: "actions",
          entrypoint: "spawnPlayer",
        },
        { name: "actions", entrypoint: "createDojomon" },
        { name: "actions", entrypoint: "feedDojomon" },
      ],
    },
    [BATTLE_ADDRESS]: {
      methods: [
        {
          name: "battle",
          entrypoint: "attack",
        },
        {
          name: "battle",
          entrypoint: "endBattle",
        },
      ],
    },
    [FRIEND_ADDRESS]: {
      methods: [
        {
          name: "friendSystem",
          entrypoint: "sendFriendRequest",
        },
        {
          name: "friendSystem",
          entrypoint: "acceptFriendRequest",
        },
      ],
    },
    [LOBBY_ADDRESS]: {
      methods: [
        {
          name: "lobby",
          entrypoint: "createLobby",
        },
        {
          name: "lobby",
          entrypoint: "joinLobby",
        },
        {
          name: "lobby",
          entrypoint: "selectDojomon",
        },
        {
          name: "lobby",
          entrypoint: "readyForBattle",
        },
      ],
    },
    [SHOP_ADDRESS]: {
      methods: [
        {
          name: "shop",
          entrypoint: "buyDojoBall",
        },
      ],
    },
  },
};

const connector = new ControllerConnector({
  policies,
  rpc: dojoConfig.rpcUrl,
});

// const provider = jsonRpcProvider({
//   rpc: (chain: Chain) => {
//     switch (chain) {
//       case mainnet:
//         return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
//       case sepolia:

//       default:
//         return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
//     }
//   },
// });

export default function StarknetProvider({ children }: PropsWithChildren) {
  const provider = jsonRpcProvider({
    rpc: () => ({ nodeUrl: dojoConfig.rpcUrl as string }),
  });

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={[connector]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
