import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BODY_METRIC_GUIDANCE_VERSION,
  classifyDeviceMetric,
  getMetricInsights,
} from '../src/utils/metricGuidance.js'

test('classifies device metric ranges from the provided guidance images', () => {
  assert.equal(BODY_METRIC_GUIDANCE_VERSION, 'body-metric-guidance-v1')

  assert.equal(classifyDeviceMetric('weight', 68.1).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bodyFat', 22.2).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bmi', 24.1).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bmr', 1511).statusLabel, '偏低')
  assert.equal(classifyDeviceMetric('muscle', 50.3).statusLabel, '标准')
})

test('builds structured metric insights from the image-derived guidance', () => {
  const latest = {
    weight: 68.1,
    bodyFat: 22.2,
    bmi: 24.1,
    bmr: 1511,
    muscle: 50.3,
  }
  const prev = {
    weight: 67.95,
    bodyFat: 20.7,
    bmi: 24.0,
    bmr: 1508,
    muscle: 51.2,
  }

  const insights = getMetricInsights(latest, prev)
  const bodyFatInsight = insights.find(item => item.key === 'bodyFat')
  const bmrInsight = insights.find(item => item.key === 'bmr')
  const muscleInsight = insights.find(item => item.key === 'muscle')

  assert.ok(bodyFatInsight)
  assert.equal(bodyFatInsight.statusLabel, '偏胖')
  assert.match(bodyFatInsight.summary, /降低精白淀粉主食比例/)
  assert.ok(bodyFatInsight.movementAdvice.some(item => item.includes('慢跑')))
  assert.ok(bodyFatInsight.dietAdvice.some(item => item.includes('杜绝甜食、饮料')))

  assert.ok(bmrInsight)
  assert.equal(bmrInsight.statusLabel, '偏低')
  assert.match(bmrInsight.analysis, /睡眠不足、运动量不足或饮水不足/)
  assert.ok(bmrInsight.movementAdvice.some(item => item.includes('45分钟')))
  assert.ok(bmrInsight.dietAdvice.some(item => item.includes('不要过度节食')))

  assert.ok(muscleInsight)
  assert.equal(muscleInsight.statusLabel, '标准')
  assert.match(muscleInsight.analysis, /对比上次.*肌肉/)
})
