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

test('builds a longer-window baseline model and exposes structured evidence groups', () => {
  const history = [
    { date: '2026-05-13', weight: 68.7, bodyFat: 22.4, muscle: 50.6, water: 53.2, bmr: 1515, visceralFat: 10 },
    { date: '2026-05-12', weight: 68.6, bodyFat: 22.2, muscle: 50.7, water: 53.4, bmr: 1516, visceralFat: 10 },
    { date: '2026-05-10', weight: 68.4, bodyFat: 21.9, muscle: 50.8, water: 53.6, bmr: 1517, visceralFat: 10 },
    { date: '2026-05-08', weight: 68.2, bodyFat: 21.5, muscle: 50.9, water: 53.7, bmr: 1518, visceralFat: 10 },
    { date: '2026-05-05', weight: 67.9, bodyFat: 21.1, muscle: 51.0, water: 53.9, bmr: 1520, visceralFat: 9 },
    { date: '2026-05-01', weight: 67.7, bodyFat: 20.8, muscle: 51.1, water: 54.1, bmr: 1522, visceralFat: 9 },
    { date: '2026-04-28', weight: 67.6, bodyFat: 20.6, muscle: 51.2, water: 54.2, bmr: 1523, visceralFat: 9 },
    { date: '2026-04-24', weight: 67.5, bodyFat: 20.5, muscle: 51.2, water: 54.2, bmr: 1524, visceralFat: 9 },
    { date: '2026-04-20', weight: 67.4, bodyFat: 20.4, muscle: 51.3, water: 54.3, bmr: 1525, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.ok(result.features.bodyFat.window28)
  assert.equal(result.features.bodyFat.window28.count, 9)
  assert.ok(result.features.bodyFat.baseline28 != null)
  assert.ok(result.features.bodyFat.deviationFromBaseline28 > 1)
  assert.equal(result.decision.stateStage, 'fat_gain_control')
  assert.ok(Array.isArray(result.decision.evidenceGroups.baseline))
  assert.ok(result.decision.evidenceGroups.baseline.length > 0)
  assert.ok(Array.isArray(result.decision.evidenceGroups.trend))
  assert.ok(result.decision.evidenceGroups.trend.length > 0)
})

test('uses baseline context to classify recovery rebound instead of over-tightening', () => {
  const history = [
    { date: '2026-05-13', weight: 68.9, bodyFat: 20.7, muscle: 51.0, water: 53.7, bmr: 1521, visceralFat: 9 },
    { date: '2026-05-12', weight: 68.6, bodyFat: 20.8, muscle: 50.9, water: 53.6, bmr: 1519, visceralFat: 9 },
    { date: '2026-05-11', weight: 68.3, bodyFat: 21.0, muscle: 50.8, water: 53.5, bmr: 1518, visceralFat: 9 },
    { date: '2026-05-10', weight: 68.1, bodyFat: 21.1, muscle: 50.8, water: 53.4, bmr: 1517, visceralFat: 9 },
    { date: '2026-05-07', weight: 68.0, bodyFat: 21.0, muscle: 50.9, water: 53.5, bmr: 1518, visceralFat: 9 },
    { date: '2026-05-03', weight: 68.1, bodyFat: 20.9, muscle: 50.9, water: 53.6, bmr: 1519, visceralFat: 9 },
    { date: '2026-04-28', weight: 68.0, bodyFat: 20.8, muscle: 51.0, water: 53.6, bmr: 1519, visceralFat: 9 },
    { date: '2026-04-22', weight: 68.1, bodyFat: 20.8, muscle: 51.0, water: 53.7, bmr: 1520, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: true,
  })

  assert.equal(result.decision.primaryMode, 'recovery_first')
  assert.equal(result.decision.stateStage, 'rebound_recovery')
  assert.ok(result.decision.evidenceGroups.baseline.some(item => item.includes('个人基线')))
})

test('exposes baseline band and training load semantics for phase 3A decisions', () => {
  const history = [
    { date: '2026-05-13', weight: 68.35, bodyFat: 22.4, muscle: 50.4, water: 53.2, bmr: 1514, visceralFat: 10 },
    { date: '2026-05-12', weight: 68.85, bodyFat: 21.0, muscle: 51.7, water: 54.1, bmr: 1521, visceralFat: 10 },
    { date: '2026-05-08', weight: 68.80, bodyFat: 22.5, muscle: 50.7, water: 53.1, bmr: 1521, visceralFat: 10 },
    { date: '2026-05-06', weight: 68.20, bodyFat: 21.0, muscle: 51.5, water: 54.1, bmr: 1528, visceralFat: 10 },
    { date: '2026-04-30', weight: 68.40, bodyFat: 22.5, muscle: 50.8, water: 53.1, bmr: 1520, visceralFat: 10 },
    { date: '2026-04-23', weight: 67.10, bodyFat: 20.3, muscle: 50.8, water: 54.2, bmr: 1498, visceralFat: 10 },
    { date: '2026-04-15', weight: 68.35, bodyFat: 22.5, muscle: 50.3, water: 53.1, bmr: 1514, visceralFat: 10 },
    { date: '2026-04-14', weight: 69.10, bodyFat: 22.2, muscle: 51.1, water: 53.3, bmr: 1524, visceralFat: 10 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: true,
    cardioDay: false,
    lowerBodyDay: true,
    recoveryDay: false,
  })

  assert.ok(result.features.bodyFat.baselineBand28)
  assert.equal(result.features.bodyFat.baselinePosition, 'within_band')
  assert.equal(result.features.weight.withinBaselineBand, true)
  assert.equal(result.decision.trainingLoad, 'lower_body_strength')
  assert.equal(result.decision.trainingLoadLabel, '下肢力量日')
  assert.equal(result.decision.stateStage, 'muscle_protection')
  assert.equal(result.decision.intakeStrategy, 'protect_recovery')
})

test('classifies above-band fat trend as tighten_intake on cardio days', () => {
  const history = [
    { date: '2026-05-20', weight: 69.4, bodyFat: 24.1, muscle: 50.4, water: 53.0, bmr: 1512, visceralFat: 11 },
    { date: '2026-05-18', weight: 69.1, bodyFat: 23.6, muscle: 50.5, water: 53.2, bmr: 1514, visceralFat: 10 },
    { date: '2026-05-15', weight: 68.9, bodyFat: 23.1, muscle: 50.6, water: 53.3, bmr: 1515, visceralFat: 10 },
    { date: '2026-05-12', weight: 68.6, bodyFat: 22.8, muscle: 50.8, water: 53.4, bmr: 1517, visceralFat: 10 },
    { date: '2026-05-08', weight: 68.3, bodyFat: 22.2, muscle: 50.9, water: 53.5, bmr: 1518, visceralFat: 10 },
    { date: '2026-05-05', weight: 68.1, bodyFat: 21.9, muscle: 51.0, water: 53.6, bmr: 1519, visceralFat: 9 },
    { date: '2026-05-02', weight: 67.9, bodyFat: 21.7, muscle: 51.1, water: 53.7, bmr: 1520, visceralFat: 9 },
    { date: '2026-04-29', weight: 67.8, bodyFat: 21.6, muscle: 51.1, water: 53.8, bmr: 1521, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.equal(result.features.bodyFat.baselinePosition, 'above_band')
  assert.equal(result.features.weight.baselinePosition, 'above_band')
  assert.equal(result.decision.primaryMode, 'tighten_intake')
  assert.equal(result.decision.stateStage, 'fat_gain_control')
  assert.equal(result.decision.trainingLoad, 'cardio')
  assert.equal(result.decision.intakeStrategy, 'trim_extras')
})

test('tightens intake when weight and fat both sit above baseline band even without sharp short-term spike', () => {
  const history = [
    { date: '2026-05-24', weight: 68.15, bodyFat: 21.1, muscle: 51.0, water: 53.9, bmr: 1520, visceralFat: 9 },
    { date: '2026-05-21', weight: 68.05, bodyFat: 21.0, muscle: 51.0, water: 54.0, bmr: 1520, visceralFat: 9 },
    { date: '2026-05-18', weight: 68.0, bodyFat: 20.9, muscle: 51.1, water: 54.1, bmr: 1521, visceralFat: 9 },
    { date: '2026-05-15', weight: 67.95, bodyFat: 20.9, muscle: 51.1, water: 54.1, bmr: 1521, visceralFat: 9 },
    { date: '2026-05-12', weight: 67.9, bodyFat: 20.9, muscle: 51.2, water: 54.2, bmr: 1522, visceralFat: 9 },
    { date: '2026-05-09', weight: 67.9, bodyFat: 20.8, muscle: 51.2, water: 54.2, bmr: 1522, visceralFat: 9 },
    { date: '2026-05-06', weight: 67.85, bodyFat: 20.8, muscle: 51.3, water: 54.3, bmr: 1523, visceralFat: 9 },
    { date: '2026-05-03', weight: 67.85, bodyFat: 20.8, muscle: 51.3, water: 54.3, bmr: 1523, visceralFat: 9 },
  ]

  const result = analyzeBodySignals(history[0], history, {
    strengthDay: false,
    cardioDay: true,
    lowerBodyDay: false,
    recoveryDay: false,
  })

  assert.equal(result.features.bodyFat.baselinePosition, 'above_band')
  assert.equal(result.features.weight.baselinePosition, 'above_band')
  assert.equal(result.features.bodyFat.delta3 <= 0.4, true)
  assert.equal(result.features.weight.delta3 <= 0.4, true)
  assert.equal(result.decision.primaryMode, 'tighten_intake')
  assert.equal(result.decision.stateStage, 'fat_gain_control')
  assert.ok(result.signals.some(signal => signal.key === 'intake_tightening_needed'))
})
