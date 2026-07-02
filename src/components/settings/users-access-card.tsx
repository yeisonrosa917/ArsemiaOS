"use client";

import Link from "next/link";
import { Users as UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/lib/store/users";
import { usePreferences } from "@/lib/store/preferences";
import { useActivityLog } from "@/lib/store/activity-log";
import { getUserByRole } from "@/lib/auth/users";
import { ROLES, ROLE_IDS, type UserRoleId } from "@/lib/auth/roles";
import { cn, initials } from "@/lib/utils";

export function UsersAccessCard() {
  const users = useUsers((s) => s.users);
  const setRole = useUsers((s) => s.setRole);
  const setStatus = useUsers((s) => s.setStatus);
  const updateProfile = useUsers((s) => s.updateProfile);
  const resetRoleCapabilities = usePreferences((s) => s.resetRoleCapabilities);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);

  const log = (title: string, objectId: string) =>
    pushActivity({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: activeRoleId,
      module: "Permissions",
      action: "permission_changed",
      objectType: "User",
      objectId,
      title,
    });

  const active = users.filter((u) => u.status === "active").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-primary" /> Users & Access
        </CardTitle>
        <CardDescription>
          {users.length} users · {active} active. Change a role, deactivate
          access, or reset a role&apos;s permissions to its default. Roles map to
          capabilities across the hub.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-2">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead>Foreman profile</TableHead>
              <TableHead className="pr-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className={cn(u.status === "inactive" && "opacity-55")}>
                <TableCell className="pl-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("bg-gradient-to-br text-[11px] text-white", u.avatarColor)}>
                        {u.initials || initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{u.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{u.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <select
                    value={u.roleId}
                    onChange={(e) => {
                      const roleId = e.target.value as UserRoleId;
                      setRole(u.id, roleId);
                      log(`${u.name} role changed to ${ROLES[roleId].label}`, u.id);
                    }}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                  >
                    {ROLE_IDS.map((r) => (
                      <option key={r} value={r}>
                        {ROLES[r].label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  {u.status === "active" ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="slate">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell className="text-[11px]">
                  {u.foremanId ? (
                    <Link href={`/payroll/foreman/${u.foremanId}`} className="font-mono hover:underline">
                      {u.foremanId}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Manage
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {u.foremanId && (
                        <DropdownMenuItem asChild>
                          <Link href={`/payroll/foreman/${u.foremanId}`}>Open foreman payroll</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          const next = u.status === "active" ? "inactive" : "active";
                          setStatus(u.id, next);
                          log(`${u.name} ${next === "active" ? "activated" : "deactivated"}`, u.id);
                        }}
                      >
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          resetRoleCapabilities(u.roleId);
                          log(`Permissions reset to default for ${ROLES[u.roleId].label}`, u.id);
                        }}
                      >
                        Reset permissions to role default
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const name = window.prompt("Name:", u.name);
                          if (name && name !== u.name) {
                            updateProfile(u.id, { name });
                            log(`${u.name} profile updated`, u.id);
                          }
                        }}
                      >
                        Edit profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Local workspace directory. Real invitations, SSO, and per-user
          passwords require the backend — the structure here is what that will
          bind to.
        </p>
      </CardContent>
    </Card>
  );
}
