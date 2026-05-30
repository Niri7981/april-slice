export const AGENT_STATE_KEYS = [
  "pressure",
  "loneliness",
  "futureSense",
  "selfSense",
  "trust",
] as const;

export type AgentStateKey = (typeof AGENT_STATE_KEYS)[number];

export type AgentSignalState = Record<AgentStateKey, number>;

export type AgentStateDelta = Partial<Record<AgentStateKey, number>>;

export const buildAgentStateShape = <T>(createValue: () => T): Record<AgentStateKey, T> =>
  Object.fromEntries(AGENT_STATE_KEYS.map((key) => [key, createValue()])) as Record<
    AgentStateKey,
    T
  >;
