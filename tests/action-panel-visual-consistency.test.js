import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const panelSource = readFileSync(new URL('../src/components/DailyPlanPanel.jsx', import.meta.url), 'utf8')

test('action panels use the same boxed summary block and boxed reminder block for visual consistency', () => {
  assert.match(panelSource, /rounded-xl border border-dark-700\/80 bg-dark-900\/45 p-3\.5 sm:p-4/)
  assert.match(panelSource, /mt-3 space-y-2 border-t border-dark-700\/70 pt-3 text-sm leading-relaxed text-slate-400/)
  assert.match(panelSource, /rounded-xl border border-dark-700\/80 bg-dark-900\/35 p-3\.5 sm:p-4/)
  assert.match(panelSource, /space-y-2\.5 text-sm leading-relaxed text-slate-400/)
})
