const HIGH_CONFIDENCE_KEYS = new Set(['weight', 'bodyFat', 'visceralFat'])
const LOW_CONFIDENCE_KEYS = new Set(['water', 'muscle', 'bone', 'bmr'])

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return null
  return Number(value.toFixed(digits))
}

function getSeries(history, key, limit = 10) {
  return history
    .filter(item => item?.[key] != null)
    .slice(0, limit)
    .map(item => item[key])
}

function getDelta(series, span = 1) {
  if (series.length <= span) return null
  return round(series[0] - series[span])
}

function getWindowAverage(series, size) {
  const values = series.slice(0, size)
  if (!values.length) return null
  return round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function getSlope(series, size = 4) {
  const values = series.slice(0, size)
  if (values.length < 3) return null
  return round((values[0] - values[values.length - 1]) / (values.length - 1))
}

function countDirectionalMoves(series, direction = 'up') {
  const values = series.slice(0, 4)
  if (values.length < 3) return 0
  let matches = 0
  for (let i = 0; i < values.length - 1; i += 1) {
    const diff = values[i] - values[i + 1]
    if ((direction === 'up' && diff > 0) || (direction === 'down' && diff < 0)) {
      matches += 1
    }
  }
  return matches
}

function getMedian(series, size = series.length) {
  const values = series.slice(0, size).slice().sort((a, b) => a - b)
  if (!values.length) return null
  const mid = Math.floor(values.length / 2)
  return values.length % 2 === 0
    ? round((values[mid - 1] + values[mid]) / 2)
    : values[mid]
}

function getPercentile(series, percentile, size = series.length) {
  const values = series.slice(0, size).slice().sort((a, b) => a - b)
  if (!values.length) return null
  if (values.length === 1) return values[0]

  const index = (values.length - 1) * percentile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)
  if (lowerIndex === upperIndex) return values[lowerIndex]

  const weight = index - lowerIndex
  return round(values[lowerIndex] + (values[upperIndex] - values[lowerIndex]) * weight)
}

function getBaselineDeviation(latest, series, size = 8) {
  if (latest == null) return null
  const baseline = getMedian(series.slice(1), size)
  if (baseline == null) return null
  return round(latest - baseline)
}

function getWindowSnapshot(series, size) {
  const values = series.slice(0, size)
  if (!values.length) {
    return {
      count: 0,
      avg: null,
      median: null,
      slope: null,
      delta: null,
    }
  }

  return {
    count: values.length,
    avg: getWindowAverage(values, values.length),
    median: getMedian(values),
    slope: getSlope(values, Math.min(4, values.length)),
    delta: getDelta(values, Math.min(values.length - 1, 3)),
  }
}

function getBaseline(series, size = 10) {
  return getMedian(series.slice(1), size)
}

function getBaselineBand(series, size = 10) {
  const values = series.slice(1, size + 1)
  if (values.length < 4) return null

  const low = getPercentile(values, 0.25)
  const mid = getMedian(values)
  const high = getPercentile(values, 0.75)
  if (low == null || mid == null || high == null) return null

  return {
    low,
    mid,
    high,
    width: round(high - low),
  }
}

function getBaselinePosition(latestValue, baselineBand) {
  if (latestValue == null || !baselineBand) return null
  if (latestValue < baselineBand.low) return 'below_band'
  if (latestValue > baselineBand.high) return 'above_band'
  return 'within_band'
}

function getConfidence(key, seriesLength, evidenceCount = 0) {
  const base = HIGH_CONFIDENCE_KEYS.has(key) ? 0.8 : LOW_CONFIDENCE_KEYS.has(key) ? 0.45 : 0.6
  const historyBonus = clamp(seriesLength / 10, 0, 0.35)
  const evidenceBonus = clamp(evidenceCount * 0.08, 0, 0.2)
  return round(clamp(base + historyBonus + evidenceBonus, 0, 0.98), 2)
}

function formatSigned(value, digits = 1, unit = '') {
  if (value == null) return null
  const abs = Math.abs(value).toFixed(digits)
  if (Math.abs(value) < 0.05) return `≈0${unit}`
  return `${value > 0 ? '+' : '-'}${abs}${unit}`
}

