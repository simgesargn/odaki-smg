export const colors = {
  primary: "#6D5EF6",
  primary2: "#B45CFF",
  primarySoft: "#F1EEFF",
  bg: "#F6F7FB",
  background: "#F6F7FB",
  card: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  accent: "#6D5EF6",
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
};

// backward compat alias
export const radii = radius;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};

export const typography = {
  h1: { fontSize: 32, fontWeight: "900" as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: "800" as const, color: colors.text },
  body: { fontSize: 16, fontWeight: "500" as const, color: colors.text },
  muted: { fontSize: 13, fontWeight: "500" as const, color: colors.muted },
};

export const theme = {
  colors,
  radius,
  radii,
  spacing,
  shadow,
  typography,
};

export type Theme = typeof theme;
export default theme;
