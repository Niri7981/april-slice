import type { AstrologyChartSeed } from "./astrologyChart";

export type InitialHandPromptInput = {
  chart: AstrologyChartSeed;
};

export const buildInitialHandPrompt = ({ chart }: InitialHandPromptInput) => `
You are interpreting a western astrology chart for April Slice, a quiet Japanese seaside youth agent experiment game.

Your job is NOT to decide behavior, numbers, plot outcomes, or destiny.
Your job is to produce the agent's Initial Hand: 5-7 opening-bias tags that shape tone, misreading, pressure, and relationship interpretation.

Chart seed:
- Name: ${chart.name}
- Birth date: ${chart.birthDate}
- Sun sign: ${chart.sunSignLabel}
- Element: ${chart.element}
- Modality: ${chart.modality}
- Notes:
${chart.chartNotes.map((note) => `  - ${note}`).join("\n")}

Return strict JSON only:
{
  "source": "western_astrology_llm",
  "summary": "one concise paragraph",
  "cards": ["3-8 short chart cards"],
  "tags": [
    {
      "id": "kebab-case-id",
      "toneToken": "how the agent's response should sound",
      "misreadBias": "what kind of signal the agent may misread",
      "pressureBias": "what kind of situation raises pressure",
      "relationshipBias": "how closeness is interpreted",
      "image": "one concrete image, not an abstract label"
    }
  ]
}

Rules:
- Generate 5-7 tags.
- Do not write personality labels like "introvert", "sensitive", or "emotional".
- Do not mention astrology jargon in the tags unless it has become a lived, ordinary image.
- Do not prescribe actions.
- Do not assign numeric values.
- Make every tag usable inside a prompt for a person moving through a small world.
`.trim();
