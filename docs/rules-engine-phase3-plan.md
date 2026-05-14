# Body Dashboard Rules Engine Phase 3 Plan

> **For Hermes:** 先按本文档把 Phase 3 拆成可执行包；默认从 Package 3A 开始，用 TDD 落地。

**Goal:** 在 Phase 2 已有“长窗口基线 + 状态机 + evidence groups”的基础上，把规则引擎继续升级为**更稳定、更可解释、更易维护**的个人化判断系统。

**Architecture:** Phase 3 不再把“方向”当成松散 wishlist，而是明确拆成 3 个执行包。整体顺序为：先升级判断层，再升级可视化层，最后做工程化配置抽离。这样可以保证每一层都有清晰的输入/输出，不会把 UI 变化和规则变化耦在一起。

**Tech Stack:** React + Vite + node:test + ESLint + ECharts

---

## 1. Why Phase 3 exists

Phase 2 已经解决了这些问题：

- 不再只看最近 1-2 次波动
- 已有 `baseline28`
- 已有 `stateStage`
- 已有 `evidenceGroups`
- UI 已能消费主策略 + 阶段 + 长窗口判断

但 Phase 2 仍然有 3 个明显边界：

1. **baseline 还是“单点中位数”**，对“正常波动区间”表达还不够
2. **训练负荷 / 恢复日语义还没有完全进入决策输出层**，更多还是消费层自己解释
3. **规则阈值仍写死在引擎里**，继续演进时维护成本会上升

所以 Phase 3 的目标不是“再堆规则”，而是把规则系统从 **Phase 2 的增强版规则引擎**，升级为 **更稳定的区间判断 + 可视化解释 + 可维护配置层**。

---

## 2. Phase 3 的 5 个方向，正式归并为 3 个执行包

### 原始 5 个方向

1. 更明确的 baseline 区间（不是单点中位数，而是区间带）
2. 训练负荷 / 恢复状态与饮食策略的更强联动
3. 趋势图上直接叠加阶段标签或策略变化点
4. 对 evidence groups 做更丰富的 UI 展示
5. 将规则参数逐步抽离为可维护配置层

### 正式执行分组

#### Package 3A — 判断层升级
对应方向：**1 + 2**

核心目标：
- 把 `baseline28` 从“单点”升级为“区间带”
- 把训练负荷 / 恢复语义显式写入规则输出
- 让决策结果更像“当前偏离个人常态多少、今天该怎么执行”

#### Package 3B — 可视化解释升级
对应方向：**3 + 4**

核心目标：
- 趋势图上直接标出阶段标签 / 策略变化点
- 页面中把 `evidenceGroups` 展示得更结构化
- 让用户从图和卡片上都能看懂“为什么今天是这个模式”

#### Package 3C — 工程化配置升级
对应方向：**5**

核心目标：
- 把阈值和参数从规则代码里逐步抽离
- 保持前端可维护，不引入后端复杂度
- 为后续持续调参、回归测试、文档同步打基础

---

## 3. Phase 3 推荐顺序

### Step order

1. **先做 Package 3A：判断层升级**
2. **再做 Package 3B：可视化解释升级**
3. **最后做 Package 3C：工程化配置升级**

### 原因

- 如果判断层还没稳定，先做图表标记只会把不稳定逻辑可视化
- 如果输出结构还没定型，太早抽配置会导致参数层反复改
- 所以最合理顺序是：
  - 先把“判断是什么”做对
  - 再把“如何展示判断”做清楚
  - 最后把“如何维护判断”做工程化

---

## 4. Package 3A — 判断层升级（默认先做）

### Goal

把 Phase 2 的“个人基线 + stateStage”继续升级为**区间化 baseline 判断 + 训练负荷显式语义**。

### Scope

#### 4.1 baseline 单点 → baseline 区间带

Phase 2 只有：
- `baseline28`
- `deviationFromBaseline28`

Phase 3A 增加：
- `baselineBand28.low`
- `baselineBand28.mid`
- `baselineBand28.high`
- `baselineBand28.width`
- `baselinePosition`（`below_band | within_band | above_band`）
- `withinBaselineBand`

目标：
- 不只回答“今天比中位数高了多少”
- 还要回答“今天是否仍在个人正常波动区间里”

#### 4.2 训练负荷 / 恢复语义显式进入输出

在 Phase 3A 中，规则引擎输出层新增：
- `trainingLoad`
- `trainingLoadLabel`
- `intakeStrategy`

