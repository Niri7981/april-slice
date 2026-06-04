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
import { getWorldContextSnapshot } from "../systems/position/worldContext";
import { isDayComplete, isNotePickupTriggered } from "../systems/position/worldInteractions";
import { advanceAgentMotion, advancePlayerMotion } from "../systems/motion/worldMotion";
import {
  advanceWorldMinute,
  getDisplayWorldMinute,
  type WorldTimeOfDay,
} from "../systems/time/worldTime";
import { useWorldInput } from "./useWorldInput";

type UseWorldLoopOptions = {
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

export const useWorldLoop = ({
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
  const echoPauseRemaining = useRef(0);
  const echoEffectRemaining = useRef(0);
  const activeEchoEffectId = useRef<string | null>(null);
  const anchorPauseRemaining = useRef(0);
  const anchorPauseEffectId = useRef<string | null>(null);
  const lastContextKey = useRef<string | null>(null);
  const lastDisplayMinute = useRef<number | null>(null);

  useEffect(() => {
    player.current = createPlayerBody();
    agent.current = createScheduledAgentBody();
    camera.current = createCamera();
    worldMinute.current = dayStartMinute;
    dayCompleteFired.current = false;
    echoPauseRemaining.current = 0;
    echoEffectRemaining.current = 0;
    activeEchoEffectId.current = null;
    anchorPauseRemaining.current = 0;
    anchorPauseEffectId.current = null;
    lastContextKey.current = null;
    lastDisplayMinute.current = dayStartMinute;
    onWorldMinuteChanged(dayStartMinute);
  }, [day, onWorldMinuteChanged]);

  useEffect(() => {
    if (!echoEffect) {
      echoPauseRemaining.current = 0;
      echoEffectRemaining.current = 0;
      activeEchoEffectId.current = null;
      return;
    }

    if (activeEchoEffectId.current === echoEffect.id) {
      return;
    }

    activeEchoEffectId.current = echoEffect.id;
    echoPauseRemaining.current = echoEffect.immediatePauseSeconds;
    echoEffectRemaining.current = echoEffect.durationSeconds;
  }, [echoEffect]);

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

    const activeEchoEffect =
      echoEffect &&
      activeEchoEffectId.current === echoEffect.id &&
      echoEffectRemaining.current > 0
        ? echoEffect
        : null;

    const {
      nextAgent,
      nextEchoPauseRemaining,
      nextAnchorPauseRemaining,
      nextAnchorPauseEffectId,
    } = advanceAgentMotion({
      agent: agent.current,
      worldMinute: worldMinute.current,
      dt,
      agentState,
      echoEffect: activeEchoEffect,
      echoPauseRemaining: echoPauseRemaining.current,
      anchorPauseRemaining: anchorPauseRemaining.current,
      anchorPauseEffectId: anchorPauseEffectId.current,
    });
    echoPauseRemaining.current = nextEchoPauseRemaining;
    anchorPauseRemaining.current = nextAnchorPauseRemaining;
    anchorPauseEffectId.current = nextAnchorPauseEffectId;

    if (activeEchoEffect) {
      echoEffectRemaining.current = Math.max(0, echoEffectRemaining.current - dt);

      if (echoEffectRemaining.current === 0) {
        activeEchoEffectId.current = null;
        onEchoEffectExpired();
      }
    }

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
