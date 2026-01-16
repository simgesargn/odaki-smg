export const colors = {
  primary: "#6D5EF3",
  primary2: "#FF6EC7",
  primarySoft: "#E8F0FF",
  bg: "#F6F7FB",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  success: "#22C55E",
  warning: "#FFB020",
  danger: "#EF4444",
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
};

export const typography = {
  h1: { fontSize: 22, fontWeight: "800" as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: "800" as const, color: colors.text },
  body: { fontSize: 14, fontWeight: "500" as const, color: colors.text },
  muted: { fontSize: 13, fontWeight: "500" as const, color: colors.muted },
};

export const theme = {
  colors,
  radius,
  spacing,
  shadow,
  typography,
};

export type Theme = typeof theme;

export default theme;
