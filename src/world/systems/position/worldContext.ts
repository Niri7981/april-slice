import type { Vector } from "../../../entities/core/body";
import { getNearestWorldNodeId, type WorldNodeId } from "../../data/worldGraph";
import { getTimeOfDayForMinute, type WorldTimeOfDay } from "../time/worldTime";

export type WorldContextSnapshot = {
  scene: WorldNodeId;
  timeOfDay: WorldTimeOfDay;
  key: string;
};

export const getWorldContextSnapshot = (
  position: Vector,
  worldMinute: number,
): WorldContextSnapshot => {
  const scene = getNearestWorldNodeId(position);
  const timeOfDay = getTimeOfDayForMinute(worldMinute);

  return {
    scene,
    timeOfDay,
    key: `${scene}:${timeOfDay}`,
  };
};
