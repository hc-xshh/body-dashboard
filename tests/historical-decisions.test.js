import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DECISION_SNAPSHOT_VERSION,
  buildHistoricalDecisionTimeline,
  createDecisionSnapshot,
} from '../src/utils/historyDecisions.js'

test('creates a compact persisted snapshot for historical decisions', () => {
  const snapshot = createDecisionSnapshot({
    badge: '恢复优先',
    stageLabel: '恢复阶段',
    primaryMode: 'recovery_first',
    trainingLoad: 'mixed',
    trainingLoadLabel: '恢复 + 有氧日',
    intakeStrategy: 'protect_recovery',
    summary: '今天更重要的是恢复和稳定执行。',
    confidence: 0.82,
    evidenceGroups: {
      baseline: ['体脂相对个人基线 +0.2%'],
      risk: ['当前更像恢复回补波动'],
    },
  })

  assert.equal(snapshot.version, DECISION_SNAPSHOT_VERSION)
  assert.equal(snapshot.badge, '恢复优先')
  assert.deepEqual(snapshot.evidenceGroups.baseline, ['体脂相对个人基线 +0.2%'])
  assert.deepEqual(snapshot.evidenceGroups.risk, ['当前更像恢复回补波动'])
})

test('prefers persisted decision snapshots over live recomputation for history rows', () => {
  const records = [
    {
      date: '2026-05-19',
      time: '08:00',
      weekday: '周二',
      weight: 68.1,
      bodyFat: 20.7,
      bmr: 1508,
      muscle: 51.2,
      water: 54,
      visceralFat: 9,
      decisionSnapshot: {
        version: DECISION_SNAPSHOT_VERSION,
        badge: '历史快照',
        stageLabel: '旧规则阶段',
        primaryMode: 'hold_course',
        trainingLoad: 'upper_body_strength',
        trainingLoadLabel: '力量日',
        intakeStrategy: 'hold_steady',
        summary: '这是之前固化下来的历史判断。',
        confidence: 0.66,
        evidenceGroups: {
          baseline: ['旧快照基线'],
          trend: [],
          risk: [],
          hydration: [],
        },
      },
    },
    {
      date: '2026-05-20',
      time: '07:56',
      weekday: '周三',
      weight: 68.1,
      bodyFat: 22.2,
      bmr: 1511,
      muscle: 50.3,
      water: 53.2,
      visceralFat: 10,
    },
  ]

  const timeline = buildHistoricalDecisionTimeline(records)
  const historical = timeline.find(item => item.date === '2026-05-19')
  const latest = timeline.find(item => item.date === '2026-05-20')

  assert.equal(historical.decision.badge, '历史快照')
  assert.equal(historical.decision.stageLabel, '旧规则阶段')
  assert.equal(historical.decision.source, 'snapshot')

  assert.ok(latest.decision.badge)
  assert.equal(latest.decision.source, 'computed')
})
