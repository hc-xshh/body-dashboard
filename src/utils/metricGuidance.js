export const BODY_METRIC_GUIDANCE_VERSION = 'body-metric-guidance-v1'

const DEVICE_RANGES = {
  weight: {
    label: '体重',
    unit: 'kg',
    statuses: [
      { key: 'underweight', statusLabel: '偏瘦', max: 52.2, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 52.2, max: 67.7, tone: 'good' },
      { key: 'overweight', statusLabel: '偏胖', min: 67.7, max: 79.0, tone: 'warn' },
      { key: 'obese', statusLabel: '肥胖', min: 79.0, tone: 'bad' },
    ],
    referenceText: '设备分级：偏瘦 <52.2 / 标准 52.2-67.7 / 偏胖 67.7-79.0 / 肥胖 >79.0 kg',
  },
  bodyFat: {
    label: '体脂率',
    unit: '%',
    statuses: [
      { key: 'low', statusLabel: '偏低', max: 11.0, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 11.0, max: 22.0, tone: 'good' },
      { key: 'overweight', statusLabel: '偏胖', min: 22.0, max: 27.0, tone: 'warn' },
      { key: 'obese', statusLabel: '肥胖', min: 27.0, tone: 'bad' },
    ],
    referenceText: '设备标准：11.0-22.0%（偏胖 22.0-27.0 / 肥胖 >27.0）',
  },
  bmi: {
    label: 'BMI',
    unit: '',
    statuses: [
      { key: 'underweight', statusLabel: '偏瘦', max: 18.5, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 18.5, max: 24.0, tone: 'good' },
      { key: 'overweight', statusLabel: '偏胖', min: 24.0, max: 28.0, tone: 'warn' },
      { key: 'obese', statusLabel: '肥胖', min: 28.0, tone: 'bad' },
    ],
    referenceText: '设备标准：18.5-24.0（偏胖 24.0-28.0 / 肥胖 >28.0）',
  },
  bmr: {
    label: '基础代谢',
    unit: 'kcal',
    statuses: [
      { key: 'low', statusLabel: '偏低', max: 1566, tone: 'warn' },
      { key: 'standard', statusLabel: '达标', min: 1566, tone: 'good' },
    ],
    referenceText: '设备达标线：≥1566 kcal',
  },
  muscle: {
    label: '肌肉',
    unit: 'kg',
    statuses: [
      { key: 'low', statusLabel: '不足', max: 44.0, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 44.0, max: 52.4, tone: 'good' },
      { key: 'excellent', statusLabel: '优秀', min: 52.4, tone: 'good' },
    ],
    referenceText: '设备标准：44.0-52.4 kg（优秀 >52.4）',
  },
  visceralFat: {
    label: '内脏脂肪',
    unit: '',
    statuses: [
      { key: 'standard', statusLabel: '标准', max: 10, tone: 'good' },
      { key: 'high', statusLabel: '偏高', min: 10, max: 15, tone: 'warn' },
      { key: 'very_high', statusLabel: '超高', min: 15, tone: 'bad' },
    ],
    referenceText: '设备标准：0-9.9（偏高 10-14.9 / 超高 ≥15）',
  },
  water: {
    label: '水分',
    unit: '%',
    statuses: [
      { key: 'low', statusLabel: '偏低', max: 55.0, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 55.0, max: 65.0, tone: 'good' },
      { key: 'high', statusLabel: '偏高', min: 65.0, tone: 'warn' },
    ],
    referenceText: '设备标准：55.0-65.0%',
  },
  bone: {
    label: '骨量',
    unit: 'kg',
    statuses: [
      { key: 'low', statusLabel: '不足', max: 2.9, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 2.9, tone: 'good' },
    ],
    referenceText: '设备标准：≥2.9 kg',
  },
  skeletalMuscleRate: {
    label: '骨骼肌率',
    unit: '%',
    statuses: [
      { key: 'low', statusLabel: '偏低', max: 40.0, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 40.0, max: 60.0, tone: 'good' },
      { key: 'high', statusLabel: '偏高', min: 60.0, tone: 'warn' },
    ],
    referenceText: '设备标准：40.0-60.0%',
  },
  protein: {
    label: '蛋白质',
    unit: '%',
    statuses: [
      { key: 'low', statusLabel: '不足', max: 16.0, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 16.0, max: 20.0, tone: 'good' },
      { key: 'high', statusLabel: '偏高', min: 20.0, tone: 'warn' },
    ],
    referenceText: '设备标准：16.0-20.0%',
  },
}

function normalizeNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function formatSignedDelta(value, digits = 1, unit = '') {
  const num = normalizeNumber(value)
  if (num == null) return null
  const abs = Math.abs(num).toFixed(digits)
  if (num === 0) return `持平${unit}`
  return `${num > 0 ? '+' : '-'}${abs}${unit}`
}

