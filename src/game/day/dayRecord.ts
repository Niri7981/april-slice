import type { AgentReaction } from "../../llm/brainTypes";
import type { DailyEchoRecord } from "../echo/echoResolution";
import type { RelationshipState } from "../relationships/relationshipDrift";
import {
  diffAgentState,
  type AgentSignalState,
  type AgentStateDelta,
} from "../state/stateDrift";

export type DayRelationshipDelta = {
  relationshipId: string;
  name: string;
  role: string;
  startWarmth: number;
  endWarmth: number;
  warmthDelta: number;
  startTension: number;
  endTension: number;
  tensionDelta: number;
};

export type DayRecord = {
  day: number;
  visitedScenes: string[];
  echoes: DailyEchoRecord[];
  stateStart: AgentSignalState;
  stateEnd: AgentSignalState;
  stateDelta: AgentStateDelta;
  relationshipsStart: RelationshipState[];
  relationshipsEnd: RelationshipState[];
  relationshipDelta: DayRelationshipDelta[];
  diaryFragments: string[];
  reactions: AgentReaction[];
  internalThoughts: string[];
};

const diffRelationships = (
  startRelationships: RelationshipState[],
  endRelationships: RelationshipState[],
): DayRelationshipDelta[] =>
  startRelationships.map((startRelationship) => {
    const endRelationship =
      endRelationships.find(
        (relationship) => relationship.id === startRelationship.id,
      ) ?? startRelationship;

    return {
      relationshipId: startRelationship.id,
      name: endRelationship.name,
      role: endRelationship.role,
      startWarmth: startRelationship.warmth,
      endWarmth: endRelationship.warmth,
      warmthDelta: endRelationship.warmth - startRelationship.warmth,
      startTension: startRelationship.tension,
      endTension: endRelationship.tension,
      tensionDelta: endRelationship.tension - startRelationship.tension,
    };
  });

export const buildDayRecord = ({
  day,
  visitedScenes,
  echoes,
  stateStart,
  stateEnd,
  relationshipsStart,
  relationshipsEnd,
}: {
  day: number;
  visitedScenes: string[];
  echoes: DailyEchoRecord[];
  stateStart: AgentSignalState;
  stateEnd: AgentSignalState;
  relationshipsStart: RelationshipState[];
  relationshipsEnd: RelationshipState[];
}): DayRecord => ({
  day,
  visitedScenes,
  echoes,
  stateStart,
  stateEnd,
  stateDelta: diffAgentState(stateStart, stateEnd),
  relationshipsStart,
  relationshipsEnd,
  relationshipDelta: diffRelationships(relationshipsStart, relationshipsEnd),
  diaryFragments: echoes.map((echo) => echo.diaryFragment),
  reactions: echoes.map((echo) => echo.reaction),
  internalThoughts: echoes.map((echo) => echo.internalThought),
});
