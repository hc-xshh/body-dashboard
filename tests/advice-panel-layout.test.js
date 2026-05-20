import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const advicePanelSource = readFileSync(new URL('../src/components/AdvicePanel.jsx', import.meta.url), 'utf8')

test('advice panel uses lighter section dividers instead of nested evidence cards and boxed alerts', () => {
  assert.doesNotMatch(advicePanelSource, /rounded-lg border \$\{card\.color\} \$\{card\.bg\}/)
  assert.doesNotMatch(advicePanelSource, /rounded-xl border p-3\.5/)
  assert.match(advicePanelSource, /border-l-2/)
  assert.match(advicePanelSource, /border-t border-dark-700/)
})
