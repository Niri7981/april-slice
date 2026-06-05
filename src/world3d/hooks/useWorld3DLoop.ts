import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useEffect, useRef } from "react";
import { type EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import { dayStartMinute } from "../../agentMind/schedule";
import { createScheduledAgentBody } from "../../entities/agent/agentMovement";
import { createPlayerBody, type Body, type Vector } from "../../entities/core/body";
import { createCamera } from "../../entities/camera/camera";
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
import { world3dCamera } from "../data/world3dConfig";
import { projectWorldPosition } from "../utils/projectWorldPosition";
import {
  syncWorld3DTransforms,
  type World3DRefs,
} from "../utils/syncWorld3DTransforms";

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

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();

export type World3DLoopTelemetry = {
  worldMinute: number;
  echoIntensity: number;
  pressure: number;
  paused: boolean;
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
  const player = useRef<Body>(createPlayerBody());
  const agent = useRef(createScheduledAgentBody());
  const camera = useRef<Vector>(createCamera());
  const worldMinute = useRef(dayStartMinute);
  const playerRef = useRef<Group | null>(null);
  const agentRef = useRef<Group | null>(null);
  const facingRef = useRef<Group | null>(null);
  const dayCompleteFired = useRef(false);
  const echoPauseRemaining = useRef(0);
  const echoEffectRemaining = useRef(0);
  const activeEchoEffectId = useRef<string | null>(null);
  const anchorPauseRemaining = useRef(0);
  const anchorPauseEffectId = useRef<string | null>(null);
  const lastContextKey = useRef<string | null>(null);
  const lastDisplayMinute = useRef<number | null>(null);
  const telemetryRef = useRef<World3DLoopTelemetry>({
    worldMinute: dayStartMinute,
    echoIntensity: 0,
    pressure: agentState.pressure,
    paused,
  });

  const refs: World3DRefs = {
    playerRef,
    agentRef,
    facingRef,
  };

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
    telemetryRef.current.worldMinute = dayStartMinute;
    telemetryRef.current.echoIntensity = 0;
    telemetryRef.current.pressure = agentState.pressure;
    telemetryRef.current.paused = paused;
    syncWorld3DTransforms({
      refs,
      player: player.current,
      agent: agent.current,
    });
    onWorldMinuteChanged(dayStartMinute);
  }, [day, onWorldMinuteChanged]);

  useEffect(() => {
    telemetryRef.current.pressure = agentState.pressure;
  }, [agentState.pressure]);

  useEffect(() => {
    telemetryRef.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    if (!echoEffect) {
      echoPauseRemaining.current = 0;
      echoEffectRemaining.current = 0;
      activeEchoEffectId.current = null;
      telemetryRef.current.echoIntensity = 0;
      return;
    }

    if (activeEchoEffectId.current === echoEffect.id) {
      return;
    }

    activeEchoEffectId.current = echoEffect.id;
    echoPauseRemaining.current = echoEffect.immediatePauseSeconds;
    echoEffectRemaining.current = echoEffect.durationSeconds;
    telemetryRef.current.echoIntensity = 1;
  }, [echoEffect]);

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

      const activeEcho =
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
        dt: delta,
        agentState,
        echoEffect: activeEcho,
        echoPauseRemaining: echoPauseRemaining.current,
        anchorPauseRemaining: anchorPauseRemaining.current,
        anchorPauseEffectId: anchorPauseEffectId.current,
      });

      echoPauseRemaining.current = nextEchoPauseRemaining;
      anchorPauseRemaining.current = nextAnchorPauseRemaining;
      anchorPauseEffectId.current = nextAnchorPauseEffectId;

      if (activeEcho) {
        echoEffectRemaining.current = Math.max(0, echoEffectRemaining.current - delta);

        if (echoEffectRemaining.current === 0) {
          activeEchoEffectId.current = null;
          onEchoEffectExpired();
        }

        telemetryRef.current.echoIntensity =
          activeEcho.durationSeconds > 0
            ? echoEffectRemaining.current / activeEcho.durationSeconds
            : 0;
      } else {
        telemetryRef.current.echoIntensity = 0;
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

      syncWorld3DTransforms({
        refs,
        player: nextPlayer,
        agent: nextAgent,
      });
    }

    const [playerX, , playerZ] = projectWorldPosition(player.current, 14);
    const cameraLerp = 1 - Math.exp(-delta * world3dCamera.damping);

    cameraTarget.set(playerX, world3dCamera.height, playerZ + world3dCamera.distance);
    lookAtTarget.set(playerX, world3dCamera.lookAtHeight, playerZ);

    state.camera.position.lerp(cameraTarget, cameraLerp);
    state.camera.lookAt(lookAtTarget);
  });

  return {
    refs,
    telemetryRef,
  };
};
