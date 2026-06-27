"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/store/preferences";

/** Convert hex (#RRGGBB) → Tailwind-style "H S% L%" string. */
function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Lighten/darken an HSL string by N percentage points of L. */
function shiftL(hsl: string, delta: number): string {
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!m) return hsl;
  const [, h, s, l] = m;
  const next = Math.max(0, Math.min(100, Number(l) + delta));
  return `${h} ${s}% ${next}%`;
}

export function ThemePaletteApplier() {
  const palette = usePreferences((s) => s.palette);
  const customSwatch = usePreferences((s) => s.customSwatch);

  useEffect(() => {
    const root = document.documentElement;

    if (palette === "midnight") {
      root.removeAttribute("data-palette");
    } else {
      root.setAttribute("data-palette", palette);
    }

    // Custom Palette — drive CSS variables directly from the three swatches.
    // swatch[0] = sidebar/background, [1] = brand, [2] = accent.
    if (palette === "custom") {
      const bgHsl = hexToHsl(customSwatch[0]);
      const brandHsl = hexToHsl(customSwatch[1]);
      const accentHsl = hexToHsl(customSwatch[2]);

      root.style.setProperty("--sidebar", bgHsl);
      root.style.setProperty("--sidebar-foreground", "0 0% 96%");
      root.style.setProperty("--sidebar-accent", brandHsl);
      root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%");
      root.style.setProperty("--sidebar-border", shiftL(bgHsl, 8));

      root.style.setProperty("--primary", brandHsl);
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--ring", brandHsl);
      root.style.setProperty("--accent", shiftL(accentHsl, 35));
      root.style.setProperty("--accent-foreground", brandHsl);
    } else {
      // Clear any leftover overrides so the palette stylesheet wins again.
      [
        "--sidebar",
        "--sidebar-foreground",
        "--sidebar-accent",
        "--sidebar-accent-foreground",
        "--sidebar-border",
        "--primary",
        "--primary-foreground",
        "--ring",
        "--accent",
        "--accent-foreground",
      ].forEach((v) => root.style.removeProperty(v));
    }
  }, [palette, customSwatch]);

  return null;
}
