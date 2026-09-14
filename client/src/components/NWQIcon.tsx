// Official NodalWaves badge — silver wave monogram, three red nodes, deep red medallion.
// BASE_URL keeps the asset resolvable when the site is served from a sub-path (GitHub Pages).
const LOGO_URL = `${import.meta.env.BASE_URL}nodalwaves-badge.png`;

interface NWQIconProps { size?: number; className?: string; }

export function NWQIcon({ size = 28, className = "" }: NWQIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }}
    >
      <img
        src={LOGO_URL}
        alt="NodalWaves icon"
        width={size}
        height={size}
        className="object-cover w-full h-full"
        style={{ display: "block" }}
      />
    </span>
  );
}

interface NWQLogoProps {
  iconSize?: number;
  compact?: boolean;
  scale?: number;
  iconOnly?: boolean;
  responsive?: boolean;
  className?: string;
}

export function NWQLogo({
  iconSize = 28,
  compact = true,
  scale = 1,
  iconOnly = false,
  responsive = false,
  className = "",
}: NWQLogoProps) {
  const fontSize = Math.round(iconSize * 0.52);
  const gap = Math.round(iconSize * 0.32);
  const wordmark = (
    <span className="font-display font-bold leading-none tracking-wide whitespace-nowrap" style={{ fontSize: `${fontSize}px` }}>
      <span style={{ color: "#ffffff" }}>Nodal</span><span style={{ color: "#FF3A55" }}>Waves</span><span style={{ color: "#C6CDD6" }}> Quest</span>
    </span>
  );

  if (responsive) {
    return (
      <div
        className={`inline-flex flex-row items-center select-none ${className}`}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: "left center", gap: `${gap}px` }}
      >
        <NWQIcon size={iconSize} />
        <div className="hidden md:flex flex-col justify-center">{wordmark}</div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex ${compact ? "flex-row items-center" : "flex-col items-center"} select-none ${className}`}
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: "left center", gap: compact && !iconOnly ? `${gap}px` : undefined }}
    >
      <NWQIcon size={iconSize} />
      {!iconOnly && (
        <div className={compact ? "flex flex-col justify-center" : "flex flex-col items-center mt-2"}>{wordmark}</div>
      )}
    </div>
  );
}

export default NWQIcon;
