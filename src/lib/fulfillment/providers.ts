import type { FulfillmentProvider } from "@/lib/domain";

/** PRD §7 — the fixed set of providers Moonfield can route a line item to. */
export const FULFILLMENT_PROVIDERS: Record<FulfillmentProvider["id"], FulfillmentProvider> = {
  LOCAL: {
    id: "LOCAL",
    name: "Moonfield Local Fulfillment",
    type: "PHYSICAL",
    capabilities: { productionModes: ["STOCK"], supportsTracking: true },
  },
  ELASTICSTAGE: {
    id: "ELASTICSTAGE",
    name: "elasticStage",
    type: "PHYSICAL",
    capabilities: { productionModes: ["ON_DEMAND"], supportsTracking: true },
  },
  PRINT_PROVIDER: {
    id: "PRINT_PROVIDER",
    name: "Print-on-demand Provider",
    type: "PHYSICAL",
    capabilities: { productionModes: ["ON_DEMAND"], supportsTracking: true },
  },
  NIX_INTERNAL: {
    id: "NIX_INTERNAL",
    name: "NiX Internal",
    type: "PHYSICAL",
    capabilities: { productionModes: ["STOCK", "ON_DEMAND"], supportsTracking: false },
  },
  DIGITAL: {
    id: "DIGITAL",
    name: "Digital Delivery",
    type: "DIGITAL",
    capabilities: { productionModes: ["ON_DEMAND"], supportsTracking: false },
  },
};
