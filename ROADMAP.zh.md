# April Slice 中文路线图

这个文件给人读，尤其是给我们自己复盘工程顺序用。

英文版 `ROADMAP.md` 保留为执行参考；中文版更关注“现在做到哪了、下一步先看什么、每一阶段到底在验收什么感觉”。

最后更新：2026-06-03。

---

## 总原则

1. 不通过验收题，就不进入下一阶段。
2. LLM 不能替代游戏事实。时间、地点、状态、关系、日程，永远由本地规则决定。
3. LLM 只负责表达、误读、语气、日记、内心残响。
4. 不显示 HUD 数字。玩家看到的是行为和氛围，不是数值。
5. Echo 不是按钮效果。Echo 是信号，April 可以接住、误读、抗拒、延迟，或者转化。
6. prompt、schema、上下文规则只能有一个来源，不能前端一份、Worker 一份、resolver 一份。
7. 每一层代码都要有明确边界：世界运行、游戏规则、LLM 表达、UI 渲染不要混在一起。

---

## 当前已经完成的部分

### 阶段 1：早晨到夜晚的世界闭环

现在基本已经跑通：

```text
早晨
  ↓
出门
  ↓
上学
  ↓
Echo
  ↓
放学
  ↓
夜晚
  ↓
diary
```

关键点：

- April 会按日程自己移动。
- 玩家可以在世界里移动。
- Echo 已经不是纯按钮，而是接进了世界流程。
- Echo 结果会进入本地状态变化、关系变化和每日记录。
- diary 会在一天结束时出现。
- 世界时间 UI 已经放在左上角，方便调试。
- 游戏状态已经拆到 `worldState / worldReducer / useWorldRuntime`。
- `useWorldLoop` 已经拆出玩家移动、镜头、时间推进、April 行动、纸条拾取、一天结束等子层。

阶段 1 的核心验收感是：April 像是在过自己的一天，而不是等玩家按按钮。

---

## 当前刚完成的部分：Initial Hand 的 LLM 层

我们已经把开局人格底色这一层接起来了。

### 已完成

- 用生日 / 出生时间 / 出生地点生成本地 `birth profile seed`。
- 本地计算结构化的西方星盘 seed 和东方命盘 seed，不让 LLM 自己“算盘”。
- LLM 只负责解释这个 seed，生成 Initial Hand。
- Initial Hand 输出必须过 Zod schema。
- fallback 明确带 `FALLBACK` 前缀，避免和真实 LLM 输出混在一起。
- 前端通过 `initialHandApiClient.ts` 请求后端。
- 后端通过 Cloudflare Worker 中转模型 API，API key 不暴露在前端。
- Worker 复用 `buildInitialHandPrompt({ chart })`，不再自己复制一份 prompt。
- `agent.md` 已经写入规则：prompt / context / schema 必须单一来源。

### 当前 Initial Hand 数据流

```text
name + birthDate
  ↓
buildBirthProfileSeed(input)
  ↓
birth profile seed
  ↓
requestInitialHand(...)
  ↓
POST /initial-hand
  ↓
Cloudflare Worker
  ↓
buildInitialHandPrompt({ chart })
  ↓
模型 API
  ↓
InitialHand JSON
  ↓
initialHandSchema.parse(...)
  ↓
进入 WorldRuntimeState.initialHand
```

### 这一层的意义

Initial Hand 不是“性格标签”，也不是数值系统。

它更像 April 开局时的表达底色：

- 她容易怎样误读 Echo。
- 她说话更偏什么语气。
- 她注意世界里的什么东西。
- 她的日记会绕着哪些主题打转。
- 她不是被标签控制，而是被这些 tone token 轻轻偏转。

---

## 下一步：阶段 2 的真正重点

Initial Hand 接上 LLM 之后，下一步不是马上让 LLM 控制 April 行为。

下一步应该做：

```text
Initial Hand
  ↓
进入 Echo prompt
  ↓
llmResolver 替代 fakeResolver
  ↓
toneFilter 拦住廉价 chatbot 味
  ↓
同一场景对比 fakeResolver 和 llmResolver
```

