import { BIOME_ATMO, BIOME_FILL, EDGES, ENEMIES, NODES } from "../game/content";
import { nodeById } from "../game/mapGraph";
import type { BiomeId, GameState } from "../game/types";

interface WorldMapProps {
  state: GameState;
  reachable: Map<string, { cost: number }>;
  onTravel: (nodeId: string) => void;
  onSelectSpawn: (spawnId: string) => void;
}

function Tree({ x, y, scale = 1, dark = "#1f3a2a" }: { x: number; y: number; scale?: number; dark?: string }) {
  const h = 55 * scale;
  const w = 22 * scale;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-3 * scale} y={-h * 0.15} width={6 * scale} height={h * 0.25} fill="#3a2a18" opacity="0.8" />
      <path d={`M0 ${-h} L${w} 0 L${-w} 0 Z`} fill={dark} />
      <path d={`M0 ${-h * 0.7} L${w * 0.75} ${-h * 0.15} L${-w * 0.75} ${-h * 0.15} Z`} fill={dark} opacity="0.85" />
    </g>
  );
}

function Ridge({ x, y, w, h, fill }: { x: number; y: number; w: number; h: number; fill: string }) {
  return (
    <path
      d={`M${x} ${y} L${x + w * 0.35} ${y - h} L${x + w * 0.55} ${y - h * 0.55} L${x + w} ${y - h * 0.9} L${x + w * 1.15} ${y} Z`}
      fill={fill}
      opacity="0.7"
    />
  );
}

