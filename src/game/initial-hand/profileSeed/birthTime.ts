import { CalendarGregorian } from "astronomia/julian";
import type { BirthProfileInput } from "./birthProfileTypes";

export const parseBirthDate = (birthDate: string) => {
  const [yearText, monthText, dayText] = birthDate.split("-");

  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
};

export const parseBirthTime = (birthTime?: string) => {
  if (!birthTime) {
    return { hour: 12, minute: 0 };
  }

  const [hourText, minuteText = "0"] = birthTime.split(":");

  return {
    hour: Number(hourText),
    minute: Number(minuteText),
  };
};

export const getJulianDay = ({
  birthDate,
  birthPlace,
  birthTime,
}: BirthProfileInput) => {
  const { year, month, day } = parseBirthDate(birthDate);
  const { hour, minute } = parseBirthTime(birthTime);
  const timeZoneOffsetHours = birthPlace?.timeZoneOffsetHours ?? 0;
  const utcHour = hour - timeZoneOffsetHours + minute / 60;

  return new CalendarGregorian(year, month, day + utcHour / 24).toJD();
};
