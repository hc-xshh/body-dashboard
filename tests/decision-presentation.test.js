import test from 'node:test'
import assert from 'node:assert/strict'

import { getAdvicePanelPresentation, getDecisionDisplay, getIntakeStrategyLabel } from '../src/utils/decisionPresentation.js'

test('maps intake strategy codes to Chinese display labels', () => {
  assert.equal(getIntakeStrategyLabel('protect_recovery'), '恢复日保蛋白 / 稳定正餐')
  assert.equal(getIntakeStrategyLabel('trim_extras'), '收紧加餐 / 甜饮 / 夜宵')
  assert.equal(getIntakeStrategyLabel('support_training'), '训练日优先补给 / 蛋白')
  assert.equal(getIntakeStrategyLabel('hold_steady'), '按当前节奏稳定执行')
})

test('builds a compact Chinese summary from structured decision data', () => {
  const display = getDecisionDisplay({
    badge: '恢复优先',
    stageLabel: '恢复阶段',
    intakeStrategy: 'protect_recovery',
    confidence: 0.86,
    summary: '今天更重要的是恢复和稳定执行。',
    evidenceGroups: {
      baseline: ['体脂相对个人基线 +1.0%'],
      trend: ['近几次体脂 ≈0%'],
      risk: ['内脏脂肪指数 10 处于偏高区间'],
      hydration: ['当前水分 53.3% 偏低'],
    },
  })

  assert.equal(display.intakeLabel, '恢复日保蛋白 / 稳定正餐')
  assert.equal(display.confidenceText, '86%')
  assert.equal(
    display.compactSummary,
    '今天更重要的是恢复和稳定执行。重点看：体脂相对个人基线 +1.0%；近几次体脂 ≈0%。'
  )
  assert.deepEqual(display.highlights, ['体脂相对个人基线 +1.0%', '近几次体脂 ≈0%'])
})

test('collapses mobile advice panel by default while keeping desktop expanded', () => {
  const result = getAdvicePanelPresentation({
    viewportWidth: 375,
    evidenceCards: [{ label: '基线' }, { label: '趋势' }, { label: '风险' }],
    expanded: false,
  })

  assert.deepEqual(result, {
    isMobile: true,
    shouldCollapseEvidence: true,
    visibleEvidenceCards: [{ label: '基线' }],
    hiddenEvidenceCount: 2,
    toggleLabel: '展开更多判断依据',
  })
})

test('shows all evidence cards when mobile advice panel is expanded', () => {
  const result = getAdvicePanelPresentation({
    viewportWidth: 375,
    evidenceCards: [{ label: '基线' }, { label: '趋势' }],
    expanded: true,
  })

  assert.equal(result.shouldCollapseEvidence, false)
  assert.equal(result.hiddenEvidenceCount, 0)
  assert.equal(result.toggleLabel, '收起判断依据')
  assert.deepEqual(result.visibleEvidenceCards, [{ label: '基线' }, { label: '趋势' }])
})

test('keeps desktop advice panel fully expanded', () => {
  const result = getAdvicePanelPresentation({
    viewportWidth: 1280,
    evidenceCards: [{ label: '基线' }, { label: '趋势' }],
    expanded: false,
  })

  assert.deepEqual(result, {
    isMobile: false,
    shouldCollapseEvidence: false,
    visibleEvidenceCards: [{ label: '基线' }, { label: '趋势' }],
    hiddenEvidenceCount: 0,
    toggleLabel: null,
  })
})
