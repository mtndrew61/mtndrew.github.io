/** Shared SVG silhouettes — clean, flat, no emoji. */

export function PlayerSprite({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(20,36,28,0.25)" />
      <circle cx="32" cy="16" r="9" fill="#f2e6c4" />
      <path
        d="M20 28 Q32 24 44 28 L42 48 Q32 52 22 48 Z"
        fill="#3d6b4f"
      />
      <path d="M22 32 L12 40 L14 42 L24 36 Z" fill="#2a4a34" />
      <path d="M42 32 L52 40 L50 42 L40 36 Z" fill="#2a4a34" />
      <path d="M26 48 L24 58 L28 58 L30 48 Z" fill="#2a3f34" />
      <path d="M34 48 L36 58 L40 58 L38 48 Z" fill="#2a3f34" />
    </svg>
  );
}

export function FoeSprite({
  kind,
  elite,
  className,
}: {
  kind: string;
  elite?: boolean;
  className?: string;
}) {
  const fill = elite ? "#6b2a6b" : "#8b3a2f";
  const accent = elite ? "#c9a85a" : "#c45a4a";

  if (kind.includes("wisp") || kind.includes("fen")) {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="32" cy="56" rx="12" ry="3" fill="rgba(20,36,28,0.2)" />
        <ellipse cx="32" cy="30" rx="14" ry="18" fill={fill} opacity="0.85" />
        <circle cx="32" cy="26" r="6" fill={accent} opacity="0.9" />
        <path d="M24 40 Q32 48 40 40" stroke={accent} strokeWidth="2" fill="none" />
      </svg>
    );
  }

  if (kind.includes("troll") || kind.includes("orc")) {
    return (
      <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(20,36,28,0.25)" />
        <rect x="18" y="22" width="28" height="28" rx="6" fill={fill} />
        <circle cx="32" cy="16" r="11" fill={fill} />
        <circle cx="27" cy="15" r="2" fill={accent} />
        <circle cx="37" cy="15" r="2" fill={accent} />
        <path d="M26 22 L32 26 L38 22" fill={accent} />
        <path d="M14 30 L8 38 L12 40 L20 34 Z" fill="#5a3030" />
        <path d="M50 30 L56 38 L52 40 L44 34 Z" fill="#5a3030" />
      </svg>
    );
  }

  // Default goblin / wild folk
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="58" rx="13" ry="3.5" fill="rgba(20,36,28,0.25)" />
      <path d="M20 26 Q32 18 44 26 L40 48 Q32 52 24 48 Z" fill={fill} />
      <circle cx="32" cy="18" r="10" fill={fill} />
      <path d="M18 12 L24 18 L20 20 Z" fill={accent} />
      <path d="M46 12 L40 18 L44 20 Z" fill={accent} />
      <circle cx="28" cy="17" r="2.2" fill="#f2e6c4" />
      <circle cx="36" cy="17" r="2.2" fill="#f2e6c4" />
      <path d="M28 24 Q32 27 36 24" stroke="#3a1814" strokeWidth="1.5" fill="none" />
      <path d="M22 34 L14 42 L17 44 L26 37 Z" fill="#5a3030" />
    </svg>
  );
}

export function MapPlayerPin() {
  return (
    <g className="player-pin">
      <ellipse cx="0" cy="10" rx="10" ry="4" fill="rgba(20,36,28,0.3)" />
      <circle cx="0" cy="-2" r="9" fill="#f2e6c4" stroke="#14241c" strokeWidth="2" />
      <circle cx="0" cy="-2" r="3.5" fill="#3d6b4f" />
    </g>
  );
}

export function MapFoeMark({ elite }: { elite?: boolean }) {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="8" ry="3" fill="rgba(20,36,28,0.25)" />
      <path
        d={
          elite
            ? "M0 -10 L6 -2 L4 6 L-4 6 L-6 -2 Z"
            : "M-6 -2 Q0 -10 6 -2 L4 6 L-4 6 Z"
        }
        fill={elite ? "#6b2a6b" : "#8b3a2f"}
        stroke="#f2e6c4"
        strokeWidth="1.5"
      />
    </g>
  );
}
