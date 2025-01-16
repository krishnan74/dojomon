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
  "0x34f280e64e9e2d1ad0910429e658611acfd9a7804ee931c0f57cb11abb46049";

const BATTLE_ADDRESS =
  "0x73c76d1c5f35f6f410b33697486054516d7a841ca89506bf17dd867bacb3546";

const FRIEND_ADDRESS =
  "0x04ac0ef61f7f06f302ba43a472bf4c92aeb9413c19620d57d15758182f949c73";

const policies: SessionPolicies = {
  contracts: {
    [ACTIONS_ADDRESS]: {
      methods: [
        {
          name: "actions",
          entrypoint: "spawnPlayer",
        },
        { name: "actions", entrypoint: "createLobby" },
      ],
    },
    [BATTLE_ADDRESS]: {
      methods: [
        {
          name: "battle",
          entrypoint: "attack",
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
