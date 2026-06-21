"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/store/preferences";

export function ThemePaletteApplier() {
  const palette = usePreferences((s) => s.palette);

  useEffect(() => {
    const root = document.documentElement;
    if (palette === "midnight") {
      root.removeAttribute("data-palette");
    } else {
      root.setAttribute("data-palette", palette);
    }
  }, [palette]);

  return null;
}
