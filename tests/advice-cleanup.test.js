import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const healthAnalysisSource = readFileSync(new URL('../src/utils/healthAnalysis.js', import.meta.url), 'utf8')

test('health advice source no longer duplicates engine summary or long-window recap cards', () => {
  assert.doesNotMatch(healthAnalysisSource, /icon:\s*'🧭'/)
  assert.doesNotMatch(healthAnalysisSource, /icon:\s*'🪜'/)
  assert.doesNotMatch(healthAnalysisSource, /主策略模式：/)
  assert.doesNotMatch(healthAnalysisSource, /长窗口判断：/)
})
