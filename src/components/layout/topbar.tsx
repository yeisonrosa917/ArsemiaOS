"use client";

import { Bell, CommandIcon, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RoleSwitcher } from "./role-switcher";
import { ThemeMenu } from "./theme-menu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl lg:px-8">
      <div className="hidden flex-1 items-center md:flex">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs, drivers, customers..."
            className="h-10 rounded-xl border-border/80 bg-muted/40 pl-9 pr-20 text-sm shadow-none focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-lg px-3 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Job</span>
        </Button>

        <ThemeMenu />

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <RoleSwitcher />
      </div>
    </header>
  );
}
