import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const advicePanelSource = readFileSync(new URL('../src/components/AdvicePanel.jsx', import.meta.url), 'utf8')

test('advice panel folds metric guidance behind a compact summary instead of large bubble cards', () => {
  assert.match(advicePanelSource, /metricInsights/)
  assert.match(advicePanelSource, /<details/)
  assert.match(advicePanelSource, /查看全部指标说明/)
  assert.match(advicePanelSource, /metricInsightPresentation\.summary/)
  assert.doesNotMatch(advicePanelSource, /rounded-xl border border-dark-700 bg-dark-900\/45 p-3/)
})
