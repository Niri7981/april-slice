import { useFrame } from "@react-three/fiber";
import { type EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { AgentSignalState } from "../../game/state/agentState";
import type { WorldNodeId } from "../../world/data/worldGraph";
import { getWorldContextSnapshot } from "../../world/systems/position/worldContext";
import {
  isDayComplete,
  isNotePickupTriggered,
} from "../../world/systems/position/worldInteractions";
import {
  advanceAgentMotion,
  advancePlayerMotion,
} from "../../world/systems/motion/worldMotion";
import {
  advanceWorldMinute,
  getDisplayWorldMinute,
  type WorldTimeOfDay,
} from "../../world/systems/time/worldTime";
import { useWorldInput } from "../../world/hooks/useWorldInput";
import {
  syncWorld3DTransforms,
} from "../utils/syncWorld3DTransforms";
import { updateWorld3DCamera } from "../utils/updateWorld3DCamera";
import { useWorld3DEchoState } from "./useWorld3DEchoState";
import { useWorld3DLoopState } from "./useWorld3DLoopState";

type UseWorld3DLoopOptions = {
  day: number;
  paused: boolean;
  noteAvailable: boolean;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  onNotePicked: () => void;
  onDayComplete: () => void;
  onEchoEffectExpired: () => void;
  onWorldContextChanged: (scene: WorldNodeId, timeOfDay: WorldTimeOfDay) => void;
  onWorldMinuteChanged: (minute: number) => void;
};

export const useWorld3DLoop = ({
  day,
  paused,
  noteAvailable,
  agentState,
  echoEffect,
  onNotePicked,
  onDayComplete,
  onEchoEffectExpired,
  onWorldContextChanged,
  onWorldMinuteChanged,
}: UseWorld3DLoopOptions) => {
  const { keys, eWasDown } = useWorldInput(day);
  const {
    refs,
    player,
    agent,
    camera,
    worldMinute,
    dayCompleteFired,
    lastContextKey,
    lastDisplayMinute,
    telemetryRef,
  } = useWorld3DLoopState({
    day,
    pressure: agentState.pressure,
    paused,
    onWorldMinuteChanged,
  });
  const echoState = useWorld3DEchoState({
    day,
    echoEffect,
    telemetryRef,
  });

  useFrame((state, delta) => {
    if (!paused) {
      const { nextPlayer, nextCamera } = advancePlayerMotion({
        player: player.current,
        camera: camera.current,
        keys: keys.current,
        dt: delta,
      });

      worldMinute.current = advanceWorldMinute(worldMinute.current, delta);
      telemetryRef.current.worldMinute = worldMinute.current;
      telemetryRef.current.pressure = agentState.pressure;
      telemetryRef.current.paused = false;
      const displayMinute = getDisplayWorldMinute(worldMinute.current);

      if (lastDisplayMinute.current !== displayMinute) {
        lastDisplayMinute.current = displayMinute;
        onWorldMinuteChanged(displayMinute);
      }

      const worldContext = getWorldContextSnapshot(nextPlayer, worldMinute.current);

      if (lastContextKey.current !== worldContext.key) {
        lastContextKey.current = worldContext.key;
        onWorldContextChanged(worldContext.scene, worldContext.timeOfDay);
      }

      const activeEcho = echoState.getActiveEcho();

      const {
        nextAgent,
        nextEchoPauseRemaining,
        nextAnchorPauseRemaining,
        nextAnchorPauseEffectId,
      } = advanceAgentMotion({
        agent: agent.current,
        worldMinute: worldMinute.current,
        dt: delta,
        agentState,
        echoEffect: activeEcho,
        echoPauseRemaining: echoState.echoPauseRemaining.current,
        anchorPauseRemaining: echoState.anchorPauseRemaining.current,
        anchorPauseEffectId: echoState.anchorPauseEffectId.current,
      });

      echoState.applyAgentMotionResult({
        nextEchoPauseRemaining,
        nextAnchorPauseRemaining,
        nextAnchorPauseEffectId,
      });
      echoState.updateEffectProgress({
        activeEcho,
        delta,
        onEchoEffectExpired,
      });

      const eIsDown = keys.current.has("e");
      if (
        isNotePickupTriggered({
          noteAvailable,
          eIsDown,
          eWasDown: eWasDown.current,
          player: nextPlayer,
        })
      ) {
        onNotePicked();
      }
      eWasDown.current = eIsDown;

      if (
        isDayComplete({
          alreadyFired: dayCompleteFired.current,
          worldMinute: worldMinute.current,
          player: nextPlayer,
          agent: nextAgent,
        })
      ) {
        dayCompleteFired.current = true;
        onDayComplete();
      }

      player.current = nextPlayer;
      camera.current = nextCamera;
      agent.current = nextAgent;

      syncWorld3DTransforms({
        refs,
        player: nextPlayer,
        agent: nextAgent,
      });
    }

    updateWorld3DCamera({
      camera: state.camera,
      player: player.current,
      delta,
    });
  });

  return {
    refs,
    telemetryRef,
  };
};
