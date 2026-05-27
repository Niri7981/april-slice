import { dayEndMinute } from "../../agentMind/schedule";
import type { AgentBody } from "../../entities/agent/agentMovement";
import type { Body, Vector } from "../../entities/core/body";
import { worldNodes } from "../data/worldGraph";
import { notePaperPosition } from "../data/worldObjects";

export const getDistance = (from: Vector, to: Vector) =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const isNotePickupTriggered = ({
  noteAvailable,
  eIsDown,
  eWasDown,
  player,
}: {
  noteAvailable: boolean;
  eIsDown: boolean;
  eWasDown: boolean;
  player: Body;
}) =>
  noteAvailable &&
  eIsDown &&
  !eWasDown &&
  getDistance(player, notePaperPosition) <= 78;

export const isDayComplete = ({
  alreadyFired,
  worldMinute,
  player,
  agent,
}: {
  alreadyFired: boolean;
  worldMinute: number;
  player: Body;
  agent: AgentBody;
}) =>
  !alreadyFired &&
  worldMinute >= dayEndMinute &&
  getDistance(player, worldNodes.room) <= 130 &&
  getDistance(agent, worldNodes.room) <= 20;
