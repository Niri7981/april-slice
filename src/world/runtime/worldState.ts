import type { EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { DayRecord } from "../../game/day/dayRecord";
import type { DailyEchoRecord } from "../../game/echo/echoResolution";
import { createFallbackInitialHand } from "../../game/initial-hand/resolver/createInitialHand";
import type { InitialHand } from "../../game/initial-hand/model/initialHand";
import type { RelationshipState } from "../../game/relationships/relationshipDrift";
import type { AgentSignalState } from "../../game/state/agentState";
import type { WorldNodeId } from "../data/worldGraph";
import type { WorldTimeOfDay } from "../systems/worldTime";

export type WorldNoteState = {
  available: boolean;
  dialogOpen: boolean;
  draft: string;
};

export type WorldDiaryState = {
  open: boolean;
  record: DayRecord | null;
};

export type WorldContextState = {
  scene: WorldNodeId;
  timeOfDay: WorldTimeOfDay;
  visitedScenes: WorldNodeId[];
};

export type WorldRuntimeState = {
  day: number;
  initialHand: InitialHand;
  context: WorldContextState;
  note: WorldNoteState;
  diary: WorldDiaryState;
  agentState: AgentSignalState;
  relationships: RelationshipState[];
  dailyEchoes: DailyEchoRecord[];
  echoEffect: EchoBehaviorEffect | null;
};

export const initialAgentState: AgentSignalState = {
  pressure: 64,
  loneliness: 56,
  futureSense: 45,
  selfSense: 52,
  trust: 50,
};

export const initialRelationships: RelationshipState[] = [
  {
    id: "mina",
    name: "Mina",
    role: "Classmate",
    roleKey: "classmate",
    warmth: 42,
    tension: 36,
    note: "同路时会点头，但还没有真正说上话。",
  },
  {
    id: "family",
    name: "Mother",
    role: "Family",
    roleKey: "family",
    warmth: 54,
    tension: 44,
    note: "早晨的餐桌安静得像一张没有寄出的明信片。",
  },
  {
    id: "guide",
    name: "Station Light",
    role: "Guide",
    roleKey: "guide",
    warmth: 38,
    tension: 24,
    note: "远处的铁轨像是在替她记住离开的方向。",
  },
];

export const initialHand = createFallbackInitialHand({
  name: "April",
  birthDate: "2008-04-17",
});

export const initialWorldState: WorldRuntimeState = {
  day: 1,
  initialHand,
  context: {
    scene: "room",
    timeOfDay: "morning",
    visitedScenes: ["room"],
  },
  note: {
    available: true,
    dialogOpen: false,
    draft: "",
  },
  diary: {
    open: false,
    record: null,
  },
  agentState: initialAgentState,
  relationships: initialRelationships,
  dailyEchoes: [],
  echoEffect: null,
};
