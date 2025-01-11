import { createDojoConfig } from "@dojoengine/core";

import manifest from "../contract/manifest_dev.json";

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl : "https://api.cartridge.gg/x/demo1/katana" ,
  toriiUrl: "https://api.cartridge.gg/x/demo1/torii",
  relayUrl:""
});

