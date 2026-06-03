import { useRef, type Dispatch } from "react";
import { createEchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import { resolveEchoOutcome } from "../../game/echo/echoResolution";
import { resolveAgentBrainFake } from "../../llm/echo/fakeResolver";
import { resolveAgentBrainLlm } from "../../llm/echo/llmResolver";
import type { WorldRuntimeAction } from "../runtime/worldReducer";
import { initialAgentState, initialRelationships } from "../runtime/worldState";
import type { WorldRuntimeState } from "../runtime/worldState";

type UseWorldEchoOptions = {
  state: WorldRuntimeState;
  dispatch: Dispatch<WorldRuntimeAction>;
  initialAgentState: typeof initialAgentState;
  initialRelationships: typeof initialRelationships;
};

const buildNoteEchoInput = ({
  state,
  noteText,
  latestAgentState,
  latestRelationships,
  latestDailyEchoes,
}: {
  state: WorldRuntimeState;
  noteText: string;
  latestAgentState: WorldRuntimeState["agentState"];
  latestRelationships: WorldRuntimeState["relationships"];
  latestDailyEchoes: WorldRuntimeState["dailyEchoes"];
}) => ({
  language: "zh" as const,
  profile: {
    id: "april-agent",
    name: "April",
    age: 17,
    summary: "海边小镇四月里的高中生，习惯把想法藏在动作里。",
    keywords: ["四月", "海边", "放学路", "迟疑"],
  },
  openingHand: {
    summary: state.initialHand.summary,
    cards: state.initialHand.cards,
    tags: state.initialHand.tags,
  },
  currentState: latestAgentState,
  relationships: latestRelationships,
  dayContext: {
    day: state.day,
    timeOfDay: state.context.timeOfDay,
    scene: state.context.scene,
    visitedScenes: state.context.visitedScenes,
  },
  echoContext: {
    baseEchoes: 2,
    extraWindows: 0,
    usedEchoes: latestDailyEchoes.length,
    remainingEchoes: Math.max(0, 2 - latestDailyEchoes.length),
    noteEcho: noteText,
    spatialTraces: [],
  },
  memory: {
    recentDiary: latestDailyEchoes.map((echo) => echo.diaryFragment).slice(-3),
    recentReactions: latestDailyEchoes.map((echo) => echo.reaction).slice(-3),
  },
  event: {
    kind: "note" as const,
    noteText,
    scene: state.context.scene,
  },
});

export const useWorldEcho = ({
  state,
  dispatch,
  initialAgentState,
  initialRelationships,
}: UseWorldEchoOptions) => {
  const latestAgentState = useRef(state.agentState);
  const latestRelationships = useRef(state.relationships);
  const latestDailyEchoes = useRef(state.dailyEchoes);
  const dayStartAgentState = useRef(initialAgentState);
  const dayStartRelationships = useRef(initialRelationships);

  const openNotePaper = () => {
    dispatch({ type: "note/open" });
  };

  const cancelNotePaper = () => {
    dispatch({ type: "note/cancel" });
  };

  const changeNoteDraft = (draft: string) => {
    dispatch({ type: "note/draftChanged", draft });
  };

  const sendNoteEcho = () => {
    const noteText = state.note.draft.trim();
    const echoApiUrl = import.meta.env.VITE_ECHO_API_URL;

    if (!noteText) {
      return;
    }

    const input = buildNoteEchoInput({
      state,
      noteText,
      latestAgentState: latestAgentState.current,
      latestRelationships: latestRelationships.current,
      latestDailyEchoes: latestDailyEchoes.current,
    });

    void resolveAgentBrainLlm({
      apiUrl: echoApiUrl,
      input,
      fallbackResolver: resolveAgentBrainFake,
    }).then((brainOutput) => {
      const resolution = resolveEchoOutcome(input, () => brainOutput);
      const nextEchoes = [...latestDailyEchoes.current, resolution.record];

      latestAgentState.current = resolution.stateDrift.nextState;
      latestRelationships.current = resolution.relationshipDrift.nextRelationships;
      latestDailyEchoes.current = nextEchoes;

      dispatch({
        type: "echo/applied",
        agentState: resolution.stateDrift.nextState,
        relationships: resolution.relationshipDrift.nextRelationships,
        dailyEchoes: nextEchoes,
        echoEffect: createEchoBehaviorEffect({
          id: resolution.record.id,
          reaction: resolution.record.reaction,
          intendedAction: resolution.brainOutput.behavior.intendedAction,
        }),
      });
    });
  };

  const resetForNextDay = () => {
    dayStartAgentState.current = latestAgentState.current;
    dayStartRelationships.current = latestRelationships.current;
    latestDailyEchoes.current = [];
  };

  return {
    actions: {
      openNotePaper,
      cancelNotePaper,
      changeNoteDraft,
      sendNoteEcho,
    },
    refs: {
      latestAgentState,
      latestRelationships,
      latestDailyEchoes,
      dayStartAgentState,
      dayStartRelationships,
    },
    resetForNextDay,
  };
};
