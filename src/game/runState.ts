import type { AgentReaction } from "../llm/brainTypes";
import type { DayRecord } from "./dayRecord";
import type { DailyEchoRecord } from "./echoResolution";
import type { RelationshipState } from "./relationshipDrift";
import type { AgentSignalState, AgentStateDelta, StateDriftReasonCode } from "./stateDrift";

export type RunLanguage = "zh" | "en";
export type RunSceneId = "homeRoom" | "corridor" | "classroom" | "station" | "harbor";
export type RunTimeOfDay = "morning" | "afternoon" | "night";

export type EchoTrace =
  | {
      id: string;
      kind: "note";
      text: string;
    }
  | {
      id: string;
      kind: "spatial";
      scene: RunSceneId;
      labelKey:
        | "window"
        | "desk"
        | "bag"
        | "bed"
        | "door"
        | "board"
        | "bench"
        | "rail"
        | "water";
    };

export type AgentBrainMemory = {
  recentDiary: string[];
  recentReactions: AgentReaction[];
};

export type DriftLogEntry = {
  id: string;
  event:
    | {
        kind: "note";
        noteText: string;
      }
    | {
        kind: "spatial";
        scene: RunSceneId;
        target:
          | "window"
          | "desk"
          | "bag"
          | "bed"
          | "door"
          | "board"
          | "bench"
          | "rail"
          | "water";
      };
  reaction: AgentReaction;
  delta: AgentStateDelta;
  nextState: AgentSignalState;
  reasons: StateDriftReasonCode[];
  day: number;
  timeOfDay: RunTimeOfDay;
  scene: RunSceneId;
};

export type RunStateSnapshot = {
  gameDay: number;
  language: RunLanguage;
  activeScene: RunSceneId;
  activeTimeOfDay: RunTimeOfDay;
  agentState: AgentSignalState;
  dayStartAgentState: AgentSignalState;
  relationships: RelationshipState[];
  dayStartRelationships: RelationshipState[];
  usedEchoes: number;
  sentNote: string;
  visitedScenes: RunSceneId[];
  echoTraces: EchoTrace[];
  brainMemory: AgentBrainMemory;
  dailyEchoRecords: DailyEchoRecord[];
  dayRecords: DayRecord[];
  driftLog: DriftLogEntry[];
  sceneText: string;
  noteFloatKey: number;
};

export const createInitialRunState = ({
  agentState,
  relationships,
  openingText,
  language = "zh",
}: {
  agentState: AgentSignalState;
  relationships: RelationshipState[];
  openingText: string;
  language?: RunLanguage;
}): RunStateSnapshot => ({
  gameDay: 1,
  language,
  activeScene: "homeRoom",
  activeTimeOfDay: "morning",
  agentState,
  dayStartAgentState: agentState,
  relationships,
  dayStartRelationships: relationships,
  usedEchoes: 0,
  sentNote: "",
  visitedScenes: ["homeRoom"],
  echoTraces: [],
  brainMemory: {
    recentDiary: [],
    recentReactions: [],
  },
  dailyEchoRecords: [],
  dayRecords: [],
  driftLog: [],
  sceneText: openingText,
  noteFloatKey: 0,
});
