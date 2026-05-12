# Body Dashboard

Daemon 的身体数据可视化项目。自动解析体测截图，生成健康趋势图表和建议。

## 功能

- 📊 体重 & 体脂率趋势折线图
- 💪 肌肉 / 水分 / 去脂体重趋势
- 🕸️ 身体成分雷达图
- 🃏 核心指标卡片（含状态色标）
- 💡 基于阈值规则的健康建议
- 📋 历史记录表格

## 数据更新

体测数据存储在 `src/data/measurements.json`，由 Hermes Agent 解析截图后自动更新。

## 开发

```bash
npm install
npm run dev
```

## 部署

推送到 main 分支后，Vercel 自动构建部署。

## 技术栈

React + Vite + ECharts + Tailwind CSS v4
