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

function formatWeightNumber(value) {
  return Number(value).toFixed(2)
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

  if (candidates.length < minSamples) {
    return {
      reference: '以近30天稳定区间为主',
      status: '近30天样本不足，先继续记录',
    }
  }

  const sortedValues = [...candidates].sort((a, b) => a - b)
  const low = sortedValues[Math.floor(sortedValues.length * 0.25)]
  const high = sortedValues[Math.ceil(sortedValues.length * 0.75) - 1]
  const latestWeight = Number(measurements[0]?.weight)

  let status = '处于个人稳定区间'
  if (Number.isFinite(latestWeight)) {
    if (latestWeight < low) {
      status = '低于个人稳定区间'
    } else if (latestWeight > high) {
      status = '高于个人稳定区间'
    }
  }

  return {
    reference: `${formatWeightNumber(low)}-${formatWeightNumber(high)} kg`,
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
