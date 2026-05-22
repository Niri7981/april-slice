import type { RunStateSnapshot } from "./runState";

export const localSaveKey = "april-slice-run-v1";

export type RunSaveState = RunStateSnapshot;

export const loadRunSaveState = (): RunSaveState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(localSaveKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RunSaveState;
  } catch {
    return null;
  }
};

export const persistRunSaveState = (state: RunSaveState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localSaveKey, JSON.stringify(state));
};

export const clearRunSaveState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(localSaveKey);
};
