export type GamePhase =
  | "setup"
  | "opening"
  | "investigation"
  | "light_touch"
  | "intervention"
  | "prediction"
  | "agent_turn"
  | "result";

export type DestinySeed = {
  birthDate: string;
  seedText: string;
  elements: string[];
  tensions: string[];
  openingHand: string;
};

export type AgentProfile = {
  id: string;
  name: string;
  age: number;
  hobby?: string;
  familyBackground?: string;
  summary: string;
  keywords: string[];
};

export type AgentState = {
  pressure: number;
  loneliness: number;
  freedom: number;
  futureSense: number;
  selfIdentity: number;
};

export type Relationship = {
  id: string;
  name: string;
  role: "family" | "friend" | "possible_intimacy" | "mentor";
  closeness: number;
  tension: number;
  note: string;
};

export type DiaryEntry = {
  id: string;
  dateLabel: string;
  text: string;
};

export type PlayerTouch = {
  id: string;
  label: string;
  description: string;
};

export type PlayerSignal = {
  medium: "dream" | "letter" | "book_page" | "old_photo" | "sea_wind";
  message: string;
};

export type PlayerPrediction = {
  id: string;
  label: string;
};

export type PlayerInput = {
  touch?: PlayerTouch;
  signal?: PlayerSignal;
  prediction?: PlayerPrediction;
  viewedClues: string[];
};

export type MonthScenario = {
  id: string;
  title: string;
  monthLabel: string;
  theme: string;
  openingText: string;
  pressure: string;
  phases: GamePhase[];
  touchOptions: PlayerTouch[];
  predictionOptions: PlayerPrediction[];
};

export type RelationshipChange = {
  relationshipId: string;
  closenessDelta: number;
  tensionDelta: number;
  reason: string;
};

export type MonthResult = {
  action: string;
  reason: string;
  narrative: string;
  signalReceived: boolean;
  signalInterpretation: string;
  predictionMatched: boolean;
  predictionFeedback: string;
  stateDelta: Partial<AgentState>;
  relationshipChanges: RelationshipChange[];
  nextMonthForeshadow: string;
};

export type RunState = {
  id: string;
  phase: GamePhase;
  agent?: AgentProfile;
  destiny?: DestinySeed;
  month: MonthScenario;
  state?: AgentState;
  relationships: Relationship[];
  diary: DiaryEntry[];
  playerInput: PlayerInput;
  result?: MonthResult;
};
