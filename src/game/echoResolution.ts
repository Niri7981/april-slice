import type { AgentBrainInput, AgentBrainOutput } from "../llm/brainTypes";
import { resolveLocalRelationshipDrift } from "./relationshipDrift";
import { resolveLocalStateDrift } from "./stateDrift";

export type EchoBrainResolver = (input: AgentBrainInput) => AgentBrainOutput;

export type DailyEchoRecord = {
  id: string;
  day: number;
  timeOfDay: string;
  scene: string;
  event: AgentBrainInput["event"];
  reaction: AgentBrainOutput["behavior"]["reaction"];
  outwardText: string;
  diaryFragment: string;
  traceSummary: string;
  internalThought: string;
  stateDelta: ReturnType<typeof resolveLocalStateDrift>["delta"];
  stateReasons: ReturnType<typeof resolveLocalStateDrift>["reasons"];
  relationshipChanges: ReturnType<typeof resolveLocalRelationshipDrift>["changes"];
  relationshipReasons: ReturnType<typeof resolveLocalRelationshipDrift>["reasons"];
};

export type EchoResolution = {
  brainOutput: AgentBrainOutput;
  stateDrift: ReturnType<typeof resolveLocalStateDrift>;
  relationshipDrift: ReturnType<typeof resolveLocalRelationshipDrift>;
  record: DailyEchoRecord;
};

export const resolveEchoOutcome = (
  input: AgentBrainInput,
  resolveBrain: EchoBrainResolver,
): EchoResolution => {
  const brainOutput = resolveBrain(input);
  const reaction = brainOutput.behavior.reaction;
  const stateDrift = resolveLocalStateDrift(input, reaction);
  const relationshipDrift = resolveLocalRelationshipDrift(input, reaction);

  return {
    brainOutput,
    stateDrift,
    relationshipDrift,
    record: {
      id: `${input.dayContext.day}-${input.dayContext.timeOfDay}-${input.dayContext.scene}-${Date.now()}`,
      day: input.dayContext.day,
      timeOfDay: input.dayContext.timeOfDay,
      scene: input.dayContext.scene,
      event: input.event,
      reaction,
      outwardText: brainOutput.behavior.outwardText,
      diaryFragment: brainOutput.diary.fragment,
      traceSummary: brainOutput.diary.traceSummary,
      internalThought: brainOutput.memory.internalThought,
      stateDelta: stateDrift.delta,
      stateReasons: stateDrift.reasons,
      relationshipChanges: relationshipDrift.changes,
      relationshipReasons: relationshipDrift.reasons,
    },
  };
};
