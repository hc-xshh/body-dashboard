import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BODY_METRIC_GUIDANCE_VERSION,
  classifyDeviceMetric,
  getMetricInsights,
  getMetricInsightPresentation,
} from '../src/utils/metricGuidance.js'

test('classifies device metric ranges from the provided guidance images', () => {
  assert.equal(BODY_METRIC_GUIDANCE_VERSION, 'body-metric-guidance-v2')

  assert.equal(classifyDeviceMetric('weight', 68.1).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bodyFat', 22.2).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bmi', 24.1).statusLabel, '偏胖')
  assert.equal(classifyDeviceMetric('bmr', 1511).statusLabel, '偏低')
  assert.equal(classifyDeviceMetric('muscle', 50.3).statusLabel, '标准')
})

test('builds structured metric insights for all 12 body metrics from the guidance screenshots', () => {
  const latest = {
    weight: 68.1,
    bodyFat: 22.2,
    bmi: 24.1,
    bmr: 1511,
    muscle: 50.3,
    visceralFat: 10,
    subcutaneousFat: 14.8,
    protein: 16.2,
    skeletalMuscleRate: 43.6,
    leanBodyMass: 53.0,
    water: 53.3,
    bone: 2.7,
  }
  const prev = {
    weight: 67.95,
    bodyFat: 20.7,
    bmi: 24.0,
    bmr: 1508,
    muscle: 51.2,
    visceralFat: 10,
    subcutaneousFat: 13.8,
    protein: 16.6,
    skeletalMuscleRate: 44.4,
    leanBodyMass: 54.0,
    water: 54.3,
    bone: 2.7,
  }

  const insights = getMetricInsights(latest, prev)
  assert.deepEqual(
    insights.map(item => item.key),
    ['weight', 'bodyFat', 'bmi', 'bmr', 'muscle', 'visceralFat', 'subcutaneousFat', 'protein', 'skeletalMuscleRate', 'leanBodyMass', 'water', 'bone'],
  )

  const bodyFatInsight = insights.find(item => item.key === 'bodyFat')
  const bmrInsight = insights.find(item => item.key === 'bmr')
  const muscleInsight = insights.find(item => item.key === 'muscle')
  const boneInsight = insights.find(item => item.key === 'bone')
  const subcutaneousFatInsight = insights.find(item => item.key === 'subcutaneousFat')
  const proteinInsight = insights.find(item => item.key === 'protein')
  const skeletalMuscleRateInsight = insights.find(item => item.key === 'skeletalMuscleRate')
  const leanBodyMassInsight = insights.find(item => item.key === 'leanBodyMass')

  assert.ok(bodyFatInsight)
  assert.equal(bodyFatInsight.statusLabel, '偏胖')
  assert.match(bodyFatInsight.summary, /内脏器官脂肪过多/)
  assert.ok(bodyFatInsight.movementAdvice.some(item => item.includes('慢跑')))
  assert.ok(bodyFatInsight.dietAdvice.some(item => item.includes('杜绝甜食、饮料')))

  assert.ok(bmrInsight)
  assert.equal(bmrInsight.statusLabel, '偏低')
  assert.match(bmrInsight.summary, /睡眠不足、运动量不足或饮水不足/)
  assert.ok(bmrInsight.movementAdvice.some(item => item.includes('45分钟')))
  assert.ok(bmrInsight.dietAdvice.some(item => item.includes('不要过度节食')))

  assert.ok(muscleInsight)
  assert.equal(muscleInsight.statusLabel, '标准')
  assert.match(muscleInsight.analysis, /对比上次.*肌肉/)

  assert.ok(boneInsight)
  assert.equal(boneInsight.statusLabel, '不足')
  assert.ok(boneInsight.dietAdvice.some(item => item.includes('牛奶')))

  assert.ok(subcutaneousFatInsight)
  assert.equal(subcutaneousFatInsight.statusLabel, '标准')
  assert.match(subcutaneousFatInsight.summary, /继续保持/)

  assert.ok(proteinInsight)
  assert.equal(proteinInsight.statusLabel, '标准')
  assert.match(proteinInsight.analysis, /蛋白质水平达标/)

  assert.ok(skeletalMuscleRateInsight)
  assert.equal(skeletalMuscleRateInsight.statusLabel, '标准')
  assert.match(skeletalMuscleRateInsight.summary, /骨骼肌率/)

  assert.ok(leanBodyMassInsight)
  assert.equal(leanBodyMassInsight.statusLabel, '未见状态标签')
  assert.match(leanBodyMassInsight.analysis, /去脂体重又称瘦体重/)
})

test('builds a compact fold-summary while keeping all metric insights available', () => {
  const insights = [
    { key: 'weight', label: '体重', statusLabel: '偏胖' },
    { key: 'bodyFat', label: '体脂率', statusLabel: '偏胖' },
    { key: 'bmr', label: '基础代谢', statusLabel: '偏低' },
    { key: 'visceralFat', label: '内脏脂肪', statusLabel: '偏高' },
    { key: 'water', label: '水分', statusLabel: '偏低' },
  ]

  const presentation = getMetricInsightPresentation(insights)

  assert.deepEqual(
    presentation.items.map(item => item.key),
    ['bodyFat', 'bmr', 'visceralFat', 'weight', 'water'],
  )
  assert.match(presentation.summary, /体脂率偏胖/)
  assert.match(presentation.summary, /基础代谢偏低/)
  assert.match(presentation.summary, /共5项/)
})

test('formats delta copy and joined advice text without awkward symbols', () => {
  const latest = {
    weight: 68.1,
    bodyFat: 22.2,
    bmi: 24.1,
    bmr: 1514,
    muscle: 50.5,
    visceralFat: 10,
    subcutaneousFat: 14.8,
    protein: 16.2,
    skeletalMuscleRate: 43.6,
    leanBodyMass: 53.1,
    water: 53.3,
    bone: 2.7,
  }
  const prev = {
    weight: 67.9,
    bodyFat: 22.2,
    bmi: 24.1,
    bmr: 1511,
    muscle: 50.3,
    visceralFat: 10,
    subcutaneousFat: 14.8,
    protein: 16.2,
    skeletalMuscleRate: 43.6,
    leanBodyMass: 53.1,
    water: 53.3,
    bone: 2.7,
  }

  const insights = getMetricInsights(latest, prev)
  const bodyFatInsight = insights.find(item => item.key === 'bodyFat')
  const bmrInsight = insights.find(item => item.key === 'bmr')

  assert.match(bodyFatInsight.analysis, /基本持平/)
  assert.doesNotMatch(bodyFatInsight.analysis, /持平%/)
  assert.match(bmrInsight.analysis, /\+3\.0 kcal/)
})
