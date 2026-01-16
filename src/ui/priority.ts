import { colors } from "./design";

export type Priority = "low" | "medium" | "high" | "düşük" | "orta" | "yüksek";

export function normalizePriority(p?: string): "low" | "medium" | "high" {
  const v = (p || "").toLowerCase();
  if (v === "yüksek" || v === "high") return "high";
  if (v === "orta" || v === "medium") return "medium";
  return "low";
}

export function priorityLabel(p?: string) {
  const v = normalizePriority(p);
  if (v === "high") return "Yüksek";
  if (v === "medium") return "Orta";
  return "Düşük";
}

export function priorityColors(p?: string) {
  const v = normalizePriority(p);
  if (v === "high") return { bg: "#FFE7E7", fg: "#B91C1C", dot: colors.danger };
  if (v === "medium") return { bg: "#FFF4DA", fg: "#92400E", dot: colors.accent };
  return { bg: "#E9FBEF", fg: "#166534", dot: colors.success };
}
