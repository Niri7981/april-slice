import type { InitialHand, InitialHandTag } from "../model/initialHand";
import type { InitialHandOutputLanguage } from "../model/initialHand";
import type { AstrologyChartSeed } from "../profileSeed/astrologyChart";

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
  outputLanguage = "en",
}: {
  chart: AstrologyChartSeed;
  outputLanguage?: InitialHandOutputLanguage;
}): InitialHand => outputLanguage === "zh" ? ({
  source: "birth_profile_fallback",
  summary: `FALLBACK ONLY: ${chart.name} 的初始手牌是根据 birth profile seed 生成的占位结果：${chart.western.sun.signLabel} 太阳、${chart.western.moon.signLabel} 月亮、${chart.eastern.dayPillar.pillar} 日柱、${chart.eastern.fiveElementLeanings.join("/")} 偏向。真正判断质感前要换成 LLM 输出。`,
  cards: [
    `fallback:${chart.western.sun.signLabel} 太阳`,
    `fallback:${chart.western.moon.signLabel} 月亮`,
    `fallback:${chart.eastern.dayPillar.pillar} 日柱`,
    `fallback:${chart.eastern.fiveElementLeanings.join("/")} 偏向`,
  ],
  tags: [
    tag(
      "fallback-opening-bias-private-weather",
      "FALLBACK 语气：像房间里的细微信号会改变室内天气一样回应",
      "FALLBACK 误读：可能把普通沉默听成某句话其实不是留给自己的",
      "FALLBACK 压力：当情绪没有私密处可以落下时，压力会上升",
      "FALLBACK 关系：更信任能保持日常、不急着变成宣言的亲近",
      "FALLBACK 图像：有人开口前，窗帘已经轻轻动了一下",
    ),
    tag(
      "fallback-opening-bias-threshold-step",
      "FALLBACK 语气：停在第一步附近，希望这一步仍然部分属于自己",
      "FALLBACK 误读：可能把指引听成被催着跨过某条线",
      "FALLBACK 压力：开始、离开、被命名的决定都会抬高压力",
      "FALLBACK 关系：别人留下主动余地时，她更容易回应",
      "FALLBACK 图像：一只手停在还没打开的门上",
    ),
    tag(
      "fallback-opening-bias-second-reading",
      "FALLBACK 语气：每句话落下前都会保留第二种读法",
      "FALLBACK 误读：可能把安慰听成自己已经变得麻烦",
      "FALLBACK 压力：还没读懂房间就必须回答时，压力会上升",
      "FALLBACK 关系：会靠近能容纳未完成想法的人",
      "FALLBACK 图像：两张纸条夹在同一本书里",
    ),
    tag(
      "fallback-opening-bias-afterimage",
      "FALLBACK 语气：比预期更久地保存一个瞬间的情绪残影",
      "FALLBACK 误读：可能把变化听成安全感正在被拿走",
      "FALLBACK 压力：当天催她往前走、但她还没准备好时，压力会上升",
      "FALLBACK 关系：信任长得慢，但一旦放下就很难移开",
      "FALLBACK 图像：一本怎么压也压不平的笔记本折痕",
    ),
    tag(
      "fallback-opening-bias-night-self",
      "FALLBACK 语气：白天停止索取以后，才更清楚地理解自己",
      "FALLBACK 误读：可能把白天的自信当成借来的东西",
      "FALLBACK 压力：夜里压力落下，但那个念头变得更难忽略",
      "FALLBACK 关系：在说出口前，先把喜欢放进私人仪式里",
      "FALLBACK 图像：午夜后还亮着的一盏台灯",
    ),
  ],
}) : ({
  source: "birth_profile_fallback",
  summary: `FALLBACK ONLY: ${chart.name}'s Initial Hand is a placeholder generated from a structured birth profile seed: ${chart.western.sun.signLabel} sun, ${chart.western.moon.signLabel} moon, ${chart.eastern.dayPillar.pillar} day pillar, and ${chart.eastern.fiveElementLeanings.join("/")} leaning. Replace this with the LLM interpreter before judging personality quality.`,
  cards: [
    `fallback:${chart.western.sun.signLabel} Sun`,
    `fallback:${chart.western.moon.signLabel} Moon`,
    `fallback:${chart.eastern.dayPillar.pillar} day pillar`,
    `fallback:${chart.eastern.fiveElementLeanings.join("/")} leaning`,
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