function pushSignal(signals, key, payload) {
  signals.push({ key, ...payload })
}

function dedupe(array) {
  return [...new Set(array.filter(Boolean))]
}

function getSignalMetricKey(key) {
  if (!key) return null
  if (key.startsWith('hydration_')) return 'water'
  if (key.startsWith('muscle_drop_')) return 'muscle'
  if (key === 'bmr_low') return 'bmr'
  if (key.startsWith('bone_')) return 'bone'
  return key.replace(/_(low|declining|confirmed|possible)$/, '')
}

function getModeMeta(primaryMode, stateStage) {
  switch (primaryMode) {
    case 'protect_metabolism':
      return {
        badge: '代谢保护',
        summary: '今天优先稳蛋白、稳正餐、稳训练质量，避免因为短期波动继续激进减餐。',
        stageLabel: stateStage === 'muscle_protection' ? '保肌/保代谢阶段' : '保护阶段',
      }
    case 'tighten_intake':
      return {
        badge: '收紧冗余热量',
        summary: '今天优先削掉下午加餐冗余、甜饮和晚间额外摄入，不动核心正餐蛋白。',
        stageLabel: stateStage === 'fat_gain_control' ? '增脂控制阶段' : '收紧阶段',
      }
    case 'recovery_first':
      return {
        badge: '恢复优先',
        summary: '今天更重要的是恢复和稳定执行，不把恢复日误用成补偿性进食或极端减餐日。',
        stageLabel: stateStage === 'rebound_recovery' ? '恢复回补阶段' : '恢复阶段',
      }
    case 'observe_noise':
      return {
        badge: '先观察',
        summary: '最近数据存在一定噪声，今天以稳定执行为主，不根据单次波动做大动作。',
        stageLabel: '噪声观察阶段',
      }
    default:
      return {
        badge: '稳定执行',
        summary: '当前方向基本正常，今天以按计划执行为主，不做额外激进调整。',
        stageLabel: '稳定执行阶段',
      }
  }
}

function buildMetricFeatures(latestValue, series, { shortWindow = 4, mediumWindow = 8, longWindow = 10 } = {}) {
  const baseline28 = getBaseline(series, longWindow)
  const baselineBand28 = getBaselineBand(series, longWindow)
  const short = getWindowSnapshot(series, shortWindow)
  const medium = getWindowSnapshot(series, mediumWindow)
  const long = getWindowSnapshot(series, longWindow)
  const baselinePosition = getBaselinePosition(latestValue, baselineBand28)

  return {
    latest: latestValue ?? null,
    delta1: getDelta(series, 1),
    delta3: getDelta(series, Math.min(3, Math.max(series.length - 1, 1))),
    avg4: short.avg,
    avg8: medium.avg,
    slope4: getSlope(series, 4),
    baselineDeviation: getBaselineDeviation(latestValue, series, mediumWindow),
    upMoves: countDirectionalMoves(series, 'up'),
    downMoves: countDirectionalMoves(series, 'down'),
    seriesLength: series.length,
    window7: short,
    window14: medium,
    window28: long,
    baseline28,
    baselineBand28,
    baselinePosition,
    withinBaselineBand: baselinePosition === 'within_band',
    deviationFromBaseline28: baseline28 == null || latestValue == null ? null : round(latestValue - baseline28),
  }
}

