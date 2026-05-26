import { extend, useTick } from "@pixi/react";
import { Container, Graphics, type Graphics as PixiGraphics } from "pixi.js";
import { useEffect, useRef } from "react";
import { dayEndMinute, dayStartMinute, getScheduleEntryForMinute, worldMinutesPerSecond } from "../agentMind/schedule";
import { assignAgentTarget, createScheduledAgentBody, moveAgentAlongPath } from "../entities/agentMovement";
import { createPlayerBody, type Body, type Vector } from "../entities/body";
import { createCamera, getCameraTarget, moveCameraToward } from "../entities/camera";
import { getMoveDirection, moveBody } from "../entities/playerMovement";
import { viewportSize, worldSize } from "./worldConfig";
import { drawAgent, drawPlayer, drawWorld } from "./worldRenderers";

extend({ Container, Graphics });

const advanceWorldMinute = (currentMinute: number, dt: number) => {
  const nextMinute = currentMinute + worldMinutesPerSecond * dt;
  return Math.min(nextMinute, dayEndMinute);
};

export const WorldStage = () => {
  const keys = useRef(new Set<string>());
  const player = useRef<Body>(createPlayerBody());
  const agent = useRef(createScheduledAgentBody());
  const camera = useRef<Vector>(createCamera());
  const worldMinute = useRef(dayStartMinute);
  const stageRef = useRef<Container | null>(null);
  const playerRef = useRef<PixiGraphics | null>(null);
  const agentRef = useRef<PixiGraphics | null>(null);

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
    const dt = ticker.deltaMS / 1000;
    const direction = getMoveDirection(keys.current);
    const nextPlayer = moveBody(player.current, direction, dt, worldSize);
    const nextCamera = moveCameraToward(
      camera.current,
      getCameraTarget(nextPlayer, viewportSize, worldSize),
    );

    worldMinute.current = advanceWorldMinute(worldMinute.current, dt);
    const scheduleEntry = getScheduleEntryForMinute(worldMinute.current);
    const scheduledAgent = assignAgentTarget(agent.current, scheduleEntry.targetNodeId);
    const nextAgent = moveAgentAlongPath(scheduledAgent, dt);

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
  });

  return (
    <pixiContainer ref={stageRef}>
      <pixiGraphics draw={drawWorld} />
      <pixiGraphics
        ref={agentRef}
        x={agent.current.x}
        y={agent.current.y}
        draw={drawAgent}
      />
      <pixiGraphics
        ref={playerRef}
        x={player.current.x}
        y={player.current.y}
        draw={drawPlayer}
      />
    </pixiContainer>
  );
};
