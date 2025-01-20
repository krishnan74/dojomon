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
  "0x057a6377949ade2eaf15acc9a57b1bf623b5791e70654df864b1428dfc041ace";

const BATTLE_ADDRESS =
  "0x0650266f43afb264986a8738a0964c1968597c6bde505212e26b6063da2bd692";

const FRIEND_ADDRESS =
  "0x074adf429f0484603a007de9f56ff493465241d6e13214e8ef02d65a75c5956c";

const LOBBY_ADDRESS =
  "0x0500fae744da1afe24828b485a99aa8e3b2f1595179184182a270a843b6cb3d6";

const SHOP_ADDRESS =
  "0x0531dc5251669303907e7137b0e3818aa5bf2292bbd1248220e88cde7598f61a";

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
      connectors={pa}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
