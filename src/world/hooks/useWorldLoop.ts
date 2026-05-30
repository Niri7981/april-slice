import { useTick } from "@pixi/react";
import { Container, type Graphics as PixiGraphics } from "pixi.js";
import { useEffect, useRef } from "react";
import { type EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import { dayStartMinute } from "../../agentMind/schedule";
import { createScheduledAgentBody } from "../../entities/agent/agentMovement";
import { createPlayerBody, type Body, type Vector } from "../../entities/core/body";
import { createCamera } from "../../entities/camera/camera";
import type { AgentSignalState } from "../../game/state/agentState";
import { type WorldNodeId } from "../data/worldGraph";
import { syncPixiTransforms } from "../presentation/syncPixiTransforms";
import { getWorldContextSnapshot } from "../systems/worldContext";
import { isDayComplete, isNotePickupTriggered } from "../systems/worldInteractions";
import { advanceAgentMotion, advancePlayerMotion } from "../systems/worldMotion";
import {
  advanceWorldMinute,
  getDisplayWorldMinute,
  type WorldTimeOfDay,
} from "../systems/worldTime";
import { useWorldInput } from "./useWorldInput";

type UseWorldLoopOptions = {
  day: number;
  paused: boolean;
  noteAvailable: boolean;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  onNotePicked: () => void;
  onDayComplete: () => void;
  onWorldContextChanged: (scene: WorldNodeId, timeOfDay: WorldTimeOfDay) => void;
  onWorldMinuteChanged: (minute: number) => void;
};

export const useWorldLoop = ({
  day,
  paused,
  noteAvailable,
  agentState,
  echoEffect,
  onNotePicked,
  onDayComplete,
  onWorldContextChanged,
  onWorldMinuteChanged,
}: UseWorldLoopOptions) => {
  const { keys, eWasDown } = useWorldInput(day);
  const player = useRef<Body>(createPlayerBody());
  const agent = useRef(createScheduledAgentBody());
  const camera = useRef<Vector>(createCamera());
  const worldMinute = useRef(dayStartMinute);
  const stageRef = useRef<Container | null>(null);
  const playerRef = useRef<PixiGraphics | null>(null);
  const agentRef = useRef<PixiGraphics | null>(null);
  const facingRef = useRef<PixiGraphics | null>(null);
  const dayCompleteFired = useRef(false);
  const schoolPauseRemaining = useRef(0);
  const schoolPauseEffectId = useRef<string | null>(null);
  const lastContextKey = useRef<string | null>(null);
  const lastDisplayMinute = useRef<number | null>(null);

  useEffect(() => {
    player.current = createPlayerBody();
    agent.current = createScheduledAgentBody();
    camera.current = createCamera();
    worldMinute.current = dayStartMinute;
    dayCompleteFired.current = false;
    schoolPauseRemaining.current = 0;
    schoolPauseEffectId.current = null;
    lastContextKey.current = null;
    lastDisplayMinute.current = dayStartMinute;
    onWorldMinuteChanged(dayStartMinute);
  }, [day, onWorldMinuteChanged]);

  useTick((ticker) => {
    if (paused) {
      return;
    }

    const dt = ticker.deltaMS / 1000;
    const { nextPlayer, nextCamera } = advancePlayerMotion({
      player: player.current,
      camera: camera.current,
      keys: keys.current,
      dt,
    });

    worldMinute.current = advanceWorldMinute(worldMinute.current, dt);
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

    const { nextAgent, nextSchoolPauseRemaining, nextSchoolPauseEffectId } =
      advanceAgentMotion({
        agent: agent.current,
        worldMinute: worldMinute.current,
        dt,
        agentState,
        echoEffect,
        schoolPauseRemaining: schoolPauseRemaining.current,
        schoolPauseEffectId: schoolPauseEffectId.current,
      });
    schoolPauseRemaining.current = nextSchoolPauseRemaining;
    schoolPauseEffectId.current = nextSchoolPauseEffectId;

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

    syncPixiTransforms({
      refs: {
        stageRef,
        playerRef,
        agentRef,
        facingRef,
      },
      camera: nextCamera,
      player: nextPlayer,
      agent: nextAgent,
    });
  });

  return {
    refs: {
      stageRef,
      playerRef,
      agentRef,
      facingRef,
    },
    snapshot: {
      player: player.current,
      agent: agent.current,
    },
  };
};
