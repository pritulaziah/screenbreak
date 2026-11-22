import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme, loadCachedTheme } from "./theme";

describe("theme cache", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark");
  });

  it("falls back to the dark cozy theme", () => {
    expect(loadCachedTheme()).toEqual({ theme: "cozy", appearance: "dark" });
  });

  it("ignores unknown theme ids", () => {
    localStorage.setItem("screenbreak.theme", "forest");
    localStorage.setItem("screenbreak.appearance", "light");

    expect(loadCachedTheme()).toEqual({ theme: "cozy", appearance: "light" });
  });

  it("applies the theme to the document and caches it", () => {
    applyTheme("night", "dark");

    expect(document.documentElement.dataset.theme).toBe("night");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("screenbreak.theme")).toBe("night");
    expect(localStorage.getItem("screenbreak.appearance")).toBe("dark");
  });
});
