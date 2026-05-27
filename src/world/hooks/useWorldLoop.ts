import { useTick } from "@pixi/react";
import { Container, type Graphics as PixiGraphics } from "pixi.js";
import { useEffect, useRef } from "react";
import {
  getAgentSpeedMultiplier,
  shouldPauseAtSchoolGate,
  type EchoBehaviorEffect,
} from "../../agentMind/behaviorEffects";
import { dayStartMinute, getScheduleEntryForMinute } from "../../agentMind/schedule";
import {
  assignAgentTarget,
  createScheduledAgentBody,
  moveAgentAlongPath,
} from "../../entities/agent/agentMovement";
import { createPlayerBody, type Body, type Vector } from "../../entities/core/body";
import { createCamera, getCameraTarget, moveCameraToward } from "../../entities/camera/camera";
import { getMoveDirection, moveBody } from "../../entities/player/playerMovement";
import type { AgentSignalState } from "../../game/agentState";
import { viewportSize, worldSize } from "../data/worldConfig";
import { getNearestWorldNodeId, worldNodes, type WorldNodeId } from "../data/worldGraph";
import {
  getDistance,
  isDayComplete,
  isNotePickupTriggered,
} from "../systems/worldInteractions";
import {
  advanceWorldMinute,
  getTimeOfDayForMinute,
  type WorldTimeOfDay,
} from "../systems/worldTime";

type UseWorldLoopOptions = {
  day: number;
  paused: boolean;
  noteAvailable: boolean;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  onNotePicked: () => void;
  onDayComplete: () => void;
  onWorldContextChanged: (scene: WorldNodeId, timeOfDay: WorldTimeOfDay) => void;
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
}: UseWorldLoopOptions) => {
  const keys = useRef(new Set<string>());
  const player = useRef<Body>(createPlayerBody());
  const agent = useRef(createScheduledAgentBody());
  const camera = useRef<Vector>(createCamera());
  const worldMinute = useRef(dayStartMinute);
  const stageRef = useRef<Container | null>(null);
  const playerRef = useRef<PixiGraphics | null>(null);
  const agentRef = useRef<PixiGraphics | null>(null);
  const facingRef = useRef<PixiGraphics | null>(null);
  const eWasDown = useRef(false);
  const dayCompleteFired = useRef(false);
  const schoolPauseRemaining = useRef(0);
  const schoolPauseEffectId = useRef<string | null>(null);
  const lastContextKey = useRef<string | null>(null);

  useEffect(() => {
    keys.current.clear();
    player.current = createPlayerBody();
    agent.current = createScheduledAgentBody();
    camera.current = createCamera();
    worldMinute.current = dayStartMinute;
    eWasDown.current = false;
    dayCompleteFired.current = false;
    schoolPauseRemaining.current = 0;
    schoolPauseEffectId.current = null;
    lastContextKey.current = null;
  }, [day]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keys.current.add(event.key.toLowerCase());
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useTick((ticker) => {
    if (paused) {
      return;
    }

    const dt = ticker.deltaMS / 1000;
    const direction = getMoveDirection(keys.current);
    const nextPlayer = moveBody(player.current, direction, dt, worldSize);
    const nextCamera = moveCameraToward(
      camera.current,
      getCameraTarget(nextPlayer, viewportSize, worldSize),
    );

    worldMinute.current = advanceWorldMinute(worldMinute.current, dt);
    const currentScene = getNearestWorldNodeId(nextPlayer);
    const currentTimeOfDay = getTimeOfDayForMinute(worldMinute.current);
    const contextKey = `${currentScene}:${currentTimeOfDay}`;

    if (lastContextKey.current !== contextKey) {
      lastContextKey.current = contextKey;
      onWorldContextChanged(currentScene, currentTimeOfDay);
    }

    const scheduleEntry = getScheduleEntryForMinute(worldMinute.current);
    const scheduledAgent = assignAgentTarget(agent.current, scheduleEntry.targetNodeId);
    const canPauseAtGate =
      shouldPauseAtSchoolGate(agentState, echoEffect) &&
      scheduleEntry.targetNodeId === "classroom" &&
      getDistance(scheduledAgent, worldNodes.schoolGate) <= 12 &&
      schoolPauseEffectId.current !== (echoEffect?.id ?? "state-pressure");

    if (canPauseAtGate) {
      schoolPauseRemaining.current = 2.6;
      schoolPauseEffectId.current = echoEffect?.id ?? "state-pressure";
    }

    const nextAgent =
      schoolPauseRemaining.current > 0
        ? scheduledAgent
        : moveAgentAlongPath(
            scheduledAgent,
            dt,
            getAgentSpeedMultiplier(agentState, echoEffect),
          );

    schoolPauseRemaining.current = Math.max(0, schoolPauseRemaining.current - dt);

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

    if (stageRef.current) {
      stageRef.current.position.set(-nextCamera.x, -nextCamera.y);
    }
    if (playerRef.current) {
      playerRef.current.position.set(nextPlayer.x, nextPlayer.y);
    }
    if (agentRef.current) {
      agentRef.current.position.set(nextAgent.x, nextAgent.y);
    }
    if (facingRef.current) {
      facingRef.current.position.set(nextAgent.x, nextAgent.y);
      facingRef.current.rotation = Math.atan2(nextAgent.facing.y, nextAgent.facing.x);
    }
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
