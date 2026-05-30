import type {
  ZodiacElement,
  ZodiacModality,
  ZodiacPlacement,
  ZodiacSign,
} from "./birthProfileTypes";

type ZodiacProfile = {
  label: string;
  element: ZodiacElement;
  modality: ZodiacModality;
};

const degreesPerSign = 30;

const zodiacOrder: ZodiacSign[] = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const zodiacProfiles: Record<ZodiacSign, ZodiacProfile> = {
  aries: { label: "Aries", element: "fire", modality: "cardinal" },
  taurus: { label: "Taurus", element: "earth", modality: "fixed" },
  gemini: { label: "Gemini", element: "air", modality: "mutable" },
  cancer: { label: "Cancer", element: "water", modality: "cardinal" },
  leo: { label: "Leo", element: "fire", modality: "fixed" },
  virgo: { label: "Virgo", element: "earth", modality: "mutable" },
  libra: { label: "Libra", element: "air", modality: "cardinal" },
  scorpio: { label: "Scorpio", element: "water", modality: "fixed" },
  sagittarius: { label: "Sagittarius", element: "fire", modality: "mutable" },
  capricorn: { label: "Capricorn", element: "earth", modality: "cardinal" },
  aquarius: { label: "Aquarius", element: "air", modality: "fixed" },
  pisces: { label: "Pisces", element: "water", modality: "mutable" },
};

export const normalizeDegrees = (degrees: number) =>
  ((degrees % 360) + 360) % 360;

const signFromLongitude = (longitude: number): ZodiacSign =>
  zodiacOrder[Math.floor(normalizeDegrees(longitude) / degreesPerSign)];

export const placementFromLongitude = (longitude: number): ZodiacPlacement => {
  const sign = signFromLongitude(longitude);
  const profile = zodiacProfiles[sign];

  return {
    sign,
    signLabel: profile.label,
    element: profile.element,
    modality: profile.modality,
    degree: Number((normalizeDegrees(longitude) % degreesPerSign).toFixed(2)),
  };
};
