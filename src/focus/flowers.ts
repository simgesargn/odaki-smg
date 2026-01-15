export type FlowerId = "seed" | "lotus" | "sunflower" | "orchid" | "pink" | "default";

export const FLOWERS: Record<FlowerId, { id: FlowerId; title: string; emoji: string }> = {
  seed: { id: "seed", title: "Tohum", emoji: "🌱" },
  lotus: { id: "lotus", title: "Lotus", emoji: "🪷" },
  sunflower: { id: "sunflower", title: "Ayçiçeği", emoji: "🌻" },
  orchid: { id: "orchid", title: "Orkide", emoji: "🌸" },
  pink: { id: "pink", title: "Çiçek", emoji: "🌺" },
  default: { id: "default", title: "Çiçek", emoji: "🌼" },
};

export function normalizeFlowerId(input: any): FlowerId {
  if (!input && input !== 0) return "default";
  if (typeof input === "string") {
    const k = input.trim().toLowerCase();
    // Treat legacy "tohum"/"seed" as generic "Çiçek"
    if (k === "tohum" || k === "seed") return "default";
    if (k.includes("lotus")) return "lotus";
    if (k.includes("ayçi") || k.includes("ayci") || k.includes("sunflower")) return "sunflower";
    if (k.includes("orkide") || k.includes("orchid")) return "orchid";
    if (k.includes("pink") || k.includes("pembe") || k.includes("çiçek")) return "pink";
    return (Object.keys(FLOWERS).includes(k) ? (k as FlowerId) : "default");
  }
  // object: try common fields
  if (typeof input === "object") {
    const maybe = (input.id ?? input.type ?? input.name ?? input.title) as any;
    return normalizeFlowerId(maybe);
  }
  return "default";
}

export function formatFlowerTitle(id: FlowerId): string {
  return FLOWERS[id]?.title ?? "Çiçek";
}

export function flowerEmoji(id: FlowerId): string {
  return FLOWERS[id]?.emoji ?? FLOWERS["default"].emoji;
}
