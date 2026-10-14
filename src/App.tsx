import { useEffect, useState } from "react";
import { MapTrail } from "./components/MapTrail";
import { TodayPanel } from "./components/TodayPanel";
import {
  equipWeapon,
  loadState,
  resetGame,
  resolveToday,
  saveState,
  setSimulatedSteps,
  startNextScout,
} from "./game/state";
import type { GameState, WeaponId } from "./game/types";
import "./App.css";

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <div className="app">
      <MapTrail state={state} />
      <TodayPanel
        state={state}
        onStepsChange={(steps) => setState((s) => setSimulatedSteps(s, steps))}
        onResolve={() => setState((s) => resolveToday(s))}
        onReset={() => setState(resetGame())}
        onNextScout={() => setState((s) => startNextScout(s))}
        onEquip={(id: WeaponId) => setState((s) => equipWeapon(s, id))}
      />
    </div>
  );
}
