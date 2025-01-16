import { createDojoConfig } from "@dojoengine/core";

import manifest from "../contract/manifest_dev.json";

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: "https://api.cartridge.gg/x/krish74-dojomon/katana",
  toriiUrl: "https://api.cartridge.gg/x/krish74-dojomon/torii",
  relayUrl: "",
});
