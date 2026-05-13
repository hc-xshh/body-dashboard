# Body Dashboard Rules Engine Phase 1 Upgrade Plan

**Goal:** 将当前基于阈值和短期 if-else 的实用规则，升级为更稳健、可解释、低误判的 Phase 1 规则引擎，同时保持现有 UI 结构与自动截图同步工作流不变。

## Why this upgrade

当前规则引擎已经能用，但主要问题是：

1. 过于依赖固定阈值
2. 对 BIA 高频噪声（肌肉 / 水分 / 骨量 / BMR）防误判不够系统
3. 趋势窗口偏短，容易被局部波动干扰
4. 多个规则同时命中时，缺少统一的“主策略层”
5. 页面能看到很多建议，但很难一眼看出“今天最该做什么、为什么”

Phase 1 不追求完整医学建模，而是优先解决：

- **更少误判**
- **更强解释性**
- **更稳的趋势判断**
- **更统一的执行策略输出**

---

## Phase 1 scope

### Keep unchanged
- 页面总体结构（状态 → 执行 → 趋势）
- 训练 / 护肤的周计划机制
- 体测截图同步到 `measurements.json` 的工作流
- 核心指标卡片和趋势图的主要展示方式

### Upgrade in Phase 1
- 健康建议与饮食微调背后的规则内核
- 趋势分析方式（多窗口 + 更稳的确认机制）
- 统一主策略输出（primary mode）
- 证据链输出（evidence）
- 可信度分层（confidence）

### Not in Phase 1
- 机器学习模型
- 外部医疗 API
- 用户手工维护复杂阈值
- 大规模 UI 改版

---

## Architecture after upgrade

### Layer 1: feature extraction
从 `latest + prev + history` 中提取结构化特征：

- 单次值：`latest.bodyFat`, `latest.weight`, `latest.water` ...
- 短期 delta：最近 2 次 / 4 次变化
- 多窗口平均：近 7 / 14 / 28 天
- 连续趋势：最近 3-4 次是否持续上升/下降
- 个体基线：相对近 28 天中位或均值的偏离
- 测量可信度：是否有足够历史点、是否属于高噪声指标

### Layer 2: signal generation
将特征翻译成标准化信号：

- `fat_high`
- `fat_rising_persistent`
- `visceral_fat_high`
- `hydration_low`
- `hydration_declining`
- `muscle_drop_possible`
- `muscle_drop_confirmed`
- `bmr_low_confidence`
- `metabolism_protection_needed`
- `recovery_rebound_likely`
- `intake_tightening_needed`
- `noise_high`

每个信号附带：
- `severity`
- `confidence`
- `evidence[]`

### Layer 3: decision layer
统一决策出：

- `primaryMode`
- `secondaryFlags[]`
- `confidence`
- `evidence[]`

候选主策略：
- `hold_course`：方向正常，稳定执行
- `protect_metabolism`：优先保代谢 / 保蛋白 / 防误减脂
- `tighten_intake`：优先削减额外热量与晚间冗余摄入
- `recovery_first`：今天以恢复和稳定为主，不做激进饮食动作
- `observe_noise`：数据噪声较高，先观察，不进行大调整

### Layer 4: output rendering
把统一策略翻译成页面消费的数据：

- 健康建议卡
- 饮食 badge / subtitle
- 今日策略卡
- 趋势判断卡
- reminders
- 证据摘要（适度展示）

---

## Priority model

当多个信号同时命中时，按以下优先级处理：

1. **噪声 / 低可信度防误判**
2. **保代谢 / 保肌肉**
3. **体脂 / 内脏脂肪风险控制**
4. **训练日适配（力量 / 下肢 / 有氧 / 恢复）**
5. **补水 / 执行提醒 / 文案优化**

这样可以避免出现：
- 一边触发代谢保护
- 一边又建议继续极端收口

---

## Phase 1 concrete implementation

### 1. Create a new rules engine module
新增：
- `src/utils/rulesEngine.js`

职责：
- 统一封装 feature extraction / signal generation / decision layer
- 输出给 `App.jsx` 和 `dailyPlans.js` 可直接消费的结果

### 2. Keep `healthAnalysis.js` lightweight
- 保留指标状态颜色判断函数
- 将 `generateAdvice` 升级为消费新 rules engine 的输出，或者保留兼容 wrapper

### 3. Refactor diet plan generation
在 `dailyPlans.js` 中：
- 将当前散落在 `getDietPlan()` 中的趋势判断与组合规则，迁移为调用 `rulesEngine`
- `getDietPlan()` 只负责：
  - 取基础模板
  - 按 `primaryMode + secondaryFlags + training context` 做结构化调整
  - 生成页面卡片数据

### 4. Add evidence-aware UI output
不大改 UI，但允许：
- 健康建议里出现更明确的“原因”描述
- 饮食 subtitle 更聚焦主策略
- 必要时在饮食卡里加入 1 张“今日策略”卡和 1 张“趋势判断”卡

### 5. Add validation harness
新增简单验证脚本或测试，验证至少这些场景：

- 体重降但体脂不降 → `protect_metabolism`
- 体重和体脂同时上升 → `tighten_intake`
- 体重小涨但体脂下降 → `hold_course` 或 `recovery_first`
- 高噪声指标单次波动 → 不应触发强动作
- 水分连续下降 + 当前偏低 → 补水提醒升级
- 肌肉下降但没有伴随体脂/BMR恶化 → 不升级为强负向判断

---

## Files to touch in Phase 1

### New
- `src/utils/rulesEngine.js`
- `docs/rules-engine-phase1.md`（本文件）
- optional: `scripts/validate-rules.mjs` 或 `tests/rules-engine.spec.mjs`

### Modify
- `src/utils/healthAnalysis.js`
- `src/data/dailyPlans.js`
- `src/App.jsx`
- `README.md`（后续可补规则引擎介绍）

---

## Verification checklist

### Logic verification
- 单次肌肉 / 水分波动不会过度触发激进调整
- 体重-体脂背离关系被正确识别
- 恢复波动不会误判成脂肪反弹
- 多个信号同时存在时，主策略唯一且可解释

### Product verification
- 页面仍能正常渲染
- 饮食模块更聚焦“今天该做什么”
- 健康建议比过去更有证据感
- 顶部同步状态逻辑不受影响

### Engineering verification
- 本地 build 通过
- 验证脚本 / 测试通过
- git diff 清晰可审阅
- push 后线上可访问

---

## Success criteria for Phase 1

如果完成后满足以下条件，就说明升级成功：

1. 页面建议更少“见波动就反应过度”
2. 恢复期、噪声期、误减脂风险期能被区分开
3. 用户不需要理解规则实现，也能看懂今天为什么给出这个建议
4. 规则逻辑被集中到可维护模块，而不是继续散落在多个 if-else 中

---

## Follow-up after Phase 1

Phase 2 再考虑：
- 更完整的个人基线模型
- 更长窗口趋势
- 更丰富的 evidence UI
- 更细化的状态机
