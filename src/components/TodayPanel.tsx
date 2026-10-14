import { ENEMIES, WEAPONS } from "../game/content";
import {
  computeDamage,
  dailyTarget,
} from "../game/economy";
import { getBaseGoal } from "../game/state";
import type { GameState } from "../game/types";

interface TodayPanelProps {
  state: GameState;
  onStepsChange: (steps: number) => void;
  onResolve: () => void;
  onReset: () => void;
  onNextScout: () => void;
  onEquip: (id: GameState["weaponId"]) => void;
}

function format(n: number): string {
  return n.toLocaleString();
}

export function TodayPanel({
  state,
  onStepsChange,
  onResolve,
  onReset,
  onNextScout,
  onEquip,
}: TodayPanelProps) {
  const baseGoal = getBaseGoal(state);
  const target = dailyTarget(baseGoal, state.debt);
  const enemy = ENEMIES[state.enemyId];
  const weapon = WEAPONS[state.weaponId];
  const preview = computeDamage(
    state.simulatedSteps,
    state.bankedDamage,
    state.weaponId,
  );
  const hpAfter = Math.max(0, state.enemyHp - preview.total);
  const hpPct = state.enemyMaxHp
    ? (state.enemyHp / state.enemyMaxHp) * 100
    : 0;
  const stepPct = Math.min(100, (state.simulatedSteps / Math.max(1, target)) * 100);
  const lastLog = state.history[state.history.length - 1];

  return (
    <section className="today" aria-label="Today">
      <header className="today__brand">
        <p className="today__eyebrow">Phase 0 prototype</p>
        <h1 className="today__title">Step Quest</h1>
        <p className="today__lede">
          Walk the wild road. Your steps bruise the goblin that bars the trail.
        </p>
      </header>

      {state.inEncounter ? (
        <div className="encounter">
          <div className="encounter__art" aria-hidden="true">
            <div className="encounter__silhouette" />
          </div>
          <div className="encounter__copy">
            <h2>{enemy.name}</h2>
            <p>{enemy.blurb}</p>
            <div
              className="meter"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={state.enemyMaxHp}
              aria-valuenow={state.enemyHp}
              aria-label="Enemy health"
            >
              <div className="meter__fill meter__fill--danger" style={{ width: `${hpPct}%` }} />
            </div>
            <p className="meter__label">
              {format(state.enemyHp)} / {format(state.enemyMaxHp)} spite
              {preview.total > 0 && (
                <span className="meter__preview">
                  {" "}
                  → {format(hpAfter)} after sync
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="encounter encounter--clear">
          <h2>Road clear</h2>
          <p>
            The scout is gone. Keep walking, or dare another Whisperwood ambush.
          </p>
          <button type="button" className="btn btn--secondary" onClick={onNextScout}>
            Face another scout
          </button>
        </div>
      )}

      <div className="goal-block">
        <div className="goal-block__main">
          <p className="goal-block__label">Today&apos;s mark</p>
          <p className="goal-block__value">{format(target)}</p>
          <p className="goal-block__meta">
            Base {format(baseGoal)}
            {state.debt > 0 && (
              <>
                {" "}
                + debt <strong>{format(state.debt)}</strong>
              </>
            )}
            {state.bankedDamage > 0 && (
              <>
                {" "}
                · banked damage {format(state.bankedDamage)}
              </>
            )}
          </p>
        </div>
        <div
          className="meter meter--tall"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={state.simulatedSteps}
          aria-label="Steps toward goal"
        >
          <div
            className="meter__fill meter__fill--moss"
            style={{ width: `${stepPct}%` }}
          />
        </div>
        <p className="meter__label">
          {format(state.simulatedSteps)} steps · weapon {weapon.name} (×
          {weapon.damageMult})
        </p>
      </div>

      <div className="simulator">
        <label htmlFor="steps">
          Simulate Apple Health steps
          <span className="simulator__hint">Phase 0 — no HealthKit yet</span>
        </label>
        <input
          id="steps"
          type="range"
          min={0}
          max={16000}
          step={100}
          value={state.simulatedSteps}
          onChange={(e) => onStepsChange(Number(e.target.value))}
        />
        <div className="simulator__row">
          <input
            type="number"
            min={0}
            max={50000}
            value={state.simulatedSteps}
            onChange={(e) => onStepsChange(Number(e.target.value))}
            aria-label="Step count"
          />
          <button type="button" className="btn btn--primary" onClick={onResolve}>
            End day & resolve
          </button>
        </div>
      </div>

      {lastLog && (
        <aside className="result" aria-live="polite">
          <p className="result__title">
            Last resolve · {lastLog.date} · {lastLog.outcome}
          </p>
          <p>
            Dealt {format(lastLog.damageDealt)} damage. Debt out{" "}
            {format(lastLog.debtOut)}. Banked {format(lastLog.bankedOut)}.
            {lastLog.lootGained && (
              <> Loot: {WEAPONS[lastLog.lootGained].name}.</>
            )}
          </p>
        </aside>
      )}

      <div className="gear">
        <h3>Gear</h3>
        <ul>
          {state.unlockedWeapons.map((id) => {
            const w = WEAPONS[id];
            const active = id === state.weaponId;
            return (
              <li key={id}>
                <button
                  type="button"
                  className={active ? "gear__item gear__item--active" : "gear__item"}
                  onClick={() => onEquip(id)}
                >
                  <strong>{w.name}</strong>
                  <span>{w.blurb}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="journal">
        <h3>Journal</h3>
        <ul>
          {[...state.journal].reverse().slice(0, 5).map((line, i) => (
            <li key={`${i}-${line.slice(0, 12)}`}>{line}</li>
          ))}
        </ul>
      </div>

      <footer className="today__footer">
        <p>Day {state.today}</p>
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Reset prototype
        </button>
      </footer>
    </section>
  );
}
