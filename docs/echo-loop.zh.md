# Echo 单独闭环

这个文件只讲 `Echo` 这一条链路，不掺 `Initial Hand` 的生成细节，也不扩展到整天 world loop。

目标是把一件事讲清楚：

`玩家投出一句 Echo -> April 产生反应 -> 本地状态结算 -> 当天记录留下痕迹`

---

## 1. Echo 闭环的职责边界

`Echo` 不是命令系统。

玩家给出的只是一句轻微信号，April 可以：

- `accepted`
- `hesitated`
- `resisted`
- `misread`
- `delayed`
- `transformed`

LLM 负责的是：

- April 怎样理解这句 Echo
- 她怎么表现出这一下反应
- 她夜里会留下怎样的 diary fragment
- 她内部的那一句 thought 更像什么

本地规则负责的是：

- 世界事实是否成立
- 位置、时间、scene 是否真实
- 状态漂移怎么结算
- 关系变化怎么结算
- 这次 Echo 怎么进入 daily record

一句话原则：

`LLM 负责表达，本地负责事实。`

---

## 2. 当前闭环流程

```text
玩家在 Note Echo UI 写一句话
  -> useWorldRuntime.sendNoteEcho()
  -> 组装 AgentBrainInput
  -> resolveAgentBrainLlm()
  -> POST /echo
  -> Worker 调上游 chat/completions
  -> 返回 AgentBrainOutput JSON
  -> toneFilter 检查文风
  -> resolveEchoOutcome()
  -> 本地 state drift / relationship drift
  -> 写入 dailyEchoes
  -> UI 更新这次 reaction
```

---

## 3. 每一层现在在哪

### A. 前端入口

文件：

- `src/world/hooks/useWorldRuntime.ts`

这里负责：

- 读取当前 note 文本
- 读取当前 day / scene / timeOfDay
- 读取当前 initialHand / agentState / relationships / memory
- 组装 `AgentBrainInput`
- 调 `resolveAgentBrainLlm()`
- 在拿到输出后继续走本地 `resolveEchoOutcome()`

### B. Echo prompt

文件：

- `src/llm/echo/prompt.ts`

这里负责：

- 告诉模型这是一个 quiet youth game
- 限制模型不能发明世界事实
- 限制玩家 Echo 只是 signal，不是 command
- 规定输出 JSON shape
- 规定允许的 reaction 枚举

### C. LLM 请求和回退

文件：

- `src/llm/echo/llmResolver.ts`
- `src/llm/echo/toneFilter.ts`
- `src/llm/initial-hand/apiClient.ts`

这里负责：

- 请求 `/echo`
- 校验返回结果是否符合 schema
- 检查文风是不是太像 AI 小作文
- 第一次不过就再试一次
- 再不行就 fallback 到 `fakeResolver`

### D. Worker

文件：

- `worker/src/index.ts`

这里负责：

- 接收 `POST /echo`
- 读取 `input`
- 调 `buildEchoPrompt(input)`
- 请求上游 `/v1/chat/completions`
- 只把 JSON 返回给前端

### E. 本地结算

文件：

- `src/game/echo/echoResolution.ts`
- `src/game/state/stateDrift.ts`
- `src/game/relationships/relationshipDrift.ts`

这里负责：

- 从 `brainOutput.behavior.reaction` 提取 reaction
- 根据 reaction 做本地状态漂移
- 根据 reaction 做本地关系变化
- 生成 `DailyEchoRecord`

---

## 4. 发给 LLM 的核心输入

当前发送的是 `AgentBrainInput`，重点包括：

- `profile`
  - April 的基础人物设定
- `openingHand`
  - 初始手牌 summary / cards / tags
- `currentState`
  - trust / pressure / loneliness / selfSense / curiosity
- `relationships`
  - 当前重要关系的 warmth / tension / note
- `dayContext`
  - day / timeOfDay / scene / visitedScenes
- `echoContext`
  - 当天用了几次 Echo、还剩几次、当前 note 是什么
- `memory`
  - 最近几条日记片段、最近几次 reaction
- `event`
  - 这次到底是 note 还是 spatial，文本是什么

这保证了模型看到的是“刚好够回答这一下 Echo”的上下文，而不是整份世界状态。

---

## 5. 返回给本地的结构

当前要求模型返回 `AgentBrainOutput`：

- `behavior`
  - `reaction`
  - `outwardText`
  - `intendedAction`
- `diary`
  - `fragment`
  - `traceSummary`
- `summary`
  - `mood`
  - `next`
- `stateChanges`
- `relationshipChanges`
- `memory`
  - `internalThought`
- `meta`
  - `source`
  - `fallbackUsed`

注意：

现在本地结算真正依赖的关键字段是 `behavior.reaction`。

也就是说，哪怕模型写得很漂亮，只要 `reaction` 不可信，整条 Echo 闭环就不算可靠。

---

## 6. 失败时怎么保住闭环

当前已经有完整兜底：

1. `/echo` 没配 URL
2. Worker 调上游失败
3. JSON 解析失败
4. schema 校验失败
5. toneFilter 认为太像 AI 小作文

这些情况都会退回：

- `resolveAgentBrainFake`

这样可以保证：

- day flow 不会断
- note 投出后仍然会有 reaction
- diary 和 daily record 仍然能生成

所以现在的 `Echo` 是：

`真实 LLM 优先，fakeResolver 兜底。`

---

## 7. 当前完成度

从工程闭环角度看，`Echo` 现在已经完成了这些部分：

- note -> input 组装
- `/echo` API 接口
- Worker 转发上游模型
- JSON schema 验证
- toneFilter + retry
- fallback 到 fakeResolver
- 本地 state / relationship / daily record 结算

还没真正稳定完成的是：

- 让一条可用的上游模型渠道稳定返回
- 调出更像 April 的 prompt 质感
- 把 tone reject 例子沉淀成文档
- 补 spatial Echo 的真实 LLM 路径验证

---

## 8. 这个闭环的验收标准

`Echo` 单独闭环完成，至少要满足：

1. 玩家投一句 note，前端能拿到一次结构化 `AgentBrainOutput`
2. `reaction` 能进入本地状态结算
3. diary fragment 能进入 daily record
4. 模型失败时不会让 day flow 崩掉
5. April 的表达变化来自 `Initial Hand + currentState + event`
6. 世界事实仍然只由本地状态控制

---

## 9. 当前一句话状态

现在 `Echo` 的代码闭环已经接通了。

卡住的不是本地链路，而是：

`上游模型渠道还没有稳定可用。`
