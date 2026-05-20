import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const advicePanelSource = readFileSync(new URL('../src/components/AdvicePanel.jsx', import.meta.url), 'utf8')

test('advice panel renders structured metric insight blocks from the new image guidance', () => {
  assert.match(advicePanelSource, /metricInsights/)
  assert.match(advicePanelSource, /指标说明/)
  assert.match(advicePanelSource, /movementAdvice/)
  assert.match(advicePanelSource, /dietAdvice/)
})
