# Body Dashboard Rules Engine Phase 2

**Goal:** 在 Phase 1 的“趋势窗口 + 主策略 + 证据链”基础上，继续把规则引擎升级为更接近个人化解释系统的版本：不仅看最近几次波动，还要把当前状态放回更长窗口的个人基线中理解，并以更明确的阶段状态输出给页面。

> Phase 3 正式规划已单独拆出：见 `docs/rules-engine-phase3-plan.md`。

## Why Phase 2

Phase 1 已经解决了几个关键问题：

- 不再只靠单一阈值
- 开始区分噪声与真实趋势
- 能输出 `primaryMode`
- 能给出基础 evidence 和 confidence

但还存在几个不足：

1. 仍然偏重最近 3-4 次变化
2. “今天偏高/偏低”还没有充分放回个人历史基线理解
3. 页面能看到 evidence，但 evidence 结构还不够分层
4. 恢复回补、增脂控制、保代谢这些状态，缺少统一的阶段标签

因此 Phase 2 的重点不是继续加更多 if-else，而是补上：

- **更完整的个人基线模型**
- **更长窗口趋势**
- **更细化的状态机**
- **更结构化的 evidence UI 数据**

---

## Phase 2 scope

### Keep unchanged
- 页面整体结构仍保持：状态 → 执行 → 趋势
- 周训练 / 护肤的自动切换机制不变
- 体测截图同步到 `measurements.json` 的工作流不变
- `primaryMode` 仍作为顶层主策略输出

### Upgrade in Phase 2
- 为核心指标补充更长窗口特征
- 引入个人基线（baseline）概念
- 从单层 evidence 扩展为 evidence groups
- 引入 `stateStage` 作为更细的状态标签
- 让 UI 能同时看到：主策略 + 阶段 + 长窗口判断

### Not in Phase 2
- 医学级个体模型
- 用户手工配置复杂参数面板
- 外部健康 API / 后端数据库
- 机器学习或预测模型

---

## Key architecture upgrades

### 1. Longer-window features

在 Phase 2 中，每个关键指标不只保留短窗口特征，还补充：

- `window7`
- `window14`
- `window28`
- `baseline28`
- `deviationFromBaseline28`

这样规则层就能同时理解三种信息：

1. **单次值**：今天是多少
2. **短期趋势**：最近几次在往上还是往下
3. **基线偏离**：今天相对你自己过去一段时间的常态偏离了多少

这比单纯比较 `latest vs prev` 更稳。

### 2. Personal baseline model

Phase 2 的 baseline 不是医学标准值，而是：

> 以用户最近一个更长窗口里的中位数/中枢区间，作为“个人常态参考”

它主要用来回答：

- 当前体脂虽然不一定越过绝对阈值，但是否已经明显高于个人基线？
- 当前体重小涨，是不是其实仍处于个人正常波动区间？
- 恢复期的小反弹，是否只是回到基线附近，而不是进入新的恶化阶段？

### 3. State machine layer

Phase 2 增加 `stateStage`，用于表达当前所处的细化阶段。

当前定义：

- `steady_execution`：整体稳定，按计划执行
- `noise_management`：高噪声指标波动较多，先观察
- `muscle_protection`：更偏向保代谢 / 保肌肉
- `fat_gain_control`：更偏向收紧额外热量、防止增脂继续扩张
- `rebound_recovery`：更像恢复 / 糖原回补，而不是需要激进收口

`primaryMode` 仍是页面最直接消费的顶层决策；
`stateStage` 则让页面和文档能更明确解释：**为什么当前是这个 mode。**

### 4. Evidence groups

Phase 1 的 evidence 更接近平铺字符串数组。

Phase 2 改为分层输出：

- `baseline`：相对个人基线的证据
- `trend`：短中期趋势证据
- `risk`：风险/状态判断证据
- `hydration`：补水相关证据

这样 UI 可以更容易做：

- 主策略摘要
- 长窗口判断卡
- 风险说明
- 补水提醒

而不是把所有原因都混成一段话。

---

## Current decision model in Phase 2

### Top-level output

规则引擎继续输出：

- `primaryMode`
- `secondaryFlags[]`
- `confidence`
- `evidence[]`

并新增：

- `stateStage`
- `stageLabel`
- `evidenceGroups`

### Decision priority

优先级仍遵循 Phase 1 的原则，但在 Phase 2 更明确分层为：

1. **保肌 / 保代谢风险**
2. **增脂控制风险**
3. **恢复回补识别**
4. **高噪声观察**
5. **普通稳定执行**

这样可以降低几类常见误判：

- 恢复日体重小涨 → 被误判成必须 tighten_intake
- 近期高噪声指标波动 → 被误判成身体状态明显恶化
- 体脂虽未剧烈跳升，但已经明显高于个人基线 → 页面却仍显示“基本正常”

---

## UI impact in Phase 2

Phase 2 仍然不做大规模 UI 重构，但补充了更明确的消费方式：

### 健康建议区
- 主策略建议中展示 `stageLabel`
- 增加“长窗口判断”提示

### 饮食执行区
- 顶部“主策略模式”卡现在同时展示：
  - `decisionBadge`
  - `stageLabel`
  - `confidence`
- 新增“个人基线判断”卡
  - 展示 baseline + trend 的高价值摘要

### 保持不变
- 训练 / 护肤结构不变
- 趋势图主视觉不变
- 页面主阅读顺序不变

---

## Files touched in Phase 2

### Main logic
- `src/utils/rulesEngine.js`
- `src/utils/healthAnalysis.js`
- `src/data/dailyPlans.js`

### Tests
- `tests/rules-engine.test.js`

### Docs
- `docs/rules-engine-phase2.md`

---

## Verification in this phase

### Logic verification
至少验证以下场景：

1. **只有高噪声指标波动** → `observe_noise`
2. **体重下降但体脂不改善** → `protect_metabolism`
3. **体重与体脂同步上行** → `tighten_intake`
4. **恢复日体重回补、体脂不升反降** → `recovery_first`
5. **长窗口基线明显抬升** → 输出 baseline evidence，并进入 `fat_gain_control`
6. **恢复性回补仍接近个人基线** → 输出 `rebound_recovery`，避免过度收紧

### Engineering verification
本次实际验证命令：

```bash
node --test tests/rules-engine.test.js
npm run lint
npm run build
```

通过标准：

- 测试通过
- lint 通过
- build 通过
- git diff 清晰可审阅

---

## Success criteria for Phase 2

如果满足下面这些条件，就说明阶段二是有效升级：

1. 页面不再只靠最近 1-2 次波动做决策
2. 当前状态能被解释为“相对个人基线是偏离还是回归”
3. 恢复回补、增脂控制、保代谢三类状态更容易区分
4. evidence 能被页面结构化消费，而不是只能拼成一整段文案
5. 规则仍保持前端可维护，而不是继续散落在多个模块里

---

## Suggested Phase 3 directions

如果后续继续做 Phase 3，可以优先考虑：

- 更明确的 baseline 区间（不是单点中位数，而是区间带）
- 训练负荷 / 恢复状态与饮食策略的更强联动
- 趋势图上直接叠加阶段标签或策略变化点
- 对 evidence groups 做更丰富的 UI 展示
- 将规则参数逐步抽离为可维护配置层
