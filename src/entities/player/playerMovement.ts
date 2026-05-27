import type { Body, Vector } from "../core/body";
import type { Size } from "../../world/data/worldConfig";

export const playerSpeed = 230;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const getMoveDirection = (pressedKeys: Set<string>): Vector => ({
  x:
    Number(pressedKeys.has("d") || pressedKeys.has("arrowright")) -
    Number(pressedKeys.has("a") || pressedKeys.has("arrowleft")),
  y:
    Number(pressedKeys.has("s") || pressedKeys.has("arrowdown")) -
    Number(pressedKeys.has("w") || pressedKeys.has("arrowup")),
});

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
