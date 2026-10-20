import { useState } from "react";
import {
  ARMORS,
  ENEMIES,
  MERCS,
  RESPEC_GOLD,
  WEAPONS,
} from "../game/content";
import { getForkChoices } from "../game/forks";
import { nodeById } from "../game/mapGraph";
import { progressSummary } from "../game/progress";
import { skillsByTree } from "../game/skills";
import type { GameState, MercId, SkillTree, ArmorId, WeaponId } from "../game/types";

type SheetId = "skills" | "gear" | "town" | "menu" | null;

const TREES: SkillTree[] = ["melee", "archer", "rogue", "mage"];

interface GameHudProps {
  state: GameState;
  onSelectSpawn: (id: string | null) => void;
  onTravel: (nodeId: string) => void;
  onOpenChest: (id: string) => void;
  onHire: (id: MercId) => void;
  onClaimHunt: () => void;
  onBuySkill: (id: string) => void;
  onRespec: () => void;
  onEquipWeapon: (id: WeaponId) => void;
  onEquipArmor: (id: ArmorId) => void;
  onGrantSteps: (n: number) => void;
  onNextDay: () => void;
  onReset: () => void;
  healthNote: string | null;
  syncing: boolean;
  onSyncHealth: () => void;
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function GameHud(props: GameHudProps) {
  const { state } = props;
  const [sheet, setSheet] = useState<SheetId>(null);
  const node = nodeById(state.currentNodeId);
  const isTown = node.kind === "town";
  const localChests = state.chests.filter(
    (c) => c.nodeId === state.currentNodeId && !c.opened,
  );
  const localSpawns = state.spawns.filter((s) => s.nodeId === state.currentNodeId);
  const choices = getForkChoices(state).filter((c) => c.toId !== state.currentNodeId);
  const huntPct = Math.min(
    100,
    (state.hunt.progress / state.hunt.targetKills) * 100,
  );
  const latest = state.journal[0]?.text;
  const progress = progressSummary(state);

  return (
    <div className="hud-root">
      <header className="hud-top">
        <div className="hud-brand">
          <span className="hud-brand__mark">Step Quest</span>
          <span className="hud-brand__place">{node.name}</span>
          <span className="hud-brand__rank">
            Rank {progress.rank} · {progress.title}
          </span>
        </div>
        <div className="hud-stats" role="group" aria-label="Status">
          <div className="hud-stat">
            <span>{state.stepSource === "health" ? "Health" : "Steps"}</span>
            <strong>{fmt(state.stepsRemaining)}</strong>
          </div>
          <div className="hud-stat">
            <span>Gold</span>
            <strong>{fmt(state.gold)}</strong>
          </div>
          <div className="hud-stat">
            <span>HP</span>
            <strong>
              {state.hp}
              <em>/{state.maxHp}</em>
            </strong>
          </div>
        </div>
        <div className="hud-hunt" title={state.hunt.title}>
          <span>
            Hunt {state.hunt.progress}/{state.hunt.targetKills}
          </span>
          <div className="meter meter--slim">
            <div
              className="meter__fill meter__fill--moss"
              style={{ width: `${huntPct}%` }}
            />
          </div>
        </div>
      </header>

      {latest && (
        <p className="hud-toast" aria-live="polite">
          {latest}
        </p>
      )}

      <nav className="hud-rail" aria-label="Menus">
        <button
          type="button"
          className={sheet === "skills" ? "hud-rail__btn is-on" : "hud-rail__btn"}
          onClick={() => setSheet(sheet === "skills" ? null : "skills")}
        >
          Skills
          {state.skillPoints > 0 && (
            <i className="hud-rail__badge">{state.skillPoints}</i>
          )}
        </button>
        <button
          type="button"
          className={sheet === "gear" ? "hud-rail__btn is-on" : "hud-rail__btn"}
          onClick={() => setSheet(sheet === "gear" ? null : "gear")}
        >
          Gear
        </button>
        {isTown && (
          <button
            type="button"
            className={sheet === "town" ? "hud-rail__btn is-on" : "hud-rail__btn"}
            onClick={() => setSheet(sheet === "town" ? null : "town")}
          >
            Town
          </button>
        )}
        <button
          type="button"
          className={sheet === "menu" ? "hud-rail__btn is-on" : "hud-rail__btn"}
          onClick={() => setSheet(sheet === "menu" ? null : "menu")}
        >
          Menu
        </button>
      </nav>

      <footer className="hud-dock">
        {localSpawns.length > 0 && (
          <div className="hud-dock__row">
            {localSpawns.map((s) => (
              <button
                key={s.id}
                type="button"
                className="btn btn--danger"
                onClick={() => props.onSelectSpawn(s.id)}
              >
                Fight {ENEMIES[s.templateId].name}
                {s.elite ? " ★" : ""}
              </button>
            ))}
          </div>
        )}

        {localChests.map((c) => (
          <button
            key={c.id}
            type="button"
            className="btn btn--secondary"
            onClick={() => props.onOpenChest(c.id)}
          >
            Open chest
          </button>
        ))}

        {choices.length > 0 && (
          <div className="hud-paths">
            {choices.map((c) => (
              <button
                key={c.toId}
                type="button"
                className="path-chip"
                disabled={!c.affordable}
                onClick={() => props.onTravel(c.toId)}
                title={c.rumor?.rumor ?? nodeById(c.toId).blurb}
              >
                <span className="path-chip__name">{c.rumor?.title ?? c.name}</span>
                <span className="path-chip__meta">
                  {c.cost != null ? fmt(c.cost) : "—"}
                  {c.tags.slice(0, 2).map((t) => (
                    <em key={t} className={`tag tag--${t}`}>
                      {t}
                    </em>
                  ))}
                </span>
              </button>
            ))}
          </div>
        )}

        {state.merc && (
          <p className="hud-merc">
            {MERCS[state.merc.id].name} · {state.merc.fightsLeft} left
          </p>
        )}
      </footer>

      {sheet && (
        <div className="sheet" role="dialog" aria-modal="true">
          <div className="sheet__scrim" onClick={() => setSheet(null)} />
          <div className="sheet__panel">
            <header className="sheet__head">
              <h2>
                {sheet === "skills" && "Skills"}
                {sheet === "gear" && "Gear"}
                {sheet === "town" && "Briarhaven"}
                {sheet === "menu" && "Menu"}
              </h2>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setSheet(null)}
              >
                Close
              </button>
            </header>

            {sheet === "skills" && (
              <div className="sheet__body">
                <p className="muted small">
                  Rank {progress.rank} {progress.title} · {progress.unspent}{" "}
                  unspent / {progress.earned} earned · hybrid OK · respec in town
                </p>
                <p className="muted small">
                  Earn points from daily hunt claims and elite kills — no XP bar
                  yet.
                </p>
                {TREES.map((tree) => (
                  <div key={tree} className="skill-tree">
                    <h3>{tree}</h3>
                    <ul className="list">
                      {skillsByTree(tree).map((sk) => {
                        const rank = state.skills[sk.id] ?? 0;
                        return (
                          <li key={sk.id}>
                            <button
                              type="button"
                              className="gear__item"
                              disabled={
                                state.skillPoints <= 0 || rank >= sk.maxRank
                              }
                              onClick={() => props.onBuySkill(sk.id)}
                            >
                              <strong>
                                {sk.name} ({rank}/{sk.maxRank})
                              </strong>
                              <span>{sk.blurb}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {sheet === "gear" && (
              <div className="sheet__body gear-grid">
                {state.unlockedWeapons.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={
                      state.weaponId === id
                        ? "gear__item gear__item--active"
                        : "gear__item"
                    }
                    onClick={() => props.onEquipWeapon(id)}
                  >
                    <strong>{WEAPONS[id].name}</strong>
                    <span>×{WEAPONS[id].damageMult}</span>
                  </button>
                ))}
                {state.unlockedArmor.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={
                      state.armorId === id
                        ? "gear__item gear__item--active"
                        : "gear__item"
                    }
                    onClick={() => props.onEquipArmor(id)}
                  >
                    <strong>{ARMORS[id].name}</strong>
                    <span>
                      −{Math.round(ARMORS[id].mitigation * 100)}% bruises
                    </span>
                  </button>
                ))}
              </div>
            )}

            {sheet === "town" && (
              <div className="sheet__body stack-gap">
                {state.hunt.completed && !state.hunt.claimed && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={props.onClaimHunt}
                  >
                    Claim hunt +{state.hunt.rewardGold}g
                  </button>
                )}
                {Object.values(MERCS).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="btn btn--secondary"
                    disabled={state.gold < m.hireGold}
                    onClick={() => props.onHire(m.id)}
                  >
                    Hire {m.name} ({m.hireGold}g · {m.fights} fights)
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={state.gold < RESPEC_GOLD}
                  onClick={props.onRespec}
                >
                  Respec skills ({RESPEC_GOLD}g)
                </button>
              </div>
            )}

            {sheet === "menu" && (
              <div className="sheet__body">
                <p className="muted small">
                  Day {state.day}
                  {state.stepSource === "health"
                    ? " · Apple Health"
                    : " · step simulator"}
                </p>
                <p className="muted small" role="status">
                  {state.stepSource === "health"
                    ? "Today’s step count is your stamina. Steps already spent stay spent until midnight. Step Quest reads steps only and keeps them on this device."
                    : (props.healthNote ?? "Checking Apple Health…")}
                </p>
                <div className="stack-gap">
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={props.syncing}
                    onClick={props.onSyncHealth}
                  >
                    {props.syncing ? "Syncing…" : "Sync Apple Health"}
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => props.onGrantSteps(2000)}
                  >
                    Dev +2,000 steps
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={props.onNextDay}
                  >
                    Next day
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={props.onReset}
                  >
                    Reset demo
                  </button>
                </div>
                <ul className="journal-mini">
                  {state.journal.slice(0, 4).map((j, i) => (
                    <li key={`${j.at}-${i}`}>{j.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
