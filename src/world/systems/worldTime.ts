import { dayEndMinute, worldMinutesPerSecond } from "../../agentMind/schedule";

export const advanceWorldMinute = (currentMinute: number, dt: number) => {
  const nextMinute = currentMinute + worldMinutesPerSecond * dt;
  return Math.min(nextMinute, dayEndMinute);
};
