import type { EchoBehaviorEffect } from "../../agentMind/behaviorEffects";
import type { AgentSignalState } from "../../game/state/agentState";
import type { WorldNodeId } from "../../world/data/worldGraph";
import type { WorldTimeOfDay } from "../../world/systems/time/worldTime";
import { WorldAtmosphere3D } from "../components/WorldAtmosphere3D";
import { WorldGround3D } from "../components/WorldGround3D";
import {
  AgentActor3D,
  NpcMarkers3D,
  NoteEchoProp3D,
  PlayerActor3D,
  WorldLandmarks3D,
} from "../components/WorldMarkers3D";
import { world3dAtmosphere } from "../data/world3dConfig";
import { useWorld3DLoop } from "../hooks/useWorld3DLoop";

type WorldScene3DProps = {
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

export function WorldScene3D(props: WorldScene3DProps) {
  const { refs, telemetryRef } = useWorld3DLoop(props);

  return (
    <>
      <color attach="background" args={[world3dAtmosphere.background]} />
      <fog
        attach="fog"
        args={[
          world3dAtmosphere.background,
          world3dAtmosphere.fogNear,
          world3dAtmosphere.fogFar,
        ]}
      />
      <WorldAtmosphere3D telemetryRef={telemetryRef} />

      <WorldGround3D />
      <WorldLandmarks3D />
      {props.noteAvailable ? <NoteEchoProp3D /> : null}
      <NpcMarkers3D />
      <AgentActor3D
        agentRef={refs.agentRef}
        facingRef={refs.facingRef}
        pressure={props.agentState.pressure}
        echoActive={Boolean(props.echoEffect)}
      />
      <PlayerActor3D playerRef={refs.playerRef} />
    </>
  );
}
