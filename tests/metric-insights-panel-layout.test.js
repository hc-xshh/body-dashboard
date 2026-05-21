import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panelSource = readFileSync(new URL('../src/components/MetricInsightsPanel.jsx', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('metric insights panel lives under the core metrics section and keeps a compact foldable layout', () => {
  assert.match(panelSource, /<details/)
  assert.match(panelSource, /group-open:hidden">查看</)
  assert.match(panelSource, /group-open:inline">收起</)
  assert.doesNotMatch(panelSource, /查看全部指标说明/)
  assert.doesNotMatch(panelSource, /收起指标说明/)
  assert.match(panelSource, /summary className="flex cursor-pointer list-none items-center gap-2/)
  assert.match(panelSource, /className="flex min-w-0 items-center gap-2"/)
  assert.match(panelSource, /className="truncate text-\[11px\] text-slate-500"/)
  assert.match(panelSource, /className="ml-auto shrink-0 text-\[11px\] text-slate-500 group-open:hidden"/)
  assert.match(panelSource, /metricInsightPresentation\.summary/)
  assert.match(panelSource, /divide-y divide-dark-700\/80/)
  assert.match(panelSource, /状态：/)
  assert.match(panelSource, /区间：/)
  assert.match(panelSource, /概览：/)
  assert.match(panelSource, /分析：/)
  assert.match(panelSource, /运动重点：/)
  assert.match(panelSource, /饮食重点：/)
  assert.match(panelSource, /formatAdviceText/)
  assert.match(panelSource, /replace\(\/\[。；;，,\]\+\$\/u, ''\)/)
  assert.match(panelSource, /font-semibold text-slate-200">概览：/)
  assert.match(panelSource, /font-semibold text-slate-200">分析：/)
  assert.match(panelSource, /font-semibold text-slate-200">运动重点：/)
  assert.match(panelSource, /font-semibold text-slate-200">饮食重点：/)
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
