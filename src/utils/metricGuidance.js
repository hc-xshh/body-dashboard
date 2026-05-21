export const BODY_METRIC_GUIDANCE_VERSION = 'body-metric-guidance-v2'

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
  subcutaneousFat: {
    label: '皮下脂肪',
    unit: '%',
    statuses: [
      { key: 'low', statusLabel: '偏瘦', max: 8.6, tone: 'warn' },
      { key: 'standard', statusLabel: '标准', min: 8.6, max: 20.7, tone: 'good' },
      { key: 'high', statusLabel: '偏高', min: 20.7, tone: 'warn' },
    ],
    referenceText: '设备标准：8.6-20.7%（偏瘦 <8.6 / 偏高 >20.7）',
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'weight',
    label: '体重',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '体重目前在设备标准范围内，继续保持当前训练和饮食节律。'
      : '体重偏高，增加了患心血管及内分泌疾病的风险，也会增加心肺负担。',
    analysis: [
      delta == null ? null : `对比上次体重 ${formatSignedDelta(delta, 2, 'kg')}。`,
      classification.statusLabel === '标准'
        ? '体重维持在设备标准区间，继续看长期趋势即可。'
        : '体重偏高时，腰、膝等大关节承受的重量更大，日常活动和运动时都要注意关节负担。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '运动时先注意保护膝关节。',
      '优先选择运动强度较低、持续时间较长的项目，如游泳、单车、快走。',
    ],
    dietAdvice: classification.statusLabel === '标准'
      ? ['维持清淡少油和稳定正餐即可。']
      : [
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'bodyFat',
    label: '体脂率',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '体脂率处于标准区间，继续保持当前节律即可。'
      : '体脂率偏高，容易造成内脏器官脂肪过多，并诱发冠心病、高血压、脂肪肝等问题。',
    analysis: [
      delta == null ? null : `对比上次体脂率 ${formatSignedDelta(delta, 1, '%')}。`,
      classification.statusLabel === '标准'
        ? '当前体脂率在设备标准区间，继续看长期趋势。'
        : '当前更适合用稳定有氧、规律力量训练和持续饮食控制来慢慢拉低体脂，而不是短期激进减重。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可以进行慢跑，加速脂肪氧化消耗。',
      '游泳也是不错的选择，能消耗大量能量并增加多余体脂消耗。',
    ],
    dietAdvice: classification.statusLabel === '标准'
      ? ['保持规律饮食和蛋白摄入即可。']
      : [
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'bmi',
    label: 'BMI',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? 'BMI处于标准区间，继续稳定执行即可。'
      : 'BMI偏高，通常意味着身体偏胖，并与高血压、血脂升高、尿酸增高等并发症风险相关。',
    analysis: [
      delta == null ? null : `对比上次 BMI ${formatSignedDelta(delta, 1)}。`,
      classification.statusLabel === '标准'
        ? 'BMI当前处于设备标准区间，继续保持。'
        : '腰、膝等大关节承受的重量更大，活动和训练时都更要注意冲击与磨损。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可以做有氧运动，如慢跑、游泳、健身操等。',
      '每日运动 30 分钟以上，持之以恒。',
    ],
    dietAdvice: classification.statusLabel === '标准'
      ? ['继续定时定量、避免暴饮暴食即可。']
      : [
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'bmr',
    label: '基础代谢',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '达标'
      ? '基础代谢达到设备达标线，继续保持作息、补水和训练节律。'
      : '基础代谢偏低，通常和睡眠不足、运动量不足或饮水不足有关，也提示当前基础消耗能力偏弱。',
    analysis: [
      delta == null ? null : `对比上次基础代谢 ${formatSignedDelta(delta, 1)}。`,
      classification.statusLabel === '达标'
        ? '基础代谢已达到设备达标线。'
        : '这类情况更适合先稳住作息、补水和有氧，再配合耐力训练慢慢把静息代谢拉起来。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '每天坚持有氧运动。',
      '每次建议运动45分钟以上，可采用慢跑、游泳等方式。',
      '运动后结合耐力训练，有助于提高静息基础代谢率。',
    ],
    dietAdvice: classification.statusLabel === '达标'
      ? ['保持正常进食和补水，不要极端减餐。']
      : [
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

  return {
    key: 'muscle',
    label: '肌肉',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '肌肉量处于标准范围，继续维持负重训练和蛋白摄入。'
      : classification.statusLabel === '优秀'
        ? '肌肉量处于优秀区间，当前重点是稳定训练与恢复，避免无谓流失。'
        : '肌肉量不足时，优先把负重训练和基础蛋白补回来。',
    analysis: [
      delta == null ? null : `对比上次肌肉 ${formatSignedDelta(delta, 1, 'kg')}。`,
      classification.statusLabel === '标准'
        ? '肌肉量达到标准，肌肉量越稳，越有利于通过体力活动消耗更多热量。'
        : classification.statusLabel === '优秀'
          ? '肌肉量处于优秀区间，继续保持力量训练即可。'
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'visceralFat',
    label: '内脏脂肪',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '内脏脂肪当前在标准区间，继续守住有氧频率和晚间收口。'
      : '内脏脂肪偏高，容易引起高血糖、高血脂，也可能增加脂肪肝风险。',
    analysis: [
      delta == null ? null : `对比上次内脏脂肪 ${formatSignedDelta(delta, 0)}。`,
      classification.statusLabel === '标准'
        ? '内脏脂肪维持在标准区间，继续保持当前训练与饮食节律即可。'
        : '这项指标更适合通过持续有氧、控制高油脂食物和稳定作息来慢慢往下压，不适合靠几天激进节食解决。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '以有氧运动为主，适当进行跑步、游泳、爬山。',
      '也可选择慢走、太极等强度更低的运动。',
    ],
    dietAdvice: classification.statusLabel === '标准'
      ? ['保持当前饮食节律，避免晚间额外高油脂摄入。']
      : [
          '饮食上不能吃油脂过高的食物。',
          '烧烤、油炸、腌制品要控制。',
          '同时多喝水，促进代谢排出。',
        ],
  }
}

function buildSubcutaneousFatInsight(latest, prev) {
  const current = normalizeNumber(latest.subcutaneousFat)
  const previous = normalizeNumber(prev?.subcutaneousFat)
  if (current == null) return null
  const classification = classifyDeviceMetric('subcutaneousFat', current)
  const delta = previous == null ? null : current - previous

  return {
    key: 'subcutaneousFat',
    label: '皮下脂肪',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '皮下脂肪处于理想范围，继续保持清淡、低脂的饮食节律即可。'
      : '皮下脂肪偏高时，重点仍是稳定控脂，不用追求极端减重。',
    analysis: [
      delta == null ? null : `对比上次皮下脂肪 ${formatSignedDelta(delta, 1, '%')}。`,
      classification.statusLabel === '标准'
        ? '继续保持皮下脂肪率在理想范围。'
        : '皮下脂肪厚度可用于辅助判断胖瘦和全身脂肪比例。',
    ].filter(Boolean).join(' '),
    movementAdvice: classification.statusLabel === '标准'
      ? ['保持当前训练节奏即可，不必因为皮下脂肪单次波动临时加码。']
      : ['优先保持规律有氧与基础力量训练，稳定降低脂肪比例。'],
    dietAdvice: classification.statusLabel === '标准'
      ? ['饮食以清淡、低脂肪的食物为主，继续保持。']
      : ['饮食继续少油少糖，避免高脂高热量零食。'],
  }
}

function buildProteinInsight(latest, prev) {
  const current = normalizeNumber(latest.protein)
  const previous = normalizeNumber(prev?.protein)
  if (current == null) return null
  const classification = classifyDeviceMetric('protein', current)
  const delta = previous == null ? null : current - previous

  return {
    key: 'protein',
    label: '蛋白质',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '蛋白质水平达标，继续保持科学饮食，不过分节食。'
      : '蛋白质不达标时，先把规律进食和优质蛋白补回来。',
    analysis: [
      delta == null ? null : `对比上次蛋白质 ${formatSignedDelta(delta, 1, '%')}。`,
      classification.statusLabel === '标准'
        ? '你的蛋白质水平达标。'
        : '体脂秤测得的蛋白质率是根据身体成分推算的参考值。',
    ].filter(Boolean).join(' '),
    movementAdvice: ['维持当前训练与恢复节律，避免因过度训练拖累恢复。'],
    dietAdvice: classification.statusLabel === '标准'
      ? ['坚持科学饮食，不过分节食有助于维持稳定蛋白质水平。']
      : ['增加奶类、蛋类、肉类等优质蛋白来源，避免长期吃得太少。'],
  }
}

function buildSkeletalMuscleRateInsight(latest, prev) {
  const current = normalizeNumber(latest.skeletalMuscleRate)
  const previous = normalizeNumber(prev?.skeletalMuscleRate)
  if (current == null) return null
  const classification = classifyDeviceMetric('skeletalMuscleRate', current)
  const delta = previous == null ? null : current - previous

  return {
    key: 'skeletalMuscleRate',
    label: '骨骼肌率',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '骨骼肌率处于标准区间，继续保持力量训练和恢复节律。'
      : '骨骼肌率偏离标准时，重点是把力量训练和蛋白摄入重新拉稳。',
    analysis: [
      delta == null ? null : `对比上次骨骼肌率 ${formatSignedDelta(delta, 1, '%')}。`,
      '骨骼肌率即骨骼肌重量占体重的百分比。',
      classification.statusLabel === '标准' ? '当前指标正常，合理饮食，继续坚持。' : null,
    ].filter(Boolean).join(' '),
    movementAdvice: ['保持规律力量训练，优先多肌群动作和稳定训练量。'],
    dietAdvice: ['保持规律进食与蛋白摄入，避免过度节食。'],
  }
}

function buildLeanBodyMassInsight(latest, prev) {
  const current = normalizeNumber(latest.leanBodyMass)
  const previous = normalizeNumber(prev?.leanBodyMass)
  if (current == null) return null
  const delta = previous == null ? null : current - previous

  return {
    key: 'leanBodyMass',
    label: '去脂体重',
    statusLabel: '未见状态标签',
    tone: 'na',
    rangeText: null,
    summary: '去脂体重是结果型指标，主要用于观察瘦体重是否稳住，不单独做红黄绿判断。',
    analysis: [
      delta == null ? null : `对比上次去脂体重 ${formatSignedDelta(delta, 1, 'kg')}。`,
      '去脂体重又称瘦体重，是指除脂肪以外身体其他成分的重量，肌肉是其中的主要部分。',
      '去脂体重高通常说明身体更强壮、瘦体重占比更好。',
    ].filter(Boolean).join(' '),
    movementAdvice: ['优先维持力量训练和恢复，不要因短期体重波动随意削减训练。'],
    dietAdvice: ['保证蛋白摄入和正常正餐，避免激进减餐导致瘦体重下滑。'],
  }
}

function buildWaterInsight(latest, prev) {
  const current = normalizeNumber(latest.water)
  const previous = normalizeNumber(prev?.water)
  if (current == null) return null
  const classification = classifyDeviceMetric('water', current)

  const delta = previous == null ? null : current - previous
  return {
    key: 'water',
    label: '水分',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '水分处于标准区间，继续维持补水节律即可。'
      : '水分偏低时，今天的重点不是多想，而是把分次补水和低盐饮食执行到位。',
    analysis: [
      delta == null ? null : `对比上次水分 ${formatSignedDelta(delta, 1, '%')}。`,
      classification.statusLabel === '标准'
        ? '当前水分在设备标准区间。'
        : '水分偏低会影响血液循环和身体代谢，需要及时补充体液。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '坚持有氧锻炼，如慢跑、健身舞等。',
      '配合补水和代谢调整，提高体内水分含量。',
    ],
    dietAdvice: classification.statusLabel === '标准'
      ? ['保持规律补水，避免吃得太咸。']
      : [
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

  const delta = previous == null ? null : current - previous
  return {
    key: 'bone',
    label: '骨量',
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    summary: classification.statusLabel === '标准'
      ? '骨量达到设备标准线，继续保持负重训练和补钙饮食。'
      : '骨量不足时，今天更重要的是稳住低冲击有氧和补钙饮食，不做冒进动作。',
    analysis: [
      delta == null ? null : `对比上次骨量 ${formatSignedDelta(delta, 1, 'kg')}。`,
      classification.statusLabel === '标准'
        ? '骨量已达到设备标准线。'
        : '骨量偏低可能伴随骨质疏松、关节疼痛、乏力和剧烈运动时力量下降。',
    ].filter(Boolean).join(' '),
    movementAdvice: [
      '可选择慢跑、散步、步行等有氧运动，缓慢锻炼。',
    ],
    dietAdvice: [
      '多吃含钙高的食物，例如牛奶、豆腐、胡萝卜、瘦肉等。',
    ],
  }
}

const INSIGHT_PRIORITY = {
  bodyFat: 120,
  bmr: 110,
  visceralFat: 100,
  weight: 90,
  bmi: 80,
  muscle: 70,
  subcutaneousFat: 60,
  protein: 50,
  skeletalMuscleRate: 40,
  leanBodyMass: 35,
  water: 30,
  bone: 20,
}

function getInsightPriority(insight) {
  return INSIGHT_PRIORITY[insight?.key] ?? 0
}

function formatInsightTag(insight) {
  return `${insight.label}${insight.statusLabel}`
}

export function getMetricInsightPresentation(insights = [], options = {}) {
  const { maxSummary = 3 } = options
  const items = [...insights].sort((a, b) => getInsightPriority(b) - getInsightPriority(a))
  const summaryItems = items.slice(0, maxSummary)

  return {
    items,
    summary: items.length
      ? `共${items.length}项：${summaryItems.map(formatInsightTag).join('、')}${items.length > summaryItems.length ? '等' : ''}。`
      : null,
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
    buildSubcutaneousFatInsight(latest, prev),
    buildProteinInsight(latest, prev),
    buildSkeletalMuscleRateInsight(latest, prev),
    buildLeanBodyMassInsight(latest, prev),
    buildWaterInsight(latest, prev),
    buildBoneInsight(latest, prev),
  ].filter(Boolean)
}
