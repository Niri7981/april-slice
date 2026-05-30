import type { BirthProfileSeed } from "../profileSeed/birthProfileSeed";
import type { InitialHandOutputLanguage } from "../model/initialHand";

export type InitialHandPromptInput = {
  chart: BirthProfileSeed;
  outputLanguage?: InitialHandOutputLanguage;
};

const formatPlacement = (label: string, placement: BirthProfileSeed["western"]["sun"]) =>
  `- ${label}: ${placement.signLabel} ${placement.degree}° (${placement.element}, ${placement.modality})`;

const formatPlanetPlacements = (chart: BirthProfileSeed) =>
  Object.entries(chart.western.planets)
    .map(([planetName, placement]) =>
      formatPlacement(planetName[0].toUpperCase() + planetName.slice(1), placement),
    )
    .join("\n");

const formatPillar = (
  label: string,
  pillar: BirthProfileSeed["eastern"]["yearPillar"] | null,
) => {
  if (!pillar) {
    return `- ${label}: unknown`;
  }

  return `- ${label}: ${pillar.pillar} / elements ${pillar.elementText} / na yin ${pillar.naYin} / ten-god ${pillar.tenGod}`;
};

const outputLanguageInstructions: Record<InitialHandOutputLanguage, string> = {
  en: "Write all human-readable JSON values in natural English. Keep ids in kebab-case English.",
  zh: "Write all human-readable JSON values in natural Simplified Chinese. Keep ids in kebab-case English.",
};

export const buildInitialHandPrompt = ({
  chart,
  outputLanguage = "en",
}: InitialHandPromptInput) => `
You are interpreting a structured birth profile for April Slice, a quiet Japanese seaside youth agent experiment game.

Your job is NOT to decide behavior, numbers, plot outcomes, destiny, fortune, compatibility, or life advice.
Your job is to produce the agent's Initial Hand: 5-7 opening-bias tags that shape tone, misreading, pressure, and relationship interpretation.
Output language rule:
- ${outputLanguageInstructions[outputLanguage]}

Birth profile:
- Name: ${chart.name}
- Birth date: ${chart.birthDate}
- Birth time: ${chart.birthTime ?? "unknown"}
- Birth place: ${chart.birthPlace?.label ?? "unknown"}
- Precision:
  - birth time known: ${chart.precision.birthTimeKnown}
  - birth place known: ${chart.precision.birthPlaceKnown}
  - rising sign known: ${chart.precision.risingSignKnown}
  - eastern hour pillar known: ${chart.precision.easternHourPillarKnown}

Western astrology seed:
${formatPlacement("Sun", chart.western.sun)}
${formatPlacement("Moon", chart.western.moon)}
${chart.western.rising ? formatPlacement("Rising", chart.western.rising) : "- Rising: unknown"}
${formatPlanetPlacements(chart)}
- Element balance: ${chart.western.elementBalance.join(", ")}
- Modality balance: ${chart.western.modalityBalance.join(", ")}
- Notes:
${chart.western.chartNotes.map((note) => `  - ${note}`).join("\n")}

Eastern birth seed:
${formatPillar("Year pillar", chart.eastern.yearPillar)}
${formatPillar("Month pillar", chart.eastern.monthPillar)}
${formatPillar("Day pillar", chart.eastern.dayPillar)}
${formatPillar("Hour pillar", chart.eastern.hourPillar)}
- Zodiac animals: year ${chart.eastern.zodiacAnimals.year}, month ${chart.eastern.zodiacAnimals.month}, day ${chart.eastern.zodiacAnimals.day}, hour ${chart.eastern.zodiacAnimals.hour ?? "unknown"}
- Season: ${chart.eastern.season}
- Lunar phase: ${chart.eastern.moonPhase}
- Solar terms: previous ${chart.eastern.solarTerms.previous ?? "unknown"}, next ${chart.eastern.solarTerms.next ?? "unknown"}
- Five-element leanings: ${chart.eastern.fiveElementLeanings.join(", ")}
- Notes:
${chart.eastern.chartNotes.map((note) => `  - ${note}`).join("\n")}

Interpretation rules:
- Western seed gives expression style, attention pattern, tone texture, and misreading style.
- Use Mercury for thought/speech texture, Venus for attachment/receiving warmth, Mars for friction/initiative, Jupiter/Saturn for hope/constraint, and outer planets only as faint background weather.
- Eastern seed gives rhythm, pressure pattern, inner weather, and how closeness is carried over time.
- Blend the two systems into lived images. Do not explain the systems.
- If birth time or place is unknown, do not pretend precision. Use the known fields and mention uncertainty only through softer tags.
- Do not write personality labels like "introvert", "sensitive", "emotional", "caring", or "ambitious".
- Do not mention astrology, BaZi, pillars, signs, elements, or jargon in the final cards/tags unless transformed into an ordinary image.
- Do not prescribe actions.
- Do not assign numeric values.
- Make every tag usable inside a prompt for a person moving through a small world.

Return strict JSON only:
{
  "source": "birth_profile_llm",
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
- Keep every card short enough to fit in a prompt.
- Keep every image concrete, local, and ordinary.
`.trim();
