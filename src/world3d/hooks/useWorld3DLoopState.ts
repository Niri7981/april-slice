import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";
import { dayStartMinute } from "../../agentMind/schedule";
import { createScheduledAgentBody } from "../../entities/agent/agentMovement";
import { createPlayerBody, type Body, type Vector } from "../../entities/core/body";
import { createCamera } from "../../entities/camera/camera";
import {
  syncWorld3DTransforms,
  type World3DRefs,
} from "../utils/syncWorld3DTransforms";

export type World3DLoopTelemetry = {
  worldMinute: number;
  echoIntensity: number;
  pressure: number;
  paused: boolean;
};

type UseWorld3DLoopStateOptions = {
  day: number;
  pressure: number;
  paused: boolean;
  onWorldMinuteChanged: (minute: number) => void;
};

export const useWorld3DLoopState = ({
  day,
  pressure,
  paused,
  onWorldMinuteChanged,
}: UseWorld3DLoopStateOptions) => {
  const player = useRef<Body>(createPlayerBody());
  const agent = useRef(createScheduledAgentBody());
  const camera = useRef<Vector>(createCamera());
  const worldMinute = useRef(dayStartMinute);
  const playerRef = useRef<Group | null>(null);
  const agentRef = useRef<Group | null>(null);
  const facingRef = useRef<Group | null>(null);
  const dayCompleteFired = useRef(false);
  const lastContextKey = useRef<string | null>(null);
  const lastDisplayMinute = useRef<number | null>(null);
  const telemetryRef = useRef<World3DLoopTelemetry>({
    worldMinute: dayStartMinute,
    echoIntensity: 0,
    pressure,
    paused,
  });

  const refs: World3DRefs = useMemo(
    () => ({
      playerRef,
      agentRef,
      facingRef,
    }),
    [],
  );

  useEffect(() => {
    player.current = createPlayerBody();
    agent.current = createScheduledAgentBody();
    camera.current = createCamera();
    worldMinute.current = dayStartMinute;
    dayCompleteFired.current = false;
    lastContextKey.current = null;
    lastDisplayMinute.current = dayStartMinute;
    telemetryRef.current.worldMinute = dayStartMinute;
    telemetryRef.current.echoIntensity = 0;
    telemetryRef.current.pressure = pressure;
    telemetryRef.current.paused = paused;
    syncWorld3DTransforms({
      refs,
      player: player.current,
      agent: agent.current,
    });
    onWorldMinuteChanged(dayStartMinute);
  }, [day, onWorldMinuteChanged, paused, pressure, refs]);

  useEffect(() => {
    telemetryRef.current.pressure = pressure;
  }, [pressure]);

  useEffect(() => {
    telemetryRef.current.paused = paused;
  }, [paused]);

  return {
    refs,
    player,
    agent,
    camera,
    worldMinute,
    dayCompleteFired,
    lastContextKey,
    lastDisplayMinute,
    telemetryRef,
  };
};
