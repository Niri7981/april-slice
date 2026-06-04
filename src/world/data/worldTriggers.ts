import type { WorldNodeId } from "./worldGraph";

export type WorldPauseTrigger = {
  id: string;
  whenTargetNodeId: WorldNodeId;
  anchorNodeId: WorldNodeId;
  radius: number;
  fallbackDurationSeconds: number;
};

export const worldPauseTriggers: WorldPauseTrigger[] = [
  {
    id: "school-entrance-hesitation",
    whenTargetNodeId: "classroom",
    anchorNodeId: "schoolGate",
    radius: 12,
    fallbackDurationSeconds: 2.6,
  },
];
