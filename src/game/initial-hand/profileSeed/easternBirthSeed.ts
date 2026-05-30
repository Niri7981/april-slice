import lunar from "lunar-javascript";
import { parseBirthDate, parseBirthTime } from "./birthTime";
import type {
  BirthProfileInput,
  ChineseElement,
  ChinesePillarSeed,
  EasternBirthSeed,
} from "./birthProfileTypes";

const chineseElementMap: Record<string, ChineseElement> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

const buildPillar = (
  pillar: string,
  elementText: string,
  naYin: string,
  tenGod: string,
): ChinesePillarSeed => ({
  pillar,
  elementText,
  naYin,
  tenGod,
});

const getFiveElementLeanings = (elementTexts: string[]) => {
  const counts = new Map<ChineseElement, number>();

  elementTexts.forEach((elementText) => {
    Array.from(elementText).forEach((char) => {
      const element = chineseElementMap[char];

      if (!element) {
        return;
      }

      counts.set(element, (counts.get(element) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([element]) => element);
};

export const buildEasternBirthSeed = (
  input: BirthProfileInput,
): EasternBirthSeed => {
  const { year, month, day } = parseBirthDate(input.birthDate);
  const { hour, minute } = parseBirthTime(input.birthTime);
  const lunarDate = lunar.Solar.fromYmdHms(
    year,
    month,
    day,
    hour,
    minute,
    0,
  ).getLunar();
  const baZi = lunarDate.getBaZi();
  const wuXing = lunarDate.getBaZiWuXing();
  const naYin = lunarDate.getBaZiNaYin();
  const tenGods = lunarDate.getBaZiShiShenGan();
  const previousSolarTerm = lunarDate.getPrevJieQi();
  const nextSolarTerm = lunarDate.getNextJieQi();

  return {
    yearPillar: buildPillar(baZi[0], wuXing[0], naYin[0], tenGods[0]),
    monthPillar: buildPillar(baZi[1], wuXing[1], naYin[1], tenGods[1]),
    dayPillar: buildPillar(baZi[2], wuXing[2], naYin[2], tenGods[2]),
    hourPillar: input.birthTime
      ? buildPillar(baZi[3], wuXing[3], naYin[3], tenGods[3])
      : null,
    zodiacAnimals: {
      year: lunarDate.getYearShengXiaoExact(),
      month: lunarDate.getMonthShengXiaoExact(),
      day: lunarDate.getDayShengXiao(),
      hour: input.birthTime ? lunarDate.getTimeShengXiao() : null,
    },
    season: lunarDate.getSeason(),
    moonPhase: lunarDate.getYueXiang(),
    solarTerms: {
      previous: previousSolarTerm?.getName() ?? null,
      next: nextSolarTerm?.getName() ?? null,
    },
    fiveElementLeanings: getFiveElementLeanings(
      input.birthTime ? wuXing : wuXing.slice(0, 3),
    ),
    chartNotes: [
      "Use eastern pillars as rhythm, pressure pattern, and inner weather.",
      "The day pillar is the self-anchor; the hour pillar is omitted when birth time is unknown.",
      "Do not produce destiny, fortune telling, scores, or fixed life outcomes.",
    ],
  };
};
