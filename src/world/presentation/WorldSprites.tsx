import type { RefObject } from "react";
import type { Graphics as PixiGraphics } from "pixi.js";
import type { AgentBody } from "../../entities/agent/agentMovement";
import type { Body } from "../../entities/core/body";
import {
  drawAgent,
  drawAgentFacingMarker,
  drawNotePaper,
  drawNpc,
  drawPlayer,
  drawWorld,
} from "./worldRenderers";
import { namedNpcs, notePaperPosition, type NamedNpc } from "../data/worldObjects";

type GraphicsRef = RefObject<PixiGraphics | null>;

export function WorldMapSprite() {
  return <pixiGraphics draw={drawWorld} />;
}

export function NotePaperSprite({ visible }: { visible: boolean }) {
  return visible ? (
    <pixiGraphics
      x={notePaperPosition.x}
      y={notePaperPosition.y}
      draw={drawNotePaper}
    />
  ) : null;
}

function NpcSprite({ npc }: { npc: NamedNpc }) {
  return (
    <>
      <pixiGraphics x={npc.position.x} y={npc.position.y} draw={drawNpc} />
      <pixiText
        text={npc.name}
        x={npc.position.x - 31}
        y={npc.position.y + 31}
        style={{
          fill: 0x2d2a24,
          fontFamily: "Fusion Pixel 12px Monospaced SC, Courier New, monospace",
          fontSize: 16,
        }}
      />
    </>
  );
}

export function NpcLayer() {
  return (
    <>
      {namedNpcs.map((npc) => (
        <NpcSprite key={npc.id} npc={npc} />
      ))}
    </>
  );
}

export function AgentSprite({
  agent,
  agentRef,
  facingRef,
}: {
  agent: AgentBody;
  agentRef: GraphicsRef;
  facingRef: GraphicsRef;
}) {
  return (
    <>
      <pixiGraphics ref={agentRef} x={agent.x} y={agent.y} draw={drawAgent} />
      <pixiGraphics
        ref={facingRef}
        x={agent.x}
        y={agent.y}
        draw={drawAgentFacingMarker}
      />
    </>
  );
}

export function PlayerSprite({
  player,
  playerRef,
}: {
  player: Body;
  playerRef: GraphicsRef;
}) {
  return (
    <pixiGraphics
      ref={playerRef}
      x={player.x}
      y={player.y}
      draw={drawPlayer}
    />
  );
}