export function classifyDeviceMetric(metricKey, value) {
  const config = DEVICE_RANGES[metricKey]
  const num = normalizeNumber(value)
  if (!config || num == null) {
    return {
      key: metricKey,
      statusKey: 'unknown',
      statusLabel: '未见',
      tone: 'na',
      referenceText: config?.referenceText ?? null,
    }
  }

  const matched = config.statuses.find((item) => {
    const meetsMin = item.min == null || num >= item.min
    const belowMax = item.max == null || num < item.max
    return meetsMin && belowMax
  }) ?? config.statuses.at(-1)

  return {
    key: metricKey,
    label: config.label,
    statusKey: matched.key,
    statusLabel: matched.statusLabel,
    tone: matched.tone,
    referenceText: config.referenceText,
  }
}

export function getMetricReferenceText(metricKey) {
  return DEVICE_RANGES[metricKey]?.referenceText ?? null
}

function buildWeightInsight(latest, prev) {
  const current = normalizeNumber(latest.weight)
  const previous = normalizeNumber(prev?.weight)
  if (current == null) return null
  const classification = classifyDeviceMetric('weight', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'weight',
    label: '体重',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '体重偏高时，重点是保护关节、优先低冲击有氧，并把饮食收口做扎实。',
    analysis: [
      delta == null ? null : `对比上次体重 ${formatSignedDelta(delta, 2, 'kg')}。`,
      '体重偏高会增加心血管及内分泌疾病风险，也会增加心肺和膝关节负担。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '运动时先注意保护膝关节。',
      '优先选择运动强度较低、持续时间较长的项目，如游泳、单车、快走。',
    ],
    dietAdvice: [
      '适当少吃，清淡少油。',
      '不要吃高糖、高脂肪的食物。',
      '多吃蔬菜水果，增加膳食纤维。',
      '减少脂肪摄入，有利于控制体重。',
    ],
  }
}

function buildBodyFatInsight(latest, prev) {
  const current = normalizeNumber(latest.bodyFat)
  const previous = normalizeNumber(prev?.bodyFat)
  if (current == null) return null
  const classification = classifyDeviceMetric('bodyFat', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'bodyFat',
    label: '体脂率',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '体脂率偏高时，先降低精白淀粉主食比例和甜饮，再把蛋白补足，用稳定有氧拉开赤字。',
    analysis: [
      delta == null ? null : `对比上次体脂率 ${formatSignedDelta(delta, 1, '%')}。`,
      '体脂率过高容易造成内脏器官脂肪过多，并增加冠心病、高血压、脂肪肝等风险。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可以进行慢跑，加速脂肪氧化消耗。',
      '游泳也是不错的选择，能消耗大量能量并增加多余体脂消耗。',
    ],
    dietAdvice: [
      '降低精白淀粉主食比例。',
      '增加蛋白质食物如肉类、奶类。',
      '杜绝甜食、饮料等。',
      '养成良好的饮食习惯。',
    ],
  }
}

function buildBmiInsight(latest, prev) {
  const current = normalizeNumber(latest.bmi)
  const previous = normalizeNumber(prev?.bmi)
  if (current == null) return null
  const classification = classifyDeviceMetric('bmi', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'bmi',
    label: 'BMI',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: 'BMI偏胖时，把重点放在稳定有氧、控制总热量和避免暴饮暴食。',
    analysis: [
      delta == null ? null : `对比上次 BMI ${formatSignedDelta(delta, 1)}。`,
      '身体偏胖与高血压、血脂升高、尿酸增高等并发症相关，也会增加腰膝等大关节磨损。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可以做有氧运动，如慢跑、游泳、健身操等。',
      '每日运动 30 分钟以上，持之以恒。',
    ],
    dietAdvice: [
      '养成健康的饮食习惯，定时定量，避免暴饮暴食。',
      '尽量食用低热量、低脂肪的食物和水果。',
    ],
  }
}

function buildBmrInsight(latest, prev) {
  const current = normalizeNumber(latest.bmr)
  const previous = normalizeNumber(prev?.bmr)
  if (current == null) return null
  const classification = classifyDeviceMetric('bmr', current)
  if (classification.statusLabel !== '偏低') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'bmr',
    label: '基础代谢',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '基础代谢偏低时，不要继续硬压热量，要补水、做够有氧，再接一点耐力训练。',
    analysis: [
      delta == null ? null : `对比上次基础代谢 ${formatSignedDelta(delta, 1)}。`,
      '基础代谢偏低可能与睡眠不足、运动量不足或饮水不足有关，也会增加肥胖、消化功能下降和高脂血症风险。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '每天坚持有氧运动。',
      '每次建议运动45分钟以上，可采用慢跑、游泳等方式。',
      '运动后结合耐力训练，有助于提高静息基础代谢率。',
    ],
    dietAdvice: [
      '不要过度节食。',
      '多喝水。',
      '多吃蔬菜和水果。',
      '少量多餐，保持低盐低脂。',
    ],
  }
}

