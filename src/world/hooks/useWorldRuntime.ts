import { useEffect, useReducer } from "react";
import { buildDayRecord } from "../../game/day/dayRecord";
import { requestInitialHand } from "../../llm/initial-hand/apiClient";
import type { WorldNodeId } from "../data/worldGraph";
import type { WorldTimeOfDay } from "../systems/worldTime";
import { useWorldEcho } from "./useWorldEcho";
import { worldReducer } from "../runtime/worldReducer";
import {
  initialAgentState,
  initialRelationships,
  initialWorldState,
} from "../runtime/worldState";

export const useWorldRuntime = () => {
  const [state, dispatch] = useReducer(worldReducer, initialWorldState);
  const echo = useWorldEcho({
    state,
    dispatch,
    initialAgentState,
    initialRelationships,
  });

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
      outputLanguage: "en",
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

  const clearEchoEffect = () => {
    dispatch({ type: "echo/effectExpired" });
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
        echoes: echo.refs.latestDailyEchoes.current,
        stateStart: echo.refs.dayStartAgentState.current,
        stateEnd: echo.refs.latestAgentState.current,
        relationshipsStart: echo.refs.dayStartRelationships.current,
        relationshipsEnd: echo.refs.latestRelationships.current,
      }),
    });
  };

  const closeDiary = () => {
    echo.resetForNextDay();
    dispatch({ type: "diary/closed" });
  };

  return {
    state,
    actions: {
      ...echo.actions,
      recordWorldContext,
      clearEchoEffect,
      completeDay,
      closeDiary,
    },
  };
};
