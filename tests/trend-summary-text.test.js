import test from 'node:test'
import assert from 'node:assert/strict'
import { getTrendSummaryText } from '../src/utils/decisionPresentation.js'

test('builds a human-readable trend summary sentence from stage, load and intake labels', () => {
  const text = getTrendSummaryText({
    stageLabel: '恢复阶段',
    trainingLoadLabel: '恢复 + 有氧日',
    intakeStrategy: 'protect_recovery',
  })

  assert.equal(text, '最近一次体测判断为恢复阶段，今天按恢复 + 有氧日安排，饮食以恢复日保蛋白 / 稳定正餐为主。')
})

test('falls back gracefully when trend summary fields are missing', () => {
  const text = getTrendSummaryText({
    stageLabel: '',
    trainingLoadLabel: '',
    intakeStrategy: '',
  })

  assert.equal(text, '最近一次体测暂无完整判断，先结合核心指标和趋势图一起看。')
})
