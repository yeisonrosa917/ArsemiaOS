"use client";

import { Moon, Palette as PaletteIcon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PALETTES, type Palette } from "@/lib/theme/palettes";
import { usePreferences } from "@/lib/store/preferences";
import { cn } from "@/lib/utils";

export function AppearanceCard() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const {
    palette,
    setPalette,
    sidebarSide,
    setSidebarSide,
    customSwatch,
    setCustomSwatch,
  } = usePreferences();

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PaletteIcon className="h-4 w-4 text-primary" />
          Appearance
        </CardTitle>
        <CardDescription>
          Pick a color palette, mode and sidebar position. Saved per device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mode
          </p>
          <div className="mt-2 grid max-w-xs grid-cols-2 gap-2">
            <Button
              variant={isDark ? "outline" : "default"}
              size="sm"
              className="justify-start gap-2"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" /> Light
            </Button>
            <Button
              variant={isDark ? "default" : "outline"}
              size="sm"
              className="justify-start gap-2"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" /> Dark
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Palette
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTES.map((p) => {
              const active = p.id === palette;
              const swatch = p.id === "custom" ? customSwatch : p.swatch;
              return (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id as Palette)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-all hover:border-primary/60 hover:bg-accent/40",
                    active && "border-primary bg-primary/5 shadow-soft",
                  )}
                >
                  <div className="flex h-10 w-16 overflow-hidden rounded-lg border border-border/60 shadow-soft">
                    {swatch.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">
                      {p.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  </div>
                  {active && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {palette === "custom" && (
            <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Custom palette swatches
              </p>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {(["Background", "Brand", "Accent"] as const).map((label, i) => (
                  <label key={label} className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold text-muted-foreground">{label}</span>
                    <input
                      type="color"
                      value={customSwatch[i]}
                      onChange={(e) => {
                        const next = [...customSwatch] as [string, string, string];
                        next[i] = e.target.value;
                        setCustomSwatch(next);
                      }}
                      className="h-9 w-full cursor-pointer rounded border border-border bg-transparent"
                    />
                    <code className="text-[10px]">{customSwatch[i]}</code>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Swatches are stored per device. Full CSS-variable theming lands
                when the palette engine ships — for now this is a visual preview slot.
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sidebar position
          </p>
          <div className="mt-2 grid max-w-xs grid-cols-2 gap-2">
            <Button
              variant={sidebarSide === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarSide("left")}
            >
              Left
            </Button>
            <Button
              variant={sidebarSide === "right" ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarSide("right")}
            >
              Right
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
