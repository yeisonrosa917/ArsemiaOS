import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size in pixels — applied to both width and height. */
  size?: number;
  className?: string;
  /** Override fill color of the stacked "A" shapes. Defaults to currentColor. */
  color?: string;
  /** Background tile + rounded corners (for use as an app icon). */
  withTile?: boolean;
}

/**
 * Arsemia "A" mark — three stacked triangular/trapezoidal bands forming the A.
 * Rendered as inline SVG so it scales crisply and can be tinted via CSS color.
 * The canonical asset version (blue tile + white mark) lives at
 * `/brand/arsemia-mark.svg` and is used by documents/PDFs via `<ArsemiaIcon />`.
 */
export function ArsemiaLogo({
  size = 32,
  className,
  color = "currentColor",
  withTile = false,
}: LogoProps) {
  const svg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Arsemia"
      role="img"
    >
      {/* Top cap — apex of the A */}
      <path d="M100 24 L132 86 L68 86 Z" fill={color} />
      {/* Middle band */}
      <path d="M62 96 L138 96 L150 122 L50 122 Z" fill={color} />
      {/* Bottom band — foot of the A */}
      <path d="M44 134 L156 134 L176 176 L24 176 Z" fill={color} />
    </svg>
  );

  if (withTile) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-[#1aa3ff] text-white shadow-elevated",
          className,
        )}
        style={{ width: size + 8, height: size + 8 }}
      >
        <ArsemiaLogo size={size} color="white" />
      </div>
    );
  }

  return <span className={className}>{svg}</span>;
}

/**
 * Canonical icon — references the SVG asset directly. Use this in documents,
 * PDFs, invoice headers, login screens — anywhere we want the exact brand
 * asset rather than a tinted inline copy.
 */
export function ArsemiaIcon({
  size = 56,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/brand/arsemia-mark.svg"
      alt="Arsemia"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

/** Logo + wordmark — for headers, login screens, marketing surfaces. */
export function ArsemiaLogomark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ArsemiaLogo size={size} color="currentColor" />
      <span className="text-lg font-bold tracking-tight">Arsemia</span>
    </span>
  );
}
