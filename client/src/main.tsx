import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./index.css";
import { init } from "@dojoengine/sdk";
import { SchemaType, schema } from "./typescript/models.gen.ts";
import { dojoConfig } from "../dojoConfig.ts";
import { DojoSdkProvider } from "./dojo-sdk-provider.tsx";
import { setupBurnerManager } from "@dojoengine/create-burner";
import StarknetProvider from "./starknet-provider.tsx";
import Demo from "./GameCanvas.tsx";
import GameCanvas from "./GameCanvas.tsx";

/**
 * Initializes and bootstraps the Dojo application.
 * Sets up the SDK, burner manager, and renders the root component.
 *
 * @throws {Error} If initialization fails
 */
async function main() {
  const sdk = await init<SchemaType>(
    {
      client: {
        rpcUrl: dojoConfig.rpcUrl,
        toriiUrl: dojoConfig.toriiUrl,
        relayUrl: dojoConfig.relayUrl,
        worldAddress: dojoConfig.manifest.world.address,
      },
      domain: {
        name: "WORLD_NAME",
        version: "1.0",
        chainId: "KATANA",
        revision: "1",
      },
    },
    schema
  );

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <DojoSdkProvider
        sdk={sdk}
        burnerManager={await setupBurnerManager(dojoConfig)}
      >
        <StarknetProvider>
          <App />
          {/* <GameCanvas pokeballPosition={{ x: 0, y: 0 }} /> */}
        </StarknetProvider>
      </DojoSdkProvider>
    </StrictMode>
  );
}

main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
