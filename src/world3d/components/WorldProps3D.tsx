import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { namedNpcs, notePaperPosition } from "../../world/data/worldObjects";
import { projectWorldPosition, projectWorldScalar } from "../utils/projectWorldPosition";

export function NoteEchoProp3D() {
  const ringRef = useRef<Group | null>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * 4.2) * 0.08;
    ringRef.current.scale.setScalar(pulse);
    ringRef.current.rotation.y = clock.elapsedTime * 0.65;
  });

  return (
    <group position={projectWorldPosition(notePaperPosition, 8)}>
      <mesh rotation-x={-Math.PI / 2} castShadow>
        <boxGeometry args={[18, 4, 14]} />
        <meshStandardMaterial color="#f2dfaf" />
      </mesh>
      <group ref={ringRef} position={[0, 8, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[16, 1.6, 8, 36]} />
          <meshBasicMaterial color="#fff2bd" transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 15, 0]}
          color="#2d2a24"
          fontSize={projectWorldScalar(34)}
          anchorX="center"
          anchorY="middle"
        >
          E
        </Text>
      </group>
    </group>
  );
}

export function NpcMarkers3D() {
  return (
    <group>
      {namedNpcs.map((npc) => (
        <group key={npc.id} position={projectWorldPosition(npc.position, 12)}>
          <mesh castShadow>
            <sphereGeometry args={[10, 20, 20]} />
            <meshStandardMaterial color="#b57e98" />
          </mesh>
          <Text
            position={[0, 18, 0]}
            color="#2d2a24"
            fontSize={projectWorldScalar(38)}
            anchorX="center"
            anchorY="middle"
          >
            {npc.name}
          </Text>
        </group>
      ))}
    </group>
  );
}
