"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useUsers, type WorkspaceUser } from "@/lib/store/users";
import { UserDetailDrawer } from "@/components/settings/user-detail-drawer";
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
  const inviteUser = useUsers((s) => s.inviteUser);
  const removeUser = useUsers((s) => s.removeUser);
  const resetRoleCapabilities = usePreferences((s) => s.resetRoleCapabilities);
  const pushActivity = useActivityLog((s) => s.push);
  const activeRoleId = usePreferences((s) => s.activeRoleId);
  const actor = getUserByRole(activeRoleId);

  const [detailUser, setDetailUser] = useState<WorkspaceUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState<UserRoleId>("dispatcher");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail.trim());
  const canInvite = invName.trim().length > 1 && emailValid;

  const submitInvite = () => {
    if (!canInvite) return;
    const u = inviteUser({ name: invName, email: invEmail, roleId: invRole });
    log(`Invited ${u.name} (${u.email}) as ${ROLES[invRole].label}`, u.id);
    setInvName("");
    setInvEmail("");
    setInvRole("dispatcher");
    setInviteOpen(false);
  };

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
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" /> Users & Access
          </CardTitle>
          <CardDescription>
            {users.length} users · {active} active. Invite a teammate, change a
            role, deactivate access, or reset a role&apos;s permissions. Roles
            map to capabilities across the hub.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setInviteOpen((v) => !v)}>
          <UserPlus className="h-3.5 w-3.5" />
          Invite user
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {inviteOpen && (
          <div className="mb-4 grid gap-2 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
              <Input value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Full name" className="h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <Input value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="name@arsemia.co" className="h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
              <select
                value={invRole}
                onChange={(e) => setInvRole(e.target.value as UserRoleId)}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs font-medium"
              >
                {ROLE_IDS.map((r) => (
                  <option key={r} value={r}>{ROLES[r].label}</option>
                ))}
              </select>
            </div>
            <Button size="sm" className="h-9" disabled={!canInvite} onClick={submitInvite}>
              Send invite
            </Button>
          </div>
        )}
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
                      <DropdownMenuItem onClick={() => setDetailUser(u)}>View details</DropdownMenuItem>
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
                      {u.roleId !== "owner" && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (!window.confirm(`Remove ${u.name} from the workspace?`)) return;
                            removeUser(u.id);
                            log(`${u.name} removed from the workspace`, u.id);
                          }}
                        >
                          Remove user
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-3 text-[10px] text-muted-foreground">
          Invites, role changes and removals update this local workspace
          directory and the activity log. Email delivery, SSO, and per-user
          passwords require the backend — the structure here is what that will
          bind to.
        </p>
      </CardContent>
      <UserDetailDrawer user={detailUser} onClose={() => setDetailUser(null)} />
    </Card>
  );
}
