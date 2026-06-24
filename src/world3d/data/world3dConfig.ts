import { viewportSize, type Size } from "../../world/data/worldConfig";
import type { Vector } from "../../entities/core/body";

export type World3DCameraOrbit = {
  yaw: number;
  pitch: number;
};

export const world3dScale = 0.28;

export const world3dRunBounds: Size = {
  width: 10000,
  height: 10000,
};

export const world3dTestFieldCenter: Vector = {
  x: world3dRunBounds.width / 2,
  y: world3dRunBounds.height / 2,
};

export const world3dPlayerSpawn: Vector = {
  x: world3dTestFieldCenter.x - 120,
  y: world3dTestFieldCenter.y + 180,
};

export const world3dGroundSize = {
  width: world3dRunBounds.width * world3dScale,
  depth: world3dRunBounds.height * world3dScale,
};

export const world3dViewport = viewportSize;

export const world3dCamera = {
  fov: 34,
  near: 0.1,
  far: 6000,
  distance: 360,
  damping: 4.5,
  lookAtHeight: 16,
  initialYaw: 0,
  initialPitch: 0.78,
  minPitch: 0.22,
  maxPitch: 1.18,
  yawSpeed: 1.8,
  pitchSpeed: 1.1,
};

export const world3dAtmosphere = {
  background: "#c8c2b2",
  fogNear: 320,
  fogFar: 1800,
};
