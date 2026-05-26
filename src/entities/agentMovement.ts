import type { Body, Vector } from "./body";
import {
  findWorldPath,
  getNearestWorldNodeId,
  type WorldNodeId,
  worldNodes,
} from "../world/worldGraph";

export type AgentBody = Body & {
  currentTargetNodeId: WorldNodeId;
  path: WorldNodeId[];
  pathIndex: number;
};

const agentSpeed = 105;
const arrivalDistance = 8;

const getDistance = (from: Vector, to: Vector) =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const createScheduledAgentBody = (): AgentBody => ({
  x: worldNodes.room.x,
  y: worldNodes.room.y,
  radius: 28,
  currentTargetNodeId: "room",
  path: ["room"],
  pathIndex: 0,
});

export const assignAgentTarget = (
  agent: AgentBody,
  targetNodeId: WorldNodeId,
): AgentBody => {
  if (agent.currentTargetNodeId === targetNodeId) {
    return agent;
  }

  const startNodeId = getNearestWorldNodeId(agent);

  return {
    ...agent,
    currentTargetNodeId: targetNodeId,
    path: findWorldPath(startNodeId, targetNodeId),
    pathIndex: 0,
  };
};

export const moveAgentAlongPath = (agent: AgentBody, dt: number): AgentBody => {
  const nextNodeId = agent.path[agent.pathIndex + 1] ?? agent.path[agent.pathIndex];
  const nextNode = worldNodes[nextNodeId];

  if (!nextNode) {
    return agent;
  }

  const distance = getDistance(agent, nextNode);

  if (distance <= arrivalDistance) {
    return {
      ...agent,
      x: nextNode.x,
      y: nextNode.y,
      pathIndex: Math.min(agent.pathIndex + 1, agent.path.length - 1),
    };
  }

  const step = Math.min(distance, agentSpeed * dt);

  return {
    ...agent,
    x: agent.x + ((nextNode.x - agent.x) / distance) * step,
    y: agent.y + ((nextNode.y - agent.y) / distance) * step,
  };
};
