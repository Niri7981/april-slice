import {
  type AgentBrainInput,
  agentBrainOutputSchema,
  type AgentBrainOutput,
  type AgentReaction,
} from "./brainTypes";

const reactionSummaryCopy = {
  zh: {
    accepted: "她把这点靠近轻轻收下了。",
    hesitated: "她停了一下，还没有完全让这件事走进来。",
    resisted: "她本能地往后缩了一点，不想立刻被碰到。",
    misread: "她听见了，却先按自己的方式误读了它。",
    delayed: "她没有马上回应，但这件事会在更晚的时候回来。",
    transformed: "她没有照着原样接受，而是把它变成了自己的动作。",
  },
  en: {
    accepted: "She lets the closeness settle, quietly.",
    hesitated: "She pauses there, not fully letting it in yet.",
    resisted: "She pulls back by instinct, not ready to be touched so directly.",
    misread: "She hears it, but first bends it through her own misunderstanding.",
    delayed: "She does not answer right away, but it will return to her later.",
    transformed: "She does not accept it as given. She turns it into something of her own.",
  },
} as const;

const nextCopy = {
  zh: {
    accepted: "明天她也许会再多留一会儿，不会那么快把心门关上。",
    hesitated: "明天仍需要慢一点靠近，不要把一句话说得太满。",
    resisted: "明天最好留一点距离，让她自己先往前半步。",
    misread: "明天她可能还会绕着理解走，但那句回声已经留下来了。",
    delayed: "明天也许还看不出来，但它已经在她心里存下了一格。",
    transformed: "明天她可能不会照着你的意思走，却会给出属于她自己的回应。",
  },
  en: {
    accepted: "Tomorrow she may stay a little longer instead of closing herself so quickly.",
    hesitated: "Tomorrow still needs a slower approach. Do not make one sentence carry too much.",
    resisted: "Tomorrow is better with more distance, letting her take the first half-step herself.",
    misread: "Tomorrow she may still circle around the meaning, but the echo has already stayed with her.",
    delayed: "Tomorrow it may still be invisible from the outside, but something has already been stored.",
    transformed: "Tomorrow she may not follow your shape exactly, but she may answer in one of her own.",
  },
} as const;

const reactionByNote = (input: AgentBrainInput): AgentReaction => {
  const note = input.event.noteText?.trim() ?? "";

  if (input.currentState.trust <= 45 && input.currentState.selfSense >= 55) {
    return "misread";
  }

  if (note.length >= 18 && input.currentState.pressure >= 62) {
    return "hesitated";
  }

  if (input.currentState.loneliness >= 60 || input.currentState.trust >= 52) {
    return "accepted";
  }

  return "delayed";
};

const reactionBySpatial = (input: AgentBrainInput): AgentReaction => {
  const target = input.event.spatialTarget ?? "";

  if (target === "water" || target === "rail" || target === "window") {
    return input.currentState.trust >= 50 ? "accepted" : "hesitated";
  }

  if (target === "door" || target === "board") {
    return input.currentState.pressure >= 63 ? "hesitated" : "transformed";
  }

  return "accepted";
};

