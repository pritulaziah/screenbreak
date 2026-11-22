import type { Appearance, ThemeId } from "./types";

const THEME_KEY = "screenbreak.theme";
const APPEARANCE_KEY = "screenbreak.appearance";

function normalizeTheme(value: string | null): ThemeId {
  if (value === "cozy" || value === "night" || value === "nature") {
    return value;
  }
  return "cozy";
}

export function applyTheme(theme: ThemeId, appearance: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", appearance === "dark");

  try {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem(APPEARANCE_KEY, appearance);
  } catch {
    // Theme caching only prevents a first-paint flash. Settings are authoritative.
  }
}

export function loadCachedTheme(): { theme: ThemeId; appearance: Appearance } {
  try {
    return {
      theme: normalizeTheme(localStorage.getItem(THEME_KEY)),
      appearance:
        localStorage.getItem(APPEARANCE_KEY) === "light" ? "light" : "dark",
    };
  } catch {
    return { theme: "cozy", appearance: "dark" };
  }
}
