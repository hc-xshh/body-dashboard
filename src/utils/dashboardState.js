function toIsoDateParts(dateString) {
  if (!dateString) return null
  const parts = dateString.split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  return { year: parts[0], month: parts[1], day: parts[2] }
}

function differenceInDays(laterDate, earlierDate) {
  const later = toIsoDateParts(laterDate)
  const earlier = toIsoDateParts(earlierDate)
  if (!later || !earlier) return null

  const laterUtc = Date.UTC(later.year, later.month - 1, later.day)
  const earlierUtc = Date.UTC(earlier.year, earlier.month - 1, earlier.day)
  return Math.floor((laterUtc - earlierUtc) / 86400000)
}

function formatWeightNumber(value, digits = 2) {
  return Number(value).toFixed(digits)
}

function inferHeightMetersFromLatestMeasurement(measurements = []) {
  const latest = measurements.find(record => record?.weight != null && record?.bmi != null)
  if (!latest) return null

  const weight = Number(latest.weight)
  const bmi = Number(latest.bmi)
  if (!Number.isFinite(weight) || !Number.isFinite(bmi) || bmi <= 0) return null

  return Math.sqrt(weight / bmi)
}

function getHealthyWeightBand(measurements = []) {
  const heightMeters = inferHeightMetersFromLatestMeasurement(measurements)
  if (!heightMeters) return null

  return {
    low: 18.5 * heightMeters * heightMeters,
    high: 23.9 * heightMeters * heightMeters,
  }
}

export function getWeightPresentation(measurements = [], options = {}) {
  const {
    latestDate = measurements[0]?.date ?? null,
    minSamples = 4,
    lookbackDays = 30,
  } = options

  const candidates = measurements
    .filter(record => record?.weight != null && record?.date)
    .filter((record) => {
      const diff = differenceInDays(latestDate, record.date)
      return diff != null && diff >= 0 && diff <= lookbackDays
    })
    .map(record => Number(record.weight))
    .filter(value => Number.isFinite(value))

  const healthyBand = getHealthyWeightBand(measurements)
  const latestWeight = Number(measurements[0]?.weight)

  let personalBand = null
  if (candidates.length >= minSamples) {
    const sortedValues = [...candidates].sort((a, b) => a - b)
    personalBand = {
      low: sortedValues[Math.floor(sortedValues.length * 0.25)],
      high: sortedValues[Math.ceil(sortedValues.length * 0.75) - 1],
    }
  }

  const references = [
    healthyBand
      ? `健康参考：${formatWeightNumber(healthyBand.low, 1)}-${formatWeightNumber(healthyBand.high, 1)} kg`
      : '健康参考：需补全身高/BMI后计算',
    personalBand
      ? `个人波动：${formatWeightNumber(personalBand.low)}-${formatWeightNumber(personalBand.high)} kg`
      : '个人波动：近30天样本不足',
  ]

  let status = '先补全健康参考数据'
  if (Number.isFinite(latestWeight) && healthyBand && personalBand) {
    const aboveHealthy = latestWeight > healthyBand.high
    const belowHealthy = latestWeight < healthyBand.low
    const withinPersonal = latestWeight >= personalBand.low && latestWeight <= personalBand.high
    const abovePersonal = latestWeight > personalBand.high
    const belowPersonal = latestWeight < personalBand.low

    if (aboveHealthy && withinPersonal) {
      status = '略高于健康上限，但处于近期个人稳定区间'
    } else if (belowHealthy && withinPersonal) {
      status = '低于健康下限，但处于近期个人稳定区间'
    } else if (!aboveHealthy && !belowHealthy && withinPersonal) {
      status = '处于健康范围，也处于近期个人稳定区间'
    } else if (aboveHealthy && abovePersonal) {
      status = '高于健康上限，也高于近期个人波动'
    } else if (belowHealthy && belowPersonal) {
      status = '低于健康下限，也低于近期个人波动'
    } else if (aboveHealthy) {
      status = '高于健康上限'
    } else if (belowHealthy) {
      status = '低于健康下限'
    } else if (abovePersonal) {
      status = '处于健康范围，但高于近期个人波动'
    } else if (belowPersonal) {
      status = '处于健康范围，但低于近期个人波动'
    } else {
      status = '处于健康范围'
    }
  } else if (Number.isFinite(latestWeight) && healthyBand) {
    if (latestWeight > healthyBand.high) {
      status = '略高于健康上限，个人趋势样本仍不足'
    } else if (latestWeight < healthyBand.low) {
      status = '低于健康下限，个人趋势样本仍不足'
    } else {
      status = '处于健康范围，个人趋势样本仍不足'
    }
  } else if (!personalBand) {
    status = '近30天样本不足，先继续记录'
  }

  return {
    references,
    status,
  }
}

export function getMeasurementOverview(measurements = [], todayDate) {
  const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date))
  const latest = sorted[0] ?? null
  const prev = sorted[1] ?? null

  if (!latest) {
    return {
      hasMeasurements: false,
      sorted,
      latest: null,
      prev: null,
      isUsingLatestMeasurement: false,
      measurementSyncBanner: {
        tone: 'amber',
        text: '暂无体测数据，仪表盘已进入安全回退状态。请先同步最新体测后再查看建议。',
      },
    }
  }

  const isUsingLatestMeasurement = latest.date === todayDate
  const measurementSyncBanner = isUsingLatestMeasurement
    ? {
        tone: 'emerald',
        text: `今日体测已同步，当前建议基于 ${latest.date} ${latest.time ?? ''} 的最新数据生成。`,
      }
    : {
        tone: 'amber',
        text: `今日未同步新体测，当前沿用 ${latest.date} ${latest.time ?? ''} 的最近一次数据生成建议。`,
      }

  return {
    hasMeasurements: true,
    sorted,
    latest,
    prev,
    isUsingLatestMeasurement,
    measurementSyncBanner,
  }
}
