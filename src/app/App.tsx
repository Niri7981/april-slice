import {
  BookOpen,
  CalendarDays,
  Map,
  Heart,
  Home,
  Moon,
  Radio,
  School,
  Sparkles,
  TrainFront,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import regionMapApril from "../assets/pixel/scenes/region_map_april.png";
import classroomScene from "../assets/pixel/scenes/scene_classroom_day.png";
import homeRoomScene from "../assets/pixel/scenes/scene_home_room_day.png";
import schoolCorridorScene from "../assets/pixel/scenes/scene_school_corridor_day.png";
import { aprilScenario } from "../game/world";

type Language = "zh" | "en";
type SceneId = "homeRoom" | "corridor" | "classroom";
type Direction = "up" | "down" | "left" | "right";

type PlayerSnapshot = {
  x: number;
  y: number;
  direction: Direction;
  isWalking: boolean;
  walkFrame: number;
};

type Rect = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type SceneTransition = Rect & {
  target: SceneId;
  labelKey: "leaveHome" | "enterClassroom" | "backToCorridor";
};

type SceneMap = {
  image: string;
  spawn: Pick<PlayerSnapshot, "x" | "y" | "direction">;
  walkBounds: Rect;
  transitions: SceneTransition[];
  touchZones?: TouchZone[];
};

type TouchZone = Rect & {
  id: string;
  labelKey: "window" | "desk" | "bag" | "bed" | "door";
  approachPoint: {
    x: number;
    y: number;
  };
  responseKey:
    | "homeWindow"
    | "homeDesk"
    | "homeBag"
    | "homeBed"
    | "homeDoor";
};

type AutoMovePlan = {
  targetX: number;
  targetY: number;
  responseText: string;
};

const initialPlayer: PlayerSnapshot = {
  x: 50,
  y: 67,
  direction: "down",
  isWalking: false,
  walkFrame: 0,
};

const sceneMaps: Record<SceneId, SceneMap> = {
  homeRoom: {
    image: homeRoomScene,
    spawn: {
      x: 50,
      y: 67,
      direction: "down",
    },
    walkBounds: {
      minX: 8,
      maxX: 91,
      minY: 34,
      maxY: 86,
    },
    transitions: [
      {
        minX: 88,
        maxX: 94,
        minY: 63,
        maxY: 90,
        target: "corridor",
        labelKey: "leaveHome",
      },
    ],
    touchZones: [
      {
        id: "home-window",
        labelKey: "window",
        minX: 5,
        maxX: 19,
        minY: 18,
        maxY: 56,
        approachPoint: {
          x: 25,
          y: 58,
        },
        responseKey: "homeWindow",
      },
      {
        id: "home-desk",
        labelKey: "desk",
        minX: 52,
        maxX: 65,
        minY: 20,
        maxY: 39,
        approachPoint: {
          x: 58,
          y: 48,
        },
        responseKey: "homeDesk",
      },
      {
        id: "home-bag",
        labelKey: "bag",
        minX: 63,
        maxX: 70,
        minY: 37,
        maxY: 48,
        approachPoint: {
          x: 64,
          y: 56,
        },
        responseKey: "homeBag",
      },
      {
        id: "home-bed",
        labelKey: "bed",
        minX: 27,
        maxX: 39,
        minY: 28,
        maxY: 53,
        approachPoint: {
          x: 43,
          y: 60,
        },
        responseKey: "homeBed",
      },
      {
        id: "home-door",
        labelKey: "door",
        minX: 87,
        maxX: 94,
        minY: 62,
        maxY: 90,
        approachPoint: {
          x: 81,
          y: 76,
        },
        responseKey: "homeDoor",
      },
    ],
  },
  corridor: {
    image: schoolCorridorScene,
    spawn: {
      x: 50,
      y: 48,
      direction: "up",
    },
    walkBounds: {
      minX: 4,
      maxX: 96,
      minY: 30,
      maxY: 60,
    },
    transitions: [
      {
        minX: 46,
        maxX: 54,
        minY: 25,
        maxY: 35,
        target: "classroom",
        labelKey: "enterClassroom",
      },
    ],
  },
  classroom: {
    image: classroomScene,
    spawn: {
      x: 90,
      y: 24,
      direction: "left",
    },
    walkBounds: {
      minX: 13,
      maxX: 91,
      minY: 20,
      maxY: 90,
    },
    transitions: [
      {
        minX: 88,
        maxX: 94,
        minY: 13,
        maxY: 29,
        target: "corridor",
        labelKey: "backToCorridor",
      },
    ],
  },
};

const playerSpeed = 22;
const baseEchoCount = 2;
const agentGrantedEchoWindows = 1;
const noteEchoLimit = 30;

const timeIcons = {
  day: School,
  afterSchool: TrainFront,
  night: Moon,
};

const copy = {
  zh: {
    monthChip: "四月 · 白天",
    sceneNames: {
      homeRoom: "早晨房间",
      corridor: "走廊",
      classroom: "教室",
    },
    timeSlots: [
      {
        id: "day",
        label: "白天",
        scene: "学校",
        icon: timeIcons.day,
        active: true,
        note: "现实压力开始显形。",
      },
      {
        id: "after-school",
        label: "放学后",
        scene: "海边路",
        icon: timeIcons.afterSchool,
        active: false,
        note: "关系会在路上偏移。",
      },
      {
        id: "night",
        label: "夜里",
        scene: "房间",
        icon: timeIcons.night,
        active: false,
        note: "信号更容易被听见。",
      },
    ],
    speaker: "四月上旬 · 学校",
    actions: {
      map: "查看地图",
      diary: "查看日记",
      relationships: "关系温度",
      touch: "轻触碰",
      signal: "留一张纸条",
    },
    echo: {
      title: "今日回声",
      base: "基础",
      window: "她今天好像愿意多听一句。",
      depleted: "今天的回声已经落下了。只能远远陪着。",
    },
    spatialEcho: {
      ready: "选择一个可以被轻轻触碰的地方。",
      cancel: "轻触碰收回了。",
      promptPrefix: "用 1 个回声轻触这里：",
      labels: {
        window: "窗边",
        desk: "书桌",
        bag: "书包",
        bed: "床边",
        door: "门口",
      },
      confirm: "让她走近",
      back: "再想一想",
      homeWindow: "晨光像被轻轻拨了一下。澪看向窗外，樱花还没完全落完。",
      homeDesk: "摊开的本子晃了一点。她把手放在纸边，却没有立刻写字。",
      homeBag: "书包带子轻轻滑落。她把它扶正，像是在提醒自己今天已经开始了。",
      homeBed: "被角还留着体温。她回头看了一眼，没有坐回去。",
      homeDoor: "门边的光线窄窄一条。她站了一会儿，终于往外走。",
    },
    noteEcho: {
      title: "写给澪的一句话",
      hint: "不要命令，试着像风一样轻轻吹过。",
      placeholder: "例如：今天别太勉强自己。",
      send: "让纸条飘过去",
      cancel: "收回",
      remaining: "还可以写",
      unit: "字",
      empty: "纸条需要留下一点声音。",
      sent: "纸条像被晨光折了一下，轻轻落进这一天。澪没有立刻看它，只是停了一瞬。",
      diaryPreview: "夜里，她也许会在日记里误读、珍藏，或假装没有看见这句话。",
    },
    sceneHotspots: {
      leaveHome: "出门上学",
      enterClassroom: "进入教室",
      backToCorridor: "回到走廊",
    },
    regionMap: {
      title: "夏末沿海町",
      subtitle: "四月区域图",
      close: "关闭地图",
      hint: "第一版区域地图：山上神社、学校、住宅区、小车站、铁轨和海边路。",
      places: ["山上神社", "学校", "住宅区", "小车站", "商店街", "海边路"],
    },
    agentEyebrow: "Agent",
    agentName: "朝仓澪",
    avatarText: "澪",
    agentDescription:
      "17 岁。新学期第一周，她开始觉得这座小城像一件穿了太久的校服。",
    openingHandTitle: "初始牌",
    openingHand:
      "敏感 / 表达 / 抗拒束缚。她想被理解，却总在真正开口前先退半步。",
    stateTitle: "状态",
    agentState: [
      { label: "压力", value: 64, tone: "rust" },
      { label: "孤独", value: 57, tone: "sea" },
      { label: "未来感", value: 38, tone: "moss" },
      { label: "自我感", value: 46, tone: "ink" },
    ],
    relationshipTitle: "关系温度",
    warmthLabel: "温度",
    tensionLabel: "张力",
    relationships: [
      {
        name: "母亲",
        role: "家人",
        warmth: 62,
        tension: 74,
        note: "她没有逼问未来，但晚饭时总把你的碗放得很近。",
      },
      {
        name: "佐原",
        role: "同桌",
        warmth: 48,
        tension: 21,
        note: "他知道你在烦什么，却一直装作只是顺路去便利店。",
      },
      {
        name: "旧书店老板",
        role: "引路人",
        warmth: 36,
        tension: 8,
        note: "他记得你常借哪类书，只是从不主动说破。",
      },
    ],
  },
  en: {
    monthChip: "April · Day",
    sceneNames: {
      homeRoom: "Morning Room",
      corridor: "Corridor",
      classroom: "Classroom",
    },
    timeSlots: [
      {
        id: "day",
        label: "Day",
        scene: "School",
        icon: timeIcons.day,
        active: true,
        note: "The pressure of reality starts to show.",
      },
      {
        id: "after-school",
        label: "After School",
        scene: "Seaside Road",
        icon: timeIcons.afterSchool,
        active: false,
        note: "Relationships begin to drift on the way home.",
      },
      {
        id: "night",
        label: "Night",
        scene: "Bedroom",
        icon: timeIcons.night,
        active: false,
        note: "Signals are easier to hear after dark.",
      },
    ],
    speaker: "Early April · School",
    actions: {
      map: "Map",
      diary: "Diary",
      relationships: "Relationship Warmth",
      touch: "Light Touch",
      signal: "Leave a Note",
    },
    echo: {
      title: "Today's Echoes",
      base: "Base",
      window: "She seems willing to hear one more thing today.",
      depleted: "Today's echoes have already settled. You can only stay near.",
    },
    spatialEcho: {
      ready: "Choose somewhere that can be lightly touched.",
      cancel: "The light touch folds back.",
      promptPrefix: "Spend 1 echo to lightly touch:",
      labels: {
        window: "Window",
        desk: "Desk",
        bag: "Schoolbag",
        bed: "Bedside",
        door: "Doorway",
      },
      confirm: "Let her walk closer",
      back: "Not yet",
      homeWindow: "The morning light shifts as if brushed by a fingertip. Mio looks outside; the blossoms have not fully fallen yet.",
      homeDesk: "The open notebook trembles a little. She places her hand near the page, but does not write yet.",
      homeBag: "The schoolbag strap slips down. She straightens it, as if reminding herself the day has already begun.",
      homeBed: "The blanket still holds warmth. She looks back once, but does not sit down again.",
      homeDoor: "A narrow line of light rests by the door. She stands there for a while, then finally moves forward.",
    },
    noteEcho: {
      title: "A sentence for Mio",
      hint: "Do not command. Try to pass through like wind.",
      placeholder: "For example: Do not push yourself too hard today.",
      send: "Let it drift in",
      cancel: "Fold it away",
      remaining: "Characters left",
      unit: "",
      empty: "The note needs a small trace of voice.",
      sent: "The note folds once in the morning light and slips into the day. Mio does not read it right away; she only pauses.",
      diaryPreview: "Tonight, she may misread it, keep it, or pretend she never saw the sentence.",
    },
    sceneHotspots: {
      leaveHome: "Leave for School",
      enterClassroom: "Enter Classroom",
      backToCorridor: "Back to Corridor",
    },
    regionMap: {
      title: "Natsusue Coastal Town",
      subtitle: "April Region Map",
      close: "Close Map",
      hint: "First region map: hillside shrine, school, homes, station, railway, and seaside road.",
      places: [
        "Hillside Shrine",
        "School",
        "Residential Area",
        "Small Station",
        "Shopping Street",
        "Seaside Road",
      ],
    },
    agentEyebrow: "Agent",
    agentName: "Mio Asakura",
    avatarText: "Mio",
    agentDescription:
      "17 years old. In the first week of the new school year, the town starts to feel like a uniform she has worn for too long.",
    openingHandTitle: "Opening Hand",
    openingHand:
      "Sensitive / expressive / resistant to being contained. She wants to be understood, but steps back before she speaks plainly.",
    stateTitle: "State",
    agentState: [
      { label: "Pressure", value: 64, tone: "rust" },
      { label: "Loneliness", value: 57, tone: "sea" },
      { label: "Future Sense", value: 38, tone: "moss" },
      { label: "Self Sense", value: 46, tone: "ink" },
    ],
    relationshipTitle: "Relationship Warmth",
    warmthLabel: "Warmth",
    tensionLabel: "Tension",
    relationships: [
      {
        name: "Mother",
        role: "Family",
        warmth: 62,
        tension: 74,
        note: "She does not ask directly about the future, but always places the bowl close at dinner.",
      },
      {
        name: "Sahara",
        role: "Classmate",
        warmth: 48,
        tension: 21,
        note: "He seems to know something is wrong, but pretends the convenience store is just on the way.",
      },
      {
        name: "Old Bookshop Owner",
        role: "Guide",
        warmth: 36,
        tension: 8,
        note: "He remembers what kinds of books she borrows, but never says it first.",
      },
    ],
  },
} satisfies Record<Language, Record<string, unknown>>;

export function App() {
  const [language, setLanguage] = useState<Language>("zh");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneId>("homeRoom");
  const [playerView, setPlayerView] = useState<PlayerSnapshot>(initialPlayer);
  const [usedEchoes, setUsedEchoes] = useState(0);
  const [isNoteEchoOpen, setIsNoteEchoOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [sentNote, setSentNote] = useState("");
  const [noteFloatKey, setNoteFloatKey] = useState(0);
  const [sceneText, setSceneText] = useState(aprilScenario.openingText);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [pendingTouchZone, setPendingTouchZone] = useState<TouchZone | null>(
    null,
  );
  const [autoMovePlan, setAutoMovePlan] = useState<AutoMovePlan | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const keysPressed = useRef(new Set<string>());
  const activeSceneRef = useRef(activeScene);
  const playerRef = useRef<PlayerSnapshot>(initialPlayer);
  const hasTransitionedRef = useRef(false);
  const autoMovePlanRef = useRef<AutoMovePlan | null>(autoMovePlan);
  const text = copy[language];
  const activeSceneMap = sceneMaps[activeScene];
  const activeSceneName = text.sceneNames[activeScene];
  const totalEchoes = baseEchoCount + agentGrantedEchoWindows;
  const remainingEchoes = totalEchoes - usedEchoes;
  const trimmedNote = noteDraft.trim();
  const activeTouchZones = activeSceneMap.touchZones ?? [];
  const primaryTransition = activeSceneMap.transitions[0];
  const activeHotspotLabel = primaryTransition
    ? text.sceneHotspots[primaryTransition.labelKey]
    : null;
  const handleSceneSwitch = () => {
    if (!primaryTransition) {
      return;
    }

    setActiveScene(primaryTransition.target);
  };
  const openNoteEcho = () => {
    if (remainingEchoes <= 0) {
      setSceneText(text.echo.depleted);
      return;
    }

    setIsNoteEchoOpen(true);
  };
  const submitNoteEcho = () => {
    if (!trimmedNote) {
      setSceneText(text.noteEcho.empty);
      return;
    }

    if (remainingEchoes <= 0) {
      setIsNoteEchoOpen(false);
      setSceneText(text.echo.depleted);
      return;
    }

    setSentNote(trimmedNote);
    setUsedEchoes((current) => current + 1);
    setNoteFloatKey((current) => current + 1);
    setNoteDraft("");
    setIsNoteEchoOpen(false);
    setPendingTouchZone(null);
    setSceneText(`${text.noteEcho.sent} ${text.noteEcho.diaryPreview}`);
  };
  const toggleTouchMode = () => {
    if (isTouchMode) {
      setIsTouchMode(false);
      setPendingTouchZone(null);
      setSceneText(text.spatialEcho.cancel);
      return;
    }

    if (remainingEchoes <= 0) {
      setSceneText(text.echo.depleted);
      return;
    }

    setIsTouchMode(true);
    setSceneText(text.spatialEcho.ready);
  };
  const previewSpatialEcho = (zone: TouchZone) => {
    if (remainingEchoes <= 0) {
      setIsTouchMode(false);
      setSceneText(text.echo.depleted);
      return;
    }

    setPendingTouchZone(zone);
  };
  const confirmSpatialEcho = () => {
    if (!pendingTouchZone) {
      return;
    }

    if (remainingEchoes <= 0) {
      setIsTouchMode(false);
      setPendingTouchZone(null);
      setSceneText(text.echo.depleted);
      return;
    }

    setUsedEchoes((current) => current + 1);
    setIsTouchMode(false);
    setPendingTouchZone(null);
    setAutoMovePlan({
      targetX: pendingTouchZone.approachPoint.x,
      targetY: pendingTouchZone.approachPoint.y,
      responseText: text.spatialEcho[pendingTouchZone.responseKey],
    });
  };

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    autoMovePlanRef.current = autoMovePlan;
  }, [autoMovePlan]);

  useEffect(() => {
    const nextSpawn = sceneMaps[activeScene].spawn;
    const nextPlayer = {
      ...playerRef.current,
      ...nextSpawn,
      isWalking: false,
      walkFrame: 0,
    };

    playerRef.current = nextPlayer;
    setPlayerView(nextPlayer);
    keysPressed.current.clear();
    hasTransitionedRef.current = true;
    setAutoMovePlan(null);
    setPendingTouchZone(null);
    setIsTouchMode(false);
  }, [activeScene]);

  useEffect(() => {
    const trackedKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ]);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!trackedKeys.has(event.code)) {
        return;
      }

      event.preventDefault();
      keysPressed.current.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!trackedKeys.has(event.code)) {
        return;
      }

      event.preventDefault();
      keysPressed.current.delete(event.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let animationFrame = 0;
    let previousTimestamp = performance.now();

    const tick = (timestamp: number) => {
      const deltaSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.05);
      previousTimestamp = timestamp;

      const keys = keysPressed.current;
      const player = playerRef.current;
      const scene = activeSceneRef.current;
      const sceneMap = sceneMaps[scene];
      const bounds = sceneMap.walkBounds;
      let moveX = 0;
      let moveY = 0;
      let isAutoMoving = false;

      const activeAutoMovePlan = autoMovePlanRef.current;

      if (activeAutoMovePlan) {
        const deltaX = activeAutoMovePlan.targetX - player.x;
        const deltaY = activeAutoMovePlan.targetY - player.y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance <= 1.6) {
          setAutoMovePlan(null);
          setSceneText(activeAutoMovePlan.responseText);
        } else {
          moveX = deltaX / distance;
          moveY = deltaY / distance;
          isAutoMoving = true;
        }
      } else {
        if (keys.has("ArrowLeft") || keys.has("KeyA")) moveX -= 1;
        if (keys.has("ArrowRight") || keys.has("KeyD")) moveX += 1;
        if (keys.has("ArrowUp") || keys.has("KeyW")) moveY -= 1;
        if (keys.has("ArrowDown") || keys.has("KeyS")) moveY += 1;
      }

      const isWalking = moveX !== 0 || moveY !== 0;
      const diagonalScale = moveX !== 0 && moveY !== 0 ? Math.SQRT1_2 : 1;
      const nextDirection =
        Math.abs(moveX) > Math.abs(moveY)
          ? moveX > 0
            ? "right"
            : "left"
          : moveY < 0
            ? "up"
            : moveY > 0
              ? "down"
              : player.direction;

      const nextPlayer: PlayerSnapshot = {
        x: Math.min(
          Math.max(player.x + moveX * playerSpeed * diagonalScale * deltaSeconds, bounds.minX),
          bounds.maxX,
        ),
        y: Math.min(
          Math.max(player.y + moveY * playerSpeed * diagonalScale * deltaSeconds, bounds.minY),
          bounds.maxY,
        ),
        direction: isWalking ? nextDirection : player.direction,
        isWalking,
        walkFrame: isWalking ? Math.floor(timestamp / 130) % 4 : 0,
      };

      playerRef.current = nextPlayer;
      setPlayerView(nextPlayer);

      const activeTransition = isAutoMoving
        ? undefined
        : sceneMap.transitions.find(
            (transition) =>
              nextPlayer.x >= transition.minX &&
              nextPlayer.x <= transition.maxX &&
              nextPlayer.y >= transition.minY &&
              nextPlayer.y <= transition.maxY,
          );

      if (activeTransition && !hasTransitionedRef.current) {
        hasTransitionedRef.current = true;
        setActiveScene(activeTransition.target);
      }

      if (!activeTransition && hasTransitionedRef.current) {
        hasTransitionedRef.current = false;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <main className="shell">
      <section className="scene-panel">
        <div className="scene-header">
          <div>
            <p className="eyebrow">April Slice</p>
            <h1>{aprilScenario.title}</h1>
          </div>
          <div className="top-controls">
            <div className="language-toggle" aria-label="Language switch">
              <button
                className={language === "zh" ? "is-active" : ""}
                onClick={() => setLanguage("zh")}
                type="button"
              >
                中文
              </button>
              <button
                className={language === "en" ? "is-active" : ""}
                onClick={() => setLanguage("en")}
                type="button"
              >
                EN
              </button>
            </div>
            <span className="month-chip">
              <CalendarDays size={16} />
              {text.monthChip}
            </span>
          </div>
        </div>

        <div
          className={`pixel-stage ${isTouchMode ? "is-touch-mode" : ""}`}
          aria-label={`${activeSceneName} pixel stage`}
          onMouseDown={() => stageRef.current?.focus()}
          ref={stageRef}
          tabIndex={0}
        >
          <img
            alt={activeSceneName}
            className="scene-stage-image"
            src={activeSceneMap.image}
          />
          <nav className="map-hud time-strip" aria-label="April time slots">
            {text.timeSlots.map((slot) => {
              const Icon = slot.icon;

              return (
                <article
                  className={`time-card ${slot.active ? "is-active" : ""}`}
                  key={slot.id}
                >
                  <div className="time-card-top">
                    <Icon size={18} />
                    <span>{slot.label}</span>
                  </div>
                  <strong>{slot.scene}</strong>
                  <small>{slot.note}</small>
                </article>
              );
            })}
          </nav>

          <div className="map-label">
            <span>
              {text.speaker} · {activeSceneName}
            </span>
          </div>

          <aside className="echo-hud" aria-label={text.echo.title}>
            <div>
              <span>{text.echo.title}</span>
              <small>{text.echo.window}</small>
            </div>
            <div className="echo-dots">
              {Array.from({ length: totalEchoes }, (_, index) => (
                <span
                  className={index < usedEchoes ? "is-used" : ""}
                  key={index}
                />
              ))}
            </div>
          </aside>

          {activeHotspotLabel ? (
            <button
              className={`scene-hotspot scene-hotspot-${activeScene}`}
              onClick={handleSceneSwitch}
              type="button"
            >
              {activeHotspotLabel}
            </button>
          ) : null}

          <div
            aria-label={text.agentName}
            className={`player-sprite facing-${playerView.direction} ${
              playerView.isWalking ? "is-walking" : ""
            } walk-frame-${playerView.walkFrame}`}
            style={{
              left: `${playerView.x}%`,
              top: `${playerView.y}%`,
            }}
          >
            <span className="player-shadow" />
            <span className="player-hair" />
            <span className="player-face" />
            <span className="player-body" />
            <span className="player-leg player-leg-left" />
            <span className="player-leg player-leg-right" />
          </div>

          {sentNote ? (
            <div className="floating-note" key={noteFloatKey}>
              {sentNote}
            </div>
          ) : null}

          {isTouchMode
            ? activeTouchZones.map((zone) => (
                <button
                  aria-label={zone.id}
                  className="touch-zone"
                  key={zone.id}
                  onClick={() => previewSpatialEcho(zone)}
                  style={{
                    left: `${zone.minX}%`,
                    top: `${zone.minY}%`,
                    width: `${zone.maxX - zone.minX}%`,
                    height: `${zone.maxY - zone.minY}%`,
                  }}
                  type="button"
                />
              ))
            : null}
        </div>

        <div className="text-box">
          <Waves size={18} />
          <div>
            <p className="text-speaker">{text.speaker}</p>
            <p>{sceneText}</p>
          </div>
        </div>

        <section className="action-dock" aria-label="Current play actions">
          <button onClick={() => setIsMapOpen(true)} type="button">
            <Map size={17} />
            {text.actions.map}
          </button>
          <button type="button">
            <BookOpen size={17} />
            {text.actions.diary}
          </button>
          <button type="button">
            <Heart size={17} />
            {text.actions.relationships}
          </button>
          <button
            className={isTouchMode ? "is-active" : ""}
            onClick={toggleTouchMode}
            type="button"
          >
            <Sparkles size={17} />
            {text.actions.touch}
          </button>
          <button onClick={openNoteEcho} type="button">
            <Radio size={17} />
            {text.actions.signal}
          </button>
        </section>
      </section>

      <aside className="control-panel">
        <section className="side-section">
          <p className="eyebrow">{text.agentEyebrow}</p>
          <div className="agent-card">
            <div className="agent-avatar-mini">{text.avatarText}</div>
            <div>
              <h2>{text.agentName}</h2>
              <p>{text.agentDescription}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-title">
            <Home size={18} />
            {text.openingHandTitle}
          </div>
          <p>{text.openingHand}</p>
        </section>

        <section className="card">
          <p className="eyebrow">{text.stateTitle}</p>
          <div className="stat-list">
            {text.agentState.map((state) => (
              <div className="stat-row" key={state.label}>
                <div>
                  <span>{state.label}</span>
                  <strong>{state.value}</strong>
                </div>
                <div className="meter">
                  <span
                    className={`meter-fill tone-${state.tone}`}
                    style={{ width: `${state.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card relationships-card">
          <p className="eyebrow">{text.relationshipTitle}</p>
          <div className="relationship-list">
            {text.relationships.map((relationship) => (
              <article className="relationship" key={relationship.name}>
                <div className="relationship-head">
                  <div>
                    <strong>{relationship.name}</strong>
                    <small>{relationship.role}</small>
                  </div>
                  <span>{relationship.warmth}°</span>
                </div>
                <div className="relationship-bars">
                  <label>
                    {text.warmthLabel}
                    <span className="mini-meter">
                      <i style={{ width: `${relationship.warmth}%` }} />
                    </span>
                  </label>
                  <label>
                    {text.tensionLabel}
                    <span className="mini-meter tension">
                      <i style={{ width: `${relationship.tension}%` }} />
                    </span>
                  </label>
                </div>
                <p>{relationship.note}</p>
              </article>
            ))}
          </div>
        </section>
      </aside>

      {isMapOpen ? (
        <section
          aria-label={text.regionMap.title}
          className="map-modal"
          role="dialog"
        >
          <div className="map-modal-card">
            <header className="map-modal-header">
              <div>
                <p className="eyebrow">{text.regionMap.subtitle}</p>
                <h2>{text.regionMap.title}</h2>
              </div>
              <button onClick={() => setIsMapOpen(false)} type="button">
                {text.regionMap.close}
              </button>
            </header>

            <div className="region-map-frame">
              <img alt={text.regionMap.title} src={regionMapApril} />
            </div>

            <footer className="map-modal-footer">
              <p>{text.regionMap.hint}</p>
              <div className="map-place-list">
                {text.regionMap.places.map((place) => (
                  <span key={place}>{place}</span>
                ))}
              </div>
            </footer>
          </div>
        </section>
      ) : null}

      {isNoteEchoOpen ? (
        <section
          aria-label={text.noteEcho.title}
          className="note-modal"
          role="dialog"
        >
          <div className="note-paper">
            <header>
              <p className="eyebrow">{text.echo.title}</p>
              <h2>{text.noteEcho.title}</h2>
            </header>
            <p className="note-hint">{text.noteEcho.hint}</p>
            <textarea
              autoFocus
              maxLength={noteEchoLimit}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder={text.noteEcho.placeholder}
              value={noteDraft}
            />
            <div className="note-footer">
              <small>
                {text.noteEcho.remaining} {noteEchoLimit - noteDraft.length}
                {text.noteEcho.unit}
              </small>
              <div>
                <button
                  onClick={() => {
                    setIsNoteEchoOpen(false);
                    setNoteDraft("");
                  }}
                  type="button"
                >
                  {text.noteEcho.cancel}
                </button>
                <button
                  disabled={!trimmedNote || remainingEchoes <= 0}
                  onClick={submitNoteEcho}
                  type="button"
                >
                  {text.noteEcho.send}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {pendingTouchZone ? (
        <section
          aria-label={text.actions.touch}
          className="touch-confirm-modal"
          role="dialog"
        >
          <div className="touch-confirm-card">
            <p className="eyebrow">{text.echo.title}</p>
            <h2>
              {text.spatialEcho.promptPrefix}{" "}
              {text.spatialEcho.labels[pendingTouchZone.labelKey]}
            </h2>
            <p>{text.echo.window}</p>
            <div className="touch-confirm-actions">
              <button
                onClick={() => setPendingTouchZone(null)}
                type="button"
              >
                {text.spatialEcho.back}
              </button>
              <button onClick={confirmSpatialEcho} type="button">
                {text.spatialEcho.confirm}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
