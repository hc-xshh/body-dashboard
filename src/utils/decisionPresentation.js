export const INTAKE_STRATEGY_LABELS = {
  protect_recovery: '恢复日保蛋白 / 稳定正餐',
  trim_extras: '收紧加餐 / 甜饮 / 夜宵',
  support_training: '训练日优先补给 / 蛋白',
  hold_steady: '按当前节奏稳定执行',
}

function normalizeText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function pickHighlights(evidenceGroups = {}) {
  return [
    ...(evidenceGroups.baseline ?? []),
    ...(evidenceGroups.trend ?? []),
    ...(evidenceGroups.risk ?? []),
    ...(evidenceGroups.hydration ?? []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .slice(0, 2)
}

export function getIntakeStrategyLabel(strategy) {
  return INTAKE_STRATEGY_LABELS[strategy] ?? strategy ?? '—'
}

export function getDecisionDisplay(decision = {}) {
  const highlights = pickHighlights(decision.evidenceGroups)
  const summary = normalizeText(decision.summary)
  const compactSummary = highlights.length
    ? `${summary}重点看：${highlights.join('；')}。`
    : summary

  return {
    intakeLabel: getIntakeStrategyLabel(decision.intakeStrategy),
    confidenceText: decision.confidence == null ? '—' : `${Math.round(decision.confidence * 100)}%`,
    compactSummary,
    highlights,
  }
}
