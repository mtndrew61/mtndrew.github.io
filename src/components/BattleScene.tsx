import { useState } from "react";
import { ENEMIES } from "../game/content";
import {
  getSpawn,
  previewFight,
  type BattleAction,
} from "../game/combat";
import type { GameState } from "../game/types";

interface BattleSceneProps {
  state: GameState;
  onFight: (spawnId: string, mode: BattleAction) => void;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function BattleScene({ state, onFight, onClose }: BattleSceneProps) {
  const spawnId = state.selectedSpawnId ?? state.pendingAmbushSpawnId;
  const spawn = spawnId ? getSpawn(state, spawnId) : undefined;
  const [phase, setPhase] = useState<"idle" | "anim">("idle");
  const [flash, setFlash] = useState<"strike" | "block" | null>(null);

  if (!spawn || !spawnId) return null;

  const preview = previewFight(state, spawn);
  const tpl = ENEMIES[spawn.templateId];
  const ambush = state.pendingAmbushSpawnId === spawn.id;
  const hpPct = (spawn.hp / spawn.maxHp) * 100;
  const youPct = (state.hp / state.maxHp) * 100;
  const stamPct = Math.min(
    100,
    (state.stepsRemaining / Math.max(state.stepsGranted, 1)) * 100,
  );
  const lastLine = state.journal[0]?.text;

  function act(mode: BattleAction) {
    if (mode === "flee") {
      onFight(spawnId!, "flee");
      return;
    }
    if (mode === "strike" && !preview.canStrike) return;
    if (mode === "block" && !preview.canBlock) return;
    setPhase("anim");
    setFlash(mode);
    window.setTimeout(() => {
      onFight(spawnId!, mode);
      setPhase("idle");
      setFlash(null);
    }, 520);
  }

  const busy = phase === "anim";

  return (
    <div
      className={`battle ${ambush ? "battle--ambush" : ""} ${flash === "strike" ? "battle--strike" : ""} ${flash === "block" ? "battle--block" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Battle: ${tpl.name}`}
    >
      <div className="battle__sky" aria-hidden="true" />
      <div className="battle__ground" aria-hidden="true" />

      <header className="battle__header">
        <p className="battle__eyebrow">
          {ambush ? "Ambush" : "Battle"} · stamina strikes
        </p>
        <h2>
          {tpl.name}
          {preview.elite ? " ★" : ""}
        </h2>
        <p className="muted">{tpl.blurb}</p>
      </header>

      <div className="battle__arena">
        <div
          className={`battle__fighter battle__fighter--you ${flash === "block" ? "is-guard" : ""}`}
        >
          <div className="battle__sprite battle__sprite--you" aria-hidden="true" />
          <p className="battle__name">You</p>
          <div className="meter">
            <div
              className="meter__fill meter__fill--moss"
              style={{ width: `${youPct}%` }}
            />
          </div>
          <p className="meter__label">
            {state.hp}/{state.maxHp} HP
          </p>
          <div className="meter meter--slim">
            <div
              className="meter__fill meter__fill--stam"
              style={{ width: `${stamPct}%` }}
            />
          </div>
          <p className="meter__label">
            {fmt(state.stepsRemaining)} stamina (steps)
          </p>
        </div>

        <div
          className={`battle__fighter battle__fighter--foe ${flash === "strike" ? "is-hit" : ""}`}
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
            {fmt(spawn.hp)} / {fmt(spawn.maxHp)}
          </p>
        </div>
      </div>

      <div className="battle__stats">
        <p>
          Strike ~{fmt(preview.strikeDamage)} dmg · {preview.strikesToKill} hits
          to fell · loot {preview.goldHint}g
        </p>
        <p className="muted small">
          Open hit {preview.openHit} · Blocked hit {preview.blockedHit} · gear +
          skills set both
        </p>
        {preview.mercNote && <p className="pill-line">{preview.mercNote}</p>}
      </div>

      {lastLine && (
        <p className="battle__log" aria-live="polite">
          {lastLine}
        </p>
      )}

      <div className="battle__actions btn-row">
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy || !preview.canStrike}
          onClick={() => act("strike")}
        >
          Strike (−{fmt(preview.strikeCost)})
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={busy || !preview.canBlock}
          onClick={() => act("block")}
        >
          Block (−{fmt(preview.blockCost)})
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={busy}
          onClick={() => act("flee")}
        >
          Flee
        </button>
        {!ambush && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={onClose}
          >
            Back to map
          </button>
        )}
      </div>

      {!preview.canStrike && (
        <p className="muted small battle__hint">
          Out of strike stamina — Block if you can, Flee, or leave and walk to
          recover steps.
        </p>
      )}
    </div>
  );
}
