import { dayEndMinute, worldMinutesPerSecond } from "../../agentMind/schedule";

export type WorldTimeOfDay = "morning" | "afternoon" | "evening" | "night";

export const advanceWorldMinute = (currentMinute: number, dt: number) => {
  const nextMinute = currentMinute + worldMinutesPerSecond * dt;
  return Math.min(nextMinute, dayEndMinute);
};

export const getTimeOfDayForMinute = (minute: number): WorldTimeOfDay => {
  if (minute < 12 * 60) {
    return "morning";
  }

  if (minute < 17 * 60) {
    return "afternoon";
  }

  if (minute < 20 * 60) {
    return "evening";
  }

  return "night";
};
