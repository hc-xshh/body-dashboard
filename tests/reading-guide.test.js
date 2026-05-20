import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const readingGuideSource = readFileSync(new URL('../src/components/ReadingGuide.jsx', import.meta.url), 'utf8')

test('app removes standalone reading-guide heading and lets the path card carry the summary', () => {
  assert.doesNotMatch(readingGuideSource, /阅读引导/)
  assert.doesNotMatch(readingGuideSource, /先看状态，再看今天执行，最后再看趋势/)
  assert.match(readingGuideSource, /summary/)
  assert.match(appSource, /summary=\{readingPathSummary\}/)
})

test('reading-path summary copy is decision-first rather than section-order instructions', () => {
  assert.match(appSource, /今天重点不是减量，而是恢复执行。/)
  assert.match(appSource, /今天先盯饮食策略，训练照计划做。/)
  assert.match(appSource, /今天重点是稳住正餐和恢复，不做额外减量。/)
  assert.match(appSource, /今天状态以稳定执行为主，按计划完成就够。/)
  assert.doesNotMatch(appSource, /今天先看健康建议，再执行/)
  assert.doesNotMatch(appSource, /今天先看核心指标和饮食策略，再执行/)
})
