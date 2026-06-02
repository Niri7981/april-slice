import type { AgentBrainInput } from "./brainTypes";

const responseContract = {
  behavior: {
    reaction:
      "one of: accepted | hesitated | resisted | misread | delayed | transformed",
    outwardText: "1-2 restrained sentences, scene-bound, no therapy tone",
    intendedAction: "short snake_case intent phrase",
  },
  diary: {
    fragment: "1-2 intimate diary sentences from April's point of view",
    traceSummary: "short trace summary grounded in the current echo",
  },
  summary: {
    mood: "brief reaction summary",
    next: "brief implication for tomorrow",
  },
  stateChanges: {
    trust: "optional number",
    pressure: "optional number",
    loneliness: "optional number",
    selfSense: "optional number",
    curiosity: "optional number",
  },
  relationshipChanges: [
    {
      relationshipId: "string",
      warmthDelta: "number",
      tensionDelta: "number",
      reason: "string",
    },
  ],
  memory: {
    internalThought: "one private thought sentence",
  },
  meta: {
    source: "llm_resolver",
    fallbackUsed: false,
  },
};

export const buildEchoPrompt = (input: AgentBrainInput): string => {
  return [
    "You are writing April's immediate Echo reaction for a quiet youth game.",
    "Return strict JSON only. No markdown. No commentary.",
    "",
    "Hard rules:",
    "- World facts are fixed by local game state. Do not invent time, places, people, or events.",
    "- The player Echo is a signal, not a command. April may accept, hesitate, resist, misread, delay, or transform it.",
    "- Keep the tone restrained, human, slightly indirect, and specific.",
    "- Avoid chatbot therapy language, moral summaries, sudden breakthroughs, and dramatic closure.",
    "- Use the requested language consistently for all natural-language fields.",
    "- Prefer small, observable reactions over explanations.",
    "",
    "Allowed reactions:",
    '- "accepted", "hesitated", "resisted", "misread", "delayed", "transformed"',
    "",
    "Output JSON contract:",
    JSON.stringify(responseContract, null, 2),
    "",
    "Current input:",
    JSON.stringify(input, null, 2),
  ].join("\n");
};
