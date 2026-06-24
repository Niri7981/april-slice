import type { Camera } from "three";
import { Vector3 } from "three";
import type { Body } from "../../entities/core/body";
import { type World3DCameraOrbit, world3dCamera } from "../data/world3dConfig";
import { projectWorldPosition } from "./projectWorldPosition";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const updateWorld3DCamera = ({
  camera,
  player,
  orbit,
  keys,
  delta,
}: {
  camera: Camera;
  player: Body;
  orbit: World3DCameraOrbit;
  keys: Set<string>;
  delta: number;
}) => {
  orbit.yaw +=
    (Number(keys.has("d")) - Number(keys.has("a"))) * world3dCamera.yawSpeed * delta;
  orbit.pitch = clamp(
    orbit.pitch +
      (Number(keys.has("w")) - Number(keys.has("s"))) *
        world3dCamera.pitchSpeed *
        delta,
    world3dCamera.minPitch,
    world3dCamera.maxPitch,
  );

  const [playerX, , playerZ] = projectWorldPosition(player, 14);
  const cameraLerp = 1 - Math.exp(-delta * world3dCamera.damping);
  const orbitRadius = Math.cos(orbit.pitch) * world3dCamera.distance;
  const cameraX = playerX + Math.sin(orbit.yaw) * orbitRadius;
  const cameraY =
    world3dCamera.lookAtHeight + Math.sin(orbit.pitch) * world3dCamera.distance;
  const cameraZ = playerZ + Math.cos(orbit.yaw) * orbitRadius;

  cameraTarget.set(cameraX, cameraY, cameraZ);
  lookAtTarget.set(playerX, world3dCamera.lookAtHeight, playerZ);

  camera.position.lerp(cameraTarget, cameraLerp);
  camera.lookAt(lookAtTarget);
};
