"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

/**
 * Shared identity avatar (Sprint 2.2). One component for every person shown
 * in the app: renders the photo when one exists, otherwise high-contrast
 * initials on a color derived deterministically from the person's name —
 * the same person always gets the same color on every surface, and there is
 * never a blank circle.
 */

/** High-contrast backgrounds — all readable with white text. */
const PALETTE = [
  "bg-brand-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600",
  "bg-fuchsia-600",
] as const;

export function avatarColorFor(seed: string): string {
  let h = 0;
  const s = seed || "?";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
} as const;

export function UserAvatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string;
  /** Local photo (data URI or path). Falls back to initials when absent/broken. */
  photoUrl?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Avatar className={cn(SIZES[size], className)}>
      {photoUrl ? <AvatarImage src={photoUrl} alt={name} /> : null}
      <AvatarFallback className={cn("font-semibold text-white", avatarColorFor(name))}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
