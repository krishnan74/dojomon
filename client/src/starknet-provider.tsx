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

const ETH_TOKEN_ADDRESS =
  "0x7a1c71029f2d0b38e3ac89b09931d08b6e48417e079c289ff19a8698d0cba33";

const policies: SessionPolicies = {
  contracts: {
    [ETH_TOKEN_ADDRESS]: {
      methods: [
        {
          name: "actions",
          entrypoint: "spawnPlayer",
        },
        { name: "actions", entrypoint: "createLobby" },
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
