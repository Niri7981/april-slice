import { viewportSize, worldSize } from "../world/worldConfig";
import { Application } from "@pixi/react";
import { WorldStage } from "../world/WorldStage";

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
