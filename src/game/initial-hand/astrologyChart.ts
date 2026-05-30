export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacElement = "fire" | "earth" | "air" | "water";
export type ZodiacModality = "cardinal" | "fixed" | "mutable";

export type AstrologyChartInput = {
  birthDate: string;
  name: string;
};

export type AstrologyChartSeed = {
  name: string;
  birthDate: string;
  sunSign: ZodiacSign;
  sunSignLabel: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  chartNotes: string[];
};

const zodiacProfiles: Record<
  ZodiacSign,
  {
    label: string;
    element: ZodiacElement;
    modality: ZodiacModality;
  }
> = {
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

const getZodiacSign = (month: number, day: number): ZodiacSign => {
  const monthDay = month * 100 + day;

  if (monthDay >= 321 && monthDay <= 419) return "aries";
  if (monthDay >= 420 && monthDay <= 520) return "taurus";
  if (monthDay >= 521 && monthDay <= 620) return "gemini";
  if (monthDay >= 621 && monthDay <= 722) return "cancer";
  if (monthDay >= 723 && monthDay <= 822) return "leo";
  if (monthDay >= 823 && monthDay <= 922) return "virgo";
  if (monthDay >= 923 && monthDay <= 1022) return "libra";
  if (monthDay >= 1023 && monthDay <= 1121) return "scorpio";
  if (monthDay >= 1122 && monthDay <= 1221) return "sagittarius";
  if (monthDay >= 1222 || monthDay <= 119) return "capricorn";
  if (monthDay >= 120 && monthDay <= 218) return "aquarius";

  return "pisces";
};

export const buildAstrologyChartSeed = ({
  birthDate,
  name,
}: AstrologyChartInput): AstrologyChartSeed => {
  const [, monthText, dayText] = birthDate.split("-");
  const month = Number(monthText);
  const day = Number(dayText);
  const sunSign = getZodiacSign(month, day);
  const profile = zodiacProfiles[sunSign];

  return {
    name,
    birthDate,
    sunSign,
    sunSignLabel: profile.label,
    element: profile.element,
    modality: profile.modality,
    chartNotes: [
      "Use this chart as an opening bias, not fate.",
      "Generate interpretation tendencies, not direct behavior commands.",
      "Keep the output grounded in April Slice: quiet seaside youth fiction.",
    ],
  };
};
