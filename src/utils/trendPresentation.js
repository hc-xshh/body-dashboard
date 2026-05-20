export const DEFAULT_TREND_METRIC_KEYS = ['weight', 'bodyFat', 'muscle']

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
  return [...new Set(selectedKeys)].filter(key => available.has(key))
}

export function getTrendChartRenderProps() {
  return {
    notMerge: true,
    replaceMerge: ['series'],
    lazyUpdate: false,
  }
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
