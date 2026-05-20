import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const panelSource = readFileSync(new URL('../src/components/DailyPlanPanel.jsx', import.meta.url), 'utf8')
const dailyPlansSource = readFileSync(new URL('../src/data/dailyPlans.js', import.meta.url), 'utf8')

test('diet section uses timeline layout and a simpler reminder heading', () => {
  assert.match(appSource, /variant="timeline"/)
  assert.match(appSource, /reminderTitle="执行提醒"/)
  assert.match(panelSource, /variant === 'timeline'/)
  assert.match(panelSource, /border-l-2 border-dark-700\/80 pl-4/)
})

test('diet plan source keeps strategy summary in the header and removes duplicated prepended strategy cards', () => {
  assert.match(dailyPlansSource, /subtitle: '按当天训练和体测判断微调，直接顺着时间吃就行。'/)
  assert.match(dailyPlansSource, /summary,/)
  assert.match(dailyPlansSource, /metaLine: `\$\{stageLabel\} · \$\{trainingLoadLabel\} · \$\{intakeLabel\} · 置信度 \$\{\(confidence \* 100\)\.toFixed\(0\)\}%`/)
  assert.match(dailyPlansSource, /highlights: summaryHighlights/)
  assert.doesNotMatch(dailyPlansSource, /title: '主策略模式'/)
  assert.doesNotMatch(dailyPlansSource, /title: '个人基线判断'/)
  assert.doesNotMatch(dailyPlansSource, /title: '个人波动带位置'/)
  assert.doesNotMatch(dailyPlansSource, /title: '最近趋势判断'/)
  assert.doesNotMatch(dailyPlansSource, /intake=\$\{intakeStrategy\}/)
})
