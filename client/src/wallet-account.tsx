import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import { useCallback, useState } from "react";

export function WalletAccount() {
  const { connectAsync, connectors } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [pendingConnectorId, setPendingConnectorId] = useState<
    string | undefined
  >(undefined);

  const connect = useCallback(
    async (connector: Connector) => {
      setPendingConnectorId(connector.id);
      try {
        await connectAsync({ connector });
      } catch (error) {
        console.error(error);
      }
      setPendingConnectorId(undefined);
    },
    [connectAsync]
  );

  function isWalletConnecting(connectorId: string) {
    return pendingConnectorId === connectorId;
  }

  if (undefined !== address) {
    return (
      <div className="">
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => disconnect()}
            className="text-black border border-black p-3"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-white">Connect Wallet</h2>
      <div className="grid grid-cols-4 gap-10">
        {}
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect(connector)}
            disabled={!connector.available()}
            className="text-black border border-black p-3 text-[8px] "
          >
            {connector.name}

            {isWalletConnecting(connector.id) && "Connecting"}
          </button>
        ))}
      </div>
    </div>
  );
}
