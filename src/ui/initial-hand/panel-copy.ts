import type { InitialHandOutputLanguage } from "../../game/initial-hand/model/initialHand";

export type InitialHandPanelCopy = {
  advancedSummary: string;
  birthCity: string;
  birthDate: string;
  birthTime: string;
  cityPlaceholder: string;
  correctionHint: string;
  errorFallback: string;
  generate: string;
  generating: string;
  image: string;
  imagePromptLabel: string;
  latitude: string;
  latitudePlaceholder: string;
  longitude: string;
  longitudePlaceholder: string;
  misread: string;
  name: string;
  placeSuggestionsLabel: string;
  pressure: string;
  relationship: string;
  sourceLabel: string;
  timezone: string;
  timezonePlaceholder: string;
  title: string;
};

export const copyByLanguage: Record<InitialHandOutputLanguage, InitialHandPanelCopy> = {
  zh: {
    advancedSummary: "校正地点",
    birthCity: "出生城市",
    birthDate: "生日",
    birthTime: "时间",
    cityPlaceholder: "城市",
    correctionHint: "城市命中后会自动填；如果没命中，可以手动校正。",
    errorFallback: "生成失败",
    generate: "生成两份",
    generating: "生成中",
    image: "图像",
    imagePromptLabel: "图片生成提示词",
    latitude: "纬度",
    latitudePlaceholder: "39.90",
    longitude: "经度",
    longitudePlaceholder: "116.40",
    misread: "误读",
    name: "名字",
    placeSuggestionsLabel: "城市建议",
    pressure: "压力",
    relationship: "关系",
    sourceLabel: "来源",
    timezone: "时区",
    timezonePlaceholder: "8",
    title: "初始手牌",
  },
  en: {
    advancedSummary: "Adjust Place",
    birthCity: "Birth City",
    birthDate: "Birth Date",
    birthTime: "Birth Time",
    cityPlaceholder: "City",
    correctionHint:
      "Known cities are filled automatically. Open this if you need to correct the place.",
    errorFallback: "Generation failed",
    generate: "Generate Both",
    generating: "Generating",
    image: "Image",
    imagePromptLabel: "Image prompt seed",
    latitude: "Latitude",
    latitudePlaceholder: "39.90",
    longitude: "Longitude",
    longitudePlaceholder: "116.40",
    misread: "Misread",
    name: "Name",
    placeSuggestionsLabel: "City suggestions",
    pressure: "Pressure",
    relationship: "Relationship",
    sourceLabel: "Source",
    timezone: "Time Zone",
    timezonePlaceholder: "8",
    title: "Initial Hand",
  },
};
