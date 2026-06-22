export type Palette =
  | "midnight"
  | "charcoal-crimson"
  | "ocean"
  | "forest"
  | "amber";

export interface PaletteMeta {
  id: Palette;
  label: string;
  description: string;
  swatch: [string, string, string];
}

export const PALETTES: PaletteMeta[] = [
  {
    id: "midnight",
    label: "Arsemia Default",
    description: "Identidad oficial — azul Arsemia #2563eb sobre navy profundo.",
    swatch: ["#0b1220", "#2563eb", "#5b8bef"],
  },
  {
    id: "charcoal-crimson",
    label: "Charcoal + Crimson",
    description: "Slate grays with crimson accents. Strong, masculine, premium.",
    swatch: ["#1f2128", "#dc1f3a", "#ef5266"],
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Deep teal + cyan. Cool, clinical, modern.",
    swatch: ["#0c2230", "#0bb6c6", "#34d3e0"],
  },
  {
    id: "forest",
    label: "Forest",
    description: "Pine + emerald. Earthy, calming, eco-aligned.",
    swatch: ["#142420", "#22c55e", "#4ade80"],
  },
  {
    id: "amber",
    label: "Amber Sunset",
    description: "Warm orange + chocolate. High-energy, attention-grabbing.",
    swatch: ["#231910", "#f97316", "#fb923c"],
  },
];
