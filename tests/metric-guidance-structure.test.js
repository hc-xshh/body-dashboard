import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BODY_METRIC_GUIDANCE_VERSION,
  DEVICE_RANGES,
  classifyDeviceMetric,
} from '../src/utils/metricStatusConfig.js'
import {
  METRIC_COPY_LIBRARY,
  getMetricStatusCopy,
} from '../src/utils/metricCopyLibrary.js'
import { getMetricInsights } from '../src/utils/metricGuidance.js'

test('metric guidance is split into status config and fixed copy library modules', () => {
  assert.equal(BODY_METRIC_GUIDANCE_VERSION, 'body-metric-guidance-v3')
  assert.ok(DEVICE_RANGES.weight)
  assert.ok(METRIC_COPY_LIBRARY.weight)
})

test('fixed copy library covers every configured device status', () => {
  for (const [metricKey, config] of Object.entries(DEVICE_RANGES)) {
    const metricCopy = METRIC_COPY_LIBRARY[metricKey]
    assert.ok(metricCopy, `${metricKey} missing copy config`)

    for (const status of config.statuses) {
      const copy = getMetricStatusCopy(metricKey, status.key)
      assert.ok(copy, `${metricKey}.${status.key} missing fixed copy`)
      assert.ok(copy.summary, `${metricKey}.${status.key} missing summary`)
      assert.ok(copy.analysis, `${metricKey}.${status.key} missing analysis`)
      assert.ok(Array.isArray(copy.movementAdvice) && copy.movementAdvice.length, `${metricKey}.${status.key} missing movement advice`)
      assert.ok(Array.isArray(copy.dietAdvice) && copy.dietAdvice.length, `${metricKey}.${status.key} missing diet advice`)
    }
  }
})

test('builds missing-status insights from the fixed copy library', () => {
  const latest = {
    weight: 50.8,
    bodyFat: 9.5,
    bmi: 17.8,
    bmr: 1600,
    muscle: 53.0,
    visceralFat: 15.2,
    subcutaneousFat: 7.8,
    protein: 20.8,
    skeletalMuscleRate: 39.5,
    leanBodyMass: 47.0,
    water: 66.2,
    bone: 3.0,
  }
  const prev = {
    weight: 51.1,
    bodyFat: 10.1,
    bmi: 18.1,
    bmr: 1590,
    muscle: 52.4,
    visceralFat: 14.6,
    subcutaneousFat: 8.4,
    protein: 20.1,
    skeletalMuscleRate: 39.9,
    leanBodyMass: 46.8,
    water: 65.6,
    bone: 2.9,
  }

  const insights = getMetricInsights(latest, prev)
  const find = (key) => insights.find(item => item.key === key)

  assert.equal(classifyDeviceMetric('weight', latest.weight).statusKey, 'underweight')
  assert.match(find('weight').summary, /偏瘦/)

  assert.equal(classifyDeviceMetric('bodyFat', latest.bodyFat).statusKey, 'low')
  assert.match(find('bodyFat').summary, /体脂率偏低/)

  assert.equal(classifyDeviceMetric('muscle', latest.muscle).statusKey, 'excellent')
  assert.match(find('muscle').summary, /优秀区间/)

  assert.equal(classifyDeviceMetric('visceralFat', latest.visceralFat).statusKey, 'very_high')
  assert.match(find('visceralFat').summary, /超高/)

  assert.equal(classifyDeviceMetric('protein', latest.protein).statusKey, 'high')
  assert.match(find('protein').summary, /蛋白质偏高/)

  assert.equal(classifyDeviceMetric('water', latest.water).statusKey, 'high')
  assert.match(find('water').summary, /水分偏高/)
})
