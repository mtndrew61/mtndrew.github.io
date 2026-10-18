import { useEffect, useMemo, useState } from "react";
import { BattleScene } from "./components/BattleScene";
import { GameHud } from "./components/GameHud";
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
} from "./game/state";
import type { BattleAction } from "./game/combat";
import type { GameState } from "./game/types";
import "./App.css";

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());
  const reachable = useMemo(() => getTravelOptions(state), [state]);
  const inBattle = !!(state.selectedSpawnId || state.pendingAmbushSpawnId);

  useEffect(() => {
    saveState(state);
  }, [state]);

  if (inBattle) {
    return (
      <div className="app app--battle">
        <BattleScene
          key={state.selectedSpawnId ?? state.pendingAmbushSpawnId ?? "battle"}
          state={state}
          onFight={(id, mode: BattleAction) =>
            setState((s) => applyFight(s, id, mode))
          }
          onClose={() => setState((s) => selectSpawn(s, null))}
        />
      </div>
    );
  }

  return (
    <div className="app app--field">
      <WorldMap
        state={state}
        reachable={reachable}
        onTravel={(id) => setState((s) => moveTo(s, id))}
        onSelectSpawn={(id) => setState((s) => selectSpawn(s, id))}
      />
      <GameHud
        state={state}
        onSelectSpawn={(id) => setState((s) => selectSpawn(s, id))}
        onTravel={(id) => setState((s) => moveTo(s, id))}
        onOpenChest={(id) => setState((s) => openChest(s, id))}
        onHire={(id) => setState((s) => hireMerc(s, id))}
        onClaimHunt={() => setState((s) => claimHunt(s))}
        onBuySkill={(id) => setState((s) => buySkill(s, id))}
        onRespec={() => setState((s) => respecSkills(s))}
        onEquipWeapon={(id) => setState((s) => equipWeapon(s, id))}
        onEquipArmor={(id) => setState((s) => equipArmor(s, id))}
        onGrantSteps={(n) => setState((s) => grantSteps(s, n))}
        onNextDay={() => setState((s) => nextDay(s))}
        onReset={() => setState(resetGame())}
      />
    </div>
  );
}
