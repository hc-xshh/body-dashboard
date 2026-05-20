import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_TREND_METRIC_KEYS,
  getMetricSelectorItems,
  getTrendChartLayout,
  sanitizeSelectedTrendMetrics,
} from '../src/utils/trendPresentation.js'

test('uses weight body fat and muscle as default selected metrics', () => {
  assert.deepEqual(DEFAULT_TREND_METRIC_KEYS, ['weight', 'bodyFat', 'muscle'])
})

test('allows empty selected metrics when user deselects everything', () => {
  const available = [
    { key: 'weight', label: '体重(kg)' },
    { key: 'bodyFat', label: '体脂率(%)' },
    { key: 'muscle', label: '肌肉量(kg)' },
  ]

  assert.deepEqual(sanitizeSelectedTrendMetrics([], available), [])
})

test('keeps only known selected metrics', () => {
  const available = [
    { key: 'weight', label: '体重(kg)' },
    { key: 'bodyFat', label: '体脂率(%)' },
    { key: 'muscle', label: '肌肉量(kg)' },
    { key: 'water', label: '水分(%)' },
  ]

  assert.deepEqual(
    sanitizeSelectedTrendMetrics(['weight', 'water', 'unknown'], available),
    ['weight', 'water']
  )
})

test('selector items expose selected state for multi-select chips', () => {
  const items = getMetricSelectorItems(
    [
      { key: 'weight', label: '体重(kg)' },
      { key: 'bodyFat', label: '体脂率(%)' },
      { key: 'muscle', label: '肌肉量(kg)' },
    ],
    ['weight', 'muscle']
  )

  assert.deepEqual(items, [
    { key: 'weight', label: '体重(kg)', selected: true },
    { key: 'bodyFat', label: '体脂率(%)', selected: false },
    { key: 'muscle', label: '肌肉量(kg)', selected: true },
  ])
})

test('returns denser chart layout for narrow screens', () => {
  const mobile = getTrendChartLayout(375)
  const desktop = getTrendChartLayout(1280)

  assert.deepEqual(mobile, {
    height: 260,
    legendBottom: -4,
    grid: { left: 28, right: 8, top: 16, bottom: 52 },
    xAxisFontSize: 10,
    yAxisFontSize: 10,
    showChangeLabels: false,
    symbolSize: 5,
  })
  assert.equal(desktop.height, 320)
  assert.equal(desktop.showChangeLabels, true)
})