也就是说，接下来要做的是 **Echo 反应的 LLM resolver**。

---

## 阶段 2A：把 Initial Hand 接进 Echo 上下文

目标：April 对 Echo 的反应开始受到 Initial Hand 影响，但不改变游戏事实。

要做：

- 整理 `AgentBrainInput` 里的 `openingHand` 字段。
- 明确 Initial Hand 进入 prompt 的方式：
  - `summary`：作为整体底色。
  - `cards`：作为开局手牌。
  - `tags`：作为 tone token 和误读偏向。
- 确保这些内容只影响表达和理解方式，不直接改变状态数值。
- 检查 `resolveEchoOutcome` 里传入的上下文，不能再出现写死的日程事实。

验收：

同一句 Echo，在不同 Initial Hand 下，April 的表达和误读方向不同，但她的日程、位置、时间仍然由本地世界状态决定。

---

## 阶段 2B：实现 `llmResolver`

目标：让真实模型生成 Echo 反应。

要做：

- 新建或整理 `llmResolver.ts`。
- 它实现和 `fakeResolver` 一样的接口。
- 输入是 `AgentBrainInput`。
- 输出必须过 `agentBrainOutputSchema`。
- 请求必须走 Worker，前端不能直接拿 API key。
- 如果模型请求失败、JSON 解析失败、schema 不通过，就 fallback 到 `fakeResolver`。
- fallback 要安静地保住游戏流程，但调试时要能看出来。

验收：

同一个 Echo，可以在不改世界规则的情况下，从 fakeResolver 切到 llmResolver，并且 day flow 不崩。

---

## 阶段 2C：上下文控制

目标：让 LLM 看到“刚好够用”的事实，不给它乱编空间。

要做：

- 把 prompt 里的上下文分层：
  - 角色底色：Initial Hand。
  - 当前事实：day、timeOfDay、scene、visitedScenes。
  - 当前状态：agentState。
  - 关系状态：relationships。
  - Echo 事件：玩家写了什么。
  - 记忆：最近日记、最近内心、最近反应。
- 明确哪些事实只能读，不能改。
- 明确哪些输出可以进入本地规则。
- 不把整份世界状态全塞给模型。

验收：

模型回答不会发明 April 不在的地点、没发生过的事件、不存在的人际关系。

---

## 阶段 2D：toneFilter

目标：挡住“像 chatbot”的句子。

要做：

- 新建 `toneFilter.ts`。
- 拦截太像总结、疗愈、顿悟、三段式抒情的输出。
- 禁止这类感觉：
  - “她终于明白了……”
  - “她的心被温暖了……”
  - “这一刻，她意识到……”
  - 先痛苦、再理解、最后成长的模板句。
- 被拦截时可以重试一次。
- 第二次还不行，就 fallback 到 fakeResolver。
- 维护 `docs/tone-rejects.md`，记录被拒绝的例子。

验收：

April 的表达更像一个人短暂露出的反应，不像模型在替她写作文。

---

## 阶段 2E：fakeResolver vs llmResolver 对比

目标：判断 LLM 版到底更像人，还是更像 chatbot。

要做：

- 用同一个 Initial Hand。
- 用同一天、同一个场景、同一句 Echo。
- 分别跑 fakeResolver 和 llmResolver。
- 对比：
  - outwardText 是否更自然。
  - diary 是否更像 April 自己写的。
  - reaction 是否还符合本地状态。
  - 有没有乱编事实。
  - 有没有廉价顿悟。

验收题：

```text
同一场景下，
LLM 版是否比 fakeResolver 更像一个具体的人，
而不是更像一个会写漂亮句子的聊天机器人？
```

如果答案是否，就继续调 prompt / context / toneFilter，不进入阶段 3。

---

## 阶段 2F：把 Echo 反应落到世界里

目标：April 不只是“说出一个反应”，而是真的被这次 Echo 碰到，接下来几分钟和夜里都会留下痕迹。

