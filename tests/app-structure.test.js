import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('app no longer renders the radar chart section', () => {
  assert.doesNotMatch(appSource, /身体成分雷达/)
  assert.doesNotMatch(appSource, /<RadarChart\b/)
})
