import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import {
  Color,
  Fog,
  type AmbientLight,
  type DirectionalLight,
  type Group,
} from "three";
import { dayEndMinute, dayStartMinute } from "../../agentMind/schedule";
import { world3dAtmosphere } from "../data/world3dConfig";
import type { World3DLoopTelemetry } from "../hooks/useWorld3DLoop";

type WorldAtmosphere3DProps = {
  telemetryRef: RefObject<World3DLoopTelemetry>;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export function WorldAtmosphere3D({ telemetryRef }: WorldAtmosphere3DProps) {
  const { scene } = useThree();
  const ambientLightRef = useRef<AmbientLight | null>(null);
  const keyLightRef = useRef<DirectionalLight | null>(null);
  const sunRef = useRef<Group | null>(null);
  const palette = useMemo(
    () => ({
      morning: new Color("#c7d8bd"),
      afternoon: new Color("#d8ddc8"),
      evening: new Color("#d8b58b"),
      night: new Color("#647079"),
      pressure: new Color("#9ea5a0"),
      echo: new Color("#f2dfaf"),
      keyLight: new Color("#fff0c8"),
    }),
    [],
  );
  const backgroundColor = useMemo(
    () => new Color(world3dAtmosphere.background),
    [],
  );
  const workingColor = useMemo(() => new Color(), []);

  useFrame((_, delta) => {
    const telemetry = telemetryRef.current;
    const dayProgress = clamp01(
      (telemetry.worldMinute - dayStartMinute) / (dayEndMinute - dayStartMinute),
    );
    const morningToAfternoon = smoothstep(0.05, 0.38, dayProgress);
    const afternoonToEvening = smoothstep(0.56, 0.78, dayProgress);
    const eveningToNight = smoothstep(0.78, 1, dayProgress);
    const pressureMix = clamp01((telemetry.pressure - 48) / 48);
    const echoMix = clamp01(telemetry.echoIntensity);

    workingColor.lerpColors(palette.morning, palette.afternoon, morningToAfternoon);
    workingColor.lerp(palette.evening, afternoonToEvening);
    workingColor.lerp(palette.night, eveningToNight);
    workingColor.lerp(palette.pressure, pressureMix * 0.28);
    workingColor.lerp(palette.echo, echoMix * 0.18);
    backgroundColor.lerp(workingColor, 1 - Math.exp(-delta * 3.4));

    scene.background = backgroundColor;

    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(backgroundColor);
      scene.fog.near = world3dAtmosphere.fogNear - echoMix * 35;
      scene.fog.far = world3dAtmosphere.fogFar - pressureMix * 120;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity =
        1.1 - eveningToNight * 0.28 + echoMix * 0.22;
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity =
        1.85 - eveningToNight * 0.72 + echoMix * 0.5 - pressureMix * 0.16;
      keyLightRef.current.color.lerpColors(
        palette.keyLight,
        palette.evening,
        afternoonToEvening * 0.58,
      );
    }

    if (sunRef.current) {
      sunRef.current.position.set(
        -170 + dayProgress * 340,
        140 + Math.sin(dayProgress * Math.PI) * 105,
        -250,
      );
      sunRef.current.scale.setScalar(1 + echoMix * 0.35);
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={1.1} />
      <directionalLight
        ref={keyLightRef}
        castShadow
        position={[180, 260, 120]}
        intensity={1.85}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#f6e5c4", "#68806e", 0.58]} />
      <group ref={sunRef} position={[-170, 180, -250]}>
        <mesh>
          <sphereGeometry args={[18, 24, 24]} />
          <meshBasicMaterial color="#f2dfaf" transparent opacity={0.86} />
        </mesh>
      </group>
    </>
  );
}
