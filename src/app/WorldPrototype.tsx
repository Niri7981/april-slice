import { Application, extend, useTick } from "@pixi/react";
import { Container, Graphics, type Graphics as PixiGraphics } from "pixi.js";
import { useEffect, useMemo, useRef } from "react";
import { createAgentBody, createPlayerBody, type Body, type Vector } from "../entities/body";
import { createCamera, getCameraTarget, moveCameraToward } from "../entities/camera";
import { getMoveDirection, moveBody } from "../entities/playerMovement";
import { viewportSize, worldSize } from "../world/worldConfig";
import { drawAgent, drawPlayer, drawWorld } from "../world/worldRenderers";

extend({ Container, Graphics });

const WorldStage = () => {
  const keys = useRef(new Set<string>());
  const player = useRef<Body>(createPlayerBody());
  const camera = useRef<Vector>(createCamera());
  const stageRef = useRef<Container | null>(null);
  const playerRef = useRef<PixiGraphics | null>(null);
  const agent = useMemo<Body>(() => createAgentBody(), []);

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

    player.current = nextPlayer;
    camera.current = nextCamera;

    if (stageRef.current) {
      stageRef.current.position.set(-nextCamera.x, -nextCamera.y);
    }
    if (playerRef.current) {
      playerRef.current.position.set(nextPlayer.x, nextPlayer.y);
    }
  });

  return (
    <pixiContainer ref={stageRef}>
      <pixiGraphics draw={drawWorld} />
      <pixiGraphics x={agent.x} y={agent.y} draw={drawAgent} />
      <pixiGraphics
        ref={playerRef}
        x={player.current.x}
        y={player.current.y}
        draw={drawPlayer}
      />
    </pixiContainer>
  );
};

export function WorldPrototype() {
  return (
    <main className="world-prototype-shell">
      <div className="world-prototype-label" aria-hidden="true">
        April Slice world prototype
      </div>
      <section className="world-prototype-frame" aria-label="April Slice world prototype">
        <Application
          background={0x20251f}
          width={viewportSize.width}
          height={viewportSize.height}
          antialias={false}
          autoDensity
          resolution={window.devicePixelRatio || 1}
          className="world-prototype-canvas"
        >
          <WorldStage />
        </Application>
      </section>
    </main>
  );
}
