import { viewportSize, worldSize } from "../../world/data/worldConfig";

export const world3dScale = 0.28;

export const world3dGroundSize = {
  width: worldSize.width * world3dScale,
  depth: worldSize.height * world3dScale,
};

export const world3dViewport = viewportSize;

export const world3dCamera = {
  fov: 34,
  near: 0.1,
  far: 4000,
  height: 245,
  distance: 190,
  damping: 4.5,
  lookAtHeight: 16,
};

export const world3dAtmosphere = {
  background: "#b8c2ae",
  fogNear: 220,
  fogFar: 900,
};
