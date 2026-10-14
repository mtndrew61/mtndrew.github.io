import { BIOME_FILL, EDGES, ENEMIES, NODES } from "../game/content";
import { nodeById } from "../game/mapGraph";
import type { GameState } from "../game/types";

interface WorldMapProps {
  state: GameState;
  reachable: Map<string, { cost: number }>;
  onTravel: (nodeId: string) => void;
  onSelectSpawn: (spawnId: string) => void;
}

export function WorldMap({
  state,
  reachable,
  onTravel,
  onSelectSpawn,
}: WorldMapProps) {
  const here = nodeById(state.currentNodeId);

  return (
    <section className="world-map" aria-label="Wilderness map">
      <svg className="world-map__svg" viewBox="0 0 1200 560" role="img">
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8eaa8f" />
            <stop offset="55%" stopColor="#4d7358" />
            <stop offset="100%" stopColor="#2a4533" />
          </linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d7e4d8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9eb8a8" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <polygon points="40,120 1160,80 1180,520 20,540" fill="url(#ground)" />
        <polygon points="40,120 1160,80 1180,200 60,230" fill="url(#haze)" />

        {NODES.map((n) => (
          <ellipse
            key={`pad-${n.id}`}
            cx={n.x}
            cy={n.y + 18}
            rx={48}
            ry={18}
            fill={BIOME_FILL[n.biome]}
            opacity={0.55}
          />
        ))}

        {EDGES.map((e) => {
          const a = nodeById(e.from);
          const b = nodeById(e.to);
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="world-map__edge"
            />
          );
        })}

        <g aria-hidden="true">
          <path d="M90 300 L110 240 L130 300 Z" fill="#1f3a2a" />
          <path d="M150 280 L165 230 L180 280 Z" fill="#2a4a34" />
          <path d="M980 300 L1010 220 L1040 300 Z" fill="#4a5058" />
          <ellipse cx="520" cy="400" rx="70" ry="16" fill="#2f4a40" opacity="0.5" />
        </g>

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
          return (
            <g
              key={s.id}
              transform={`translate(${n.x + offset} ${n.y - 36})`}
              className={s.elite ? "spawn spawn--elite" : "spawn"}
              onClick={(ev) => {
                ev.stopPropagation();
                onSelectSpawn(s.id);
              }}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") onSelectSpawn(s.id);
              }}
              aria-label={`Fight ${tpl.name}`}
            >
              <circle r={s.elite ? 11 : 8} />
              <title>
                {tpl.name} @ {n.name} ({s.hp}/{s.maxHp})
              </title>
            </g>
          );
        })}

        <g transform={`translate(${here.x} ${here.y})`} className="player-pin">
          <circle r="7" className="player-pin__core" />
        </g>
      </svg>
      <p className="world-map__hint">
        Gold rings = adjacent paths you can afford. Travel one fork at a time.
        Red dots = monsters. Ambush nodes may force a fight (flee is free).
      </p>
    </section>
  );
}
