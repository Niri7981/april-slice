import { Text } from "@react-three/drei";
import { worldNodes } from "../../world/data/worldGraph";
import { projectWorldPosition, projectWorldScalar } from "../utils/projectWorldPosition";

export function WorldLandmarks3D() {
  return (
    <group>
      {Object.values(worldNodes).map((node) => (
        <group key={node.id} position={projectWorldPosition(node, 10)}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[10, 12, 14, 16]} />
            <meshStandardMaterial color="#f4edde" />
          </mesh>
          <Text
            position={[0, 18, 0]}
            color="#2d2a24"
            fontSize={projectWorldScalar(44)}
            anchorX="center"
            anchorY="middle"
          >
            {node.label}
          </Text>
        </group>
      ))}
    </group>
  );
}
