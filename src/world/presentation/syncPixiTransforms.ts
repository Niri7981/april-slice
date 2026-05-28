import type { Container, Graphics as PixiGraphics } from "pixi.js";
import type { AgentBody } from "../../entities/agent/agentMovement";
import type { Body, Vector } from "../../entities/core/body";

type MutableRef<T> = {
  current: T | null;
};

export type WorldPixiRefs = {
  stageRef: MutableRef<Container>;
  playerRef: MutableRef<PixiGraphics>;
  agentRef: MutableRef<PixiGraphics>;
  facingRef: MutableRef<PixiGraphics>;
};

export const syncPixiTransforms = ({
  refs,
  camera,
  player,
  agent,
}: {
  refs: WorldPixiRefs;
  camera: Vector;
  player: Body;
  agent: AgentBody;
}) => {
  if (refs.stageRef.current) {
    refs.stageRef.current.position.set(-camera.x, -camera.y);
  }
  if (refs.playerRef.current) {
    refs.playerRef.current.position.set(player.x, player.y);
  }
  if (refs.agentRef.current) {
    refs.agentRef.current.position.set(agent.x, agent.y);
  }
  if (refs.facingRef.current) {
    refs.facingRef.current.position.set(agent.x, agent.y);
    refs.facingRef.current.rotation = Math.atan2(agent.facing.y, agent.facing.x);
  }
};
