import { dayEndMinute } from "../../../agentMind/schedule";
import type { AgentBody } from "../../../entities/agent/agentMovement";
import type { Body, Vector } from "../../../entities/core/body";
import { worldNodes, type WorldNodeId } from "../../data/worldGraph";
import { notePaperPosition } from "../../data/worldObjects";

export const getDistance = (from: Vector, to: Vector) =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const isWithinRadius = ({
  from,
  to,
  radius,
}: {
  from: Vector;
  to: Vector;
  radius: number;
}) => getDistance(from, to) <= radius;

export const isBodyNearWorldNode = ({
  body,
  nodeId,
  radius,
}: {
  body: Body;
  nodeId: WorldNodeId;
  radius: number;
}) =>
  isWithinRadius({
    from: body,
    to: worldNodes[nodeId],
    radius,
  });

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
  isWithinRadius({
    from: player,
    to: notePaperPosition,
    radius: 78,
  });

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
  isBodyNearWorldNode({ body: player, nodeId: "room", radius: 130 }) &&
  isBodyNearWorldNode({ body: agent, nodeId: "room", radius: 20 });