export function WorldMap({
  state,
  reachable,
  onTravel,
  onSelectSpawn,
}: WorldMapProps) {
  const here = nodeById(state.currentNodeId);
  const biome = here.biome as BiomeId;
  const atmo = BIOME_ATMO[biome] ?? BIOME_ATMO.forest;

  return (
    <section
      className={`world-map world-map--${biome}`}
      aria-label="Wilderness map"
      data-biome={biome}
    >
      <div className="world-map__atmo" aria-hidden="true" />
      <svg className="world-map__svg" viewBox="0 0 1200 560" role="img">
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={atmo.ground[0]} />
            <stop offset="100%" stopColor={atmo.ground[1]} />
          </linearGradient>
          <linearGradient id="skyband" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={atmo.sky[0]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={atmo.sky[1]} stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d7e4d8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9eb8a8" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1200" height="200" fill="url(#skyband)" />
        <polygon points="40,120 1160,80 1180,520 20,540" fill="url(#ground)" />
        <polygon points="40,120 1160,80 1180,200 60,230" fill="url(#haze)" />

        {/* Far ridges */}
        <Ridge x={700} y={160} w={220} h={70} fill="#5a6570" />
        <Ridge x={880} y={170} w={180} h={55} fill="#4a5058" />

        {/* Marsh pool */}
        <ellipse cx="400" cy="450" rx="90" ry="22" fill="#2f4a40" opacity="0.55" />
        <ellipse cx="420" cy="448" rx="40" ry="8" fill="#6a9aa0" opacity="0.25" />

        {/* River ribbon */}
        <path
          d="M480 380 C520 360, 560 350, 600 340 S680 300, 720 290"
          fill="none"
          stroke="#5a9aaa"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Forest stand near gate */}
        <Tree x={70} y={390} scale={1.1} />
        <Tree x={105} y={405} scale={0.85} dark="#2a4a34" />
        <Tree x={160} y={370} scale={1} />
        <Tree x={230} y={330} scale={0.7} dark="#2a4a34" />
        <Tree x={300} y={280} scale={0.9} />

        {/* Glade ferns */}
        <g transform="translate(480 210)" opacity="0.7">
          <path d="M0 0 Q-12 -28 -4 -40" stroke="#3d6b4f" strokeWidth="3" fill="none" />
          <path d="M0 0 Q12 -30 6 -42" stroke="#4a7a52" strokeWidth="3" fill="none" />
          <path d="M8 4 Q20 -20 18 -32" stroke="#3d6b4f" strokeWidth="2.5" fill="none" />
        </g>

        {/* Briarhaven cottage (small — no giant yellow field) */}
        <rect x="690" y="268" width="20" height="16" rx="2" fill="#6a4a28" opacity="0.9" />
        <polygon points="688,268 700,256 712,268" fill="#8a6a3a" />

        {NODES.map((n) => (
          <ellipse
            key={`pad-${n.id}`}
            cx={n.x}
            cy={n.y + 18}
            rx={52}
            ry={18}
            fill={BIOME_FILL[n.biome]}
            opacity={n.id === state.currentNodeId ? 0.75 : 0.45}
          />
        ))}

        {EDGES.map((e) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          const active =
            (reachable.has(e.to) && state.currentNodeId === e.from) ||
            (reachable.has(e.from) && state.currentNodeId === e.to);
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={active ? "world-map__edge world-map__edge--live" : "world-map__edge"}
            />
          );
        })}

        {NODES.map((n) => {
          const isHere = n.id === state.currentNodeId;
          const canReach = reachable.has(n.id);
          const cost = reachable.get(n.id)?.cost;
          return (
            <g
              key={n.id}
              transform={`translate(${n.x} ${n.y})`}
              onClick={() => {
                if (canReach) onTravel(n.id);
              }}
              style={{ cursor: canReach ? "pointer" : "default" }}
              role={canReach ? "button" : undefined}
              tabIndex={canReach ? 0 : undefined}
              onKeyDown={(ev) => {
                if (canReach && (ev.key === "Enter" || ev.key === " ")) {
                  onTravel(n.id);
                }
              }}
              aria-label={
                canReach
                  ? `Travel to ${n.name}, costs ${cost} steps`
                  : `${n.name}${isHere ? ", current location" : ""}`
              }
            >
              <circle
                r={isHere ? 16 : 12}
                className={[
                  "map-node__dot",
                  isHere ? "is-here" : "",
                  canReach ? "is-reach" : "",
                  n.kind === "town" ? "is-town" : "",
                  n.kind === "ambush" ? "is-ambush" : "",
                  n.kind === "fork" ? "is-fork" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <text y={-22} textAnchor="middle" className="map-node__label">
                {n.name}
              </text>
              {canReach && (
                <text y={32} textAnchor="middle" className="map-node__cost">
                  {cost}
                </text>
              )}
              <title>
                {n.name}
                {canReach ? ` · ${cost} steps` : isHere ? " · you are here" : ""}
              </title>
            </g>
          );
        })}

        {state.spawns.map((s, i) => {
          const n = nodeById(s.nodeId);
          const tpl = ENEMIES[s.templateId];
          const offset = (i % 3) * 14 - 14;
          const inRange = s.nodeId === state.currentNodeId;
          return (
            <g
              key={s.id}
              transform={`translate(${n.x + offset} ${n.y - 36})`}
              className={[
                "spawn",
                s.elite ? "spawn--elite" : "",
                inRange ? "spawn--near" : "spawn--far",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={(ev) => {
                ev.stopPropagation();
                if (inRange) onSelectSpawn(s.id);
              }}
              style={{ cursor: inRange ? "pointer" : "default" }}
              role={inRange ? "button" : undefined}
              tabIndex={inRange ? 0 : undefined}
              onKeyDown={(ev) => {
                if (inRange && (ev.key === "Enter" || ev.key === " ")) {
                  onSelectSpawn(s.id);
                }
              }}
              aria-label={
                inRange
                  ? `Fight ${tpl.name}`
                  : `${tpl.name} (too far — travel closer)`
              }
            >
              {inRange && (
                <circle r="18" className="spawn__range" aria-hidden="true" />
              )}
              <circle r={s.elite ? 11 : 8} />
              <title>
                {tpl.name} @ {n.name} ({s.hp}/{s.maxHp})
                {inRange ? " · tap to battle" : " · too far"}
              </title>
            </g>
          );
        })}

        <g transform={`translate(${here.x} ${here.y})`} className="player-pin">
          <circle r="7" className="player-pin__core" />
        </g>
      </svg>
      <p className="world-map__caption">{atmo.label}</p>
      <p className="world-map__hint">
        Walk onto a node to engage its foes (proximity). Pulsing rings = in
        range. Dim dots = too far. Ambush tiles can force a battle.
      </p>
    </section>
  );
}
