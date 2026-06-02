import type { AgentBrainInput, AgentBrainOutput } from "./brainTypes";

const rejectPatterns = {
  zh: [
    "她终于明白了",
    "她的心被温暖了",
    "这一刻",
    "她意识到",
    "被治愈",
  ],
  en: [
    "she finally realized",
    "her heart was warmed",
    "in this moment",
    "she realized that",
    "healed",
  ],
} as const;

const collectTextFields = (output: AgentBrainOutput) => [
  output.behavior.outwardText,
  output.diary.fragment,
  output.summary.mood,
  output.summary.next,
  output.memory.internalThought,
];

export const passesToneFilter = (
  input: AgentBrainInput,
  output: AgentBrainOutput,
): boolean => {
  const haystack = collectTextFields(output).join("\n").toLowerCase();
  const patterns = rejectPatterns[input.language];

  return patterns.every((pattern) => !haystack.includes(pattern.toLowerCase()));
};
