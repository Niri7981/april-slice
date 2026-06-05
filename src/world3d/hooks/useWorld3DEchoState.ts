import { useEffect, useRef, type RefObject } from "react";
import type { EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { World3DLoopTelemetry } from "./useWorld3DLoopState";

type AgentMotionEchoResult = {
  nextEchoPauseRemaining: number;
  nextAnchorPauseRemaining: number;
  nextAnchorPauseEffectId: string | null;
};

type UseWorld3DEchoStateOptions = {
  day: number;
  echoEffect: EchoBehaviorEffect | null;
  telemetryRef: RefObject<World3DLoopTelemetry>;
};

export const useWorld3DEchoState = ({
  day,
  echoEffect,
  telemetryRef,
}: UseWorld3DEchoStateOptions) => {
  const echoPauseRemaining = useRef(0);
  const echoEffectRemaining = useRef(0);
  const activeEchoEffectId = useRef<string | null>(null);
  const anchorPauseRemaining = useRef(0);
  const anchorPauseEffectId = useRef<string | null>(null);

  const resetFrameState = () => {
    echoPauseRemaining.current = 0;
    echoEffectRemaining.current = 0;
    activeEchoEffectId.current = null;
    anchorPauseRemaining.current = 0;
    anchorPauseEffectId.current = null;
    telemetryRef.current.echoIntensity = 0;
  };

  useEffect(() => {
    resetFrameState();
  }, [day, telemetryRef]);

  useEffect(() => {
    if (!echoEffect) {
      resetFrameState();
      return;
    }

    if (activeEchoEffectId.current === echoEffect.id) {
      return;
    }

    activeEchoEffectId.current = echoEffect.id;
    echoPauseRemaining.current = echoEffect.immediatePauseSeconds;
    echoEffectRemaining.current = echoEffect.durationSeconds;
    telemetryRef.current.echoIntensity = 1;
  }, [echoEffect, telemetryRef]);

  const getActiveEcho = () =>
    echoEffect &&
    activeEchoEffectId.current === echoEffect.id &&
    echoEffectRemaining.current > 0
      ? echoEffect
      : null;

  const applyAgentMotionResult = ({
    nextEchoPauseRemaining,
    nextAnchorPauseRemaining,
    nextAnchorPauseEffectId,
  }: AgentMotionEchoResult) => {
    echoPauseRemaining.current = nextEchoPauseRemaining;
    anchorPauseRemaining.current = nextAnchorPauseRemaining;
    anchorPauseEffectId.current = nextAnchorPauseEffectId;
  };

  const updateEffectProgress = ({
    activeEcho,
    delta,
    onEchoEffectExpired,
  }: {
    activeEcho: EchoBehaviorEffect | null;
    delta: number;
    onEchoEffectExpired: () => void;
  }) => {
    if (!activeEcho) {
      telemetryRef.current.echoIntensity = 0;
      return;
    }

    echoEffectRemaining.current = Math.max(0, echoEffectRemaining.current - delta);

    if (echoEffectRemaining.current === 0) {
      activeEchoEffectId.current = null;
      onEchoEffectExpired();
    }

    telemetryRef.current.echoIntensity =
      activeEcho.durationSeconds > 0
        ? echoEffectRemaining.current / activeEcho.durationSeconds
        : 0;
  };

  return {
    echoPauseRemaining,
    anchorPauseRemaining,
    anchorPauseEffectId,
    resetFrameState,
    getActiveEcho,
    applyAgentMotionResult,
    updateEffectProgress,
  };
};
