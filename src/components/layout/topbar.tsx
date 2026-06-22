"use client";

import { CommandIcon, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RoleSwitcher } from "./role-switcher";
import { ThemeMenu } from "./theme-menu";
import { NotificationsBell } from "@/components/notifications/notifications-bell";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/command-palette";

export function Topbar() {
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl lg:px-8">
        <div className="hidden flex-1 items-center md:flex">
          <button
            onClick={() => setOpen(true)}
            className="group flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-background"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1">Search jobs, drivers, customers...</span>
            <kbd className="hidden items-center gap-1 rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium md:inline-flex">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <Button
            variant="default"
            size="sm"
            className="h-9 rounded-lg px-3 text-sm"
            asChild
          >
            <a href="/quotes">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Quote</span>
            </a>
          </Button>

          <ThemeMenu />

          <NotificationsBell />

          <Separator orientation="vertical" className="mx-1 h-6" />

          <RoleSwitcher />
        </div>
      </header>
      <CommandPalette open={open} setOpen={setOpen} />
    </>
  );
}