function collectEvidenceGroups(features, signals, stateStage) {
  const baseline = []
  const trend = []
  const risk = []
  const hydration = []

  if (features.bodyFat.baseline28 != null && features.bodyFat.deviationFromBaseline28 != null) {
    baseline.push(`体脂相对个人基线 ${formatSigned(features.bodyFat.deviationFromBaseline28, 1, '%')}`)
  }
  if (features.bodyFat.baselineBand28) {
    const { low, high } = features.bodyFat.baselineBand28
    baseline.push(`体脂个人波动带 ${low.toFixed(1)}% - ${high.toFixed(1)}%，当前处于${features.bodyFat.baselinePosition === 'above_band' ? '带外偏高' : features.bodyFat.baselinePosition === 'below_band' ? '带外偏低' : '带内'}`)
  }
  if (features.weight.baseline28 != null && features.weight.deviationFromBaseline28 != null) {
    baseline.push(`体重相对个人基线 ${formatSigned(features.weight.deviationFromBaseline28, 1, 'kg')}`)
  }
  if (features.weight.baselineBand28) {
    const { low, high } = features.weight.baselineBand28
    baseline.push(`体重个人波动带 ${low.toFixed(1)} - ${high.toFixed(1)}kg，当前处于${features.weight.baselinePosition === 'above_band' ? '带外偏高' : features.weight.baselinePosition === 'below_band' ? '带外偏低' : '带内'}`)
  }
  if (features.bodyFat.window28.count >= 6) {
    baseline.push(`长窗口已覆盖 ${features.bodyFat.window28.count} 次记录，判断不只看最近 1-2 次波动`)
  }

  if (features.bodyFat.delta3 != null) {
    trend.push(`近几次体脂 ${formatSigned(features.bodyFat.delta3, 1, '%')}`)
  }
  if (features.weight.delta3 != null) {
    trend.push(`近几次体重 ${formatSigned(features.weight.delta3, 1, 'kg')}`)
  }
  if (features.bodyFat.slope4 != null) {
    trend.push(`短窗口体脂斜率 ${formatSigned(features.bodyFat.slope4, 2, '%/次')}`)
  }

  signals.forEach(signal => {
    if (['false_cut_risk', 'intake_tightening_needed', 'metabolism_protection_needed', 'visceral_fat_high', 'fat_rising_persistent', 'recovery_rebound_likely'].includes(signal.key)) {
      risk.push(...(signal.evidence ?? []))
    }
    if (['hydration_low', 'hydration_declining'].includes(signal.key)) {
      hydration.push(...(signal.evidence ?? []))
    }
  })

  if (stateStage === 'rebound_recovery' && !risk.length) {
    risk.push('当前更像恢复/糖原回补波动，不建议把短期小涨直接当成增脂。')
  }

  return {
    baseline: dedupe(baseline),
    trend: dedupe(trend),
    risk: dedupe(risk),
    hydration: dedupe(hydration),
  }
}

function getStateStage(signals, trainingContext, features) {
  const keys = new Set(signals.map(signal => signal.key))

  if (keys.has('metabolism_protection_needed') || keys.has('false_cut_risk') || keys.has('muscle_drop_confirmed')) {
    return 'muscle_protection'
  }
  if (keys.has('intake_tightening_needed') || keys.has('fat_rising_persistent')) {
    return 'fat_gain_control'
  }
  if (keys.has('recovery_rebound_likely')) {
    return 'rebound_recovery'
  }

  const weightNearBaseline = Math.abs(features.weight.deviationFromBaseline28 ?? 0) <= 1.2
  const fatNearBaseline = Math.abs(features.bodyFat.deviationFromBaseline28 ?? 0) <= 0.8
  const recoveryLikeDirection = (features.weight.delta3 ?? 0) > 0.3 && (features.bodyFat.delta3 ?? 0) <= 0
  if (trainingContext.recoveryDay && recoveryLikeDirection && weightNearBaseline && fatNearBaseline) {
    return 'rebound_recovery'
  }

  if (keys.has('noise_high')) return 'noise_management'
  return 'steady_execution'
}

function getPrimaryMode(signals, trainingContext, stateStage) {
  const keys = new Set(signals.map(signal => signal.key))

  if (stateStage === 'rebound_recovery') return 'recovery_first'
  if (stateStage === 'fat_gain_control') return 'tighten_intake'
  if (stateStage === 'muscle_protection') return 'protect_metabolism'
  if (keys.has('noise_high')) return trainingContext.recoveryDay ? 'recovery_first' : 'observe_noise'
  if (trainingContext.recoveryDay) return 'recovery_first'
  return 'hold_course'
}

