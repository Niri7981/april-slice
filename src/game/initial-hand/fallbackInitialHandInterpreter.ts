import type { InitialHand, InitialHandTag } from "./initialHand";
import type { AstrologyChartSeed } from "./astrologyChart";

const tag = (
  id: string,
  toneToken: string,
  misreadBias: string,
  pressureBias: string,
  relationshipBias: string,
  image: string,
): InitialHandTag => ({
  id,
  toneToken,
  misreadBias,
  pressureBias,
  relationshipBias,
  image,
});

export const fallbackInitialHandInterpreter = ({
  chart,
}: {
  chart: AstrologyChartSeed;
}): InitialHand => ({
  source: "western_astrology_fallback",
  summary: `FALLBACK ONLY: ${chart.name}'s Initial Hand is a placeholder generated from a simplified western astrology seed: ${chart.sunSignLabel} sun, ${chart.element} element, ${chart.modality} modality. Replace this with the LLM interpreter before judging personality quality.`,
  cards: [
    `fallback:${chart.sunSignLabel} Sun`,
    `fallback:${chart.element} element`,
    `fallback:${chart.modality} modality`,
  ],
  tags: [
    tag(
      "fallback-opening-bias-private-weather",
      "FALLBACK tone token: responds as if small signals change the weather inside the room",
      "FALLBACK misread bias: may hear neutral silence as a sign that something was meant for someone else",
      "FALLBACK pressure bias: pressure rises when feeling has no private place to settle",
      "FALLBACK relationship bias: trusts closeness that can stay ordinary instead of becoming a declaration",
      "FALLBACK image: curtains moving before anyone speaks",
    ),
    tag(
      "fallback-opening-bias-threshold-step",
      "FALLBACK tone token: hovers near a first step and wants it to remain partly hers",
      "FALLBACK misread bias: may hear guidance as being hurried across a line",
      "FALLBACK pressure bias: pressure rises at beginnings, departures, and named decisions",
      "FALLBACK relationship bias: responds better when someone leaves room for her initiative",
      "FALLBACK image: one hand on an unopened gate",
    ),
    tag(
      "fallback-opening-bias-second-reading",
      "FALLBACK tone token: keeps a second reading of every sentence before letting it land",
      "FALLBACK misread bias: may hear comfort as proof that she has become inconvenient",
      "FALLBACK pressure bias: pressure rises when she has to answer before understanding the room",
      "FALLBACK relationship bias: feels close to people who leave room for unfinished thoughts",
      "FALLBACK image: two notes tucked into one book",
    ),
    tag(
      "fallback-opening-bias-afterimage",
      "FALLBACK tone token: keeps the emotional afterimage of a moment longer than expected",
      "FALLBACK misread bias: may hear change as proof that something safe is being taken away",
      "FALLBACK pressure bias: pressure rises when the day asks her to move before she is ready",
      "FALLBACK relationship bias: trust grows slowly, but once placed it becomes hard to dislodge",
      "FALLBACK image: a notebook crease that will not flatten",
    ),
    tag(
      "fallback-opening-bias-night-self",
      "FALLBACK tone token: understands herself most clearly after the day has stopped asking",
      "FALLBACK misread bias: may treat daytime confidence as something she borrowed",
      "FALLBACK pressure bias: pressure settles at night, but the thought becomes harder to ignore",
      "FALLBACK relationship bias: keeps affection in private rituals before saying it aloud",
      "FALLBACK image: a desk lamp left on after midnight",
    ),
  ],
});
