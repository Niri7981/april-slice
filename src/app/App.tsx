import {
  BookOpen,
  CalendarDays,
  Map,
  Heart,
  Home,
  Moon,
  Radio,
  Sparkles,
  TrainFront,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import regionMapApril from "../assets/pixel/scenes/region_map_april.png";
import classroomScene from "../assets/pixel/scenes/scene_classroom_day.png";
import harborAfterSchoolScene from "../assets/pixel/scenes/scene_harbor_after_school.png";
import homeRoomAfternoonScene from "../assets/pixel/scenes/scene_home_room_afternoon.png";
import homeRoomScene from "../assets/pixel/scenes/scene_home_room_day.png";
import homeRoomNightScene from "../assets/pixel/scenes/scene_home_room_night.png";
import schoolCorridorScene from "../assets/pixel/scenes/scene_school_corridor_day.png";
import stationAfterSchoolScene from "../assets/pixel/scenes/scene_station_after_school.png";
import clockAfternoonImage from "../assets/pixel/ui/clock_afternoon.png";
import clockMorningImage from "../assets/pixel/ui/clock_morning.png";
import clockNightImage from "../assets/pixel/ui/clock_night.png";
import { aprilScenario } from "../game/world";

type Language = "zh" | "en";
type SceneId = "homeRoom" | "corridor" | "classroom" | "station" | "harbor";
type TimeOfDay = "morning" | "afternoon" | "night";
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
  labelKey:
    | "leaveHome"
    | "enterClassroom"
    | "backToCorridor"
    | "afterSchoolStation"
    | "goToHarbor"
    | "backToStation";
};

type SceneMap = {
  image: string;
  spawn: Pick<PlayerSnapshot, "x" | "y" | "direction">;
  walkBounds: Rect;
  transitions: SceneTransition[];
  touchZones?: TouchZone[];
  timeImages?: Partial<Record<TimeOfDay, string>>;
};

type TouchZone = Rect & {
  id: string;
  labelKey:
    | "window"
    | "desk"
    | "bag"
    | "bed"
    | "door"
    | "board"
    | "bench"
    | "rail"
    | "water";
  approachPoint: {
    x: number;
    y: number;
  };
  responseKey:
    | "homeWindow"
    | "homeDesk"
    | "homeBag"
    | "homeBed"
    | "homeDoor"
    | "corridorWindow"
    | "corridorDoor"
    | "classroomBoard"
    | "classroomWindow"
    | "classroomDoor"
    | "stationBench"
    | "stationRail"
    | "harborRail"
    | "harborWater";
};

type AutoMovePlan = {
  targetX: number;
  targetY: number;
  responseText: string;
};

type EchoTrace =
  | {
      id: string;
      kind: "note";
      text: string;
    }
  | {
      id: string;
      kind: "spatial";
      scene: SceneId;
      labelKey: TouchZone["labelKey"];
    };

type TimeSlotCopy = {
  id: TimeOfDay;
  label: string;
  scene: string;
  icon: typeof Home;
  note: string;
};

type MapPlaceId =
  | "home"
  | "school"
  | "station"
  | "harbor"
  | "shrine"
  | "shoppingStreet";

type MapPlace = {
  id: MapPlaceId;
  labelKey: MapPlaceId;
  x: number;
  y: number;
  target?: SceneId;
  sceneIds?: SceneId[];
};

type DailyWindowReason = "guarded" | "open" | "wideOpen";

type DailyWindowProfile = {
  count: 0 | 1 | 2;
  reason: DailyWindowReason;
};

const initialPlayer: PlayerSnapshot = {
  x: 50,
  y: 67,
  direction: "down",
  isWalking: false,
  walkFrame: 0,
};

const agentSignalBaseline = {
  pressure: 64,
  loneliness: 57,
  trust: 48,
};

const getDailyWindowProfile = (): DailyWindowProfile => {
  const { pressure, loneliness, trust } = agentSignalBaseline;

  if (pressure >= 70 && trust <= 45) {
    return {
      count: 0,
      reason: "guarded",
    };
  }

  if (loneliness >= 62 && trust >= 58) {
    return {
      count: 2,
      reason: "wideOpen",
    };
  }

  if (loneliness >= 55 || trust >= 48) {
    return {
      count: 1,
      reason: "open",
    };
  }

  return {
    count: 0,
    reason: "guarded",
  };
};

