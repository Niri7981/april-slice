import type { BirthProfileInput } from "../../game/initial-hand/profileSeed/birthProfileSeed";
import { lookupBirthPlace } from "../../game/initial-hand/profileSeed/birthPlaceLookup";

export type BirthFormState = {
  birthDate: string;
  birthTime: string;
  latitude: string;
  longitude: string;
  name: string;
  placeLabel: string;
  timeZoneOffsetHours: string;
};

export const defaultFormState: BirthFormState = {
  name: "Irin",
  birthDate: "2006-07-17",
  birthTime: "09:20",
  placeLabel: "",
  latitude: "",
  longitude: "",
  timeZoneOffsetHours: "8",
};

export const applyBirthPlaceLookup = (
  current: BirthFormState,
  placeLabel: string,
): BirthFormState => {
  const birthPlace = lookupBirthPlace(placeLabel);

  return {
    ...current,
    placeLabel,
    latitude: birthPlace ? String(birthPlace.latitude) : current.latitude,
    longitude: birthPlace ? String(birthPlace.longitude) : current.longitude,
    timeZoneOffsetHours: birthPlace?.timeZoneOffsetHours !== undefined
      ? String(birthPlace.timeZoneOffsetHours)
      : current.timeZoneOffsetHours,
  };
};

export const buildBirthProfileInput = (
  form: BirthFormState,
): BirthProfileInput => {
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const timeZoneOffsetHours = Number(form.timeZoneOffsetHours);
  const hasBirthPlace =
    form.placeLabel.trim().length > 0 &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  return {
    name: form.name.trim() || "April",
    birthDate: form.birthDate,
    birthTime: form.birthTime || undefined,
    birthPlace: hasBirthPlace
      ? {
          label: form.placeLabel.trim(),
          latitude,
          longitude,
          timeZoneOffsetHours: Number.isFinite(timeZoneOffsetHours)
            ? timeZoneOffsetHours
            : undefined,
        }
      : undefined,
  };
};
