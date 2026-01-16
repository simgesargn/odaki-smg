export type ThemeShape = {
	colors: {
		primary: string;
		primarySoft: string;
		accent: string;
		background: string;
		card: string;
		text: string;
		mutedText: string;
		border: string;
		success: string;
		warning: string;
		danger: string;
	};
	bg: string;
	card: string;
	text: string;
	subtext: string;
	primary: string;
	primarySoft: string;
	border: string;
	danger: string;
	muted: string;
	success: string;
	warning: string;
	spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; r: (n: number) => number };
	radius: { sm: number; md: number; lg: number; xl: number };
	shadow: any;
	typography: { title: number; body: number; caption: number };
};

function buildTheme(colors: ThemeShape["colors"], spacing: ThemeShape["spacing"], radius: ThemeShape["radius"], shadow: any, typography: any): ThemeShape {
	return {
		colors,
		bg: colors.background,
		card: colors.card,
		text: colors.text,
		subtext: colors.mutedText,
		primary: colors.primary,
		primarySoft: colors.primarySoft,
		border: colors.border,
		danger: colors.danger,
		muted: colors.mutedText,
		success: colors.success,
		warning: colors.warning,
		spacing,
		radius,
		shadow,
		typography,
	};
}

const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	r: (n: number) => n,
};

const baseRadius = { sm: 10, md: 16, lg: 22, xl: 28 };
const baseShadow = {
	sm: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
	md: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
	lg: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
	card: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
};

export const light = buildTheme(
	{
		primary: "#6C63FF",
		primarySoft: "#E9E7FF",
		accent: "#FF5A7A",
		background: "#F6F6FA",
		card: "#FFFFFF",
		text: "#111827",
		mutedText: "#6B7280",
		border: "#E5E7EB",
		success: "#22C55E",
		warning: "#F59E0B",
		danger: "#FF5A7A",
	},
	spacing,
	baseRadius,
	baseShadow,
	{ title: 18, body: 14, caption: 12 }
);

export const dark = buildTheme(
	{
		primary: "#6C63FF",
		primarySoft: "#1F1333",
		accent: "#FF5A7A",
		background: "#0B1020",
		card: "#111827",
		text: "#F9FAFB",
		mutedText: "#9CA3AF",
		border: "#1F2937",
		success: "#22C55E",
		warning: "#F59E0B",
		danger: "#FF5A7A",
	},
	spacing,
	baseRadius,
	{
		sm: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
		md: { shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
		lg: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 6 },
		card: { shadowColor: "#000", shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
	},
	{ title: 18, body: 14, caption: 12 }
);

// getTheme guaranteed returns valid ThemeShape
export function getTheme(mode?: "light" | "dark"): ThemeShape {
	if (mode === "dark") return dark;
	return light;
}

// --- NEW: named compatibility exports ---
// default named theme for legacy imports: `import { theme } from ".../ui/theme"`
export const theme = getTheme("light");
// convenience for files that do `import { colors } from ".../ui/theme"`
export const colors = theme.colors;

// default export for legacy default-imports
export default getTheme("light");