const buildOutwardText = (input: AgentBrainInput, reaction: AgentReaction): string => {
  const isZh = input.language === "zh";

  if (input.event.kind === "note") {
    const note = input.event.noteText ?? "";

    if (isZh) {
      switch (reaction) {
        case "accepted":
          return `她没有立刻拆开那张纸，只是在心里把“${note}”轻轻念了一遍。`;
        case "misread":
          return `她看见了那句话，却先把“${note}”理解成了一种不太敢承认的关心。`;
        case "hesitated":
          return `她把纸条收进掌心，却没有马上决定要不要相信“${note}”。`;
        case "delayed":
          return `她像是没有反应，但那句“${note}”并没有真的从今天滑过去。`;
        default:
          return `她把那张纸条停在手边，没有立刻给出明白的回应。`;
      }
    }

    switch (reaction) {
      case "accepted":
        return `She does not unfold the note right away, but she quietly repeats "${note}" once inside her head.`;
      case "misread":
        return `She reads the line, but first turns "${note}" into a kind of care she does not quite know how to admit.`;
      case "hesitated":
        return `She keeps the note in her hand without deciding whether "${note}" should be believed yet.`;
      case "delayed":
        return `She seems not to react, but "${note}" does not really pass through the day untouched.`;
      default:
        return "She leaves the note near herself without offering a clear response yet.";
    }
  }

  const target =
    input.event.spatialTarget && input.event.scene
      ? `${input.event.scene}:${input.event.spatialTarget}`
      : input.event.spatialTarget ?? "somewhere";

  if (isZh) {
    switch (reaction) {
      case "accepted":
        return `她朝 ${target} 那边停了一会儿，像是终于允许自己的注意力慢下来。`;
      case "hesitated":
        return `她看向 ${target}，却没有立刻走过去，像是在心里先试了一下那一步。`;
      case "transformed":
        return `她没有照着原样靠近 ${target}，却把那点提醒变成了自己的节奏。`;
      default:
        return `她被轻轻碰到了一下，目光还是朝 ${target} 那边偏过去了。`;
    }
  }

  switch (reaction) {
    case "accepted":
      return `She lingers near ${target}, as if finally allowing her attention to slow down there.`;
    case "hesitated":
      return `She looks toward ${target}, but does not go there at once, as if testing the step inside herself first.`;
    case "transformed":
      return `She does not approach ${target} in the exact shape offered to her, but turns the nudge into her own pace.`;
    default:
      return `Something touches her attention lightly, and her eyes still drift toward ${target}.`;
  }
};

const buildDiaryFragment = (input: AgentBrainInput, reaction: AgentReaction): string => {
  const isZh = input.language === "zh";

  if (input.event.kind === "note") {
    const note = input.event.noteText ?? "";

    if (isZh) {
      return reaction === "misread"
        ? `那张纸上写着“${note}”。我不知道那是不是在说我，但那句话还是在心里停了一阵。`
        : `今天那张纸上写着“${note}”。我没有立刻承认自己在意，可夜里还是又想起了一次。`;
    }

    return reaction === "misread"
      ? `The note said "${note}". I am not sure whether it was really meant for me, but the sentence still stayed in my head for a while.`
      : `The note said "${note}" today. I did not admit that it mattered right away, but it still came back to me at night.`;
  }

  const target = input.event.spatialTarget ?? "something";

  if (isZh) {
    return reaction === "accepted"
      ? `我今天在 ${target} 那里停得比平常久一点。不是因为想明白了什么，只是觉得可以先站一会儿。`
      : `今天视线在 ${target} 那边停了一下。像有人碰了碰我，但又没有逼我立刻走近。`;
  }

  return reaction === "accepted"
    ? `I stayed near ${target} a little longer than usual today. Not because I understood anything, only because it felt possible to remain there for a moment.`
    : `My eyes stopped near ${target} for a moment today. It felt like something touched me lightly, without forcing me any closer.`;
};

const buildTraceSummary = (input: AgentBrainInput): string => {
  const parts: string[] = [];

  if (input.echoContext.noteEcho) {
    parts.push(`"${input.echoContext.noteEcho}"`);
  }

  if (input.event.kind === "spatial" && input.event.spatialTarget) {
    parts.push(input.event.spatialTarget);
  }

  return parts.join(" / ");
};

export const resolveAgentBrainFake = (input: AgentBrainInput): AgentBrainOutput => {
  const reaction =
    input.event.kind === "note" ? reactionByNote(input) : reactionBySpatial(input);
  const output = {
    behavior: {
      reaction,
      outwardText: buildOutwardText(input, reaction),
      intendedAction:
        input.event.kind === "note" ? "carry_the_sentence_forward" : "pause_and_observe",
    },
    diary: {
      fragment: buildDiaryFragment(input, reaction),
      traceSummary: buildTraceSummary(input),
    },
    summary: {
      mood: reactionSummaryCopy[input.language][reaction],
      next: nextCopy[input.language][reaction],
    },
    stateChanges: {},
    relationshipChanges: [],
    memory: {
      internalThought:
        input.language === "zh"
          ? "她没有说出口，但那一点回声已经在心里留下了位置。"
          : "She does not say it aloud, but the echo has already made space inside her.",
    },
    meta: {
      source: "fake_resolver" as const,
      fallbackUsed: true,
    },
  };

  return agentBrainOutputSchema.parse(output);
};
