import type { Body, Vector } from "../core/body";
import type { Size } from "../../world/data/worldConfig";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const createCamera = (): Vector => ({
  x: 0,
  y: 0,
});

export const getCameraTarget = (
  followedBody: Body,
  viewportSize: Size,
  worldSize: Size,
): Vector => ({
  x: clamp(
    followedBody.x - viewportSize.width / 2,
    0,
    worldSize.width - viewportSize.width,
  ),
  y: clamp(
    followedBody.y - viewportSize.height / 2,
    0,
    worldSize.height - viewportSize.height,
  ),
});

export const moveCameraToward = (
  currentCamera: Vector,
  targetCamera: Vector,
  lag = 0.12,
): Vector => ({
  x: currentCamera.x + (targetCamera.x - currentCamera.x) * lag,
  y: currentCamera.y + (targetCamera.y - currentCamera.y) * lag,
});
