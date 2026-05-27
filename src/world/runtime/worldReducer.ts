import type { AgentSignalState } from "../../game/agentState";
import type { DayRecord } from "../../game/dayRecord";
import type { DailyEchoRecord } from "../../game/echoResolution";
import type { RelationshipState } from "../../game/relationshipDrift";
import type { WorldRuntimeState } from "./worldState";

export type WorldRuntimeAction =
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
