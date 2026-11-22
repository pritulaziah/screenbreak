import { Leaf, Moon, Sun, type LucideIcon } from "lucide-react";
import type { ThemeId } from "./types";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "cozy",
    name: "Cozy",
    description: "Soft amber light, a quiet room, and a sleeping cat.",
    icon: Sun,
  },
  {
    id: "night",
    name: "Night",
    description: "A crescent moon, city lights, and deep violet tones.",
    icon: Moon,
  },
  {
    id: "nature",
    name: "Nature",
    description: "Sunlit leaves, plants, and a calm green room.",
    icon: Leaf,
  },
];

export function getThemeMeta(id: ThemeId) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
