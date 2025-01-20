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
import Navbar from "./components/Navbar.tsx";
import GameCanvas from "./GameCanvas.tsx";

import Home from "./pages/Home.tsx";
import Battle from "./pages/Battle.tsx";
import WaitLobby from "./pages/WaitLobby.tsx";
import NoPage from "./pages/NoPage.tsx";
import SelectDojomon from "./pages/SelectDojomon.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NewGameCanvas from "./NewGameCanvas.tsx";

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

          <BrowserRouter>
            <Routes>
              <Route index element={<Home />} />
              <Route
                path="game"
                element={<NewGameCanvas/>}
              />
              {/* <Route path="test" element={<App />}></Route> */}
              <Route path="battle/:lobbyCode" element={<Battle />} />
              <Route path="lobby/:lobbyCode" element={<WaitLobby />} />
              <Route
                path="selectDojomon/:lobbyCode"
                element={<SelectDojomon />}
              />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </BrowserRouter>
          {/* <GameCanvas pokeballPosition={{ x: 0, y: 0 }} /> */}
        </StarknetProvider>
      </DojoSdkProvider>
    </StrictMode>
  );
}

main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
