import { Line } from "@react-three/drei";
import { worldEdges, worldNodes, type WorldNodeId } from "../../world/data/worldGraph";
import { world3dGroundSize } from "../data/world3dConfig";
import { projectWorldPosition, projectWorldScalar } from "../utils/projectWorldPosition";

const landmarkBlocks = [
  {
    center: { x: 410, y: 340 },
    width: 460,
    depth: 300,
    height: 28,
    color: "#e6d1a5",
  },
  {
    center: { x: 1210, y: 440 },
    width: 620,
    depth: 360,
    height: 42,
    color: "#c8d0b7",
  },
  {
    center: { x: 1660, y: 930 },
    width: 500,
    depth: 220,
    height: 34,
    color: "#8ca8b0",
  },
];

const roadPolyline = [
  { x: 420, y: 490 },
  { x: 780, y: 680 },
  { x: 1120, y: 620 },
  { x: 1510, y: 820 },
];

const graphLines = (() => {
  const drawnEdges = new Set<string>();

  return Object.entries(worldEdges).flatMap(([fromNodeId, nextNodeIds]) =>
    nextNodeIds.flatMap((toNodeId) => {
      const edgeKey = [fromNodeId, toNodeId].sort().join(":");

      if (drawnEdges.has(edgeKey)) {
        return [];
      }

      drawnEdges.add(edgeKey);

      return [
        {
          key: edgeKey,
          points: [
            projectWorldPosition(worldNodes[fromNodeId as WorldNodeId], 1.5),
            projectWorldPosition(worldNodes[toNodeId], 1.5),
          ],
        },
      ];
    }),
  );
})();

export function WorldGround3D() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -10, 0]}>
        <planeGeometry args={[world3dGroundSize.width, world3dGroundSize.depth]} />
        <meshStandardMaterial color="#d8ddc8" />
      </mesh>

      {landmarkBlocks.map((block) => (
        <mesh
          key={`${block.center.x}-${block.center.y}`}
          position={projectWorldPosition(block.center, block.height / 2 - 8)}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              projectWorldScalar(block.width),
              block.height,
              projectWorldScalar(block.depth),
            ]}
          />
          <meshStandardMaterial color={block.color} />
        </mesh>
      ))}

      <Line
        points={roadPolyline.map((point) => projectWorldPosition(point, 3))}
        color="#5f695b"
        lineWidth={6}
      />

      {graphLines.map((line) => (
        <Line
          key={line.key}
          points={line.points}
          color="#73826e"
          transparent
          opacity={0.65}
          lineWidth={2}
        />
      ))}
    </group>
  );
}
