import type { Graphics } from "pixi.js";
import { worldSize } from "./worldConfig";
import { worldEdges, worldNodes, type WorldNode, type WorldNodeId } from "./worldGraph";

const drawWorldGraph = (graphics: Graphics) => {
  const drawnEdges = new Set<string>();

  graphics.setStrokeStyle({ color: 0x4f5f53, width: 8, alpha: 0.62 });
  for (const [fromNodeId, nextNodeIds] of Object.entries(worldEdges) as Array<
    [WorldNodeId, WorldNodeId[]]
  >) {
    const fromNode = worldNodes[fromNodeId];

    for (const toNodeId of nextNodeIds) {
      const edgeKey = [fromNodeId, toNodeId].sort().join(":");

      if (drawnEdges.has(edgeKey)) {
        continue;
      }

      drawnEdges.add(edgeKey);
      graphics.moveTo(fromNode.x, fromNode.y);
      graphics.lineTo(worldNodes[toNodeId].x, worldNodes[toNodeId].y);
    }
  }
  graphics.stroke();

  for (const node of Object.values(worldNodes) as WorldNode[]) {
    graphics.circle(node.x, node.y, 13);
    graphics.fill(0xf4edde);
    graphics.stroke({ color: 0x2d2a24, width: 4 });
  }
};

export const drawWorld = (graphics: Graphics) => {
  graphics.clear();
  graphics.rect(0, 0, worldSize.width, worldSize.height);
  graphics.fill(0xd8dcc7);

  graphics.setStrokeStyle({ color: 0x8e9a82, width: 2, alpha: 0.42 });
  for (let x = 0; x <= worldSize.width; x += 80) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, worldSize.height);
  }
  for (let y = 0; y <= worldSize.height; y += 80) {
    graphics.moveTo(0, y);
    graphics.lineTo(worldSize.width, y);
  }
  graphics.stroke();

  graphics.rect(180, 190, 460, 300);
  graphics.fill({ color: 0xf1dfb2, alpha: 0.86 });
  graphics.stroke({ color: 0x2d2a24, width: 5 });

  graphics.rect(900, 260, 620, 360);
  graphics.fill({ color: 0xcfd6bd, alpha: 0.9 });
  graphics.stroke({ color: 0x2d2a24, width: 5 });

  graphics.rect(1410, 820, 500, 220);
  graphics.fill({ color: 0x9cb7bf, alpha: 0.78 });
  graphics.stroke({ color: 0x2d2a24, width: 5 });

  graphics.setStrokeStyle({ color: 0x5d6557, width: 28, alpha: 0.72 });
  graphics.moveTo(420, 490);
  graphics.lineTo(780, 680);
  graphics.lineTo(1120, 620);
  graphics.lineTo(1510, 820);
  graphics.stroke();

  drawWorldGraph(graphics);
};

export const drawAgent = (graphics: Graphics) => {
  graphics.clear();
  graphics.circle(0, 0, 28);
  graphics.fill(0x587ca5);
  graphics.circle(0, -18, 19);
  graphics.fill(0x6f91bd);
  graphics.stroke({ color: 0x2d2a24, width: 5 });
};

export const drawPlayer = (graphics: Graphics) => {
  graphics.clear();
  graphics.circle(0, 0, 28);
  graphics.fill(0x6c8f5f);
  graphics.circle(0, -18, 19);
  graphics.fill(0x8dae7d);
  graphics.stroke({ color: 0x2d2a24, width: 5 });
};
