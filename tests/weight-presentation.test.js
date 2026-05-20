import test from 'node:test'
import assert from 'node:assert/strict'

import { getWeightPresentation } from '../src/utils/dashboardState.js'

test('derives both healthy-weight reference and personal 30-day weight band', () => {
  const measurements = [
    { date: '2026-05-20', weight: 68.1, bmi: 24.1 },
    { date: '2026-05-19', weight: 68.1, bmi: 24.1 },
    { date: '2026-05-18', weight: 68.85, bmi: 24.3 },
    { date: '2026-05-17', weight: 68.25, bmi: 24.1 },
    { date: '2026-05-15', weight: 68.4, bmi: 24.2 },
    { date: '2026-05-13', weight: 67.95, bmi: 24.0 },
    { date: '2026-05-09', weight: 68.2, bmi: 24.1 },
    { date: '2026-05-05', weight: 67.95, bmi: 24.0 },
    { date: '2026-05-01', weight: 67.95, bmi: 24.0 },
    { date: '2026-04-29', weight: 68.8, bmi: 24.3 },
    { date: '2026-04-25', weight: 68.85, bmi: 24.3 },
    { date: '2026-04-21', weight: 68.35, bmi: 24.2 },
    { date: '2026-04-17', weight: 67.1, bmi: 23.7 },
    { date: '2026-04-13', weight: 67.0, bmi: 23.7 },
  ]

  assert.deepEqual(getWeightPresentation(measurements), {
    references: [
      '健康参考：52.3-67.5 kg',
      '个人波动：68.10-68.40 kg',
    ],
    status: '略高于健康上限，但处于近期个人稳定区间',
  })
})

test('falls back to guidance copy when personal 30-day weight records are insufficient', () => {
  const measurements = [
    { date: '2026-05-20', weight: 68.1, bmi: 24.1 },
    { date: '2026-05-19', weight: 68.4, bmi: 24.2 },
    { date: '2026-05-17', weight: 68.2, bmi: 24.1 },
  ]

  assert.deepEqual(getWeightPresentation(measurements), {
    references: [
      '健康参考：52.3-67.5 kg',
      '个人波动：近30天样本不足',
    ],
    status: '略高于健康上限，个人趋势样本仍不足',
  })
})
