import type { Vector } from "../../entities/core/body";

export type WorldNodeId =
  | "room"
  | "homeGate"
  | "schoolGate"
  | "classroom"
  | "cafeteria"
  | "station"
  | "harbor";

export type WorldNode = Vector & {
  id: WorldNodeId;
  label: string;
};

export const worldNodes: Record<WorldNodeId, WorldNode> = {
  room: {
    id: "room",
    label: "Room",
    x: 360,
    y: 350,
  },
  homeGate: {
    id: "homeGate",
    label: "Home Gate",
    x: 610,
    y: 560,
  },
  schoolGate: {
    id: "schoolGate",
    label: "School Gate",
    x: 980,
    y: 620,
  },
  classroom: {
    id: "classroom",
    label: "Classroom",
    x: 1210,
    y: 410,
  },
  cafeteria: {
    id: "cafeteria",
    label: "Cafeteria",
    x: 1360,
    y: 560,
  },
  station: {
    id: "station",
    label: "Station",
    x: 1510,
    y: 820,
  },
  harbor: {
    id: "harbor",
    label: "Harbor",
    x: 1760,
    y: 930,
  },
};

export const worldEdges: Record<WorldNodeId, WorldNodeId[]> = {
  room: ["homeGate"],
  homeGate: ["room", "schoolGate"],
  schoolGate: ["homeGate", "classroom", "cafeteria", "station"],
  classroom: ["schoolGate", "cafeteria"],
  cafeteria: ["schoolGate", "classroom", "station"],
  station: ["schoolGate", "cafeteria", "harbor"],
  harbor: ["station"],
};

const getDistance = (from: Vector, to: Vector) =>
  Math.hypot(to.x - from.x, to.y - from.y);

export const findWorldPath = (
  startNodeId: WorldNodeId,
  goalNodeId: WorldNodeId,
): WorldNodeId[] => {
  const frontier: Array<{ nodeId: WorldNodeId; cost: number }> = [
    { nodeId: startNodeId, cost: 0 },
  ];
  const cameFrom = new Map<WorldNodeId, WorldNodeId | null>([[startNodeId, null]]);
  const costSoFar = new Map<WorldNodeId, number>([[startNodeId, 0]]);

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    const current = frontier.shift();

    if (!current) {
      break;
    }

    if (current.nodeId === goalNodeId) {
      break;
    }

    for (const nextNodeId of worldEdges[current.nodeId]) {
      const nextCost =
        (costSoFar.get(current.nodeId) ?? 0) +
        getDistance(worldNodes[current.nodeId], worldNodes[nextNodeId]);

      if (!costSoFar.has(nextNodeId) || nextCost < (costSoFar.get(nextNodeId) ?? Infinity)) {
        costSoFar.set(nextNodeId, nextCost);
        frontier.push({
          nodeId: nextNodeId,
          cost: nextCost + getDistance(worldNodes[nextNodeId], worldNodes[goalNodeId]),
        });
        cameFrom.set(nextNodeId, current.nodeId);
      }
    }
  }

  if (!cameFrom.has(goalNodeId)) {
    return [startNodeId];
  }

  const path: WorldNodeId[] = [];
  let currentNodeId: WorldNodeId | null = goalNodeId;

  while (currentNodeId) {
    path.unshift(currentNodeId);
    currentNodeId = cameFrom.get(currentNodeId) ?? null;
  }

  return path;
};

export const getNearestWorldNodeId = (position: Vector): WorldNodeId =>
  (Object.values(worldNodes) as WorldNode[]).reduce((nearest, node) =>
    getDistance(position, node) < getDistance(position, nearest) ? node : nearest,
  ).id;
