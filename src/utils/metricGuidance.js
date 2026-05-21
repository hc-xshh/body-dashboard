import {
  BODY_METRIC_GUIDANCE_VERSION,
  classifyDeviceMetric,
  getMetricReferenceText,
  normalizeNumber,
  formatSignedDelta,
} from './metricStatusConfig.js'
import { SPECIAL_METRIC_COPY, getMetricStatusCopy } from './metricCopyLibrary.js'

export { BODY_METRIC_GUIDANCE_VERSION, classifyDeviceMetric, getMetricReferenceText }

function buildStatusBasedInsight(latest, prev, {
  metricKey,
  valueKey = metricKey,
  deltaDigits = 1,
  deltaUnit = '',
  deltaLabel,
}) {
  const current = normalizeNumber(latest[valueKey])
  const previous = normalizeNumber(prev?.[valueKey])
  if (current == null) return null

  const classification = classifyDeviceMetric(metricKey, current)
  const copy = getMetricStatusCopy(metricKey, classification.statusKey)
  if (!copy) return null

  const delta = previous == null ? null : current - previous

  return {
    key: valueKey,
    label: classification.label,
    statusLabel: classification.statusLabel,
    tone: classification.tone,
    rangeText: classification.referenceText,
    copySource: {
      type: copy.sourceType,
    },
    summary: copy.summary,
    analysis: [
      delta == null ? null : `对比上次${deltaLabel ?? classification.label} ${formatSignedDelta(delta, deltaDigits, deltaUnit)}。`,
      copy.analysis,
    ].filter(Boolean).join(' '),
    movementAdvice: copy.movementAdvice,
    dietAdvice: copy.dietAdvice,
  }
}

function buildLeanBodyMassInsight(latest, prev) {
  const current = normalizeNumber(latest.leanBodyMass)
  const previous = normalizeNumber(prev?.leanBodyMass)
  if (current == null) return null
  const delta = previous == null ? null : current - previous
  const copy = SPECIAL_METRIC_COPY.leanBodyMass

  return {
    key: 'leanBodyMass',
    label: '去脂体重',
    statusLabel: '未见状态标签',
    tone: 'na',
    rangeText: null,
    copySource: {
      type: copy.sourceType,
    },
    summary: copy.summary,
    analysis: [
      delta == null ? null : `对比上次去脂体重 ${formatSignedDelta(delta, 1, 'kg')}。`,
      copy.analysis,
    ].filter(Boolean).join(' '),
    movementAdvice: copy.movementAdvice,
    dietAdvice: copy.dietAdvice,
  }
}

const METRIC_BUILDERS = [
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'weight', deltaDigits: 2, deltaUnit: 'kg' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'bodyFat', deltaDigits: 1, deltaUnit: '%' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'bmi', deltaDigits: 1, deltaUnit: '' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'bmr', deltaDigits: 1, deltaUnit: 'kcal' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'muscle', deltaDigits: 1, deltaUnit: 'kg' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'visceralFat', deltaDigits: 0, deltaUnit: '' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'subcutaneousFat', deltaDigits: 1, deltaUnit: '%' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'protein', deltaDigits: 1, deltaUnit: '%' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'skeletalMuscleRate', deltaDigits: 1, deltaUnit: '%' }),
  buildLeanBodyMassInsight,
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'water', deltaDigits: 1, deltaUnit: '%' }),
  (latest, prev) => buildStatusBasedInsight(latest, prev, { metricKey: 'bone', deltaDigits: 1, deltaUnit: 'kg' }),
]

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
  return METRIC_BUILDERS.map((builder) => builder(latest, prev)).filter(Boolean)
}
