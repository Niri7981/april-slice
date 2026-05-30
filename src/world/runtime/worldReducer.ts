import type { DayRecord } from "../../game/day/dayRecord";
import type { DailyEchoRecord } from "../../game/echo/echoResolution";
import type { InitialHand } from "../../game/initial-hand/initialHand";
import type { RelationshipState } from "../../game/relationships/relationshipDrift";
import type { AgentSignalState } from "../../game/state/agentState";
import type { WorldNodeId } from "../data/worldGraph";
import type { WorldTimeOfDay } from "../systems/worldTime";
import type { WorldRuntimeState } from "./worldState";

export type WorldRuntimeAction =
  | { type: "initialHand/resolved"; initialHand: InitialHand }
  | { type: "context/changed"; scene: WorldNodeId; timeOfDay: WorldTimeOfDay }
  | { type: "note/open" }
  | { type: "note/cancel" }
  | { type: "note/draftChanged"; draft: string }
  | {
      type: "echo/applied";
      agentState: AgentSignalState;
      relationships: RelationshipState[];
      dailyEchoes: DailyEchoRecord[];
      echoEffect: NonNullable<WorldRuntimeState["echoEffect"]>;
    }
  | { type: "diary/opened"; record: DayRecord }
  | { type: "diary/closed" };

export const worldReducer = (
  state: WorldRuntimeState,
  action: WorldRuntimeAction,
): WorldRuntimeState => {
  switch (action.type) {
    case "initialHand/resolved":
      return {
        ...state,
        initialHand: action.initialHand,
      };
    case "context/changed":
      return {
        ...state,
        context: {
          scene: action.scene,
          timeOfDay: action.timeOfDay,
          visitedScenes: state.context.visitedScenes.includes(action.scene)
            ? state.context.visitedScenes
            : [...state.context.visitedScenes, action.scene],
        },
      };
    case "note/open":
      return {
        ...state,
        note: {
          ...state.note,
          available: false,
          dialogOpen: true,
          draft: "",
        },
      };
    case "note/cancel":
      return {
        ...state,
        note: {
          ...state.note,
          available: true,
          dialogOpen: false,
          draft: "",
        },
      };
    case "note/draftChanged":
      return {
        ...state,
        note: {
          ...state.note,
          draft: action.draft,
        },
      };
    case "echo/applied":
      return {
        ...state,
        agentState: action.agentState,
        relationships: action.relationships,
        dailyEchoes: action.dailyEchoes,
        echoEffect: action.echoEffect,
        note: {
          ...state.note,
          dialogOpen: false,
          draft: "",
        },
      };
    case "diary/opened":
      return {
        ...state,
        diary: {
          open: true,
          record: action.record,
        },
      };
    case "diary/closed":
      return {
        ...state,
        day: state.day + 1,
        context: {
          scene: "room",
          timeOfDay: "morning",
          visitedScenes: ["room"],
        },
        dailyEchoes: [],
        echoEffect: null,
        note: {
          ...state.note,
          available: true,
        },
        diary: {
          open: false,
          record: null,
        },
      };
    default:
      return state;
  }
};
