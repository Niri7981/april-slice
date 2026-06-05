import { Canvas } from "@react-three/fiber";
import type { EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { AgentSignalState } from "../../game/state/agentState";
import type { WorldNodeId } from "../../world/data/worldGraph";
import type { WorldTimeOfDay } from "../../world/systems/time/worldTime";
import { world3dCamera } from "../data/world3dConfig";
import { WorldScene3D } from "../scenes/WorldScene3D";

type WorldStage3DProps = {
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

export function WorldStage3D(props: WorldStage3DProps) {
  return (
    <Canvas
      className="world-prototype-canvas"
      shadows
      dpr={[1, 2]}
      camera={{
        position: [0, world3dCamera.height, world3dCamera.distance],
        fov: world3dCamera.fov,
        near: world3dCamera.near,
        far: world3dCamera.far,
      }}
    >
      <WorldScene3D {...props} />
    </Canvas>
  );
}
