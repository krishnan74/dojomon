import { sepolia, mainnet } from "@starknet-react/chains";

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
