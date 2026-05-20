import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_TREND_METRIC_KEYS,
  getHistoryCards,
  getMetricSelectorItems,
  getMobileHistoryColumns,
  getTrendChartLayout,
  sanitizeSelectedTrendMetrics,
} from '../src/utils/trendPresentation.js'

test('compacts history records into mobile-friendly cards', () => {
  const cards = getHistoryCards([
    {
      date: '2026-05-20',
      time: '07:56',
      weight: 68.1,
      bodyFat: 22.2,
      bmi: 24.1,
      muscle: 50.3,
      visceralFat: 10,
      water: 53.3,
      bone: 2.7,
      score: 77,
    },
  ], new Map([
    ['2026-05-20', { stageLabel: '恢复阶段', badge: '恢复优先' }],
  ]))

  assert.deepEqual(cards[0], {
    key: '2026-05-20-07:56',
    dateLabel: '2026-05-20',
    stageModeLabel: '恢复阶段 / 恢复优先',
    metrics: [
      { label: '体重', value: '68.1 kg' },
      { label: '体脂', value: '22.2%' },
      { label: 'BMI', value: '24.1' },
      { label: '肌肉', value: '50.3 kg' },
      { label: '内脏脂肪', value: '10' },
      { label: '水分', value: '53.3%' },
      { label: '骨量', value: '2.7 kg' },
      { label: '得分', value: '77' },
    ],
  })
})

test('keeps desktop columns but reduces mobile table columns', () => {
  const columns = getMobileHistoryColumns()
  assert.deepEqual(columns, ['日期', '阶段 / 模式', '体重', '体脂%'])
})

test('uses weight body fat and muscle as default selected metrics', () => {
  assert.deepEqual(DEFAULT_TREND_METRIC_KEYS, ['weight', 'bodyFat', 'muscle'])
})

test('sanitizes selected metrics and falls back to defaults when empty', () => {
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

  assert.deepEqual(
    sanitizeSelectedTrendMetrics([], available),
    ['weight', 'bodyFat', 'muscle']
  )
})

test('builds selector items with selected state for multi-select chips', () => {
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
