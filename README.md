# Body Dashboard

Daemon 的个人身体数据仪表盘。项目把**最新体测、今天的周计划、规则引擎判断和历史趋势**整理成一个适合每天打开查看的页面：**状态 → 执行 → 趋势**。

**正式线上地址**：`https://body-dashboard.pages.dev`

---

## 当前页面结构

### 1. 顶部摘要
- 最新体测日期 / 时间
- 体型、身体年龄、当天训练主题
- 体测同步状态双态提示：
  - **今日已同步**：说明建议基于当天最新体测
  - **今日未同步**：说明今天沿用最近一次体测数据
- 阅读路径导航：**状态 / 执行 / 趋势**

### 2. 状态区
- 核心指标卡片：体重、体脂率、BMI、基础代谢、内脏脂肪、水分、骨量、综合得分
- 体重卡同时展示：
  - **健康参考区间**（BMI 推导）
  - **个人近期波动区间**（近 30 天）
- 健康建议区已经改成更轻的结构：
  - 顶部总判断
  - 基线 / 趋势 / 风险 / 补水分组依据
  - 列表式建议

### 3. 执行区
当前三张执行卡都已经统一成同一种信息结构：

1. 短说明
2. 一句主结论
3. 一行摘要信息
4. 2-3 条重点提示
5. 时间线式执行内容
6. 底部提醒框

具体包括：
- **今日训练内容**：训练执行单 + 执行提醒
- **今日护肤流程**：早晚流程 + 护理提醒
- **今日推荐饮食**：饮食执行单 + 执行提醒

### 4. 趋势区
- 单一趋势总览图（默认体重 / 体脂 / 肌肉）
- 可切换指标 chips
- 时间范围切换：
  - **近 7 天**
  - **近 10 天**
  - **近 2 周**
  - **近 1 个月**
- 允许空选择 / 空时间窗，不强制恢复默认曲线
- 顶部使用自然语言摘要说明最近一次体测判断

### 5. 历史记录
- 历史记录表格
- 默认每页 7 条
- 可切换：**7 / 10 / 20 / 50**
- 支持上一页 / 下一页

---

## 当前设计原则

这个项目是给自己每天看的，所以优化重点不是“报表感”，而是：

1. **低认知负担**：打开就知道今天是什么状态
2. **直接可执行**：训练 / 护肤 / 饮食卡片要顺着看就能做
3. **趋势可回看**：趋势图和历史表回答“最近在怎么变”
4. **不放大单次波动**：优先多窗口判断、个人基线和波动带

---

## 数据来源与生成逻辑

### 体测数据
- 文件：`src/data/measurements.json`
- 来源：Hermes Agent 解析体测截图后更新
- 用途：
  - 顶部最新记录
  - 核心指标
  - 健康建议
  - 趋势图
  - 历史记录
  - 饮食微调输入

### 周计划 / 执行模板
- 训练、饮食、护肤计划来自 `src/data/` 下的生成文件与 `src/data/dailyPlans.js`
- 页面会按 **Asia/Shanghai** 时区自动判断今天是周几，并切换到当天对应的执行内容

### 规则引擎
核心逻辑位于：
- `src/utils/rulesEngine.js`
- `src/utils/healthAnalysis.js`
- `src/utils/decisionPresentation.js`

规则引擎目前会综合：
- 最新体测
- 短 / 中 / 长窗口趋势
- 个人基线偏离
- baseline 波动带位置
- 当天训练语义（力量 / 有氧 / 恢复）

输出包括：
- 主策略模式
- 阶段状态
- 训练负荷语义
- intake 策略
- 分组证据
- 置信度

---

## 每天内容是怎么更新的

页面不是运行时联网取数据，也不是后端数据库驱动，而是：

- **静态体测数据文件**
- **本地周计划配置**
- **前端规则计算**
- **重新构建部署**

实际更新链路：

1. 发送新的体测截图
2. Hermes Agent 识别结构化指标
3. 更新 Obsidian / 本地数据文件
4. 更新 `src/data/measurements.json`
5. 本地构建
6. `git commit` / `git push origin main`
7. Cloudflare Pages 自动部署

如果今天没有新体测：
- 训练 / 护肤仍然会自动切换到今天版本
- 与身体状态相关的展示继续使用最近一次体测
- 顶部会明确提示当前是不是沿用历史数据

---

## 关键文件

```text
src/
├── App.jsx                         # 页面主结构
├── components/
│   ├── AdvicePanel.jsx             # 健康建议区
│   ├── DailyPlanPanel.jsx          # 执行卡统一组件
│   ├── ReadingGuide.jsx            # 阅读路径导航
│   └── TrendChart.jsx              # 趋势总览
├── data/
│   ├── measurements.json           # 体测历史
│   ├── dailyPlans.js               # 训练 / 饮食 / 护肤逻辑拼装
│   ├── trainingPlans.generated.json
│   ├── dietPlan.generated.json
│   └── skincarePlan.generated.json
└── utils/
    ├── dashboardState.js           # 空数据 / 趋势范围 / 分页状态
    ├── rulesEngine.js              # 规则引擎
    ├── healthAnalysis.js           # 建议生成
    ├── decisionPresentation.js     # 人类可读文案
    └── weightPresentation.js       # 体重双参考区间
```

---

## 测试与构建

### 常用命令
```bash
npm install
npm run dev
npm run build
```

### 推荐回归测试
```bash
node --test \
  tests/trend-presentation.test.js \
  tests/decision-presentation.test.js \
  tests/dashboard-state.test.js \
  tests/rules-engine.test.js \
  tests/weight-presentation.test.js \
  tests/app-structure.test.js \
  tests/reading-guide.test.js \
  tests/training-reminders.test.js \
  tests/page-cleanup.test.js \
  tests/advice-cleanup.test.js \
  tests/range-and-history.test.js \
  tests/trend-summary-text.test.js \
  tests/advice-panel-layout.test.js \
  tests/diet-panel-cleanup.test.js \
  tests/training-skincare-panel-cleanup.test.js \
  tests/action-panel-visual-consistency.test.js
```

---

## 部署

推送到 `main` 分支后，由 **Cloudflare Pages** 自动构建部署。

正式入口只有：
- `https://body-dashboard.pages.dev`

> Vercel 已移除，不再作为该项目的正式部署平台。

---

## 技术栈

- React
- Vite
- ECharts
- Tailwind CSS v4
