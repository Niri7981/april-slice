import { extend } from "@pixi/react";
import { Container, Graphics, Text } from "pixi.js";
import type { EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { AgentSignalState } from "../../game/agentState";
import type { WorldNodeId } from "../data/worldGraph";
import type { WorldTimeOfDay } from "../systems/worldTime";
import {
  AgentSprite,
  NotePaperSprite,
  NpcLayer,
  PlayerSprite,
  WorldMapSprite,
} from "./WorldSprites";
import { useWorldLoop } from "../hooks/useWorldLoop";

extend({ Container, Graphics, Text });

export type { EchoBehaviorEffect };

type WorldStageProps = {
  day: number;
  paused: boolean;
  noteAvailable: boolean;
  agentState: AgentSignalState;
  echoEffect: EchoBehaviorEffect | null;
  onNotePicked: () => void;
  onDayComplete: () => void;
  onWorldContextChanged: (scene: WorldNodeId, timeOfDay: WorldTimeOfDay) => void;
};

export const WorldStage = (props: WorldStageProps) => {
  const { refs, snapshot } = useWorldLoop(props);

  return (
    <pixiContainer ref={refs.stageRef}>
      <WorldMapSprite />
      <NotePaperSprite visible={props.noteAvailable} />
      <NpcLayer />
      <AgentSprite
        agent={snapshot.agent}
        agentRef={refs.agentRef}
        facingRef={refs.facingRef}
      />
      <PlayerSprite player={snapshot.player} playerRef={refs.playerRef} />
    </pixiContainer>
  );
};
