import {
  getAgentSpeedMultiplier,
  shouldPauseAtAnchorTrigger,
  type EchoBehaviorEffect,
} from "../../../agentMind/behaviorEffects";
import { getScheduleEntryForMinute } from "../../../agentMind/schedule";
import {
  assignAgentTarget,
  moveAgentAlongPath,
  type AgentBody,
} from "../../../entities/agent/agentMovement";
import type { Body, Vector } from "../../../entities/core/body";
import { getCameraTarget, moveCameraToward } from "../../../entities/camera/camera";
import { getMoveDirection, moveBody } from "../../../entities/player/playerMovement";
import type { AgentSignalState } from "../../../game/state/agentState";
import { viewportSize, worldSize } from "../../data/worldConfig";
import { worldPauseTriggers } from "../../data/worldTriggers";
import { isBodyNearWorldNode } from "../position/worldInteractions";
const statePressureEffectId = "state-pressure";

export type PlayerMotionResult = {
  nextPlayer: Body;
  nextCamera: Vector;
};

export type AgentMotionResult = {
  nextAgent: AgentBody;
  nextEchoPauseRemaining: number;
  nextAnchorPauseRemaining: number;
  nextAnchorPauseEffectId: string | null;
};

export const advancePlayerMotion = ({
  player,
  camera,
  keys,
  dt,
}: {
  player: Body;
  camera: Vector;
  keys: Set<string>;
  dt: number;
}): PlayerMotionResult => {
  const direction = getMoveDirection(keys);
  const nextPlayer = moveBody(player, direction, dt, worldSize);
  const nextCamera = moveCameraToward(
    camera,
    getCameraTarget(nextPlayer, viewportSize, worldSize),
  );

  return { nextPlayer, nextCamera };
};

export const advanceAgentMotion = ({
  agent,
  worldMinute,
  dt,
  agentState,
  echoEffect,
  echoPauseRemaining,
  anchorPauseRemaining,
  anchorPauseEffectId,
}: {
  agent: AgentBody;
  worldMinute: number;
  dt: number;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  echoPauseRemaining: number;
  anchorPauseRemaining: number;
  anchorPauseEffectId: string | null;
}): AgentMotionResult => {
  const scheduleEntry = getScheduleEntryForMinute(worldMinute);
  const scheduledAgent = assignAgentTarget(agent, scheduleEntry.targetNodeId);
  const activeEffectId = echoEffect?.id ?? statePressureEffectId;
  const pauseTrigger = worldPauseTriggers.find(
    (trigger) =>
      trigger.whenTargetNodeId === scheduleEntry.targetNodeId &&
      isBodyNearWorldNode({
        body: scheduledAgent,
        nodeId: trigger.anchorNodeId,
        radius: trigger.radius,
      }),
  );
  const canPauseAtTrigger =
    shouldPauseAtAnchorTrigger(agentState, echoEffect) &&
    Boolean(pauseTrigger) &&
    anchorPauseEffectId !== activeEffectId;

  let nextAnchorPauseRemaining = anchorPauseRemaining;
  let nextAnchorPauseEffectId = anchorPauseEffectId;

  if (canPauseAtTrigger) {
    nextAnchorPauseRemaining =
      echoEffect?.anchorPauseSeconds ?? pauseTrigger?.fallbackDurationSeconds ?? 0;
    nextAnchorPauseEffectId = activeEffectId;
  }

  const nextEchoPauseRemaining = Math.max(0, echoPauseRemaining - dt);

  const nextAgent =
    echoPauseRemaining > 0 || nextAnchorPauseRemaining > 0
      ? scheduledAgent
      : moveAgentAlongPath(
          scheduledAgent,
          dt,
          getAgentSpeedMultiplier(agentState, echoEffect),
        );

  return {
    nextAgent,
    nextEchoPauseRemaining,
    nextAnchorPauseRemaining: Math.max(0, nextAnchorPauseRemaining - dt),
    nextAnchorPauseEffectId,
  };
};
