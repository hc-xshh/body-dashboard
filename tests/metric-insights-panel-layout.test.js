import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panelSource = readFileSync(new URL('../src/components/MetricInsightsPanel.jsx', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('metric insights panel lives under the core metrics section and keeps a compact foldable layout', () => {
  assert.match(panelSource, /<details/)
  assert.match(panelSource, /查看全部指标说明/)
  assert.match(panelSource, /metricInsightPresentation\.summary/)
  assert.match(panelSource, /divide-y divide-dark-700\/80/)
  assert.match(panelSource, /状态：/)
  assert.match(panelSource, /概览：/)
  assert.match(panelSource, /分析：/)
  assert.match(panelSource, /运动重点：/)
  assert.match(panelSource, /饮食重点：/)
  assert.doesNotMatch(panelSource, /rounded-xl border border-dark-700 bg-dark-900\/45 p-3/)

  assert.match(appSource, /import MetricInsightsPanel/)
  assert.match(appSource, /<MetricInsightsPanel metricInsights=\{metricInsights\} \/>/)
})

test('core metrics section includes all 12 body metrics plus the score card', () => {
  const labels = ['体重', '体脂率', 'BMI', '基础代谢', '肌肉', '内脏脂肪', '皮下脂肪', '蛋白质', '骨骼肌率', '去脂体重', '水分', '骨量', '综合得分']

  labels.forEach((label) => {
    assert.match(appSource, new RegExp(`label=\\"${label}\\"`))
  })
})
