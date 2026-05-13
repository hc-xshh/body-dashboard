import test from 'node:test'
import assert from 'node:assert/strict'

import { analyzeBodySignals } from '../src/utils/rulesEngine.js'

test('falls back to observe_noise when only noisy indicators wobble without fat or weight deterioration', () => {
  const history = [
    { date: '2026-05-13', weight: 68.3, bodyFat: 19.9, muscle: 50.4, water: 53.2, bmr: 1514, visceralFat: 9 },
    { date: '2026-05-12', weight: 68.4, bodyFat: 19.9, muscle: 50.8, water: 53.5, bmr: 1516, visceralFat: 9 },
    { date: '2026-05-11', weight: 68.3, bodyFat: 19.8, muscle: 51.1, water: 53.7, bmr: 1518, visceralFat: 9 },
    { date: '2026-05-10', weight: 68.4, bodyFat: 19.8, muscle: 51.3, water: 54.0, bmr: 1520, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: false,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.equal(result.decision.primaryMode, 'observe_noise')
})

test('selects protect_metabolism when weight drops but body fat does not improve', () => {
  const history = [
    { date: '2026-05-13', weight: 67.8, bodyFat: 22.4, muscle: 50.4, water: 53.2, bmr: 1514, visceralFat: 10 },
    { date: '2026-05-12', weight: 68.1, bodyFat: 22.2, muscle: 50.6, water: 53.5, bmr: 1516, visceralFat: 10 },
    { date: '2026-05-11', weight: 68.4, bodyFat: 22.0, muscle: 50.8, water: 53.7, bmr: 1518, visceralFat: 10 },
    { date: '2026-05-10', weight: 68.7, bodyFat: 21.8, muscle: 51.0, water: 54.0, bmr: 1522, visceralFat: 10 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: true,
    cardioDay: false,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.equal(result.decision.primaryMode, 'protect_metabolism')
  assert.ok(result.signals.some(signal => signal.key === 'false_cut_risk'))
})

test('selects tighten_intake when weight and fat rise together', () => {
  const history = [
    { date: '2026-05-13', weight: 68.8, bodyFat: 22.4, muscle: 50.4, water: 53.2, bmr: 1514, visceralFat: 10 },
    { date: '2026-05-12', weight: 68.6, bodyFat: 22.1, muscle: 50.5, water: 53.3, bmr: 1515, visceralFat: 10 },
    { date: '2026-05-11', weight: 68.3, bodyFat: 21.8, muscle: 50.6, water: 53.4, bmr: 1516, visceralFat: 10 },
    { date: '2026-05-10', weight: 68.1, bodyFat: 21.6, muscle: 50.7, water: 53.5, bmr: 1517, visceralFat: 10 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.equal(result.decision.primaryMode, 'tighten_intake')
})

test('selects recovery_first on recovery day when weight rebounds but fat falls', () => {
  const history = [
    { date: '2026-05-13', weight: 68.6, bodyFat: 21.2, muscle: 50.5, water: 53.3, bmr: 1515, visceralFat: 9 },
    { date: '2026-05-12', weight: 68.5, bodyFat: 21.4, muscle: 50.4, water: 53.2, bmr: 1514, visceralFat: 9 },
    { date: '2026-05-11', weight: 68.4, bodyFat: 21.5, muscle: 50.3, water: 53.1, bmr: 1513, visceralFat: 9 },
    { date: '2026-05-10', weight: 68.2, bodyFat: 21.7, muscle: 50.2, water: 53.0, bmr: 1512, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: true,
  })

  assert.equal(result.decision.primaryMode, 'recovery_first')
})
