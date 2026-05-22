import type { AgentBrainInput, AgentReaction } from "../llm/brainTypes";

export type AgentSignalState = AgentBrainInput["currentState"];

export type AgentStateDelta = Partial<Record<keyof AgentSignalState, number>>;

export type StateDriftReasonCode =
  | "reaction_accepted"
  | "reaction_hesitated"
  | "reaction_resisted"
  | "reaction_misread"
  | "reaction_delayed"
  | "reaction_transformed"
  | "note_long_pressure"
  | "note_measured_trust"
  | "night_acceptance_opening"
  | "spatial_distance_future"
  | "spatial_distance_relief"
  | "spatial_threshold_push"
  | "spatial_anchor_self"
  | "school_friction"
  | "distance_release"
  | "echo_overload"
  | "acceptance_chain"
  | "resistance_aftertaste";

type StateDriftResult = {
  delta: AgentStateDelta;
  nextState: AgentSignalState;
  reasons: StateDriftReasonCode[];
};

const clampStateValue = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const addDelta = (
  delta: AgentStateDelta,
  key: keyof AgentSignalState,
  amount: number,
) => {
  delta[key] = (delta[key] ?? 0) + amount;
};

export const applyStateDelta = (
  currentState: AgentSignalState,
  delta: AgentStateDelta,
): AgentSignalState => ({
  pressure: clampStateValue(currentState.pressure + (delta.pressure ?? 0)),
  loneliness: clampStateValue(currentState.loneliness + (delta.loneliness ?? 0)),
  futureSense: clampStateValue(currentState.futureSense + (delta.futureSense ?? 0)),
  selfSense: clampStateValue(currentState.selfSense + (delta.selfSense ?? 0)),
  receptivity: clampStateValue(currentState.receptivity + (delta.receptivity ?? 0)),
  autonomy: clampStateValue(currentState.autonomy + (delta.autonomy ?? 0)),
  trust: clampStateValue(currentState.trust + (delta.trust ?? 0)),
});

export const getDailyWindowProfile = (
  currentState: AgentSignalState,
): {
  count: 0 | 1 | 2;
  reason: "guarded" | "open" | "wideOpen";
} => {
  const { pressure, loneliness, receptivity, trust } = currentState;

  if (pressure >= 72 && trust <= 45) {
    return {
      count: 0,
      reason: "guarded",
    };
  }

  if (loneliness >= 62 && trust >= 56 && receptivity >= 56) {
    return {
      count: 2,
      reason: "wideOpen",
    };
  }

  if (loneliness >= 55 || trust >= 48 || receptivity >= 50) {
    return {
      count: 1,
      reason: "open",
    };
  }

  return {
    count: 0,
    reason: "guarded",
  };
};

export const resolveLocalStateDrift = (
  input: AgentBrainInput,
  reaction: AgentReaction,
): StateDriftResult => {
  const delta: AgentStateDelta = {};
  const reasons: StateDriftReasonCode[] = [];
  const noteLength = input.event.noteText?.trim().length ?? 0;
  const sceneWeight =
    input.dayContext.scene === "harbor" || input.dayContext.scene === "station"
      ? "distance"
      : input.dayContext.scene === "classroom" || input.dayContext.scene === "corridor"
        ? "school"
        : "home";

  switch (reaction) {
    case "accepted":
      addDelta(delta, "loneliness", -2);
      addDelta(delta, "receptivity", 2);
      addDelta(delta, "trust", 1);
      reasons.push("reaction_accepted");
      break;
    case "hesitated":
      addDelta(delta, "pressure", 2);
      addDelta(delta, "autonomy", 1);
      addDelta(delta, "receptivity", -1);
      reasons.push("reaction_hesitated");
      break;
    case "resisted":
      addDelta(delta, "pressure", 1);
      addDelta(delta, "autonomy", 2);
      addDelta(delta, "trust", -1);
      addDelta(delta, "receptivity", -2);
      reasons.push("reaction_resisted");
      break;
    case "misread":
      addDelta(delta, "trust", -2);
      addDelta(delta, "selfSense", 1);
      addDelta(delta, "loneliness", 1);
      reasons.push("reaction_misread");
      break;
    case "delayed":
      addDelta(delta, "futureSense", 1);
      addDelta(delta, "loneliness", 1);
      reasons.push("reaction_delayed");
      break;
    case "transformed":
      addDelta(delta, "autonomy", 2);
      addDelta(delta, "selfSense", 2);
      addDelta(delta, "futureSense", 1);
      reasons.push("reaction_transformed");
      break;
  }

  if (input.event.kind === "note") {
    if (noteLength >= 18) {
      addDelta(delta, "pressure", 1);
      reasons.push("note_long_pressure");
    }

    if (noteLength >= 6 && noteLength <= 18) {
      addDelta(delta, "trust", 1);
      reasons.push("note_measured_trust");
    }

    if (input.dayContext.timeOfDay === "night" && reaction === "accepted") {
      addDelta(delta, "receptivity", 1);
      reasons.push("night_acceptance_opening");
    }
  }

  if (input.event.kind === "spatial") {
    if (
      input.event.spatialTarget === "water" ||
      input.event.spatialTarget === "rail" ||
      input.event.spatialTarget === "window"
    ) {
      addDelta(delta, "futureSense", 1);
      reasons.push("spatial_distance_future");
    }

    if (input.event.spatialTarget === "water" || input.event.spatialTarget === "rail") {
      addDelta(delta, "pressure", -1);
      reasons.push("spatial_distance_relief");
    }

    if (input.event.spatialTarget === "board" || input.event.spatialTarget === "door") {
      addDelta(delta, "pressure", 1);
      addDelta(delta, "autonomy", 1);
      reasons.push("spatial_threshold_push");
    }

    if (
      input.event.spatialTarget === "desk" ||
      input.event.spatialTarget === "bed" ||
      input.event.spatialTarget === "bag" ||
      input.event.spatialTarget === "bench"
    ) {
      addDelta(delta, "selfSense", 1);
      reasons.push("spatial_anchor_self");
    }
  }

  if (sceneWeight === "school" && (reaction === "hesitated" || reaction === "resisted")) {
    addDelta(delta, "pressure", 1);
    reasons.push("school_friction");
  }

  if (sceneWeight === "distance" && (reaction === "accepted" || reaction === "transformed")) {
    addDelta(delta, "pressure", -1);
    addDelta(delta, "futureSense", 1);
    reasons.push("distance_release");
  }

  if (input.echoContext.usedEchoes >= 2 && (reaction === "hesitated" || reaction === "resisted")) {
    addDelta(delta, "pressure", 1);
    reasons.push("echo_overload");
  }

  if (
    input.memory.recentReactions.slice(-2).every((pastReaction) => pastReaction === "accepted") &&
    input.memory.recentReactions.length >= 2 &&
    reaction === "accepted"
  ) {
    addDelta(delta, "trust", 1);
    addDelta(delta, "loneliness", -1);
    reasons.push("acceptance_chain");
  }

  if (
    input.memory.recentReactions.slice(-2).some((pastReaction) => pastReaction === "resisted") &&
    reaction === "misread"
  ) {
    addDelta(delta, "trust", -1);
    reasons.push("resistance_aftertaste");
  }

  return {
    delta,
    nextState: applyStateDelta(input.currentState, delta),
    reasons,
  };
};
