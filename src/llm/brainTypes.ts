import { z } from "zod";

export const agentReactionSchema = z.enum([
  "accepted",
  "hesitated",
  "resisted",
  "misread",
  "delayed",
  "transformed",
]);

export type AgentReaction = z.infer<typeof agentReactionSchema>;

export type AgentBrainEvent = {
  kind: "note" | "spatial";
  noteText?: string;
  spatialTarget?: string;
  scene?: string;
};

export type AgentBrainInput = {
  language: "zh" | "en";
  profile: {
    id: string;
    name: string;
    age: number;
    summary: string;
    keywords: string[];
  };
  openingHand: {
    summary: string;
    cards: string[];
  };
  currentState: {
    pressure: number;
    loneliness: number;
    futureSense: number;
    selfSense: number;
    receptivity: number;
    autonomy: number;
    trust: number;
  };
  relationships: Array<{
    id: string;
    name: string;
    role: string;
    warmth: number;
    tension: number;
    note: string;
  }>;
  dayContext: {
    day: number;
    timeOfDay: string;
    scene: string;
    visitedScenes: string[];
  };
  echoContext: {
    baseEchoes: number;
    extraWindows: number;
    usedEchoes: number;
    remainingEchoes: number;
    noteEcho?: string;
    spatialTraces: Array<{
      scene: string;
      target: string;
    }>;
  };
  memory: {
    recentDiary: string[];
    recentReactions: AgentReaction[];
  };
  event: AgentBrainEvent;
};

export const agentBrainOutputSchema = z.object({
  behavior: z.object({
    reaction: agentReactionSchema,
    outwardText: z.string(),
    intendedAction: z.string(),
  }),
  diary: z.object({
    fragment: z.string(),
    traceSummary: z.string(),
  }),
  summary: z.object({
    mood: z.string(),
    next: z.string(),
  }),
  stateChanges: z
    .object({
      pressure: z.number().optional(),
      loneliness: z.number().optional(),
      futureSense: z.number().optional(),
      selfSense: z.number().optional(),
      receptivity: z.number().optional(),
      autonomy: z.number().optional(),
      trust: z.number().optional(),
    })
    .default({}),
  relationshipChanges: z
    .array(
      z.object({
        relationshipId: z.string(),
        warmthDelta: z.number(),
        tensionDelta: z.number(),
        reason: z.string(),
      }),
    )
    .default([]),
  memory: z.object({
    internalThought: z.string(),
  }),
  meta: z.object({
    source: z.literal("fake_resolver"),
    fallbackUsed: z.boolean(),
  }),
});

export type AgentBrainOutput = z.infer<typeof agentBrainOutputSchema>;
