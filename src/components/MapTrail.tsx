import { BIOMES } from "../game/content";
import { ENEMIES } from "../game/content";
import type { GameState } from "../game/types";

const PATH =
  "M 40 220 C 120 200, 160 140, 240 150 S 360 210, 440 170 S 560 80, 680 110 S 800 200, 920 160 S 1040 90, 1160 120";

/** Approximate point along the cubic-ish path using sampled polyline. */
function pointOnRoute(t: number): { x: number; y: number } {
  const samples: [number, number][] = [
    [40, 220],
    [100, 195],
    [160, 155],
    [240, 150],
    [320, 175],
    [440, 170],
    [520, 130],
    [680, 110],
    [780, 155],
    [920, 160],
    [1020, 120],
    [1160, 120],
  ];
  const clamped = Math.min(1, Math.max(0, t));
  const idx = clamped * (samples.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  const a = samples[i];
  const b = samples[Math.min(samples.length - 1, i + 1)];
  return {
    x: a[0] + (b[0] - a[0]) * f,
    y: a[1] + (b[1] - a[1]) * f,
  };
}

interface MapTrailProps {
  state: GameState;
}

export function MapTrail({ state }: MapTrailProps) {
  const traveler = pointOnRoute(state.routeProgress);
  const foeT = state.inEncounter
    ? Math.min(1, state.routeProgress + 0.05)
    : -1;
  const foe = foeT >= 0 ? pointOnRoute(foeT) : null;
  const enemy = ENEMIES[state.enemyId];
  const activeBiome =
    BIOMES.find(
      (b) => state.routeProgress >= b.start && state.routeProgress < b.end,
    ) ?? BIOMES[BIOMES.length - 1];

  return (
    <section className="map-trail" aria-label="Quest map">
      <div className="map-trail__sky" />
      <svg
        className="map-trail__svg"
        viewBox="0 0 1200 320"
        role="img"
        aria-label={`Route through ${activeBiome.name}`}
      >
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8eaa8f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3d5a44" stopOpacity="0.55" />
          </linearGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Distant ridges */}
        <path
          d="M0 180 Q200 120 400 160 T800 140 T1200 170 L1200 320 L0 320 Z"
          fill="url(#ridge)"
        />
        <path
          d="M0 220 Q300 170 600 210 T1200 190 L1200 320 L0 320 Z"
          fill="#2f4a38"
          opacity="0.45"
        />

        {/* Biome bands along baseline */}
        {BIOMES.map((b) => {
          const x = b.start * 1200;
          const w = (b.end - b.start) * 1200;
          return (
            <g key={b.id}>
              <rect
                x={x}
                y={268}
                width={w}
                height={52}
                fill={b.fill}
                opacity={0.85}
              />
              <text
                x={x + w / 2}
                y={298}
                textAnchor="middle"
                className="map-label"
              >
                {b.name}
              </text>
            </g>
          );
        })}

        {/* Path glow */}
        <path
          d={PATH}
          fill="none"
          stroke="#c9a85a"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.25"
          filter="url(#soft)"
        />
        <path
          d={PATH}
          fill="none"
          stroke="#f2e6c4"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="10 8"
          className="map-trail__path"
        />

        {/* Traveler */}
        <g transform={`translate(${traveler.x} ${traveler.y})`}>
          <g className="map-trail__pin">
            <circle r="14" fill="#14241c" opacity="0.2" cy="4" />
            <circle r="11" fill="#f2e6c4" stroke="#14241c" strokeWidth="2" />
            <circle r="4" fill="#3d6b4f" />
          </g>
        </g>

        {foe && state.inEncounter && (
          <g transform={`translate(${foe.x} ${foe.y})`}>
            <g className="map-trail__foe">
              <circle r="16" fill="#8b3a2f" opacity="0.25" />
              <circle r="10" fill="#8b3a2f" stroke="#f2e6c4" strokeWidth="2" />
              <title>{enemy.name}</title>
            </g>
          </g>
        )}
      </svg>

      <div className="map-trail__caption">
        <p className="map-trail__chapter">{state.chapterTitle}</p>
        <p className="map-trail__biome">Now in {activeBiome.name}</p>
      </div>
    </section>
  );
}