建议的负荷枚举：
- `lower_body_strength`
- `upper_body_strength`
- `cardio`
- `recovery`
- `mixed`
- `general`

建议的 intake 策略枚举：
- `hold_steady`
- `support_training`
- `trim_extras`
- `protect_recovery`

目标：
- 页面不再只拿 `primaryMode` 做间接推导
- 规则层直接告诉消费层：**今天是什么负荷背景、饮食应该偏支持还是偏收紧**

#### 4.3 baseline band 进入状态判断

Phase 3A 让下面几类判断更稳：
- 恢复日体重小涨，但仍在 band 内 → 更像恢复波动
- 体脂虽然只比中位数略高，但已经持续站上 band 上沿 → 更值得收紧
- 力量日若处于保肌/保护模式，不应再给出过度收紧的执行暗示

### Files

- Modify: `src/utils/rulesEngine.js`
- Modify: `src/utils/healthAnalysis.js`
- Modify: `src/data/dailyPlans.js`
- Test: `tests/rules-engine.test.js`
- Docs: `docs/rules-engine-phase3-plan.md`

### Acceptance criteria

- `decision` 中新增 baseline band 相关输出
- `decision` 中新增 `trainingLoad` / `trainingLoadLabel` / `intakeStrategy`
- 恢复日 + band 内回补场景能更明确落入恢复导向
- 饮食执行区能展示“当前在个人波动带中的位置”与“今日负荷语义”
- 测试 / lint / build 全通过

---

## 5. Package 3B — 可视化解释升级

### Goal

让趋势图和解释卡片能够直接表达阶段变化，而不是只靠文字说明。

### Scope

#### 5.1 趋势图叠加阶段标签或策略变化点

在 `TrendChart` 上补充：
- 当前阶段标签
- 关键模式切换点
- 必要时叠加 baseline band 辅助线/带状区域

#### 5.2 evidenceGroups UI 分层展示

把 `baseline / trend / risk / hydration` 分组从“仅用于拼接文案”升级成真正的卡片级展示结构。

### Candidate files

- Modify: `src/components/TrendChart.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/AdvicePanel.jsx`
- Modify: `src/components/DailyPlanPanel.jsx`
- Possibly modify: `src/utils/healthAnalysis.js`

### Acceptance criteria

- 趋势图中能直接看到阶段/策略变化信息
- evidence groups 在页面上是结构化展示，而非只在长句中出现
- 不破坏当前“状态 → 执行 → 趋势”的主阅读顺序

---

## 6. Package 3C — 工程化配置升级

### Goal

把阈值、band 参数、优先级参数逐步抽离为可维护配置层。

### Scope

建议逐步抽出：
- body fat / weight / hydration 等阈值
- baseline band 计算窗口大小
- `stateStage` 切换阈值
- intake 策略与训练负荷映射参数

### Candidate files

- Create: `src/config/rulesEngineConfig.js`
- Modify: `src/utils/rulesEngine.js`
- Modify: `tests/rules-engine.test.js`
- Create if needed: `docs/rules-engine-config.md`

### Acceptance criteria

- 主要阈值不再散落在多个 `if` 内
- 改参数不需要重写整段规则逻辑
- 测试能覆盖默认配置行为

---

## 7. Default execution decision

### 默认现在就开始：Package 3A

原因：
- 它直接提升判断稳定性
- 这是 Package 3B 和 3C 的前置层
- 当前代码结构已经具备 Phase 2 输出层，适合继续往 `decision` 里扩展

### 本轮默认实现内容

本轮先做 3A 的最小闭环：

1. baseline band 输出
2. `baselinePosition` / `withinBaselineBand`
3. `trainingLoad` / `trainingLoadLabel`
4. `intakeStrategy`
5. 页面文案接入上述新输出
6. 对应测试补齐

这意味着：
- **本轮不碰趋势图标记**
- **本轮不做配置抽离**
- 只把 Phase 3 真正启动在“判断层升级”上

---

## 8. Verification commands

```bash
node --test tests/rules-engine.test.js
npm run lint
npm run build
```

---

## 9. Success definition for Phase 3A

如果满足以下几点，就说明 Phase 3 已经真正开始，而不只是文档上存在：

1. 规则引擎不再只输出单点 baseline，而能输出 baseline band
2. 能区分“高于中位数”与“超出正常波动带”
3. 输出层显式包含训练负荷语义和 intake 策略语义
4. 页面文字能够直接解释今天为何偏支持、偏恢复、或偏收紧
5. 新增测试能够覆盖这些行为，并通过构建验证
