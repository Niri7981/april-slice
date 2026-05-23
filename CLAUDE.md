# CLAUDE.md

April Slice 项目的工作契约。每次新会话第一时间读这份。
产品宪章见 `agent.md`，本文档只讲"现在该怎么做"和"绝对不要做什么"。

---

## 一句话产品

浏览器里跑的实验性 agent 游戏：玩家是不可见陪伴，自己有像素小人可以走；agent 是 LLM 驱动的独立像素小人，在日本海边小镇过自己的四月。玩家通过 Echo 注入信息，agent 不一定接住。

参照系：*The Friends of Ringo Ishikawa*（系统化日常 + 时间作机制），bruno-simon.com（浏览器里端出一整个世界）。

---

## 产品骨架（五块）

玩家视角的产品由这五块组成。任何一块缺失，April Slice 就不成立。

```
1. 入场 Setup
   生日 + 名字 + 性别 + 视觉 → Initial Hand（命盘性格种子）
   一行氛围文本，没有命盘图表

2. 世界 World
   日本海边小镇，4 月
   地点：房间 / 学校 / 路 / 海 / 站
   时间：白天 / 放学 / 夜晚
   天气、樱花、文化日历
   agent 自己在里面活

3. 陪伴 Presence
   玩家作为不可见小人在世界里走
   可观察、可跟随、可不跟随
   没有控制权，只有在场

4. 触碰 Echo
   每天 2 基础 + 0-2 agent 开放
   Note Echo（信纸）/ Spatial Echo（指向某物）
   反应：accept / hesitate / resist / misread / delay / transform
   Echo 可能无声

5. 痕迹 Memory
   diary fragment（玩家可见）
   internal thought（玩家不可见，喂回明日 prompt）
   关系记忆 + 状态漂移
   30 天后 April 结束，不可重来
```

**当前进度对照：**

| 块 | 状态 |
|---|---|
| 1. 入场 | ⚠️ 部分有（AgentProfile / DestinySeed 在 types.ts 里），死代码未接 |
| 2. 世界 | ❌ 几乎不存在，只有 React 场景切换 + 静态图 |
| 3. 陪伴 | ❌ 不存在，玩家不是世界里的实体 |
| 4. 触碰 | ✅ 规则层完整，但触发还是按钮不是世界交互 |
| 5. 痕迹 | ✅ 规则层有，缺 diary UI 和真 LLM |

**当前 sprint 的所有工作落在第 2 块和第 3 块**——世界和陪伴是现在最缺的两根肋骨。

---

## 已拍板（不再讨论）

- 先 2D 把机制做透，3D 是 v2
- 玩家 = 不可见陪伴 + 可在地图自由走的像素小人
- Agent = 像素小人 + LLM 大脑
- 浏览器世界 = canvas（PixiJS），不是 React 切场景
- 世界先行，密度撑独立性
- Echo = 纯信息注入，可以无声
- LLM 写表达，规则写状态
- Run state 是权威
- 没有 HUD 数字，所有状态物质化
- 命盘进表达层，不进规则层

---

## 目标架构（四层）

```
Presentation:   Canvas (PixiJS) + 极少量 React UI
World Layer:    tick loop / entities / 相机 / pathfinding / scheduler / agentMind
Rules Layer:    runState + stateDrift + relationshipDrift + echoResolution + dayRecord
LLM Layer:      brainTypes + resolver + promptBuilder + toneFilter
```

纪律：上层只读下层快照，下层不知道上层存在。
后果：2D → 3D 时只换最上层，下面三层全复用。

---

## 目标目录

```
src/
  world/        新加：map / pathfinding / calendar / weather / tick
  entities/     新加：body / agentBody / playerBody / camera
  agentMind/    新加：schedule / intent / encounters
  game/         已有，小改：runState / stateDrift / relationshipDrift / echoResolution / dayRecord / saveState
  llm/          已有：brainTypes / fakeResolver（+ llmResolver / promptBuilder / toneFilter 待加）
  app/          瘦身：只管壳
  ui/           新加，永远小：DiaryView / NotePaper / SetupForm
```

