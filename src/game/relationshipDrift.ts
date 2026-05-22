import type { AgentBrainInput, AgentReaction } from "../llm/brainTypes";

export type RelationshipState = AgentBrainInput["relationships"][number];

export type RelationshipStateChange = {
  relationshipId: string;
  warmthDelta: number;
  tensionDelta: number;
  reason: string;
};

export type RelationshipDriftReasonCode =
  | "note_school_classmate"
  | "note_home_family"
  | "note_misread_distance"
  | "spatial_window_classmate"
  | "spatial_door_family"
  | "spatial_distance_guide"
  | "accepted_softens_tension"
  | "resisted_raises_tension"
  | "misread_cools_warmth"
  | "delayed_keeps_distance";

type RelationshipDriftResult = {
  changes: RelationshipStateChange[];
  nextRelationships: RelationshipState[];
  reasons: RelationshipDriftReasonCode[];
};

const clampRelationshipValue = (value: number) =>
  Math.min(100, Math.max(0, Math.round(value)));

const applyChange = (
  relationships: RelationshipState[],
  change: RelationshipStateChange,
): RelationshipState[] =>
  relationships.map((relationship) =>
    relationship.id === change.relationshipId
      ? {
          ...relationship,
          warmth: clampRelationshipValue(relationship.warmth + change.warmthDelta),
          tension: clampRelationshipValue(relationship.tension + change.tensionDelta),
        }
      : relationship,
  );

const pushChange = (
  changes: RelationshipStateChange[],
  relationshipId: string,
  warmthDelta: number,
  tensionDelta: number,
  reason: string,
) => {
  changes.push({
    relationshipId,
    warmthDelta,
    tensionDelta,
    reason,
  });
};

const findRelationship = (
  relationships: RelationshipState[],
  role: string,
): RelationshipState | undefined => relationships.find((relationship) => relationship.role === role);

export const resolveLocalRelationshipDrift = (
  input: AgentBrainInput,
  reaction: AgentReaction,
): RelationshipDriftResult => {
  const changes: RelationshipStateChange[] = [];
  const reasons: RelationshipDriftReasonCode[] = [];
  const classmate = findRelationship(input.relationships, "同桌") ??
    findRelationship(input.relationships, "Classmate");
  const family = findRelationship(input.relationships, "家人") ??
    findRelationship(input.relationships, "Family");
  const guide = findRelationship(input.relationships, "引路人") ??
    findRelationship(input.relationships, "Guide");

  if (input.event.kind === "note") {
    if ((input.dayContext.scene === "classroom" || input.dayContext.scene === "corridor") && classmate) {
      pushChange(changes, classmate.id, 2, -1, "note_school_classmate");
      reasons.push("note_school_classmate");
    }

    if (input.dayContext.scene === "homeRoom" && family) {
      pushChange(changes, family.id, 1, 0, "note_home_family");
      reasons.push("note_home_family");
    }

    if (reaction === "misread" && guide) {
      pushChange(changes, guide.id, -1, 1, "note_misread_distance");
      reasons.push("note_misread_distance");
    }
  }

  if (input.event.kind === "spatial") {
    if (input.event.spatialTarget === "window" && classmate) {
      pushChange(changes, classmate.id, 1, 0, "spatial_window_classmate");
      reasons.push("spatial_window_classmate");
    }

    if (input.event.spatialTarget === "door" && family) {
      pushChange(changes, family.id, 0, 1, "spatial_door_family");
      reasons.push("spatial_door_family");
    }

    if (
      (input.event.spatialTarget === "rail" || input.event.spatialTarget === "water") &&
      guide
    ) {
      pushChange(changes, guide.id, 2, -1, "spatial_distance_guide");
      reasons.push("spatial_distance_guide");
    }
  }

  if (reaction === "accepted") {
    changes.forEach((change) => {
      change.tensionDelta -= 1;
    });
    reasons.push("accepted_softens_tension");
  }

  if (reaction === "resisted") {
    changes.forEach((change) => {
      change.tensionDelta += 1;
    });
    reasons.push("resisted_raises_tension");
  }

  if (reaction === "misread") {
    changes.forEach((change) => {
      change.warmthDelta -= 1;
    });
    reasons.push("misread_cools_warmth");
  }

  if (reaction === "delayed") {
    changes.forEach((change) => {
      change.warmthDelta = Math.max(0, change.warmthDelta - 1);
    });
    reasons.push("delayed_keeps_distance");
  }

  const nextRelationships = changes.reduce(
    (currentRelationships, change) => applyChange(currentRelationships, change),
    input.relationships,
  );

  return {
    changes,
    nextRelationships,
    reasons,
  };
};
