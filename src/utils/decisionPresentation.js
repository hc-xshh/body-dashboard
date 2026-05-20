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

export function getAdvicePanelPresentation({ viewportWidth = 1280, evidenceCards = [], expanded = false } = {}) {
  const isMobile = viewportWidth < 640

  if (!isMobile) {
    return {
      isMobile: false,
      shouldCollapseEvidence: false,
      visibleEvidenceCards: evidenceCards,
      hiddenEvidenceCount: 0,
      toggleLabel: null,
    }
  }

  if (expanded) {
    return {
      isMobile: true,
      shouldCollapseEvidence: false,
      visibleEvidenceCards: evidenceCards,
      hiddenEvidenceCount: 0,
      toggleLabel: '收起判断依据',
    }
  }

  const visibleEvidenceCards = evidenceCards.slice(0, 1)
  const hiddenEvidenceCount = Math.max(0, evidenceCards.length - visibleEvidenceCards.length)

  return {
    isMobile: true,
    shouldCollapseEvidence: hiddenEvidenceCount > 0,
    visibleEvidenceCards,
    hiddenEvidenceCount,
    toggleLabel: hiddenEvidenceCount > 0 ? '展开更多判断依据' : null,
  }
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

export function getTrendSummaryText(decision = {}) {
  const stageLabel = normalizeText(decision.stageLabel)
  const trainingLoadLabel = normalizeText(decision.trainingLoadLabel)
  const intakeLabel = getIntakeStrategyLabel(decision.intakeStrategy)

  if (!stageLabel || !trainingLoadLabel || intakeLabel === '—') {
    return '最近一次体测暂无完整判断，先结合核心指标和趋势图一起看。'
  }

  return `最近一次体测判断为${stageLabel}，今天按${trainingLoadLabel}安排，饮食以${intakeLabel}为主。`
}
