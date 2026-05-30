import type { BirthPlaceSeed } from "./birthProfileTypes";

type BirthPlaceLookupEntry = BirthPlaceSeed & {
  aliases: string[];
};

const birthPlaceEntries: BirthPlaceLookupEntry[] = [
  {
    label: "Beijing",
    aliases: ["beijing", "北京", "北京市"],
    latitude: 39.9042,
    longitude: 116.4074,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Shanghai",
    aliases: ["shanghai", "上海", "上海市"],
    latitude: 31.2304,
    longitude: 121.4737,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Guangzhou",
    aliases: ["guangzhou", "广州", "广州市"],
    latitude: 23.1291,
    longitude: 113.2644,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Shenzhen",
    aliases: ["shenzhen", "深圳", "深圳市"],
    latitude: 22.5431,
    longitude: 114.0579,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Chengdu",
    aliases: ["chengdu", "成都", "成都市"],
    latitude: 30.5728,
    longitude: 104.0668,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Hangzhou",
    aliases: ["hangzhou", "杭州", "杭州市"],
    latitude: 30.2741,
    longitude: 120.1551,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Nanjing",
    aliases: ["nanjing", "南京", "南京市"],
    latitude: 32.0603,
    longitude: 118.7969,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Wuhan",
    aliases: ["wuhan", "武汉", "武汉市"],
    latitude: 30.5928,
    longitude: 114.3055,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Xi'an",
    aliases: ["xian", "xi'an", "西安", "西安市"],
    latitude: 34.3416,
    longitude: 108.9398,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Qingdao",
    aliases: ["qingdao", "青岛", "青岛市"],
    latitude: 36.0671,
    longitude: 120.3826,
    timeZoneOffsetHours: 8,
  },
  {
    label: "Tokyo",
    aliases: ["tokyo", "东京", "東京都", "東京"],
    latitude: 35.6762,
    longitude: 139.6503,
    timeZoneOffsetHours: 9,
  },
  {
    label: "Osaka",
    aliases: ["osaka", "大阪"],
    latitude: 34.6937,
    longitude: 135.5023,
    timeZoneOffsetHours: 9,
  },
  {
    label: "Seoul",
    aliases: ["seoul", "首尔", "서울"],
    latitude: 37.5665,
    longitude: 126.978,
    timeZoneOffsetHours: 9,
  },
  {
    label: "Singapore",
    aliases: ["singapore", "新加坡"],
    latitude: 1.3521,
    longitude: 103.8198,
    timeZoneOffsetHours: 8,
  },
  {
    label: "London",
    aliases: ["london", "伦敦"],
    latitude: 51.5072,
    longitude: -0.1276,
    timeZoneOffsetHours: 0,
  },
  {
    label: "New York",
    aliases: ["new york", "nyc", "纽约"],
    latitude: 40.7128,
    longitude: -74.006,
    timeZoneOffsetHours: -5,
  },
  {
    label: "Los Angeles",
    aliases: ["los angeles", "la", "洛杉矶"],
    latitude: 34.0522,
    longitude: -118.2437,
    timeZoneOffsetHours: -8,
  },
  {
    label: "San Francisco",
    aliases: ["san francisco", "sf", "旧金山"],
    latitude: 37.7749,
    longitude: -122.4194,
    timeZoneOffsetHours: -8,
  },
];

const normalizeBirthPlaceName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

export const lookupBirthPlace = (name: string): BirthPlaceSeed | null => {
  const normalizedName = normalizeBirthPlaceName(name);

  if (!normalizedName) {
    return null;
  }

  const entry = birthPlaceEntries.find((candidate) =>
    candidate.aliases.some((alias) => normalizeBirthPlaceName(alias) === normalizedName),
  );

  if (!entry) {
    return null;
  }

  return {
    label: entry.label,
    latitude: entry.latitude,
    longitude: entry.longitude,
    timeZoneOffsetHours: entry.timeZoneOffsetHours,
  };
};

export const birthPlaceSuggestions = birthPlaceEntries.map((entry) => entry.label);
