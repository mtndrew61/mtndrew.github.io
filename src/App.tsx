import { useEffect, useMemo, useState } from "react";
import { SidePanel } from "./components/SidePanel";
import { WorldMap } from "./components/WorldMap";
import {
  applyFight,
  buySkill,
  claimHunt,
  equipArmor,
  equipWeapon,
  getTravelOptions,
  grantSteps,
  hireMerc,
  loadState,
  moveTo,
  nextDay,
  openChest,
  resetGame,
  respecSkills,
  saveState,
  selectSpawn,
  setSteps,
} from "./game/state";
import type { GameState } from "./game/types";
import "./App.css";

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const reachable = useMemo(() => getTravelOptions(state), [state]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <div className="app">
      <WorldMap
        state={state}
        reachable={reachable}
        onTravel={(id) => setState((s) => moveTo(s, id))}
        onSelectSpawn={(id) => setState((s) => selectSpawn(s, id))}
      />
      <SidePanel
        state={state}
        onFight={(id, mode) => setState((s) => applyFight(s, id, mode))}
        onSelectSpawn={(id) => setState((s) => selectSpawn(s, id))}
        onTravel={(id) => setState((s) => moveTo(s, id))}
        onOpenChest={(id) => setState((s) => openChest(s, id))}
        onHire={(id) => setState((s) => hireMerc(s, id))}
        onClaimHunt={() => setState((s) => claimHunt(s))}
        onBuySkill={(id) => setState((s) => buySkill(s, id))}
        onRespec={() => setState((s) => respecSkills(s))}
        onEquipWeapon={(id) => setState((s) => equipWeapon(s, id))}
        onEquipArmor={(id) => setState((s) => equipArmor(s, id))}
        onSetSteps={(n) => setState((s) => setSteps(s, n))}
        onGrantSteps={(n) => setState((s) => grantSteps(s, n))}
        onNextDay={() => setState((s) => nextDay(s))}
        onReset={() => setState(resetGame())}
      />
    </div>
  );
}
