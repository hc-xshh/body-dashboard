import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panelSource = readFileSync(new URL('../src/components/MetricInsightsPanel.jsx', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('metric insights panel lives under the core metrics section and keeps a compact foldable layout', () => {
  assert.match(panelSource, /<details/)
  assert.match(panelSource, /查看全部指标说明/)
  assert.match(panelSource, /metricInsightPresentation\.summary/)
  assert.doesNotMatch(panelSource, /rounded-xl border border-dark-700 bg-dark-900\/45 p-3/)

  assert.match(appSource, /import MetricInsightsPanel/)
  assert.match(appSource, /<MetricInsightsPanel metricInsights=\{metricInsights\} \/>/)
})
