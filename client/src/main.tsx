import { createRoot } from "react-dom/client";

//import App from "./App.tsx";

import "./index.css";
import { init } from "@dojoengine/sdk";
import { SchemaType, schema } from "./typescript bindings/models.gen.ts";
import { dojoConfig } from "../dojoConfig.ts";
import { DojoSdkProvider } from "./dojo-sdk-provider.tsx";
import { setupBurnerManager } from "@dojoengine/create-burner";
import StarknetProvider from "./starknet-provider.tsx";

import Home from "./pages/Home.tsx";
import Battle from "./pages/Battle.tsx";
import WaitLobby from "./pages/WaitLobby.tsx";
import NoPage from "./pages/NoPage.tsx";
import SelectDojomon from "./pages/SelectDojomon.tsx";

import NewGameCanvas from "./pages/Game.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreatePlayer from "./pages/CreatePlayer.tsx";
import App from "./testing/App.tsx";
import TempBattleCanvas from "./testing/TempBattleCanvas.tsx";

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
    <DojoSdkProvider
      sdk={sdk}
      burnerManager={await setupBurnerManager(dojoConfig)}
    >
      <StarknetProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/createPlayer" element={<CreatePlayer />} />
            <Route path="/game" element={<NewGameCanvas />} />
            <Route path="/battle/:lobbyCode" element={<Battle />} />
            <Route path="/lobby/:lobbyCode" element={<WaitLobby />} />
            <Route
              path="/selectYourDojomon/:lobbyCode"
              element={<SelectDojomon />}
            />
            <Route path="/test" element={<App />} />
            <Route path="/battle" element={<TempBattleCanvas />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
        {/* <GameCanvas pokeballPosition={{ x: 0, y: 0 }} /> */}
      </StarknetProvider>
    </DojoSdkProvider>
  );
}

main().catch((error) => {
  console.error("Failed to initialize the application:", error);
});
