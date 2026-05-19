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
