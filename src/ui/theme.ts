export const theme = {
	colors: {
		bg: "#F6F7FB",
		surface: "#FFFFFF",
		text: "#111111",
		muted: "#6B7280",
		primary: "#6C5CE7", // odaki moru
		primarySoft: "#EDEBFF",
		danger: "#EF4444",
		border: "#E6E7EB",
	},
	spacing: {
		s4: 4,
		s8: 8,
		s12: 12,
		s16: 16,
		s20: 20,
		s24: 24,
		s32: 32,
	},
	radius: {
		r12: 12,
		r16: 16,
		r20: 20,
	},
	shadow: {
		cardShadow: {
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.08,
			shadowRadius: 12,
			elevation: 3,
		},
	},
	textStyles: {
		h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 36 },
		h2: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
		body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
		caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
	},
};
