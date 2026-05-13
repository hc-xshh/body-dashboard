const HIGH_CONFIDENCE_KEYS = new Set(['weight', 'bodyFat', 'visceralFat'])
const LOW_CONFIDENCE_KEYS = new Set(['water', 'muscle', 'bone', 'bmr'])

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return null
  return Number(value.toFixed(digits))
}

function getSeries(history, key, limit = 8) {
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

function getMedian(series, size = 8) {
  const values = series.slice(0, size).slice().sort((a, b) => a - b)
  if (!values.length) return null
  const mid = Math.floor(values.length / 2)
  return values.length % 2 === 0
    ? round((values[mid - 1] + values[mid]) / 2)
    : values[mid]
}

function getBaselineDeviation(latest, series, size = 8) {
  if (latest == null) return null
  const baseline = getMedian(series.slice(1), size)
  if (baseline == null) return null
  return round(latest - baseline)
}

function getConfidence(key, seriesLength, evidenceCount = 0) {
  const base = HIGH_CONFIDENCE_KEYS.has(key) ? 0.8 : LOW_CONFIDENCE_KEYS.has(key) ? 0.45 : 0.6
  const historyBonus = clamp(seriesLength / 8, 0, 0.35)
  const evidenceBonus = clamp(evidenceCount * 0.08, 0, 0.2)
  return round(clamp(base + historyBonus + evidenceBonus, 0, 0.98), 2)
}

function formatSigned(value, digits = 1) {
  if (value == null) return null
  const abs = Math.abs(value).toFixed(digits)
  if (Math.abs(value) < 0.05) return '≈0'
  return `${value > 0 ? '+' : '-'}${abs}`
}

function pushSignal(signals, key, payload) {
  signals.push({ key, ...payload })
}

function getPrimaryMode(signals, trainingContext) {
  const keys = new Set(signals.map(signal => signal.key))

  if (keys.has('recovery_rebound_likely') && trainingContext.recoveryDay) return 'recovery_first'
  if (keys.has('intake_tightening_needed')) return 'tighten_intake'
  if (keys.has('metabolism_protection_needed') || keys.has('false_cut_risk')) return 'protect_metabolism'
  if (keys.has('fat_rising_persistent')) return 'tighten_intake'
  if (keys.has('noise_high')) return 'observe_noise'
  if (trainingContext.recoveryDay) return 'recovery_first'
  return 'hold_course'
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

function getModeMeta(primaryMode) {
  switch (primaryMode) {
    case 'protect_metabolism':
      return {
        badge: '代谢保护',
        summary: '今天优先稳蛋白、稳正餐、稳训练质量，避免因为短期波动继续激进减餐。',
      }
    case 'tighten_intake':
      return {
        badge: '收紧冗余热量',
        summary: '今天优先削掉下午加餐冗余、甜饮和晚间额外摄入，不动核心正餐蛋白。',
      }
    case 'recovery_first':
      return {
        badge: '恢复优先',
        summary: '今天更重要的是恢复和稳定执行，不把恢复日误用成补偿性进食或极端减餐日。',
      }
    case 'observe_noise':
      return {
        badge: '先观察',
        summary: '最近数据存在一定噪声，今天以稳定执行为主，不根据单次波动做大动作。',
      }
    default:
      return {
        badge: '稳定执行',
        summary: '当前方向基本正常，今天以按计划执行为主，不做额外激进调整。',
      }
  }
}

export function analyzeBodySignals(latest, history = [], trainingContext = {}) {
  const weightSeries = getSeries(history, 'weight')
  const fatSeries = getSeries(history, 'bodyFat')
  const muscleSeries = getSeries(history, 'muscle')
  const waterSeries = getSeries(history, 'water')
  const bmrSeries = getSeries(history, 'bmr')
  const visceralSeries = getSeries(history, 'visceralFat')

  const features = {
    weight: {
      latest: latest?.weight ?? null,
      delta1: getDelta(weightSeries, 1),
      delta3: getDelta(weightSeries, Math.min(3, Math.max(weightSeries.length - 1, 1))),
      avg4: getWindowAverage(weightSeries, 4),
      avg8: getWindowAverage(weightSeries, 8),
      slope4: getSlope(weightSeries, 4),
      baselineDeviation: getBaselineDeviation(latest?.weight, weightSeries, 8),
      upMoves: countDirectionalMoves(weightSeries, 'up'),
      downMoves: countDirectionalMoves(weightSeries, 'down'),
      seriesLength: weightSeries.length,
    },
    fat: {
      latest: latest?.bodyFat ?? null,
      delta1: getDelta(fatSeries, 1),
      delta3: getDelta(fatSeries, Math.min(3, Math.max(fatSeries.length - 1, 1))),
      avg4: getWindowAverage(fatSeries, 4),
      avg8: getWindowAverage(fatSeries, 8),
      slope4: getSlope(fatSeries, 4),
      baselineDeviation: getBaselineDeviation(latest?.bodyFat, fatSeries, 8),
      upMoves: countDirectionalMoves(fatSeries, 'up'),
      downMoves: countDirectionalMoves(fatSeries, 'down'),
      seriesLength: fatSeries.length,
    },
    muscle: {
      latest: latest?.muscle ?? null,
      delta1: getDelta(muscleSeries, 1),
      delta3: getDelta(muscleSeries, Math.min(3, Math.max(muscleSeries.length - 1, 1))),
      slope4: getSlope(muscleSeries, 4),
      baselineDeviation: getBaselineDeviation(latest?.muscle, muscleSeries, 8),
      downMoves: countDirectionalMoves(muscleSeries, 'down'),
      seriesLength: muscleSeries.length,
    },
    water: {
      latest: latest?.water ?? null,
      delta1: getDelta(waterSeries, 1),
      delta3: getDelta(waterSeries, Math.min(3, Math.max(waterSeries.length - 1, 1))),
      slope4: getSlope(waterSeries, 4),
      baselineDeviation: getBaselineDeviation(latest?.water, waterSeries, 8),
      downMoves: countDirectionalMoves(waterSeries, 'down'),
      seriesLength: waterSeries.length,
    },
    bmr: {
      latest: latest?.bmr ?? null,
      delta1: getDelta(bmrSeries, 1),
      delta3: getDelta(bmrSeries, Math.min(3, Math.max(bmrSeries.length - 1, 1))),
      slope4: getSlope(bmrSeries, 4),
      baselineDeviation: getBaselineDeviation(latest?.bmr, bmrSeries, 8),
      downMoves: countDirectionalMoves(bmrSeries, 'down'),
      seriesLength: bmrSeries.length,
    },
    visceralFat: {
      latest: latest?.visceralFat ?? null,
      avg4: getWindowAverage(visceralSeries, 4),
      seriesLength: visceralSeries.length,
    },
  }

  const signals = []

  if ((latest?.bodyFat ?? 0) > 22) {
    pushSignal(signals, 'fat_high', {
      severity: 'high',
      confidence: getConfidence('bodyFat', features.fat.seriesLength, 1),
      evidence: [`当前体脂率 ${latest.bodyFat}% 偏高`],
    })
  } else if ((latest?.bodyFat ?? 0) > 20) {
    pushSignal(signals, 'fat_mild_high', {
      severity: 'medium',
      confidence: getConfidence('bodyFat', features.fat.seriesLength, 1),
      evidence: [`当前体脂率 ${latest.bodyFat}% 轻度偏高`],
    })
  }

  if (features.fat.upMoves >= 2 && (features.fat.delta3 ?? 0) > 0.6) {
    pushSignal(signals, 'fat_rising_persistent', {
      severity: 'high',
      confidence: getConfidence('bodyFat', features.fat.seriesLength, 2),
      evidence: [`最近几次体脂持续上行，累计 ${formatSigned(features.fat.delta3)}%`],
    })
  }

  if (features.fat.downMoves >= 2 && (features.fat.delta3 ?? 0) < -0.6) {
    pushSignal(signals, 'fat_falling_persistent', {
      severity: 'medium',
      confidence: getConfidence('bodyFat', features.fat.seriesLength, 2),
      evidence: [`最近几次体脂持续回落，累计 ${formatSigned(features.fat.delta3)}%`],
    })
  }

  if ((latest?.visceralFat ?? 0) >= 10) {
    pushSignal(signals, 'visceral_fat_high', {
      severity: 'medium',
      confidence: getConfidence('visceralFat', features.visceralFat.seriesLength, 1),
      evidence: [`内脏脂肪指数 ${latest.visceralFat} 处于偏高区间`],
    })
  }

  if ((latest?.water ?? 100) < 55) {
    const evidence = [`当前水分 ${latest.water}% 偏低`]
    if (features.water.downMoves >= 2 && (features.water.delta3 ?? 0) < -0.4) {
      evidence.push(`最近几次水分持续走低，累计 ${formatSigned(features.water.delta3)}%`)
      pushSignal(signals, 'hydration_declining', {
        severity: 'medium',
        confidence: getConfidence('water', features.water.seriesLength, evidence.length),
        evidence,
      })
    } else {
      pushSignal(signals, 'hydration_low', {
        severity: 'low',
        confidence: getConfidence('water', features.water.seriesLength, evidence.length),
        evidence,
      })
    }
  }

  if ((latest?.bmr ?? 9999) < 1550) {
    pushSignal(signals, 'bmr_low', {
      severity: 'medium',
      confidence: getConfidence('bmr', features.bmr.seriesLength, 1),
      evidence: [`当前基础代谢 ${latest.bmr} kcal 偏低`],
    })
  }

  const muscleDropEvidence = []
  if ((features.muscle.delta3 ?? 0) < -0.8) muscleDropEvidence.push(`最近几次肌肉量累计 ${formatSigned(features.muscle.delta3)}kg`)
  if (features.muscle.downMoves >= 2) muscleDropEvidence.push('最近几次肌肉量方向连续走弱')

  if (muscleDropEvidence.length >= 2 && ((features.fat.delta3 ?? 0) > 0.4 || (features.bmr.delta3 ?? 0) < -20)) {
    pushSignal(signals, 'muscle_drop_confirmed', {
      severity: 'high',
      confidence: getConfidence('muscle', features.muscle.seriesLength, muscleDropEvidence.length + 1),
      evidence: [...muscleDropEvidence, '且伴随体脂或基础代谢信号变差'],
    })
  } else if (muscleDropEvidence.length >= 2) {
    pushSignal(signals, 'muscle_drop_possible', {
      severity: 'low',
      confidence: getConfidence('muscle', features.muscle.seriesLength, muscleDropEvidence.length),
      evidence: muscleDropEvidence,
    })
  }

  if ((features.weight.delta3 ?? 0) < -0.4 && (features.fat.delta3 ?? 0) > 0.4) {
    pushSignal(signals, 'false_cut_risk', {
      severity: 'high',
      confidence: getConfidence('weight', features.weight.seriesLength, 2),
      evidence: [
        `最近几次体重累计 ${formatSigned(features.weight.delta3)}kg`,
        `但体脂未同步改善，反而累计 ${formatSigned(features.fat.delta3)}%`,
      ],
    })
  }

  if ((features.weight.delta3 ?? 0) > 0.4 && (features.fat.delta3 ?? 0) > 0.4) {
    pushSignal(signals, 'intake_tightening_needed', {
      severity: 'high',
      confidence: getConfidence('weight', features.weight.seriesLength, 2),
      evidence: [
        `最近几次体重累计 ${formatSigned(features.weight.delta3)}kg`,
        `体脂同步累计 ${formatSigned(features.fat.delta3)}%`,
      ],
    })
  }

  if ((features.weight.delta3 ?? 0) > 0.3 && (features.fat.delta3 ?? 0) < -0.4) {
    pushSignal(signals, 'recovery_rebound_likely', {
      severity: 'medium',
      confidence: getConfidence('weight', features.weight.seriesLength, 2),
      evidence: [
        `最近几次体重累计 ${formatSigned(features.weight.delta3)}kg`,
        `但体脂累计 ${formatSigned(features.fat.delta3)}%，更像恢复或糖原回补波动`,
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

  const primaryMode = getPrimaryMode(signals, trainingContext)
  const modeMeta = getModeMeta(primaryMode)
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

  const evidence = dedupe(signals.flatMap(signal => signal.evidence ?? [])).slice(0, 5)

  return {
    features,
    signals,
    decision: {
      primaryMode,
      secondaryFlags,
      confidence,
      evidence,
      ...modeMeta,
    },
  }
}