const sceneMaps: Record<SceneId, SceneMap> = {
  homeRoom: {
    image: homeRoomScene,
    timeImages: {
      morning: homeRoomScene,
      afternoon: homeRoomAfternoonScene,
      night: homeRoomNightScene,
    },
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
    touchZones: [
      {
        id: "corridor-window",
        labelKey: "window",
        minX: 76,
        maxX: 95,
        minY: 18,
        maxY: 51,
        approachPoint: {
          x: 72,
          y: 49,
        },
        responseKey: "corridorWindow",
      },
      {
        id: "corridor-door",
        labelKey: "door",
        minX: 43,
        maxX: 57,
        minY: 21,
        maxY: 38,
        approachPoint: {
          x: 50,
          y: 45,
        },
        responseKey: "corridorDoor",
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
      {
        minX: 4,
        maxX: 17,
        minY: 78,
        maxY: 94,
        target: "station",
        labelKey: "afterSchoolStation",
      },
    ],
    touchZones: [
      {
        id: "classroom-board",
        labelKey: "board",
        minX: 24,
        maxX: 71,
        minY: 8,
        maxY: 27,
        approachPoint: {
          x: 48,
          y: 38,
        },
        responseKey: "classroomBoard",
      },
      {
        id: "classroom-window",
        labelKey: "window",
        minX: 77,
        maxX: 95,
        minY: 28,
        maxY: 68,
        approachPoint: {
          x: 72,
          y: 56,
        },
        responseKey: "classroomWindow",
      },
      {
        id: "classroom-door",
        labelKey: "door",
        minX: 87,
        maxX: 95,
        minY: 12,
        maxY: 30,
        approachPoint: {
          x: 79,
          y: 34,
        },
        responseKey: "classroomDoor",
      },
    ],
  },
  station: {
    image: stationAfterSchoolScene,
    spawn: {
      x: 50,
      y: 64,
      direction: "down",
    },
    walkBounds: {
      minX: 6,
      maxX: 94,
      minY: 42,
      maxY: 86,
    },
    transitions: [
      {
        minX: 2,
        maxX: 13,
        minY: 40,
        maxY: 58,
        target: "classroom",
        labelKey: "backToCorridor",
      },
      {
        minX: 87,
        maxX: 98,
        minY: 52,
        maxY: 79,
        target: "harbor",
        labelKey: "goToHarbor",
      },
    ],
    touchZones: [
      {
        id: "station-bench",
        labelKey: "bench",
        minX: 43,
        maxX: 64,
        minY: 50,
        maxY: 63,
        approachPoint: {
          x: 54,
          y: 71,
        },
        responseKey: "stationBench",
      },
      {
        id: "station-rail",
        labelKey: "rail",
        minX: 25,
        maxX: 78,
        minY: 27,
        maxY: 42,
        approachPoint: {
          x: 56,
          y: 50,
        },
        responseKey: "stationRail",
      },
    ],
  },
  harbor: {
    image: harborAfterSchoolScene,
    spawn: {
      x: 50,
      y: 62,
      direction: "down",
    },
    walkBounds: {
      minX: 5,
      maxX: 93,
      minY: 37,
      maxY: 86,
    },
    transitions: [
      {
        minX: 4,
        maxX: 15,
        minY: 47,
        maxY: 70,
        target: "station",
        labelKey: "backToStation",
      },
    ],
    touchZones: [
      {
        id: "harbor-water",
        labelKey: "water",
        minX: 20,
        maxX: 87,
        minY: 16,
        maxY: 47,
        approachPoint: {
          x: 56,
          y: 57,
        },
        responseKey: "harborWater",
      },
      {
        id: "harbor-rail",
        labelKey: "rail",
        minX: 4,
        maxX: 18,
        minY: 44,
        maxY: 72,
        approachPoint: {
          x: 22,
          y: 66,
        },
        responseKey: "harborRail",
      },
    ],
  },
};

const playerSpeed = 22;
const baseEchoCount = 2;
const noteEchoLimit = 30;
const dayDurationMs = 5 * 60 * 1000;
const timeFlowStepMs = dayDurationMs / 3;

const mapPlaces: MapPlace[] = [
  {
    id: "shrine",
    labelKey: "shrine",
    x: 18,
    y: 14,
  },
  {
    id: "school",
    labelKey: "school",
    x: 36,
    y: 48,
    target: "corridor",
    sceneIds: ["corridor", "classroom"],
  },
  {
    id: "shoppingStreet",
    labelKey: "shoppingStreet",
    x: 47,
    y: 55,
  },
  {
    id: "home",
    labelKey: "home",
    x: 52,
    y: 64,
    target: "homeRoom",
    sceneIds: ["homeRoom"],
  },
  {
    id: "station",
    labelKey: "station",
    x: 60,
    y: 40,
    target: "station",
    sceneIds: ["station"],
  },
  {
    id: "harbor",
    labelKey: "harbor",
    x: 64,
    y: 76,
    target: "harbor",
    sceneIds: ["harbor"],
  },
];

const timeIcons = {
  morning: Home,
  afternoon: TrainFront,
  night: Moon,
};

const timeClock = {
  morning: {
    display: "09:00",
    image: clockMorningImage,
  },
  afternoon: {
    display: "15:00",
    image: clockAfternoonImage,
  },
  night: {
    display: "23:00",
    image: clockNightImage,
  },
} satisfies Record<
  TimeOfDay,
  {
    display: string;
    image: string;
  }
>;

const copy = {
  zh: {
    monthChipPrefix: "四月",
    dayLabel: "第 {day} 天",
    clockLabel: "今日钟面",
    timeNames: {
      morning: "早晨",
      afternoon: "下午",
      night: "夜里",
    },
    sceneNames: {
      homeRoom: "房间",
      corridor: "走廊",
      classroom: "教室",
      station: "小车站外",
      harbor: "临海空场",
    },
    timeSlots: [
      {
        id: "morning",
        label: "早晨",
        scene: "房间",
        icon: timeIcons.morning,
        note: "光刚刚照进来，一天还没有真正开口。",
      },
      {
        id: "afternoon",
        label: "下午",
        scene: "房间",
        icon: timeIcons.afternoon,
        note: "影子被拉长了，心思也会慢一点偏开。",
      },
      {
        id: "night",
        label: "夜里",
        scene: "房间",
        icon: timeIcons.night,
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
      windows: {
        guarded: "她今天把心门收得很紧，像是不想被追得太近。",
        open: "她今天好像愿意多听一句。",
        wideOpen: "她今天悄悄打开了两个缝隙，像是在等人靠近。",
      },
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
        board: "黑板",
        bench: "长椅",
        rail: "铁轨边",
        water: "水面",
      },
      confirm: "让她走近",
      back: "再想一想",
      homeWindow: "晨光像被轻轻拨了一下。澪看向窗外，樱花还没完全落完。",
      homeDesk: "摊开的本子晃了一点。她把手放在纸边，却没有立刻写字。",
      homeBag: "书包带子轻轻滑落。她把它扶正，像是在提醒自己今天已经开始了。",
      homeBed: "被角还留着体温。她回头看了一眼，没有坐回去。",
      homeDoor: "门边的光线窄窄一条。她站了一会儿，终于往外走。",
      corridorWindow:
        "走廊尽头的窗面亮了一下。她放慢脚步，像是忽然想到放学后的风会是什么味道。",
      corridorDoor:
        "教室门边传来很轻的响动。她把手放在门边一瞬，像在确认自己有没有准备好进去。",
      classroomBoard:
        "黑板上的字迹有一点晕开。她盯着那一行看了太久，像是想把今天要面对的东西先默背一遍。",
      classroomWindow:
        "窗边的光落在课桌边缘。她没有回头太久，却还是让目光在那里停了一小会儿。",
      classroomDoor:
        "门口的风从背后擦过去。她像是知道有人在等她做决定，于是慢慢站起身。",
      stationBench:
        "长椅边的影子把时间拖慢了一点。她没有坐下，只是在旁边停住，像把回家这件事往后推了几分钟。",
      stationRail:
        "铁轨一直朝远处延伸。她看了一会儿，没有说想去哪里，只是好像没有那么急着回头。",
      harborRail:
        "栏杆有些凉。她把手轻轻搭上去，像是借着海风把心里那点拧着的地方慢慢松开。",
      harborWater:
        "海面亮了一下又暗下去。她看着那道光散开，像终于允许今天不用立刻得出答案。",
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
    diaryModal: {
      eyebrow: "夜间日记",
      title: "澪的日记",
      hint: "先用 mock 内容占位，重点看夜里翻开纸页时的感觉。",
      entryDate: "四月 / 第一天 / 夜里 23:00",
      defaultParagraph:
        "今天在门口站了一会儿。明明和平常一样，手碰到门把的时候，却觉得屋子里还有什么没说完。",
      schoolParagraph:
        "教室窗边的光有点亮，亮得像有人从很远的地方看了我一下。我没有回头，只是假装在看黑板。",
      stationParagraph:
        "放学后经过小车站的时候，铁轨一直向远处伸过去。我没有立刻回家，只是在长椅旁边站了一会儿。",
      harborParagraph:
        "海边的风比想象中安静。水面亮了一下又暗下去，好像今天有些话可以不用马上说出来。",
      noteParagraphPrefix: "那张纸条上写着：",
      noteParagraphSuffix:
        "我不知道是不是应该相信它，但我确实把那句话在心里念了一遍。",
      spatialParagraph:
        "有几次，我像是被很轻地碰了一下。不是命令，更像有人把我的注意力悄悄放到某个地方。",
      closingParagraph:
        "如果真的有人在靠近我，希望不要靠得太急。太急的话，我又会像平常一样先退开半步。",
      traceLabel: "今天留下的痕迹",
      mockTrace: "她记不清那句话是不是写给她的，只记得纸边像晨光一样薄。",
      emptyTrace: "今天没有留下明确的回声，只剩下一点很轻的风。",
      footer: "以后这里可以换成每天自动生成的日记内容。",
      close: "合上日记",
    },
    daySummary: {
      eyebrow: "第一天收束",
      title: "这一天留下了什么",
      hint: "先用一个很轻的总结页，把这一天真正收住。",
      tracesTitle: "今天的痕迹",
      routeTitle: "走过的地方",
      moodTitle: "今天更靠近的方向",
      nextTitle: "明天可能松开的地方",
      close: "先把今天收好",
      open: "看今天的小结",
      emptyTrace: "今天只是陪着，没有留下明确的回声。",
      moods: {
        home: "她还是把很多话留在屋子里，但已经开始慢慢朝外走。",
        school: "学校里的光线和视线都留下了细小的压力，也留下了被看见的可能。",
        distance: "车站和海边让“离开一下”第一次有了具体的方向感。",
        note: "那句纸条没有变成命令，更像是一点会在夜里反复想起的余温。",
        touch: "那些轻轻碰过的地方，让她今天的注意力不再完全照旧。",
      },
      nextSteps: {
        guarded: "她明天可能还是很谨慎，但已经知道有人没有逼她开口。",
        open: "她明天也许会再多给一句话的距离，尤其是在放学以后。",
        wideOpen: "她明天可能会把心门再多开一点点，只要靠近的人别太急。",
      },
    },
    sceneHotspots: {
      leaveHome: "出门上学",
      enterClassroom: "进入教室",
      backToCorridor: "回到走廊",
      afterSchoolStation: "放学后去车站",
      goToHarbor: "去海边停一会儿",
      backToStation: "回到车站",
    },
    regionMap: {
      title: "夏末沿海町",
      subtitle: "四月区域图",
      close: "关闭地图",
      hint: "澪所在的位置会在地图上轻轻闪一下。已开放的地点可以前往。",
      current: "现在在这里",
      available: "可以前往",
      locked: "尚未开放",
      placeNames: {
        home: "住宅区",
        school: "学校",
        station: "小车站",
        harbor: "临海空场",
        shrine: "山上神社",
        shoppingStreet: "商店街",
      },
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
    monthChipPrefix: "April",
    dayLabel: "Day {day}",
    clockLabel: "Today's Clock",
    timeNames: {
      morning: "Morning",
      afternoon: "Afternoon",
      night: "Night",
    },
    sceneNames: {
      homeRoom: "Room",
      corridor: "Corridor",
      classroom: "Classroom",
      station: "Station Exterior",
      harbor: "Harbor Edge",
    },
    timeSlots: [
      {
        id: "morning",
        label: "Morning",
        scene: "Room",
        icon: timeIcons.morning,
        note: "The light has only just entered. The day has not fully spoken yet.",
      },
      {
        id: "afternoon",
        label: "Afternoon",
        scene: "Room",
        icon: timeIcons.afternoon,
        note: "Shadows stretch longer, and thoughts drift a little wider.",
      },
      {
        id: "night",
        label: "Night",
        scene: "Bedroom",
        icon: timeIcons.night,
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
      windows: {
        guarded:
          "She keeps herself closed today, as if she does not want to be followed too closely.",
        open: "She seems willing to hear one more thing today.",
        wideOpen:
          "She quietly leaves two extra openings today, as if she might let someone come a little closer.",
      },
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
        board: "Blackboard",
        bench: "Bench",
        rail: "Tracks",
        water: "Water",
      },
      confirm: "Let her walk closer",
      back: "Not yet",
      homeWindow: "The morning light shifts as if brushed by a fingertip. Mio looks outside; the blossoms have not fully fallen yet.",
      homeDesk: "The open notebook trembles a little. She places her hand near the page, but does not write yet.",
      homeBag: "The schoolbag strap slips down. She straightens it, as if reminding herself the day has already begun.",
      homeBed: "The blanket still holds warmth. She looks back once, but does not sit down again.",
      homeDoor: "A narrow line of light rests by the door. She stands there for a while, then finally moves forward.",
      corridorWindow:
        "The window at the end of the corridor catches the light. She slows down, as if wondering what the wind after school might feel like.",
      corridorDoor:
        "There is a faint sound by the classroom door. She pauses there for a moment, as if checking whether she is ready to go in.",
      classroomBoard:
        "The chalk marks blur slightly on the board. She watches one line a little too long, as if rehearsing what today expects from her.",
      classroomWindow:
        "Light gathers near the classroom window. She does not turn for long, but she still lets her eyes stay there for a moment.",
      classroomDoor:
        "A draft passes the doorway behind her. She seems to know something is waiting for a decision, so she rises slowly.",
      stationBench:
        "The shadow by the bench slows time down a little. She does not sit, only stops beside it as if postponing the trip home for a few minutes.",
      stationRail:
        "The tracks keep pulling toward somewhere else. She watches them for a while and does not seem as eager to turn back.",
      harborRail:
        "The rail is cool beneath her hand. She rests there lightly, as if letting the sea wind loosen something knotted inside her.",
      harborWater:
        "The water brightens once and goes dim again. She watches the light break apart, as if finally allowing today to stay unresolved.",
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
    diaryModal: {
      eyebrow: "Night Diary",
      title: "Mio's Diary",
      hint: "Mock text for now. The main goal here is the feeling of opening a larger diary page at night.",
      entryDate: "April / Day 1 / 23:00",
      defaultParagraph:
        "I stood by the door a little too long today. Everything was ordinary, but when my hand touched the handle it felt like the room had not finished saying something.",
      schoolParagraph:
        "The classroom window was brighter than it should have been, as if someone from very far away had looked at me once. I did not turn around. I only pretended to watch the board.",
      stationParagraph:
        "After school, the tracks by the small station kept running toward somewhere else. I did not go home right away. I stood near the bench for a while.",
      harborParagraph:
        "The wind by the water was quieter than I expected. The surface brightened once and went dim again, as if some things did not have to be said today.",
      noteParagraphPrefix: "The note said:",
      noteParagraphSuffix:
        "I do not know if I should believe it, but I did read the sentence once inside my head.",
      spatialParagraph:
        "A few times, it felt like something touched my attention very lightly. Not a command, more like someone placing my eyes somewhere for a moment.",
      closingParagraph:
        "If someone is really trying to come closer, I hope they do not do it too quickly. If they do, I will probably step back the way I always do.",
      traceLabel: "Trace Left Today",
      mockTrace:
        "She cannot quite remember whether the sentence was meant for her, only that the edge of the note felt as thin as morning light.",
      emptyTrace:
        "No clear echo stayed behind today, only something as light as wind.",
      footer: "Later, this can become the auto-written diary entry for each day.",
      close: "Close Diary",
    },
    daySummary: {
      eyebrow: "Day One Close",
      title: "What Stayed Behind Today",
      hint: "A light result page for now, just enough to let the day land.",
      tracesTitle: "Traces Left",
      routeTitle: "Places Crossed",
      moodTitle: "What She Moved Closer To",
      nextTitle: "What May Open Tomorrow",
      close: "Keep Today Folded",
      open: "View Day Summary",
      emptyTrace: "Today was mostly quiet companionship, without a clear echo left behind.",
      moods: {
        home: "She kept many things inside the room, but she still began to move outward.",
        school:
          "The school light and the eyes around her left a small pressure, and also the possibility of being seen.",
        distance:
          "The station and the harbor made the idea of stepping away feel newly concrete.",
        note:
          "The note did not become an instruction. It became something warm enough to be reconsidered at night.",
        touch:
          "Those small touches kept her attention from passing through the day exactly as usual.",
      },
      nextSteps: {
        guarded:
          "Tomorrow she may still stay careful, but she already knows someone did not force her to speak.",
        open:
          "Tomorrow she may allow one more sentence of closeness, especially after school.",
        wideOpen:
          "Tomorrow she may leave the door a little wider, as long as nobody rushes her.",
      },
    },
    sceneHotspots: {
      leaveHome: "Leave for School",
      enterClassroom: "Enter Classroom",
      backToCorridor: "Back to Corridor",
      afterSchoolStation: "After School Station",
      goToHarbor: "Go to the Harbor",
      backToStation: "Back to Station",
    },
    regionMap: {
      title: "Natsusue Coastal Town",
      subtitle: "April Region Map",
      close: "Close Map",
      hint: "Mio's current place flickers softly on the town map. Open places can be visited.",
      current: "Here Now",
      available: "Open",
      locked: "Not Open Yet",
      placeNames: {
        home: "Residential Area",
        school: "School",
        station: "Small Station",
        harbor: "Harbor Edge",
        shrine: "Hillside Shrine",
        shoppingStreet: "Shopping Street",
      },
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
  const [dailyWindowProfile, setDailyWindowProfile] = useState<DailyWindowProfile>(
    () => getDailyWindowProfile(),
  );
  const [language, setLanguage] = useState<Language>("zh");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isDaySummaryOpen, setIsDaySummaryOpen] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneId>("homeRoom");
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<TimeOfDay>("morning");
  const [gameDay, setGameDay] = useState(1);
  const [playerView, setPlayerView] = useState<PlayerSnapshot>(initialPlayer);
  const [usedEchoes, setUsedEchoes] = useState(0);
  const [isNoteEchoOpen, setIsNoteEchoOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [sentNote, setSentNote] = useState("");
  const [visitedScenes, setVisitedScenes] = useState<SceneId[]>(["homeRoom"]);
  const [echoTraces, setEchoTraces] = useState<EchoTrace[]>([]);
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
  const dayFlowStartRef = useRef<number | null>(null);
  const activeTimeOfDayRef = useRef<TimeOfDay>("morning");
  const text = copy[language];
  const activeSceneMap = sceneMaps[activeScene];
  const activeSceneName = text.sceneNames[activeScene];
  const activeSceneImage =
    activeSceneMap.timeImages?.[activeTimeOfDay] ?? activeSceneMap.image;
  const monthChip = `${text.monthChipPrefix} · ${text.dayLabel.replace("{day}", String(gameDay))}`;
  const activeClock = timeClock[activeTimeOfDay];
  const totalEchoes = baseEchoCount + dailyWindowProfile.count;
  const remainingEchoes = totalEchoes - usedEchoes;
  const trimmedNote = noteDraft.trim();
  const activeTouchZones = activeSceneMap.touchZones ?? [];
  const visitedSet = new Set(visitedScenes);
  const latestNoteTrace = [...echoTraces]
    .reverse()
    .find((trace) => trace.kind === "note");
  const hasSpatialTrace = echoTraces.some((trace) => trace.kind === "spatial");
  const daySummaryLines = [
    visitedSet.has("homeRoom") ? text.daySummary.moods.home : null,
    visitedSet.has("corridor") || visitedSet.has("classroom")
      ? text.daySummary.moods.school
      : null,
    visitedSet.has("station") || visitedSet.has("harbor")
      ? text.daySummary.moods.distance
      : null,
    latestNoteTrace?.kind === "note" ? text.daySummary.moods.note : null,
    hasSpatialTrace ? text.daySummary.moods.touch : null,
  ].filter((line): line is string => Boolean(line));
  const routeSummary = visitedScenes.map((scene) => text.sceneNames[scene]).join(" / ");
  const diaryParagraphs = [
    text.diaryModal.defaultParagraph,
    visitedSet.has("corridor") || visitedSet.has("classroom")
      ? text.diaryModal.schoolParagraph
      : null,
    visitedSet.has("station") ? text.diaryModal.stationParagraph : null,
    visitedSet.has("harbor") ? text.diaryModal.harborParagraph : null,
    latestNoteTrace?.kind === "note"
      ? `${text.diaryModal.noteParagraphPrefix} "${latestNoteTrace.text}" ${text.diaryModal.noteParagraphSuffix}`
      : null,
    hasSpatialTrace ? text.diaryModal.spatialParagraph : null,
    text.diaryModal.closingParagraph,
  ].filter((paragraph): paragraph is string => Boolean(paragraph));
  const traceSummary =
    echoTraces.length > 0
      ? echoTraces
          .map((trace) =>
            trace.kind === "note"
              ? `"${trace.text}"`
              : text.spatialEcho.labels[trace.labelKey],
          )
          .join(" / ")
      : text.diaryModal.emptyTrace;
  const handleSceneSwitch = (transition: SceneTransition) => {
    setActiveScene(transition.target);
  };
  const handleMapTravel = (target: SceneId) => {
    setActiveScene(target);
    setIsMapOpen(false);
  };
  const transitionTimeOfDay = (timeOfDay: TimeOfDay, note: string) => {
    setActiveTimeOfDay(timeOfDay);
    setSceneText(note);
    setIsTouchMode(false);
    setPendingTouchZone(null);
    setIsNoteEchoOpen(false);
    setIsDiaryOpen(false);
    setIsDaySummaryOpen(false);
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
    setEchoTraces((current) => [
      ...current,
      {
        id: `note-${Date.now()}`,
        kind: "note",
        text: trimmedNote,
      },
    ]);
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
    setEchoTraces((current) => [
      ...current,
      {
        id: `${pendingTouchZone.id}-${Date.now()}`,
        kind: "spatial",
        scene: activeScene,
        labelKey: pendingTouchZone.labelKey,
      },
    ]);
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
    setVisitedScenes((current) =>
      current.includes(activeScene) ? current : [...current, activeScene],
    );
  }, [activeScene]);

  useEffect(() => {
    activeTimeOfDayRef.current = activeTimeOfDay;
  }, [activeTimeOfDay]);

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
    const slots = text.timeSlots as TimeSlotCopy[];
    const findSlot = (timeOfDay: TimeOfDay) =>
      slots.find((slot) => slot.id === timeOfDay);

    let animationFrame = 0;

    const tickTime = (timestamp: number) => {
      if (dayFlowStartRef.current === null) {
        dayFlowStartRef.current = timestamp;
      }

      const elapsed = timestamp - dayFlowStartRef.current;
      const normalized = elapsed % dayDurationMs;
      const nextTimeOfDay: TimeOfDay =
        normalized < timeFlowStepMs
          ? "morning"
          : normalized < timeFlowStepMs * 2
            ? "afternoon"
            : "night";

      if (activeTimeOfDayRef.current !== nextTimeOfDay) {
        const nextSlot = findSlot(nextTimeOfDay);

        if (nextSlot) {
          transitionTimeOfDay(nextTimeOfDay, nextSlot.note);
        }
      }

      if (elapsed >= dayDurationMs) {
        dayFlowStartRef.current = timestamp;
        setGameDay((current) => current + 1);
        setDailyWindowProfile(getDailyWindowProfile());
        setUsedEchoes(0);
        setSentNote("");
        setEchoTraces([]);
        setVisitedScenes(["homeRoom"]);
        setActiveScene("homeRoom");
        setIsDaySummaryOpen(false);
        setSceneText(
          language === "zh"
            ? "新的一天又轻轻开始了。"
            : "A new day has quietly begun again.",
        );
      }

      animationFrame = window.requestAnimationFrame(tickTime);
    };

    animationFrame = window.requestAnimationFrame(tickTime);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [language, text.timeSlots]);

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

      hasTransitionedRef.current = false;

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
              {monthChip}
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
            src={activeSceneImage}
          />
          {activeScene === "homeRoom" ? (
            <div
              aria-hidden="true"
              className={`scene-ambient scene-ambient-home scene-ambient-${activeTimeOfDay}`}
            >
              <span className="ambient-sunlight" />
              <span className="ambient-mote ambient-mote-1" />
              <span className="ambient-mote ambient-mote-2" />
              <span className="ambient-mote ambient-mote-3" />
            </div>
          ) : null}
          <div className="map-hud">
            <aside className="clock-hud" aria-label={text.clockLabel}>
              <div className="clock-hud-copy">
                <span>{text.clockLabel}</span>
              </div>
              <div className="clock-face">
                <img alt={activeClock.display} src={activeClock.image} />
              </div>
            </aside>

            <nav className="time-strip" aria-label="April time slots">
              {text.timeSlots.map((slot) => {
                const Icon = slot.icon;

                return (
                  <article
                    className={`time-card ${
                      activeTimeOfDay === slot.id ? "is-active" : ""
                    }`}
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
          </div>

          <div className="map-label">
            <span>
              {text.speaker} · {activeSceneName}
            </span>
          </div>

          <aside className="echo-hud" aria-label={text.echo.title}>
            <div>
              <span>{text.echo.title}</span>
              <small>{text.echo.windows[dailyWindowProfile.reason]}</small>
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

          {activeSceneMap.transitions.map((transition) => (
            <button
              className={`scene-hotspot scene-hotspot-${activeScene} scene-hotspot-${transition.labelKey}`}
              key={`${activeScene}-${transition.labelKey}`}
              onClick={() => handleSceneSwitch(transition)}
              type="button"
            >
              {text.sceneHotspots[transition.labelKey]}
            </button>
          ))}

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
          <button onClick={() => setIsDiaryOpen(true)} type="button">
            <BookOpen size={17} />
            {text.actions.diary}
          </button>
          <button onClick={() => setIsDaySummaryOpen(true)} type="button">
            <CalendarDays size={17} />
            {text.daySummary.open}
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
              <div className="region-map-pins">
                {mapPlaces.map((place) => {
                  const isCurrent = place.sceneIds?.includes(activeScene) ?? false;
                  const isOpen = Boolean(place.target);
                  const placeName = text.regionMap.placeNames[place.labelKey];
                  const status = isCurrent
                    ? text.regionMap.current
                    : isOpen
                      ? text.regionMap.available
                      : text.regionMap.locked;

                  return (
                    <button
                      aria-label={`${placeName} · ${status}`}
                      className={`map-place-pin ${
                        isCurrent ? "is-current" : ""
                      } ${isOpen ? "is-open" : "is-locked"}`}
                      disabled={!place.target}
                      key={place.id}
                      onClick={() => {
                        if (place.target) {
                          handleMapTravel(place.target);
                        }
                      }}
                      style={{
                        left: `${place.x}%`,
                        top: `${place.y}%`,
                      }}
                      type="button"
                    >
                      <span className="map-place-dot" />
                      <span className="map-place-label">
                        <strong>{placeName}</strong>
                        <small>{status}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <footer className="map-modal-footer">
              <p>{text.regionMap.hint}</p>
              <div className="map-place-list" aria-hidden="true">
                <span>{text.regionMap.current}</span>
                <span>{text.regionMap.available}</span>
                <span>{text.regionMap.locked}</span>
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

      {isDiaryOpen ? (
        <section
          aria-label={text.diaryModal.title}
          className="note-modal"
          role="dialog"
        >
          <div className="note-paper diary-paper">
            <header className="diary-paper-header">
              <div>
                <p className="eyebrow">{text.diaryModal.eyebrow}</p>
                <h2>{text.diaryModal.title}</h2>
              </div>
              <button onClick={() => setIsDiaryOpen(false)} type="button">
                {text.diaryModal.close}
              </button>
            </header>

            <div className="diary-meta">
              <span>{monthChip}</span>
              <span>{text.timeNames[activeTimeOfDay]}</span>
              <span>{text.sceneNames[activeScene]}</span>
            </div>

            <p className="note-hint">{text.diaryModal.hint}</p>

            <article className="diary-entry-card">
              <p className="diary-entry-date">{text.diaryModal.entryDate}</p>
              <div className="diary-entry-body">
                {diaryParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <aside className="diary-note-preview">
              <p className="eyebrow">{text.diaryModal.traceLabel}</p>
              <p>{traceSummary}</p>
            </aside>

            <div className="note-footer diary-footer">
              <small>{text.diaryModal.footer}</small>
              <div>
                <button onClick={() => setIsDiaryOpen(false)} type="button">
                  {text.diaryModal.close}
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
            <p>{text.echo.windows[dailyWindowProfile.reason]}</p>
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

      {isDaySummaryOpen ? (
        <section
          aria-label={text.daySummary.title}
          className="note-modal"
          role="dialog"
        >
          <div className="note-paper day-summary-paper">
            <header className="diary-paper-header">
              <div>
                <p className="eyebrow">{text.daySummary.eyebrow}</p>
                <h2>{text.daySummary.title}</h2>
              </div>
              <button onClick={() => setIsDaySummaryOpen(false)} type="button">
                {text.daySummary.close}
              </button>
            </header>

            <p className="note-hint">{text.daySummary.hint}</p>

            <div className="day-summary-grid">
              <article className="day-summary-card">
                <p className="eyebrow">{text.daySummary.tracesTitle}</p>
                <p>
                  {echoTraces.length > 0
                    ? traceSummary
                    : text.daySummary.emptyTrace}
                </p>
              </article>

              <article className="day-summary-card">
                <p className="eyebrow">{text.daySummary.routeTitle}</p>
                <p>{routeSummary}</p>
              </article>

              <article className="day-summary-card">
                <p className="eyebrow">{text.daySummary.moodTitle}</p>
                <div className="day-summary-list">
                  {daySummaryLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>

              <article className="day-summary-card">
                <p className="eyebrow">{text.daySummary.nextTitle}</p>
                <p>{text.daySummary.nextSteps[dailyWindowProfile.reason]}</p>
              </article>
            </div>

            <div className="note-footer diary-footer">
              <small>{monthChip}</small>
              <div>
                <button onClick={() => setIsDaySummaryOpen(false)} type="button">
                  {text.daySummary.close}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
