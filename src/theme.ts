export interface Theme {
  name: string;
  bg: string;           // root background
  surface: string;      // bars, panels, modals
  overlay: string;      // buttons, divider characters, modal borders
  border: string;       // thin separator lines (fg on text elements)
  card: string;         // picker card background
  cardSelected: string; // picker card when selected
  selection: string;    // sidebar selected item background
  accent: string;       // primary accent color
  text: string;         // primary text
  textMuted: string;    // secondary text (sidebar items, help keys)
  textFaint: string;    // tertiary text (add buttons, status, help labels)
  textDim: string;      // barely-visible text (new-project card, hints)
}

const themes: Record<string, Theme> = {
  default: {
    name: "Default Dark",
    bg: "#0D0D0D",
    surface: "#111111",
    overlay: "#222222",
    border: "#1A1A1A",
    card: "#181818",
    cardSelected: "#1E1E1E",
    selection: "#141414",
    accent: "#E63946",
    text: "#F5F5F0",
    textMuted: "#999999",
    textFaint: "#666666",
    textDim: "#2E2E2E",
  },
  "catppuccin-mocha": {
    name: "Catppuccin Mocha",
    bg: "#1E1E2E",
    surface: "#181825",
    overlay: "#313244",
    border: "#313244",
    card: "#282A3A",
    cardSelected: "#363849",
    selection: "#313244",
    accent: "#F38BA8",
    text: "#CDD6F4",
    textMuted: "#BAC2DE",
    textFaint: "#6C7086",
    textDim: "#45475A",
  },
  nord: {
    name: "Nord",
    bg: "#2E3440",
    surface: "#3B4252",
    overlay: "#4C566A",
    border: "#434C5E",
    card: "#3B4252",
    cardSelected: "#434C5E",
    selection: "#3D4455",
    accent: "#BF616A",
    text: "#ECEFF4",
    textMuted: "#D8DEE9",
    textFaint: "#7B8CA0",
    textDim: "#4C566A",
  },
  "rose-pine": {
    name: "Rosé Pine",
    bg: "#191724",
    surface: "#1F1D2E",
    overlay: "#26233A",
    border: "#26233A",
    card: "#1F1D2E",
    cardSelected: "#26233A",
    selection: "#21202E",
    accent: "#EB6F92",
    text: "#E0DEF4",
    textMuted: "#908CAA",
    textFaint: "#6E6A86",
    textDim: "#403D52",
  },
};

export const themeNames = Object.keys(themes);

export function getTheme(name: string): Theme {
  return themes[name] ?? themes.default;
}
