import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const dailyPlansSource = readFileSync(new URL('../src/data/dailyPlans.js', import.meta.url), 'utf8')

test('training and skincare panels use summary-first timeline layout with execution-oriented reminder labels', () => {
  assert.match(appSource, /summary=\{trainingPanel\.summary\}/)
  assert.match(appSource, /metaLine=\{trainingPanel\.metaLine\}/)
  assert.match(appSource, /highlights=\{trainingPanel\.highlights\}/)
  assert.match(appSource, /summary=\{skincarePanel\.summary\}/)
  assert.match(appSource, /metaLine=\{skincarePanel\.metaLine\}/)
  assert.match(appSource, /highlights=\{skincarePanel\.highlights\}/)
  assert.match(appSource, /reminderTitle="执行提醒"/)
  assert.match(appSource, /reminderTitle="护理提醒"/)
  assert.match(appSource, /variant="timeline"/)
})

test('daily plan helpers provide concise header summaries for training and skincare panels', () => {
  assert.match(dailyPlansSource, /export function getTrainingPanelPresentation\(trainingPlan\)/)
  assert.match(dailyPlansSource, /subtitle: '先看顺序和时长，照着做就行。'/)
  assert.match(dailyPlansSource, /metaLine: `\$\{trainingPlan\.badge\} · \$\{trainingPlan\.title\} · \$\{trainingPlan\.subtitle\}`/)
  assert.match(dailyPlansSource, /export function getSkincarePanelPresentation\(skincarePlan\)/)
  assert.match(dailyPlansSource, /subtitle: '按早晚顺序做，今天重点看夜间主题。'/)
  assert.match(dailyPlansSource, /metaLine: `晨间固定护理 · 夜间 \$\{eveningTheme\} · \$\{eveningDuration\}`/)
  assert.match(dailyPlansSource, /formatFlowPreview\(steps = \[], limit = 3\)/)
})
