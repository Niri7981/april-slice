import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import type { Group } from "three";
import { namedNpcs, notePaperPosition } from "../../world/data/worldObjects";
import { worldNodes } from "../../world/data/worldGraph";
import { projectWorldPosition, projectWorldScalar } from "../utils/projectWorldPosition";

type GroupRef = RefObject<Group | null>;

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

export function PlayerActor3D({ playerRef }: { playerRef: GroupRef }) {
  return (
    <group ref={playerRef}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 1, 0]}>
        <ringGeometry args={[11, 15, 24]} />
        <meshBasicMaterial color="#d9f0b8" transparent opacity={0.45} />
      </mesh>
      <mesh castShadow position={[0, 9, 0]}>
        <capsuleGeometry args={[9, 16, 4, 8]} />
        <meshStandardMaterial color="#6c8f5f" />
      </mesh>
      <mesh castShadow position={[0, 26, 0]}>
        <sphereGeometry args={[8, 20, 20]} />
        <meshStandardMaterial color="#8dae7d" />
      </mesh>
    </group>
  );
}

export function AgentActor3D({
  agentRef,
  facingRef,
  pressure,
  echoActive,
}: {
  agentRef: GroupRef;
  facingRef: GroupRef;
  pressure: number;
  echoActive: boolean;
}) {
  const auraRef = useRef<Group | null>(null);
  const pressureScale = 1 + Math.max(0, Math.min(1, (pressure - 45) / 55)) * 0.55;

  useFrame(({ clock }) => {
    if (!auraRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * (echoActive ? 6 : 3.2)) * 0.06;
    auraRef.current.scale.set(pressureScale * pulse, 1, pressureScale * pulse);
    auraRef.current.rotation.y = -clock.elapsedTime * 0.5;
  });

  return (
    <>
      <group ref={agentRef}>
        <group ref={auraRef} position={[0, 2, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[13, 18, 28]} />
            <meshBasicMaterial
              color={echoActive ? "#f2dfaf" : "#9eb6d0"}
              transparent
              opacity={echoActive ? 0.58 : 0.28}
            />
          </mesh>
        </group>
        <mesh castShadow position={[0, 9, 0]}>
          <capsuleGeometry args={[9, 16, 4, 8]} />
          <meshStandardMaterial color="#587ca5" />
        </mesh>
        <mesh castShadow position={[0, 26, 0]}>
          <sphereGeometry args={[8, 20, 20]} />
          <meshStandardMaterial color="#6f91bd" />
        </mesh>
      </group>
      <group ref={facingRef}>
        <mesh castShadow rotation-x={Math.PI / 2}>
          <coneGeometry args={[5, 14, 10]} />
          <meshStandardMaterial color="#f2dfaf" />
        </mesh>
      </group>
    </>
  );
}
