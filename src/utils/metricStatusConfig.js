export const BODY_METRIC_GUIDANCE_VERSION = 'body-metric-guidance-v3'

export const DEVICE_RANGES = {
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

export function normalizeNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function formatDeltaUnit(unit = '') {
  if (!unit) return ''
  return ['kg', 'kcal'].includes(unit) ? ` ${unit}` : unit
}

export function formatSignedDelta(value, digits = 1, unit = '') {
  const num = normalizeNumber(value)
  if (num == null) return null
  if (num === 0) return '基本持平'
  const abs = Math.abs(num).toFixed(digits)
  return `${num > 0 ? '+' : '-'}${abs}${formatDeltaUnit(unit)}`
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