function getTrainingLoad(trainingContext = {}) {
  if (trainingContext.lowerBodyDay) {
    return { trainingLoad: 'lower_body_strength', trainingLoadLabel: '下肢力量日' }
  }
  if (trainingContext.strengthDay) {
    return { trainingLoad: 'upper_body_strength', trainingLoadLabel: '力量日' }
  }
  if (trainingContext.recoveryDay && trainingContext.cardioDay) {
    return { trainingLoad: 'mixed', trainingLoadLabel: '恢复 + 有氧日' }
  }
  if (trainingContext.recoveryDay) {
    return { trainingLoad: 'recovery', trainingLoadLabel: '恢复日' }
  }
  if (trainingContext.cardioDay) {
    return { trainingLoad: 'cardio', trainingLoadLabel: '有氧日' }
  }
  return { trainingLoad: 'general', trainingLoadLabel: '常规执行日' }
}

function getIntakeStrategy(primaryMode, trainingContext) {
  if (primaryMode === 'protect_metabolism') return 'protect_recovery'
  if (primaryMode === 'tighten_intake') return 'trim_extras'
  if (primaryMode === 'recovery_first') return 'protect_recovery'
  if (trainingContext.strengthDay || trainingContext.lowerBodyDay) return 'support_training'
  return 'hold_steady'
}

