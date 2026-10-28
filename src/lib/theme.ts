import type { Appearance, ThemeId } from "./types";

const THEME_KEY = "screenbreak.theme";
const APPEARANCE_KEY = "screenbreak.appearance";

const LEGACY_THEMES: Record<string, ThemeId> = {
  forest: "nature",
  cyberpunk: "night",
  anime: "cozy",
};

function normalizeTheme(value: string | null): ThemeId {
  if (value === "cozy" || value === "night" || value === "nature") {
    return value;
  }
  if (value && value in LEGACY_THEMES) {
    return LEGACY_THEMES[value];
  }
  return "cozy";
}

export function applyTheme(theme: ThemeId, appearance: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", appearance === "dark");
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(APPEARANCE_KEY, appearance);
}

export function loadCachedTheme(): { theme: ThemeId; appearance: Appearance } {
  return {
    theme: normalizeTheme(localStorage.getItem(THEME_KEY)),
    appearance:
      localStorage.getItem(APPEARANCE_KEY) === "light" ? "light" : "dark",
  };
}
