import {
  createDefaultState,
  restoreState,
  saveState,
  type GameState,
} from "@infernodrift4/game-core";

const key = "infernodrift4.save.v1";
const backupKey = "infernodrift4.save.corrupt";

export function loadSavedState(): GameState {
  const raw = localStorage.getItem(key);
  if (!raw) return createDefaultState();
  try {
    return restoreState(raw);
  } catch {
    localStorage.setItem(backupKey, raw);
    localStorage.removeItem(key);
    return createDefaultState();
  }
}

export function persistState(state: GameState) {
  localStorage.setItem(key, saveState(state));
}

export function exportSave(state: GameState) {
  return saveState(state);
}

export function importSave(raw: string): GameState {
  const next = restoreState(raw);
  localStorage.setItem(key, saveState(next));
  return next;
}

export function resetSave() {
  localStorage.removeItem(key);
}
