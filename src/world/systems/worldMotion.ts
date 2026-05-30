import {
  getAgentSpeedMultiplier,
  shouldPauseAtSchoolGate,
  type EchoBehaviorEffect,
} from "../../agentMind/behaviorEffects";
import { getScheduleEntryForMinute } from "../../agentMind/schedule";
import {
  assignAgentTarget,
  moveAgentAlongPath,
  type AgentBody,
} from "../../entities/agent/agentMovement";
import type { Body, Vector } from "../../entities/core/body";
import { getCameraTarget, moveCameraToward } from "../../entities/camera/camera";
import { getMoveDirection, moveBody } from "../../entities/player/playerMovement";
import type { AgentSignalState } from "../../game/state/agentState";
import { viewportSize, worldSize } from "../data/worldConfig";
import { worldNodes } from "../data/worldGraph";
import { getDistance } from "./worldInteractions";

const schoolGatePauseDuration = 2.6;
const statePressureEffectId = "state-pressure";

export type PlayerMotionResult = {
  nextPlayer: Body;
  nextCamera: Vector;
};

export type AgentMotionResult = {
  nextAgent: AgentBody;
  nextSchoolPauseRemaining: number;
  nextSchoolPauseEffectId: string | null;
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
  schoolPauseRemaining,
  schoolPauseEffectId,
}: {
  agent: AgentBody;
  worldMinute: number;
  dt: number;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  schoolPauseRemaining: number;
  schoolPauseEffectId: string | null;
}): AgentMotionResult => {
  const scheduleEntry = getScheduleEntryForMinute(worldMinute);
  const scheduledAgent = assignAgentTarget(agent, scheduleEntry.targetNodeId);
  const activeEffectId = echoEffect?.id ?? statePressureEffectId;
  const canPauseAtGate =
    shouldPauseAtSchoolGate(agentState, echoEffect) &&
    scheduleEntry.targetNodeId === "classroom" &&
    getDistance(scheduledAgent, worldNodes.schoolGate) <= 12 &&
    schoolPauseEffectId !== activeEffectId;

  let nextSchoolPauseRemaining = schoolPauseRemaining;
  let nextSchoolPauseEffectId = schoolPauseEffectId;

  if (canPauseAtGate) {
    nextSchoolPauseRemaining = schoolGatePauseDuration;
    nextSchoolPauseEffectId = activeEffectId;
  }

  const nextAgent =
    nextSchoolPauseRemaining > 0
      ? scheduledAgent
      : moveAgentAlongPath(
          scheduledAgent,
          dt,
          getAgentSpeedMultiplier(agentState, echoEffect),
        );

  return {
    nextAgent,
    nextSchoolPauseRemaining: Math.max(0, nextSchoolPauseRemaining - dt),
    nextSchoolPauseEffectId,
  };
};
