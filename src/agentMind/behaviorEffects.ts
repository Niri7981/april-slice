import type { AgentSignalState } from "../game/state/agentState";
import type { AgentReaction } from "../llm/echo/brainTypes";

export type EchoBehaviorEffect = {
  id: string;
  reaction: AgentReaction;
  intendedAction: string;
  durationSeconds: number;
  immediatePauseSeconds: number;
  anchorPauseSeconds: number;
  speedMultiplier: number;
};

const reactionBehaviorProfiles: Record<
  AgentReaction,
  Omit<EchoBehaviorEffect, "id" | "reaction" | "intendedAction">
> = {
  accepted: {
    durationSeconds: 4.8,
    immediatePauseSeconds: 0.35,
    anchorPauseSeconds: 1.2,
    speedMultiplier: 0.92,
  },
  hesitated: {
    durationSeconds: 6.5,
    immediatePauseSeconds: 1.15,
    anchorPauseSeconds: 3.1,
    speedMultiplier: 0.64,
  },
  resisted: {
    durationSeconds: 5.4,
    immediatePauseSeconds: 0.9,
    anchorPauseSeconds: 2.2,
    speedMultiplier: 0.74,
  },
  misread: {
    durationSeconds: 6,
    immediatePauseSeconds: 1,
    anchorPauseSeconds: 2.8,
    speedMultiplier: 0.68,
  },
  delayed: {
    durationSeconds: 5,
    immediatePauseSeconds: 0.55,
    anchorPauseSeconds: 2.4,
    speedMultiplier: 0.8,
  },
  transformed: {
    durationSeconds: 5.6,
    immediatePauseSeconds: 0.45,
    anchorPauseSeconds: 1.6,
    speedMultiplier: 0.88,
  },
};

export const createEchoBehaviorEffect = ({
  id,
  reaction,
  intendedAction,
}: {
  id: string;
  reaction: AgentReaction;
  intendedAction: string;
}): EchoBehaviorEffect => {
  const baseProfile = reactionBehaviorProfiles[reaction];
  const normalizedAction = intendedAction.toLowerCase();
  const suggestsPause =
    normalizedAction.includes("pause") ||
    normalizedAction.includes("wait") ||
    normalizedAction.includes("hesitat") ||
    normalizedAction.includes("linger");
  const suggestsSlowMovement =
    normalizedAction.includes("slow") ||
    normalizedAction.includes("careful") ||
    normalizedAction.includes("walk_out");

  return {
    id,
    reaction,
    intendedAction,
    durationSeconds:
      baseProfile.durationSeconds + (suggestsPause || suggestsSlowMovement ? 0.8 : 0),
    immediatePauseSeconds:
      baseProfile.immediatePauseSeconds + (suggestsPause ? 0.35 : 0),
    anchorPauseSeconds: baseProfile.anchorPauseSeconds + (suggestsPause ? 0.45 : 0),
    speedMultiplier: suggestsSlowMovement
      ? Math.min(baseProfile.speedMultiplier, 0.72)
      : baseProfile.speedMultiplier,
  };
};

export const getAgentSpeedMultiplier = (
  state: AgentSignalState,
  effect: EchoBehaviorEffect | null,
) => {
  if (state.pressure >= 66) {
    return effect ? Math.min(0.55, effect.speedMultiplier) : 0.55;
  }

  if (!effect) {
    return 1;
  }

  return effect.speedMultiplier;
};

export const shouldPauseAtAnchorTrigger = (
  state: AgentSignalState,
  effect: EchoBehaviorEffect | null,
) =>
  state.pressure >= 62 || Boolean(effect && effect.anchorPauseSeconds > 0);
