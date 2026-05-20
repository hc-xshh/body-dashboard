import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const dailyPlansSource = readFileSync(new URL('../src/data/dailyPlans.js', import.meta.url), 'utf8')

test('training reminders are specialized by badge type', () => {
  assert.match(dailyPlansSource, /export function getTrainingReadingReminders\(weekday, badge\)/)
  assert.match(dailyPlansSource, /badge === '恢复日'/)
  assert.match(dailyPlansSource, /badge === '有氧日'/)
  assert.match(dailyPlansSource, /力量日优先保证训练前补给和训练后蛋白/)
  assert.match(dailyPlansSource, /恢复日目标是降疲劳，不是补训练量/)
  assert.match(dailyPlansSource, /有氧日重点是完成时长，不靠额外加练刷存在感/)
})