---

## 当前 Sprint：3 周端出会动的世界

目标：agent 能从家走到学校 + 玩家陪着走 + 跟随相机 + 没有 UI。完全本地规则，不接 LLM。

### Week 1：PixiJS 脚手架
- 装 pixi.js + @pixi/react
- 白盒地面 + 两个胶囊体（agent 蓝、player 绿）
- 玩家 WASD + 相机带 lag 跟随
- agent 不动
- 删掉当前所有 React 场景切换、CSS sprite、debug 按钮
- **验收**：按 5 分钟方向键绕 agent 走一圈，心里有没有"在一个空间里"的感觉

### Week 2：agent 自主行为（命门级验收）
- 5-7 个地点节点 + 节点间路径 + A* on graph 寻路
- agent 硬编码 schedule：7:30 起 / 7:50 出门 / 8:30 教室 / 12:00 食堂 / 15:30 放学 / 17:00 回家 / 22:00 房间
- agent 自己走，玩家可跟可不跟
- 完全没有 UI / Echo / 交互键
- **验收**："她真的在过自己的日子"那一下有没有。**没有，停下重做，不要往后推**

### Week 3：Echo 物件化 + 接回规则层
- 信纸作为可拾取物件（不是按钮）
- 玩家走过去按 E 拾起 → NotePaper UI → 写完触发 echoResolution（fakeResolver）
- agent 收到 reaction 后行为偏移（pressure 高走得慢、openness 低进教室前在走廊停 30 秒）
- 日终：进房间关灯 → diary 浮出 → 保存
- 加 1 个占位命名 NPC
- **验收**：跑通早晨→出门→上学路→教室→Echo→放学→夜晚→diary，全程零 HUD 数字

---

## 设计纪律（绝对不要做）

1. **不在 Day 1 跑通前画任何正式 sprite**。第一版全用占位（白盒 / 几何形 / 纯色块）。
2. **不在 sprint 结束前接真 LLM**。先用 fakeResolver 跑通整个世界。
3. **不再往 App.tsx 加新场景**。新场景全部加在新世界层。
4. **不在 UI 显示任何数字**：Echo 剩余、状态值、day 几、信任度——全部物质化或不显示。
5. **不让 LLM 决定数值**。LLM 只写表达层（行为文本、diary、internal thought），数值由本地规则算。
6. **不让 Echo "管用"**。任何让玩家觉得"按了就响"的反馈（震动、音效、icon 变色）都拒绝。Echo 投出后界面要安静。
7. **不做"完美结局"**。任何"玩得对就能补回去"的设计要砍。

---

## 已识别问题（按修复成本）

### 即修
- `src/game/types.ts` 70% 是死代码，与实际跑的 stateDrift 7 字段冲突
- 7 个状态字段在 4 处重复列举（stateDrift / dayRecord / runState）
- `relationshipDrift.ts` 用中文字面量做 role 匹配（"同桌" / "家人"），加英文 / 改名字会静默失效

### 换骨（本 sprint 解决）
- 没有 tick loop，世界不会自己跑
- 没有空间层，"教室"是 React state 不是坐标
- 没有相机
- agent 没有自主行为
- CSS sprite 是装饰不是实体

---

## 暂不决定（sprint 结束后再谈）

- April 末尾的戏剧锚点（一封信？一班车？一句没说出口的话？）
- 命盘三选一（八字 / 紫微 / 西占）
- 状态量减肥（7 → 5）
- Echo 完全位置化 vs 位置增强
- 第二、第三个命名 NPC
- 第一版正式 sprite

---

## 与 Claude 的工作约定

- 所有对话默认中文
- 直接指出问题，不要软化、不要鼓励
- 给具体取舍，不给"看你需求"式答案
- 写代码前先读相关文件，不凭印象
- `ROADMAP.md` 已过时（早期"月切片回合制"版本），以本文档为准
