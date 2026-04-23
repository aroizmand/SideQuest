export const Colors = {
  background: "#5EC8D0", // Flappy Bird sky
  surface: "#F5E8A8", // warm sandy paper
  cream: "#fcf1de", // near-white with warm cream tint
  border: "#2C1B2E", // very dark retro outline
  primary: "#ffffff", // golden yellow — the bird
  primaryDark: "#F5C300",
  accent: "#4EA82A", // pipe green
  text: "#2C1B2E", // dark ink on light surfaces
  textSecondary: "#522e2e",
  textMuted: "#463131",
  error: "#D04040",
  success: "#4EA82A",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Pixel/retro aesthetic — boxy, minimal rounding
export const Radius = {
  sm: 0,
  md: 2,
  lg: 4,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;
