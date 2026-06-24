import type { Body, Vector } from "../core/body";
import type { Size } from "../../world/data/worldConfig";

export const playerSpeed = 230;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const getMoveDirection = (
  pressedKeys: Set<string>,
  cameraYaw = 0,
): Vector => {
  const rightInput =
    Number(pressedKeys.has("arrowright")) -
    Number(pressedKeys.has("arrowleft"));
  const forwardInput =
    Number(pressedKeys.has("arrowup")) -
    Number(pressedKeys.has("arrowdown"));
  const right = {
    x: Math.cos(cameraYaw),
    y: -Math.sin(cameraYaw),
  };
  const forward = {
    x: -Math.sin(cameraYaw),
    y: -Math.cos(cameraYaw),
  };

  return {
    x: right.x * rightInput + forward.x * forwardInput,
    y: right.y * rightInput + forward.y * forwardInput,
  };
};

export const moveBody = (
  body: Body,
  direction: Vector,
  dt: number,
  worldSize: Size,
): Body => {
  const magnitude = Math.hypot(direction.x, direction.y) || 1;

  return {
    ...body,
    x: clamp(
      body.x + (direction.x / magnitude) * playerSpeed * dt,
      body.radius,
      worldSize.width - body.radius,
    ),
    y: clamp(
      body.y + (direction.y / magnitude) * playerSpeed * dt,
      body.radius,
      worldSize.height - body.radius,
    ),
  };
};