export function analyzeBodySignals(latest, history = [], trainingContext = {}) {
  const weightSeries = getSeries(history, 'weight')
  const fatSeries = getSeries(history, 'bodyFat')
  const muscleSeries = getSeries(history, 'muscle')
  const waterSeries = getSeries(history, 'water')
  const bmrSeries = getSeries(history, 'bmr')
  const visceralSeries = getSeries(history, 'visceralFat')

  const weight = buildMetricFeatures(latest?.weight, weightSeries)
  const bodyFat = buildMetricFeatures(latest?.bodyFat, fatSeries)
  const muscle = buildMetricFeatures(latest?.muscle, muscleSeries)
  const water = buildMetricFeatures(latest?.water, waterSeries)
  const bmr = buildMetricFeatures(latest?.bmr, bmrSeries)
  const visceralFat = {
    latest: latest?.visceralFat ?? null,
    avg4: getWindowAverage(visceralSeries, 4),
    seriesLength: visceralSeries.length,
    window14: getWindowSnapshot(visceralSeries, 8),
    window28: getWindowSnapshot(visceralSeries, 10),
    baseline28: getBaseline(visceralSeries, 10),
    deviationFromBaseline28: getBaseline(visceralSeries, 10) == null || latest?.visceralFat == null
      ? null
      : round(latest.visceralFat - getBaseline(visceralSeries, 10)),
  }

  const features = {
    weight,
    bodyFat,
    fat: bodyFat,
    muscle,
    water,
    bmr,
    visceralFat,
  }

  const signals = []

  if ((latest?.bodyFat ?? 0) > 22) {
    pushSignal(signals, 'fat_high', {
      severity: 'high',
      confidence: getConfidence('bodyFat', bodyFat.seriesLength, 1),
      evidence: [`当前体脂率 ${latest.bodyFat}% 偏高`],
    })
  } else if ((latest?.bodyFat ?? 0) > 20) {
    pushSignal(signals, 'fat_mild_high', {
      severity: 'medium',
      confidence: getConfidence('bodyFat', bodyFat.seriesLength, 1),
      evidence: [`当前体脂率 ${latest.bodyFat}% 轻度偏高`],
    })
  }

  if (bodyFat.upMoves >= 2 && (bodyFat.delta3 ?? 0) > 0.6) {
    pushSignal(signals, 'fat_rising_persistent', {
      severity: 'high',
      confidence: getConfidence('bodyFat', bodyFat.seriesLength, 2),
      evidence: [`最近几次体脂持续上行，累计 ${formatSigned(bodyFat.delta3, 1, '%')}`],
    })
  }

  if (bodyFat.downMoves >= 2 && (bodyFat.delta3 ?? 0) < -0.6) {
    pushSignal(signals, 'fat_falling_persistent', {
      severity: 'medium',
      confidence: getConfidence('bodyFat', bodyFat.seriesLength, 2),
      evidence: [`最近几次体脂持续回落，累计 ${formatSigned(bodyFat.delta3, 1, '%')}`],
    })
  }

  if ((bodyFat.deviationFromBaseline28 ?? 0) > 1 && bodyFat.window28.count >= 6) {
    pushSignal(signals, 'fat_above_personal_baseline', {
      severity: 'medium',
      confidence: getConfidence('bodyFat', bodyFat.seriesLength, 2),
      evidence: [`当前体脂较个人基线高出 ${formatSigned(bodyFat.deviationFromBaseline28, 1, '%')}`],
    })
  }

  if ((latest?.visceralFat ?? 0) >= 10) {
    pushSignal(signals, 'visceral_fat_high', {
      severity: 'medium',
      confidence: getConfidence('visceralFat', visceralFat.seriesLength, 1),
      evidence: [`内脏脂肪指数 ${latest.visceralFat} 处于偏高区间`],
    })
  }

  if ((latest?.water ?? 100) < 55) {
    const evidence = [`当前水分 ${latest.water}% 偏低`]
    if (water.downMoves >= 2 && (water.delta3 ?? 0) < -0.4) {
      evidence.push(`最近几次水分持续走低，累计 ${formatSigned(water.delta3, 1, '%')}`)
      pushSignal(signals, 'hydration_declining', {
        severity: 'medium',
        confidence: getConfidence('water', water.seriesLength, evidence.length),
        evidence,
      })
    } else {
      pushSignal(signals, 'hydration_low', {
        severity: 'low',
        confidence: getConfidence('water', water.seriesLength, evidence.length),
        evidence,
      })
    }
  }

  if ((latest?.bmr ?? 9999) < 1550) {
    pushSignal(signals, 'bmr_low', {
      severity: 'medium',
      confidence: getConfidence('bmr', bmr.seriesLength, 1),
      evidence: [`当前基础代谢 ${latest.bmr} kcal 偏低`],
    })
  }

  const muscleDropEvidence = []
  if ((muscle.delta3 ?? 0) < -0.8) muscleDropEvidence.push(`最近几次肌肉量累计 ${formatSigned(muscle.delta3, 1, 'kg')}`)
  if (muscle.downMoves >= 2) muscleDropEvidence.push('最近几次肌肉量方向连续走弱')

  if (muscleDropEvidence.length >= 2 && ((bodyFat.delta3 ?? 0) > 0.4 || (bmr.delta3 ?? 0) < -20)) {
    pushSignal(signals, 'muscle_drop_confirmed', {
      severity: 'high',
      confidence: getConfidence('muscle', muscle.seriesLength, muscleDropEvidence.length + 1),
      evidence: [...muscleDropEvidence, '且伴随体脂或基础代谢信号变差'],
    })
  } else if (muscleDropEvidence.length >= 2) {
    pushSignal(signals, 'muscle_drop_possible', {
      severity: 'low',
      confidence: getConfidence('muscle', muscle.seriesLength, muscleDropEvidence.length),
      evidence: muscleDropEvidence,
    })
  }

  if ((weight.delta3 ?? 0) < -0.4 && (bodyFat.delta3 ?? 0) > 0.4) {
    pushSignal(signals, 'false_cut_risk', {
      severity: 'high',
      confidence: getConfidence('weight', weight.seriesLength, 2),
      evidence: [
        `最近几次体重累计 ${formatSigned(weight.delta3, 1, 'kg')}`,
        `但体脂未同步改善，反而累计 ${formatSigned(bodyFat.delta3, 1, '%')}`,
      ],
    })
  }

  const baselineDrivenTightening = (bodyFat.deviationFromBaseline28 ?? 0) > 1 && (weight.deviationFromBaseline28 ?? 0) > 0.6
  const bandDrivenTightening = bodyFat.baselinePosition === 'above_band' && weight.baselinePosition === 'above_band'
  if (((weight.delta3 ?? 0) > 0.4 && (bodyFat.delta3 ?? 0) > 0.4) || baselineDrivenTightening || bandDrivenTightening) {
    pushSignal(signals, 'intake_tightening_needed', {
      severity: 'high',
      confidence: getConfidence('weight', weight.seriesLength, baselineDrivenTightening || bandDrivenTightening ? 3 : 2),
      evidence: dedupe([
        (weight.delta3 ?? 0) > 0.4 ? `最近几次体重累计 ${formatSigned(weight.delta3, 1, 'kg')}` : null,
        (bodyFat.delta3 ?? 0) > 0.4 ? `体脂同步累计 ${formatSigned(bodyFat.delta3, 1, '%')}` : null,
        baselineDrivenTightening ? `且体重/体脂都已高于个人基线` : null,
        bandDrivenTightening ? `且体重/体脂都已站上个人波动带上沿` : null,
      ]),
    })
  }

  const recoveryRebound =
    (weight.delta3 ?? 0) > 0.3
    && (bodyFat.delta3 ?? 0) <= 0
    && Math.abs(weight.deviationFromBaseline28 ?? 0) <= 1.2
    && Math.abs(bodyFat.deviationFromBaseline28 ?? 0) <= 0.8

  if (recoveryRebound) {
    pushSignal(signals, 'recovery_rebound_likely', {
      severity: 'medium',
      confidence: getConfidence('weight', weight.seriesLength, 3),
      evidence: [
        `最近几次体重累计 ${formatSigned(weight.delta3, 1, 'kg')}`,
        `但体脂累计 ${formatSigned(bodyFat.delta3, 1, '%')}，更像恢复或糖原回补波动`,
        `体重/体脂仍接近个人基线区间`,
      ],
    })
  }

  if (signals.some(signal => signal.key === 'false_cut_risk') || signals.some(signal => signal.key === 'muscle_drop_confirmed')) {
    pushSignal(signals, 'metabolism_protection_needed', {
      severity: 'high',
      confidence: round(
        clamp(
          Math.max(
            ...signals
              .filter(signal => ['false_cut_risk', 'muscle_drop_confirmed', 'bmr_low'].includes(signal.key))
              .map(signal => signal.confidence ?? 0.5),
          ) + 0.05,
          0,
          0.99,
        ),
        2,
      ),
      evidence: dedupe(
        signals
          .filter(signal => ['false_cut_risk', 'muscle_drop_confirmed', 'bmr_low'].includes(signal.key))
          .flatMap(signal => signal.evidence ?? []),
      ),
    })
  }

  const noisyMetricSignals = signals.filter(signal => {
    const metricKey = getSignalMetricKey(signal.key)
    return LOW_CONFIDENCE_KEYS.has(metricKey)
  })
  const hasPriorityRiskSignal = signals.some(signal => ['false_cut_risk', 'intake_tightening_needed', 'metabolism_protection_needed', 'fat_rising_persistent', 'recovery_rebound_likely'].includes(signal.key))
  if (noisyMetricSignals.length >= 2 && !hasPriorityRiskSignal) {
    pushSignal(signals, 'noise_high', {
      severity: 'medium',
      confidence: 0.6,
      evidence: ['最近更多是高噪声指标在波动，先按稳定执行处理，不根据单次波动做大动作。'],
    })
  }

  const stateStage = getStateStage(signals, trainingContext, features)
  const primaryMode = getPrimaryMode(signals, trainingContext, stateStage)
  const modeMeta = getModeMeta(primaryMode, stateStage)
  const { trainingLoad, trainingLoadLabel } = getTrainingLoad(trainingContext)
  const intakeStrategy = getIntakeStrategy(primaryMode, trainingContext)
  const evidenceGroups = collectEvidenceGroups(features, signals, stateStage)
  const secondaryFlags = signals
    .filter(signal => !['metabolism_protection_needed', 'noise_high'].includes(signal.key))
    .map(signal => signal.key)

  const confidence = round(
    clamp(
      signals.length
        ? signals.reduce((sum, signal) => sum + (signal.confidence ?? 0.5), 0) / signals.length
        : 0.7,
      0,
      0.98,
    ),
    2,
  )

  const evidence = dedupe([
    ...evidenceGroups.baseline,
    ...evidenceGroups.trend,
    ...evidenceGroups.risk,
    ...evidenceGroups.hydration,
  ]).slice(0, 6)

  return {
    features,
    signals,
    decision: {
      primaryMode,
      stateStage,
      secondaryFlags,
      confidence,
      evidence,
      evidenceGroups,
      trainingLoad,
      trainingLoadLabel,
      intakeStrategy,
      ...modeMeta,
    },
  }
}
