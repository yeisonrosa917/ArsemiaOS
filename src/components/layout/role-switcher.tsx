"use client";

import { ChevronDown, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePreferences } from "@/lib/store/preferences";
import { ROLES, type UserRoleId } from "@/lib/auth/roles";
import { SEED_USERS, getUserByRole } from "@/lib/auth/users";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { activeRoleId, setActiveRoleId } = usePreferences();
  const user = getUserByRole(activeRoleId);
  const role = ROLES[activeRoleId];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className={cn(
                "bg-gradient-to-br text-white text-[11px] font-semibold",
                user.avatarColor,
              )}
            >
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-xs font-semibold text-foreground">
              {user.name}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {role.label}
            </span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserCog className="h-3.5 w-3.5" />
          Switch role (test mode)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SEED_USERS.map((u) => {
          const r = ROLES[u.roleId];
          const active = u.roleId === activeRoleId;
          return (
            <DropdownMenuItem
              key={u.id}
              onClick={() => setActiveRoleId(u.roleId as UserRoleId)}
              className={cn(
                "flex items-start gap-3 py-2",
                active && "bg-accent/60",
              )}
            >
              <Avatar className="mt-0.5 h-8 w-8">
                <AvatarFallback
                  className={cn(
                    "bg-gradient-to-br text-white text-[11px] font-semibold",
                    u.avatarColor,
                  )}
                >
                  {u.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {u.name}
                </p>
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className="text-[10px] text-muted-foreground/80 truncate">
                  {r.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