当前最小版本已经落地：

- `Echo` 会生成一个短时行为余波，而不是整天挂着不散。
- 余波会先带来一次当场停顿，再影响接下来几秒的移动节奏。
- 不同 reaction 会映射到不同的停顿时长、校门口停留时长和移动速度。
- 这些 effect 仍然只改“她怎么动”，不改日程、地点和世界事实。

要做：

- 把 `AgentBrainOutput.behavior` 里的结果接进即时行为层。
- 把 `outwardText` 背后的姿态拆成可执行的短时 world effect。
- 例如：
  - 停一下。
  - 走慢一点。
  - 绕开人。
  - 不立刻靠近。
  - 朝某个方向看过去，但不走近。
- 给 Echo 增加一个“短时余波”层，不只在当场结算一次。
- 让 `internalThought` 和 `reaction` 影响后续 1-2 个 scene 的倾向。
- 让 `diary.fragment` 不只是展示文本，而是进入夜间回收和次日残响。
- 明确哪些字段只影响表达，哪些字段可以影响动作和节奏。
- 不让 LLM 直接决定路径、日程、地点真相，仍然由本地规则执行。

验收：

同一句带刺的 Echo 之后，April 不只是生成一段像样的文字，而是会：

- 当场停顿或偏移。
- 后续几分钟保持被碰到的节奏。
- 夜里 diary 能回收这次余波。
- 第二天状态留下轻微残响。

一句话判断：

```text
她不只是像 April 那样说了一句，
而是真的像一个被碰到的人那样继续过完这一天。
```

---

## 阶段 3：世界密度

目标：世界不再只是几个节点和一条日程，而是开始有天气、日历、旁人和环境细节。

要做：

- 天气系统：晴天、阴天、雨、海雾。
- 文化日历：新学期、樱花、考试临近。
- 第二个命名 NPC：家人或同学。
- 环境细节：每个地点每天有一点可被注意到的变化。
- 四月底的戏剧锚点：一封没寄出的信、一班可能错过的列车、一句没说出口的话。

验收：

两个不同 Initial Hand 的 April 走过同一个 7 天，日记和记忆应该像两个不同的人穿过同一个四月。

---

## 阶段 4：完整 30 天结构

目标：从“能跑一天”变成“能跑完整四月”。

要做：

- `gameDay` 从 1 到 30。
- 每天 rollover。
- 每天 Echo 机会有限，但不显示数字。
- 长期记忆总结。
- 单存档位。
- Day 30 夜晚的结束画面。

验收：

一个没看过项目的人玩完后，能用自己的话描述 April，并记得至少两个具体瞬间。

---

## 阶段 5：2D 打磨

目标：先把 2D 版本做到情绪上限，再考虑 3D。

要做：

- April 和玩家的像素行走动画。
- 场景美术替换占位色块。
- 夜晚版本。
- 脚步声、远处列车、风声、纸张声。
- 开头十分钟体验重做。

验收：

找 5 个陌生玩家试玩，至少有一个人出现“这个人好像真的存在过”的感觉。

---

## 阶段 6：Three.js 切换

只有前面都过了，才进入 3D。

保留：

- `game/`
- `llm/`
- `agentMind/`
- 世界图和规则层

替换：

- Pixi 渲染层
- 2D body
- 2D camera
- 场景呈现

第一步不是做美术，而是白盒 3D：

```text
胶囊 April
胶囊玩家
WASD
跟随镜头
可走的空间
```

如果 3D 白盒没有比 2D 更有“空间感”，先修镜头和光，不要急着堆美术。

---

## 现在最该做的一个任务

下一步建议只做一件事：

```text
把 Initial Hand 接进 Echo 的 LLM prompt，
然后实现第一版 llmResolver。
```

不要先做更复杂的行为控制，也不要让 LLM 决定 April 去哪里。

我们现在要验证的是：

```text
LLM 能不能让 April 的表达更像一个人，
同时不破坏本地世界规则。
```
