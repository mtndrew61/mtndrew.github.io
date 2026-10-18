import {
  ARMORS,
  ENEMIES,
  MERCS,
  RESPEC_GOLD,
  WEAPONS,
} from "../game/content";
import { getForkChoices } from "../game/forks";
import { nodeById } from "../game/mapGraph";
import { skillsByTree } from "../game/skills";
import type { GameState, MercId, SkillTree, ArmorId, WeaponId } from "../game/types";

const TREES: SkillTree[] = ["melee", "archer", "rogue", "mage"];

interface SidePanelProps {
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
  onSetSteps: (n: number) => void;
  onGrantSteps: (n: number) => void;
  onNextDay: () => void;
  onReset: () => void;
}

function fmt(n: number) {
  return n.toLocaleString();
}

export function SidePanel(props: SidePanelProps) {
  const { state } = props;
  const node = nodeById(state.currentNodeId);
  const isTown = node.kind === "town";
  const localChests = state.chests.filter(
    (c) => c.nodeId === state.currentNodeId && !c.opened,
  );
  const localSpawns = state.spawns.filter((s) => s.nodeId === state.currentNodeId);
  const choices = getForkChoices(state);
  const showForkPanel = node.kind === "fork" || choices.length > 2;

  return (
    <aside className="side">
      <header className="side__brand">
        <p className="side__eyebrow">Short web demo</p>
        <h1>Step Quest</h1>
        <p className="side__lede">
          Steps are how far you can roam. Spend them on scenic paths — or on
          spite.
        </p>
      </header>

      <div className="hud">
        <div>
          <span className="hud__label">Steps</span>
          <strong>{fmt(state.stepsRemaining)}</strong>
        </div>
        <div>
          <span className="hud__label">Gold</span>
          <strong>{fmt(state.gold)}</strong>
        </div>
        <div>
          <span className="hud__label">HP</span>
          <strong>
            {state.hp}/{state.maxHp}
          </strong>
        </div>
        <div>
          <span className="hud__label">Skill pts</span>
          <strong>{state.skillPoints}</strong>
        </div>
      </div>

      <section className="block">
        <h2>{node.name}</h2>
        <p className="muted">
          {node.blurb} · {node.kind} · checkpoint{" "}
          {nodeById(state.checkpointNodeId).name}
        </p>
        {state.merc && (
          <p className="pill-line">
            Merc: {MERCS[state.merc.id].name} · {state.merc.fightsLeft} fights left
          </p>
        )}
      </section>

      {showForkPanel && !state.pendingAmbushSpawnId && (
        <section className="block forks">
          <h3>{node.kind === "fork" ? "Choose a road" : "Paths from here"}</h3>
          <ul className="fork-list">
            {choices.map((c) => (
              <li key={c.toId} className="fork-card">
                <div className="fork-card__head">
                  <strong>{c.rumor?.title ?? c.name}</strong>
                  <span className="fork-card__cost">
                    {c.cost != null ? `${fmt(c.cost)} steps` : "—"}
                  </span>
                </div>
                <p className="muted small">
                  {c.rumor?.rumor ?? nodeById(c.toId).blurb}
                </p>
                {c.tags.length > 0 && (
                  <div className="tag-row">
                    {c.tags.map((t) => (
                      <span key={t} className={`tag tag--${t}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={!c.affordable || !!state.pendingAmbushSpawnId}
                  onClick={() => props.onTravel(c.toId)}
                >
                  {c.affordable ? `Take path to ${c.name}` : "Need more steps"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="block hunt">
        <h3>Daily hunt</h3>
        <p>
          {state.hunt.title}: {state.hunt.progress}/{state.hunt.targetKills}{" "}
          kills
          {state.hunt.completed && !state.hunt.claimed && " · ready to claim"}
          {state.hunt.claimed && " · claimed"}
        </p>
        <div className="meter">
          <div
            className="meter__fill meter__fill--moss"
            style={{
              width: `${Math.min(100, (state.hunt.progress / state.hunt.targetKills) * 100)}%`,
            }}
          />
        </div>
        {isTown && state.hunt.completed && !state.hunt.claimed && (
          <button type="button" className="btn btn--primary" onClick={props.onClaimHunt}>
            Claim {state.hunt.rewardGold}g + skill point
          </button>
        )}
      </section>

      {localSpawns.length > 0 && (
        <section className="block">
          <h3>Foes in range</h3>
          <p className="muted small">
            Only monsters at this node can be fought. Tap one to cut to battle.
          </p>
          <ul className="list">
            {localSpawns.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => props.onSelectSpawn(s.id)}
                >
                  Battle {ENEMIES[s.templateId].name}
                  {s.elite ? " ★" : ""} ({fmt(s.hp)} hp)
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {localChests.map((c) => (
        <section className="block" key={c.id}>
          <h3>Treasure</h3>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => props.onOpenChest(c.id)}
          >
            Open chest
          </button>
        </section>
      ))}

      {isTown && (
        <section className="block town">
          <h3>Briarhaven services</h3>
          <div className="stack-gap">
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
        </section>
      )}

      <section className="block">
        <h3>Skills</h3>
        <p className="muted small">Hybrid OK. Respec in town.</p>
        {TREES.map((tree) => (
          <div key={tree} className="skill-tree">
            <h4>{tree}</h4>
            <ul className="list">
              {skillsByTree(tree).map((sk) => {
                const rank = state.skills[sk.id] ?? 0;
                return (
                  <li key={sk.id}>
                    <button
                      type="button"
                      className="gear__item"
                      disabled={state.skillPoints <= 0 || rank >= sk.maxRank}
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
      </section>

      <section className="block">
        <h3>Gear</h3>
        <div className="gear-grid">
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
              <span>−{Math.round(ARMORS[id].mitigation * 100)}% bruises</span>
            </button>
          ))}
        </div>
      </section>

      <section className="block simulator">
        <h3>Simulate steps</h3>
        <label htmlFor="steps">
          Web stand-in for Apple Health
          <input
            id="steps"
            type="range"
            min={0}
            max={20000}
            step={100}
            value={state.stepsRemaining}
            onChange={(e) => props.onSetSteps(Number(e.target.value))}
          />
        </label>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => props.onGrantSteps(2000)}
          >
            +2,000 steps
          </button>
          <button type="button" className="btn btn--primary" onClick={props.onNextDay}>
            Next day
          </button>
        </div>
      </section>

      <section className="block journal">
        <h3>Journal</h3>
        <ul>
          {state.journal.slice(0, 6).map((j, i) => (
            <li key={`${j.at}-${i}`}>{j.text}</li>
          ))}
        </ul>
      </section>

      {state.demoComplete && (
        <p className="banner">Demo trail complete. More regions later.</p>
      )}

      <footer className="side__footer">
        <span>Day {state.day}</span>
        <button type="button" className="btn btn--ghost" onClick={props.onReset}>
          Reset demo
        </button>
      </footer>
    </aside>
  );
}
