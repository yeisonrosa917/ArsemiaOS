"use client";

import { Camera, FileText, MessageSquare, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_BG: Record<string, string> = {
  rose: "from-rose-200 to-rose-100 dark:from-rose-900/50 dark:to-rose-950/50",
  amber: "from-amber-200 to-amber-100 dark:from-amber-900/50 dark:to-amber-950/50",
  slate: "from-slate-200 to-slate-100 dark:from-slate-700/60 dark:to-slate-800/60",
  emerald: "from-emerald-200 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-950/50",
  violet: "from-violet-200 to-violet-100 dark:from-violet-900/50 dark:to-violet-950/50",
  cyan: "from-cyan-200 to-cyan-100 dark:from-cyan-900/50 dark:to-cyan-950/50",
};

const KIND_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  photo: Camera,
  video: Video,
  note: MessageSquare,
  document: FileText,
};

/**
 * Generated CSS-only placeholder for evidence — no copyrighted images.
 * Looks like a damaged surface based on tone (rose = damage, emerald = pre-move proof, etc.)
 */
export function EvidencePlaceholder({
  tone,
  kind,
  label,
  size = "md",
}: {
  tone: string;
  kind: "photo" | "video" | "note" | "document";
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = KIND_ICONS[kind];
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br",
        TONE_BG[tone] ?? TONE_BG.slate,
      )}
    >
      {/* Decorative pattern — looks like scratches/crack lines for damage */}
      {kind === "photo" && (
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {tone === "rose" && (
            <>
              <path d="M10 30 Q 40 35, 80 25" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M20 50 Q 50 60, 90 45" stroke="currentColor" strokeWidth="0.7" fill="none" />
              <path d="M5 70 Q 35 80, 70 65" stroke="currentColor" strokeWidth="0.4" fill="none" />
            </>
          )}
          {tone === "amber" && (
            <>
              <path d="M50 10 L 30 50 L 60 50 L 40 90" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </>
          )}
        </svg>
      )}
      <div className="relative flex flex-col items-center gap-1 text-foreground/70">
        <Icon className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
        <span className="px-1 text-center text-[9px] font-semibold">
          {label}
        </span>
      </div>
    </div>
  );
}
