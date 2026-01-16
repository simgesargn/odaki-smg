export const colors = {
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",

  // Brand (Figma'dan farklı, özgün palet)
  primary: "#2F6FED",      // mavi
  primarySoft: "#E8F0FF",
  accent: "#FFB020",       // amber
  accentSoft: "#FFF4DA",
  danger: "#EF4444",
  success: "#22C55E",
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};

export const spacing = (n: number) => n * 8;

export const textStyles = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: colors.text },
  h2: { fontSize: 16, fontWeight: "800" as const, color: colors.text },
  body: { fontSize: 14, fontWeight: "500" as const, color: colors.text },
  muted: { fontSize: 13, fontWeight: "500" as const, color: colors.muted },
};
