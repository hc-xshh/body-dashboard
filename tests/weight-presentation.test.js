import test from 'node:test'
import assert from 'node:assert/strict'

import { getWeightPresentation } from '../src/utils/dashboardState.js'

test('derives personal 30-day weight band and current status from recent records', () => {
  const measurements = [
    { date: '2026-05-20', weight: 68.1 },
    { date: '2026-05-19', weight: 68.1 },
    { date: '2026-05-18', weight: 68.85 },
    { date: '2026-05-17', weight: 68.25 },
    { date: '2026-05-15', weight: 68.4 },
    { date: '2026-05-13', weight: 67.95 },
    { date: '2026-05-09', weight: 68.2 },
    { date: '2026-05-05', weight: 67.95 },
    { date: '2026-05-01', weight: 67.95 },
    { date: '2026-04-29', weight: 68.8 },
    { date: '2026-04-25', weight: 68.85 },
    { date: '2026-04-21', weight: 68.35 },
    { date: '2026-04-17', weight: 67.1 },
    { date: '2026-04-13', weight: 67.0 },
  ]

  assert.deepEqual(getWeightPresentation(measurements), {
    reference: '68.10-68.40 kg',
    status: '处于个人稳定区间',
  })
})

test('falls back to guidance copy when 30-day weight records are insufficient', () => {
  const measurements = [
    { date: '2026-05-20', weight: 68.1 },
    { date: '2026-05-19', weight: 68.4 },
    { date: '2026-05-17', weight: 68.2 },
  ]

  assert.deepEqual(getWeightPresentation(measurements), {
    reference: '以近30天稳定区间为主',
    status: '近30天样本不足，先继续记录',
  })
})
