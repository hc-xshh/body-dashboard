import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const advicePanelSource = readFileSync(new URL('../src/components/AdvicePanel.jsx', import.meta.url), 'utf8')

test('advice panel no longer owns metric guidance content', () => {
  assert.doesNotMatch(advicePanelSource, /metricInsights/)
  assert.doesNotMatch(advicePanelSource, /查看全部指标说明/)
  assert.doesNotMatch(advicePanelSource, /指标说明/)
})
