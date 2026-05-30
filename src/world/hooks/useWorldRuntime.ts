import { useEffect, useReducer, useRef } from "react";
import { buildDayRecord } from "../../game/day/dayRecord";
import { resolveEchoOutcome } from "../../game/echo/echoResolution";
import { requestInitialHand } from "../../llm/initialHandApiClient";
import { resolveAgentBrainFake } from "../../llm/fakeResolver";
import type { WorldNodeId } from "../data/worldGraph";
import type { WorldTimeOfDay } from "../systems/worldTime";
import { worldReducer } from "../runtime/worldReducer";
import {
  initialAgentState,
  initialRelationships,
  initialWorldState,
} from "../runtime/worldState";

export const useWorldRuntime = () => {
  const [state, dispatch] = useReducer(worldReducer, initialWorldState);
  const latestAgentState = useRef(state.agentState);
  const latestRelationships = useRef(state.relationships);
  const latestDailyEchoes = useRef(state.dailyEchoes);
  const dayStartAgentState = useRef(initialAgentState);
  const dayStartRelationships = useRef(initialRelationships);

  useEffect(() => {
    const initialHandApiUrl = import.meta.env.VITE_INITIAL_HAND_API_URL;

    if (!initialHandApiUrl) {
      return;
    }

    void requestInitialHand({
      apiUrl: initialHandApiUrl,
      input: {
        name: "April",
        birthDate: "2008-04-17",
      },
    })
      .then((initialHand) => {
        dispatch({ type: "initialHand/resolved", initialHand });
      })
      .catch(() => {
        // Keep the explicit FALLBACK Initial Hand. The day flow should not break.
      });
  }, []);

  const recordWorldContext = (scene: WorldNodeId, timeOfDay: WorldTimeOfDay) => {
    dispatch({ type: "context/changed", scene, timeOfDay });
  };

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

    if (!noteText) {
      return;
    }

    const resolution = resolveEchoOutcome(
      {
        language: "zh",
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
        currentState: latestAgentState.current,
        relationships: latestRelationships.current,
        dayContext: {
          day: state.day,
          timeOfDay: state.context.timeOfDay,
          scene: state.context.scene,
          visitedScenes: state.context.visitedScenes,
        },
        echoContext: {
          baseEchoes: 2,
          extraWindows: 0,
          usedEchoes: latestDailyEchoes.current.length,
          remainingEchoes: Math.max(0, 2 - latestDailyEchoes.current.length),
          noteEcho: noteText,
          spatialTraces: [],
        },
        memory: {
          recentDiary: latestDailyEchoes.current
            .map((echo) => echo.diaryFragment)
            .slice(-3),
          recentReactions: latestDailyEchoes.current
            .map((echo) => echo.reaction)
            .slice(-3),
        },
        event: {
          kind: "note",
          noteText,
          scene: state.context.scene,
        },
      },
      resolveAgentBrainFake,
    );
    const nextEchoes = [...latestDailyEchoes.current, resolution.record];

    latestAgentState.current = resolution.stateDrift.nextState;
    latestRelationships.current = resolution.relationshipDrift.nextRelationships;
    latestDailyEchoes.current = nextEchoes;

    dispatch({
      type: "echo/applied",
      agentState: resolution.stateDrift.nextState,
      relationships: resolution.relationshipDrift.nextRelationships,
      dailyEchoes: nextEchoes,
      echoEffect: {
        id: resolution.record.id,
        reaction: resolution.record.reaction,
      },
    });
  };

  const completeDay = () => {
    if (state.diary.open) {
      return;
    }

    dispatch({
      type: "diary/opened",
      record: buildDayRecord({
        day: state.day,
        visitedScenes: state.context.visitedScenes,
        echoes: latestDailyEchoes.current,
        stateStart: dayStartAgentState.current,
        stateEnd: latestAgentState.current,
        relationshipsStart: dayStartRelationships.current,
        relationshipsEnd: latestRelationships.current,
      }),
    });
  };

  const closeDiary = () => {
    dayStartAgentState.current = latestAgentState.current;
    dayStartRelationships.current = latestRelationships.current;
    latestDailyEchoes.current = [];
    dispatch({ type: "diary/closed" });
  };

  return {
    state,
    actions: {
      openNotePaper,
      cancelNotePaper,
      changeNoteDraft,
      recordWorldContext,
      sendNoteEcho,
      completeDay,
      closeDiary,
    },
  };
};
