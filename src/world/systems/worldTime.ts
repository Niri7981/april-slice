import { dayEndMinute, worldMinutesPerSecond } from "../../agentMind/schedule";

export type WorldTimeOfDay = "morning" | "afternoon" | "evening" | "night";

const clockDisplayIntervalMinutes = 10;
const minutesPerHour = 60;

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

export const getDisplayWorldMinute = (minute: number) =>
  Math.floor(minute / clockDisplayIntervalMinutes) * clockDisplayIntervalMinutes;

export const formatWorldMinute = (minute: number) => {
  const displayMinute = Math.floor(minute);
  const hours = Math.floor(displayMinute / minutesPerHour);
  const minutes = displayMinute % minutesPerHour;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
