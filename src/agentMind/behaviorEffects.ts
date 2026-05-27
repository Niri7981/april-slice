import type { AgentSignalState } from "../game/agentState";
import type { AgentReaction } from "../llm/brainTypes";

export type EchoBehaviorEffect = {
  id: string;
  reaction: AgentReaction;
};

export const getAgentSpeedMultiplier = (
  state: AgentSignalState,
  effect: EchoBehaviorEffect | null,
) => {
  if (state.pressure >= 66) {
    return 0.55;
  }

  if (!effect) {
    return 1;
  }

  if (
    effect.reaction === "hesitated" ||
    effect.reaction === "resisted" ||
    effect.reaction === "misread"
  ) {
    return 0.62;
  }

  if (effect.reaction === "delayed") {
    return 0.78;
  }

  return 0.92;
};

export const shouldPauseAtSchoolGate = (
  state: AgentSignalState,
  effect: EchoBehaviorEffect | null,
) =>
  state.pressure >= 62 ||
  effect?.reaction === "hesitated" ||
  effect?.reaction === "resisted" ||
  effect?.reaction === "misread" ||
  effect?.reaction === "delayed";
