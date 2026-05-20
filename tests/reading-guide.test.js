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
