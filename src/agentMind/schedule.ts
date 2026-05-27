import type { WorldNodeId } from "../world/data/worldGraph";

export type ScheduleEntry = {
  minute: number;
  targetNodeId: WorldNodeId;
  label: string;
};

export const dayStartMinute = 7 * 60 + 20;
export const dayEndMinute = 22 * 60;
export const worldMinutesPerSecond = 18;

export const agentSchedule: ScheduleEntry[] = [
  {
    minute: 7 * 60 + 30,
    targetNodeId: "room",
    label: "wake",
  },
  {
    minute: 7 * 60 + 50,
    targetNodeId: "homeGate",
    label: "leave home",
  },
  {
    minute: 8 * 60 + 30,
    targetNodeId: "classroom",
    label: "classroom",
  },
  {
    minute: 12 * 60,
    targetNodeId: "cafeteria",
    label: "lunch",
  },
  {
    minute: 15 * 60 + 30,
    targetNodeId: "station",
    label: "after school",
  },
  {
    minute: 17 * 60,
    targetNodeId: "homeGate",
    label: "return home",
  },
  {
    minute: 22 * 60,
    targetNodeId: "room",
    label: "night room",
  },
];

export const getScheduleEntryForMinute = (minute: number): ScheduleEntry =>
  agentSchedule.reduce<ScheduleEntry>(
    (currentEntry, entry) => (minute >= entry.minute ? entry : currentEntry),
    agentSchedule[0],
  );
