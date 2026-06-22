import { cn } from "@/lib/utils";

interface LogoProps {
  /** Size in pixels — applied to both width and height. */
  size?: number;
  className?: string;
  /** Override fill color. Defaults to currentColor so it adopts text color. */
  color?: string;
  /** Background tile + rounded corners (for use as an app icon). */
  withTile?: boolean;
}

/**
 * Arsemia "A" mark — concentric triangle motif rendered as an SVG so it scales
 * crisply and can be tinted via CSS color. Use across the sidebar, login,
 * generated documents, etc. Do not import a raster file.
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
      {/* Outer A: large triangle with the apex at the top, ends in two angled feet */}
      <path
        d="M100 18 L188 178 L132 178 L100 119 L68 178 L12 178 Z"
        fill={color}
      />
      {/* Inner A: smaller triangle inset, forming the negative-space "A" */}
      <path
        d="M100 76 L160 178 L40 178 L70 122 L130 122 L100 67"
        fill={color}
        fillOpacity="0.92"
      />
      {/* Crossbar slot — the white V between feet */}
      <path d="M82 154 L118 154 L100 122 Z" fill="white" />
    </svg>
  );

  if (withTile) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevated",
          className,
        )}
        style={{ width: size + 8, height: size + 8 }}
      >
        {svg}
      </div>
    );
  }

  return <span className={className}>{svg}</span>;
}

/** Logo + wordmark — for headers, login screens. */
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
      <span className="text-lg font-bold tracking-tight">ARSEMIA</span>
    </span>
  );
}
