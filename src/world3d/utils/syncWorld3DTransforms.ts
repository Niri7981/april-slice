import type { Group } from "three";
import type { AgentBody } from "../../entities/agent/agentMovement";
import type { Body } from "../../entities/core/body";
import { getFacingYaw, projectWorldPosition } from "./projectWorldPosition";

type MutableRef<T> = {
  current: T | null;
};

export type World3DRefs = {
  playerRef: MutableRef<Group>;
  agentRef: MutableRef<Group>;
  facingRef: MutableRef<Group>;
};

export const syncWorld3DTransforms = ({
  refs,
  player,
  agent,
}: {
  refs: World3DRefs;
  player: Body;
  agent: AgentBody;
}) => {
  if (refs.playerRef.current) {
    refs.playerRef.current.position.set(...projectWorldPosition(player, 14));
  }

  if (refs.agentRef.current) {
    refs.agentRef.current.position.set(...projectWorldPosition(agent, 14));
    refs.agentRef.current.rotation.y = getFacingYaw(agent.facing);
  }

  if (refs.facingRef.current) {
    refs.facingRef.current.position.set(...projectWorldPosition(agent, 28));
    refs.facingRef.current.rotation.y = getFacingYaw(agent.facing);
  }
};
