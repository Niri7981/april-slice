import { world3dGroundSize, world3dTestFieldCenter } from "../data/world3dConfig";
import { projectWorldPosition, projectWorldScalar } from "../utils/projectWorldPosition";

const fieldCenter = projectWorldPosition(world3dTestFieldCenter, 0);

const testStructures = [
  {
    center: {
      x: world3dTestFieldCenter.x + 1860,
      y: world3dTestFieldCenter.y - 260,
    },
    width: 720,
    depth: 240,
    height: 168,
    color: "#b4a898",
  },
  {
    center: {
      x: world3dTestFieldCenter.x + 1420,
      y: world3dTestFieldCenter.y - 260,
    },
    width: 160,
    depth: 220,
    height: 52,
    color: "#8d8277",
  },
  {
    center: {
      x: world3dTestFieldCenter.x + 2200,
      y: world3dTestFieldCenter.y - 260,
    },
    width: 180,
    depth: 220,
    height: 52,
    color: "#8d8277",
  },
];

export function WorldGround3D() {
  return (
    <group>
      <mesh
        rotation-x={-Math.PI / 2}
        receiveShadow
        position={[fieldCenter[0], -10, fieldCenter[2]]}
      >
        <planeGeometry args={[world3dGroundSize.width, world3dGroundSize.depth]} />
        <meshStandardMaterial color="#c7c0af" />
      </mesh>

      <mesh
        rotation-x={-Math.PI / 2}
        receiveShadow
        position={[fieldCenter[0] + 70, -9.6, fieldCenter[2] - 40]}
      >
        <planeGeometry
          args={[projectWorldScalar(4200), projectWorldScalar(700)]}
        />
        <meshStandardMaterial color="#6f746f" roughness={0.92} />
      </mesh>

      <mesh
        receiveShadow
        position={[
          fieldCenter[0],
          8,
          fieldCenter[2] + projectWorldScalar(2200),
        ]}
      >
        <boxGeometry
          args={[world3dGroundSize.width, 16, projectWorldScalar(180)]}
        />
        <meshStandardMaterial color="#b4ad9f" />
      </mesh>

      <mesh
        receiveShadow
        position={[
          fieldCenter[0] - projectWorldScalar(2100),
          10,
          fieldCenter[2],
        ]}
      >
        <boxGeometry
          args={[projectWorldScalar(220), 20, projectWorldScalar(2400)]}
        />
        <meshStandardMaterial color="#b9b2a4" />
      </mesh>

      {testStructures.map((block) => (
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
    </group>
  );
}
