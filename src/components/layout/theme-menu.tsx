"use client";

import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PALETTES, type Palette as PaletteId } from "@/lib/theme/palettes";
import { usePreferences } from "@/lib/store/preferences";
import { cn } from "@/lib/utils";

export function ThemeMenu() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { palette, setPalette, sidebarSide, setSidebarSide } = usePreferences();

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          aria-label="Theme settings"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-2 gap-1 p-1">
          <Button
            variant={isDark ? "ghost" : "secondary"}
            size="sm"
            className="h-8 justify-start gap-2"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </Button>
          <Button
            variant={isDark ? "secondary" : "ghost"}
            size="sm"
            className="h-8 justify-start gap-2"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-3.5 w-3.5" /> Dark
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Palette</DropdownMenuLabel>
        {PALETTES.map((p) => {
          const active = p.id === palette;
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => setPalette(p.id as PaletteId)}
              className={cn("flex items-center gap-3", active && "bg-accent/60")}
            >
              <div className="flex h-7 w-12 overflow-hidden rounded-md border border-border/60">
                {p.swatch.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-tight">{p.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {p.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sidebar position</DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          <Button
            variant={sidebarSide === "left" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setSidebarSide("left")}
          >
            Left
          </Button>
          <Button
            variant={sidebarSide === "right" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setSidebarSide("right")}
          >
            Right
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