function buildMuscleInsight(latest, prev) {
  const current = normalizeNumber(latest.muscle)
  const previous = normalizeNumber(prev?.muscle)
  if (current == null) return null
  const classification = classifyDeviceMetric('muscle', current)
  const delta = previous == null ? null : current - previous
  const shouldShow = classification.statusLabel !== '优秀' && (classification.statusLabel !== '标准' || (delta != null && delta < 0))
  if (!shouldShow) return null

  return {
    key: 'muscle',
    label: '肌肉',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '肌肉量仍在标准范围，但最近在掉，当前重点是维持负重训练和蛋白摄入。'
      : '肌肉量不足时，优先把负重训练和基础蛋白补回来。',
    analysis: [
      delta == null ? null : `对比上次肌肉 ${formatSignedDelta(delta, 1, 'kg')}。`,
      classification.statusLabel === '标准'
        ? '肌肉量达到标准，肌肉量越稳，越有利于通过体力活动消耗更多热量。'
        : '肌肉量不足时，活动能力和热量消耗能力都会受影响。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '坚持负重训练，进行深蹲、卧推、推举等多肌群动作。',
    ],
    dietAdvice: [
      '保持营养均衡，可坚持蛋类、牛奶等蛋白来源。',
    ],
  }
}

function buildVisceralFatInsight(latest, prev) {
  const current = normalizeNumber(latest.visceralFat)
  const previous = normalizeNumber(prev?.visceralFat)
  if (current == null) return null
  const classification = classifyDeviceMetric('visceralFat', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'visceralFat',
    label: '内脏脂肪',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '内脏脂肪偏高时，有氧是主线，同时把油炸、烧烤、腌制和高油脂食物压下去。',
    analysis: [
      delta == null ? null : `对比上次内脏脂肪 ${formatSignedDelta(delta, 0)}。`,
      '内脏脂肪过多会增加腹型肥胖、脂肪肝、糖尿病和高血压等风险。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '以有氧运动为主，适当进行跑步、游泳、爬山。',
      '也可选择慢走、太极等强度更低的运动。',
    ],
    dietAdvice: [
      '饮食上不能吃油脂过高的食物。',
      '烧烤、油炸、腌制品要控制。',
      '同时多喝水，促进代谢排出。',
    ],
  }
}

function buildWaterInsight(latest, prev) {
  const current = normalizeNumber(latest.water)
  const previous = normalizeNumber(prev?.water)
  if (current == null) return null
  const classification = classifyDeviceMetric('water', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'water',
    label: '水分',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '水分偏低时，今天的重点不是多想，而是把分次补水和低盐饮食执行到位。',
    analysis: [
      delta == null ? null : `对比上次水分 ${formatSignedDelta(delta, 1, '%')}。`,
      '水分偏低会影响血液循环和身体代谢，需要及时补充体液。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '坚持有氧锻炼，如慢跑、健身舞等。',
      '配合补水和代谢调整，提高体内水分含量。',
    ],
    dietAdvice: [
      '增加饮水量。',
      '同时饮食少吃盐。',
      '多吃蔬菜水果，减少辛辣刺激和高油脂食物。',
    ],
  }
}

function buildBoneInsight(latest, prev) {
  const current = normalizeNumber(latest.bone)
  const previous = normalizeNumber(prev?.bone)
  if (current == null) return null
  const classification = classifyDeviceMetric('bone', current)
  if (classification.statusLabel === '标准') return null

  const delta = previous == null ? null : current - previous
  return {
    key: 'bone',
    label: '骨量',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: '骨量不足时，今天更重要的是稳住低冲击有氧和补钙饮食，不做冒进动作。',
    analysis: [
      delta == null ? null : `对比上次骨量 ${formatSignedDelta(delta, 1, 'kg')}。`,
      '骨量偏低可能伴随骨质疏松、关节疼痛、乏力和剧烈运动时力量下降。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可选择慢跑、散步、步行等有氧运动，缓慢锻炼。',
    ],
    dietAdvice: [
      '多吃含钙高的食物，例如牛奶、豆腐、胡萝卜、瘦肉等。',
    ],
  }
}

export function getMetricInsights(latest = {}, prev = null) {
  return [
    buildWeightInsight(latest, prev),
    buildBodyFatInsight(latest, prev),
    buildBmiInsight(latest, prev),
    buildBmrInsight(latest, prev),
    buildMuscleInsight(latest, prev),
    buildVisceralFatInsight(latest, prev),
    buildWaterInsight(latest, prev),
    buildBoneInsight(latest, prev),
  ].filter(Boolean)
}
