"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ShieldCheck, User as UserIcon, Lock, Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUsers, type WorkspaceUser } from "@/lib/store/users";
import { useActivityLog } from "@/lib/store/activity-log";
import { ROLES, ROLE_IDS, type UserRoleId } from "@/lib/auth/roles";
import { cn, initials } from "@/lib/utils";
import { formatDateTimeStable } from "@/lib/dates";

type Tab = "profile" | "access" | "security" | "activity";

/**
 * User detail drawer — a real admin surface with Profile / Access / Security /
 * Activity tabs. Profile + role/status persist to the local workspace directory;
 * backend-required actions (password reset, sessions, 2FA) are clearly labelled.
 */
export function UserDetailDrawer({
  user,
  onClose,
}: {
  user: WorkspaceUser | null;
  onClose: () => void;
}) {
  const setRole = useUsers((s) => s.setRole);
  const setStatus = useUsers((s) => s.setStatus);
  const updateProfile = useUsers((s) => s.updateProfile);
  const entries = useActivityLog((s) => s.entries);
  const [tab, setTab] = useState<Tab>("profile");

  const open = user !== null;
  if (!user) return null;
  const caps = ROLES[user.roleId].defaultCapabilities;
  const userActivity = entries.filter((e) => e.objectId === user.id || e.actorName === user.name).slice(0, 8);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-elevated focus:outline-none">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10"><AvatarFallback className={cn("bg-gradient-to-br text-xs text-white", user.avatarColor)}>{user.initials || initials(user.name)}</AvatarFallback></Avatar>
              <div>
                <Dialog.Title className="text-sm font-bold">{user.name}</Dialog.Title>
                <p className="font-mono text-[10px] text-muted-foreground">{user.id}</p>
              </div>
            </div>
            <Dialog.Close asChild><Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button></Dialog.Close>
          </div>

          <div className="flex gap-1 border-b border-border px-3 py-2">
            {([["profile", "Profile", UserIcon], ["access", "Access", ShieldCheck], ["security", "Security", Lock], ["activity", "Activity", ActivityIcon]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold", tab === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === "profile" && (
              <div className="space-y-3">
                <Field label="Name" defaultValue={user.name} onSave={(v) => updateProfile(user.id, { name: v })} />
                <Field label="Email" defaultValue={user.email} onSave={(v) => updateProfile(user.id, { email: v })} />
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.status === "active" ? "success" : "slate"}>{user.status}</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setStatus(user.id, user.status === "active" ? "inactive" : "active")}>
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
                {user.foremanId && <p className="text-[11px] text-muted-foreground">Linked foreman profile: <span className="font-mono">{user.foremanId}</span></p>}
              </div>
            )}

            {tab === "access" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
                  <select value={user.roleId} onChange={(e) => setRole(user.id, e.target.value as UserRoleId)} className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                    {ROLE_IDS.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                  </select>
                  <p className="text-[11px] text-muted-foreground">{ROLES[user.roleId].description}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Capabilities ({caps.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {caps.map((c) => <span key={c} className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">{c}</span>)}
                  </div>
                </div>
              </div>
            )}

            {tab === "security" && (
              <div className="space-y-2 text-sm">
                {[["Reset password", "Sends a reset link"], ["Active sessions", "View & revoke devices"], ["Two-factor auth", "Require 2FA for this user"]].map(([t, d]) => (
                  <div key={t} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div><p className="text-xs font-semibold">{t}</p><p className="text-[10px] text-muted-foreground">{d}</p></div>
                    <Badge variant="outline" className="text-[9px]">Backend required</Badge>
                  </div>
                ))}
              </div>
            )}

            {tab === "activity" && (
              <ul className="space-y-1.5">
                {userActivity.length === 0 && <p className="text-xs text-muted-foreground">No recent activity for this user.</p>}
                {userActivity.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border/60 bg-muted/20 p-2 text-xs">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateTimeStable(e.timestamp)}</p>
                  </li>
                ))}
                <li className="pt-1 text-[10px] text-muted-foreground">Last active: {user.lastActive}</li>
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, defaultValue, onSave }: { label: string; defaultValue: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(defaultValue);
  const dirty = v !== defaultValue;
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} className="h-9" />
        <Button size="sm" className="h-9" disabled={!dirty} onClick={() => onSave(v.trim())}>Save</Button>
      </div>
    </div>
  );
}
