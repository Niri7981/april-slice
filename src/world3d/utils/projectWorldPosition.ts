import type { Vector } from "../../entities/core/body";
import { worldSize } from "../../world/data/worldConfig";
import { world3dScale } from "../data/world3dConfig";

export type WorldPoint3D = [number, number, number];

export const projectWorldScalar = (value: number) => value * world3dScale;

export const projectWorldPosition = (
  position: Vector,
  elevation = 0,
): WorldPoint3D => [
  (position.x - worldSize.width / 2) * world3dScale,
  elevation,
  (position.y - worldSize.height / 2) * world3dScale,
];

export const getFacingYaw = (facing: Vector) => Math.atan2(facing.x, facing.y);
