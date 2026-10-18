import { useState } from "react";
import { ENEMIES } from "../game/content";
import { getSpawn, previewFight } from "../game/combat";
import type { GameState } from "../game/types";

interface BattleSceneProps {
  state: GameState;
  onFight: (spawnId: string, mode: "fight" | "chip" | "flee") => void;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function BattleScene({ state, onFight, onClose }: BattleSceneProps) {
  const spawnId = state.selectedSpawnId ?? state.pendingAmbushSpawnId;
  const spawn = spawnId ? getSpawn(state, spawnId) : undefined;
  const [phase, setPhase] = useState<"idle" | "strike" | "resolve">("idle");
  const [flash, setFlash] = useState<string | null>(null);

  if (!spawn || !spawnId) return null;

  const preview = previewFight(state, spawn);
  const tpl = ENEMIES[spawn.templateId];
  const ambush = state.pendingAmbushSpawnId === spawn.id;
  const hpPct = (spawn.hp / spawn.maxHp) * 100;
  const youPct = (state.hp / state.maxHp) * 100;

  function act(mode: "fight" | "chip" | "flee") {
    if (mode === "flee") {
      onFight(spawnId!, "flee");
      return;
    }
    setPhase("strike");
    setFlash(mode === "fight" ? "strike" : "chip");
    window.setTimeout(() => {
      onFight(spawnId!, mode);
      setPhase("resolve");
      setFlash(null);
    }, 480);
  }

  return (
    <div
      className={`battle ${ambush ? "battle--ambush" : ""} ${phase === "strike" ? "battle--strike" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Battle: ${tpl.name}`}
    >
      <div className="battle__sky" aria-hidden="true" />
      <div className="battle__ground" aria-hidden="true" />

      <header className="battle__header">
        <p className="battle__eyebrow">
          {ambush ? "Ambush!" : "Encounter"} · proximity fight
        </p>
        <h2>
          {tpl.name}
          {preview.elite ? " ★" : ""}
        </h2>
        <p className="muted">{tpl.blurb}</p>
      </header>

      <div className="battle__arena">
        <div className="battle__fighter battle__fighter--you">
          <div className="battle__sprite battle__sprite--you" aria-hidden="true" />
          <p className="battle__name">You</p>
          <div className="meter">
            <div
              className="meter__fill meter__fill--moss"
              style={{ width: `${youPct}%` }}
            />
          </div>
          <p className="meter__label">
            {state.hp}/{state.maxHp} HP · {fmt(state.stepsRemaining)} steps
          </p>
        </div>

        <div
          className={`battle__fighter battle__fighter--foe ${flash ? "is-hit" : ""}`}
        >
          <div
            className={`battle__sprite battle__sprite--foe ${preview.elite ? "is-elite" : ""}`}
            aria-hidden="true"
          />
          <p className="battle__name">{tpl.name}</p>
          <div className="meter">
            <div
              className="meter__fill meter__fill--danger"
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <p className="meter__label">
            {fmt(spawn.hp)} / {fmt(spawn.maxHp)} spite
          </p>
        </div>
      </div>

      <div className="battle__stats">
        <p>
          ~{fmt(preview.stepsToKill)} steps to finish ·{" "}
          {preview.damagePerStep.toFixed(2)} dmg/step · loot {preview.goldHint}g
        </p>
        {preview.mercName && (
          <p className="pill-line">
            {preview.mercName}: −{Math.round(preview.mercReduction * 100)}% fight
            cost
          </p>
        )}
      </div>

      <div className="battle__actions btn-row">
        <button
          type="button"
          className="btn btn--primary"
          disabled={state.stepsRemaining <= 0 || phase === "strike"}
          onClick={() => act(preview.canAfford ? "fight" : "chip")}
        >
          {preview.canAfford ? "Strike" : "Chip away"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={phase === "strike"}
          onClick={() => act("flee")}
        >
          Flee (free)
        </button>
        {!ambush && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={phase === "strike"}
            onClick={onClose}
          >
            Back to map
          </button>
        )}
      </div>

      {!preview.canAfford && (
        <p className="muted small battle__hint">
          Not enough steps for a clean kill — chip (~
          {preview.expectedPlayerDamageIfChip} HP bruise if unfinished) or flee.
        </p>
      )}
    </div>
  );
}
