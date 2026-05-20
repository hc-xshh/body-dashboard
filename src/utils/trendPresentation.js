export const DEFAULT_TREND_METRIC_KEYS = ['weight', 'bodyFat', 'muscle']

function formatMetricValue(value, unit = '') {
  if (value == null || value === '') return '—'
  return `${value}${unit}`
}

export function getHistoryCards(rows = [], decisionMap = new Map()) {
  return rows.map((row) => {
    const decision = decisionMap.get(row.date)

    return {
      key: `${row.date}-${row.time ?? ''}`,
      dateLabel: row.date,
      stageModeLabel: decision ? `${decision.stageLabel} / ${decision.badge}` : '—',
      metrics: [
        { label: '体重', value: formatMetricValue(row.weight, ' kg') },
        { label: '体脂', value: formatMetricValue(row.bodyFat, '%') },
        { label: 'BMI', value: formatMetricValue(row.bmi) },
        { label: '肌肉', value: formatMetricValue(row.muscle, ' kg') },
        { label: '内脏脂肪', value: formatMetricValue(row.visceralFat) },
        { label: '水分', value: formatMetricValue(row.water, '%') },
        { label: '骨量', value: formatMetricValue(row.bone, ' kg') },
        { label: '得分', value: formatMetricValue(row.score) },
      ],
    }
  })
}

export function getMobileHistoryColumns() {
  return ['日期', '阶段 / 模式', '体重', '体脂%']
}

export function getMetricSelectorItems(metrics = [], selectedKeys = []) {
  const selected = new Set(selectedKeys)
  return metrics.map(metric => ({
    key: metric.key,
    label: metric.label,
    selected: selected.has(metric.key),
  }))
}

export function sanitizeSelectedTrendMetrics(selectedKeys = [], metrics = []) {
  const available = new Set(metrics.map(metric => metric.key))
  const filtered = [...new Set(selectedKeys)].filter(key => available.has(key))

  if (filtered.length) return filtered

  return DEFAULT_TREND_METRIC_KEYS.filter(key => available.has(key))
}

export function getTrendChartLayout(viewportWidth = 1280) {
  const isMobile = viewportWidth < 640

  if (isMobile) {
    return {
      height: 260,
      legendBottom: -4,
      grid: { left: 28, right: 8, top: 16, bottom: 52 },
      xAxisFontSize: 10,
      yAxisFontSize: 10,
      showChangeLabels: false,
      symbolSize: 5,
    }
  }

  return {
    height: 320,
    legendBottom: 0,
    grid: { left: 40, right: 20, top: 24, bottom: 40 },
    xAxisFontSize: 11,
    yAxisFontSize: 11,
    showChangeLabels: true,
    symbolSize: 6,
  }
}
