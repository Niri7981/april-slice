import type { Camera } from "three";
import { Vector3 } from "three";
import type { Body } from "../../entities/core/body";
import { world3dCamera } from "../data/world3dConfig";
import { projectWorldPosition } from "./projectWorldPosition";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();

export const updateWorld3DCamera = ({
  camera,
  player,
  delta,
}: {
  camera: Camera;
  player: Body;
  delta: number;
}) => {
  const [playerX, , playerZ] = projectWorldPosition(player, 14);
  const cameraLerp = 1 - Math.exp(-delta * world3dCamera.damping);

  cameraTarget.set(playerX, world3dCamera.height, playerZ + world3dCamera.distance);
  lookAtTarget.set(playerX, world3dCamera.lookAtHeight, playerZ);

  camera.position.lerp(cameraTarget, cameraLerp);
  camera.lookAt(lookAtTarget);
};
