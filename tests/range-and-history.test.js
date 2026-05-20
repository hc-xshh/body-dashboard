import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  getMeasurementsWithinDays,
  paginateMeasurements,
  TREND_RANGE_OPTIONS,
  HISTORY_PAGE_SIZE_OPTIONS,
} from '../src/utils/dashboardState.js'

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const trendChartSource = readFileSync(new URL('../src/components/TrendChart.jsx', import.meta.url), 'utf8')

const measurements = [
  { date: '2026-05-20', weight: 68.1 },
  { date: '2026-05-19', weight: 68.1 },
  { date: '2026-05-18', weight: 68.85 },
  { date: '2026-05-17', weight: 68.25 },
  { date: '2026-05-16', weight: 67.95 },
  { date: '2026-05-15', weight: 67.95 },
  { date: '2026-05-14', weight: 67.95 },
  { date: '2026-05-13', weight: 68.35 },
  { date: '2026-05-12', weight: 68.85 },
  { date: '2026-05-08', weight: 68.8 },
]

test('exposes trend range options with 7-day default and longer windows', () => {
  assert.deepEqual(TREND_RANGE_OPTIONS, [
    { label: '近7天', days: 7 },
    { label: '近10天', days: 10 },
    { label: '近2周', days: 14 },
    { label: '近1个月', days: 30 },
  ])
})

test('filters measurements to the requested recent-day window and allows empty results', () => {
  assert.deepEqual(
    getMeasurementsWithinDays(measurements, { latestDate: '2026-05-20', days: 7 }).map(item => item.date),
    ['2026-05-20', '2026-05-19', '2026-05-18', '2026-05-17', '2026-05-16', '2026-05-15', '2026-05-14']
  )

  assert.deepEqual(
    getMeasurementsWithinDays(measurements, { latestDate: '2026-05-20', days: 10 }).map(item => item.date),
    ['2026-05-20', '2026-05-19', '2026-05-18', '2026-05-17', '2026-05-16', '2026-05-15', '2026-05-14', '2026-05-13', '2026-05-12']
  )

  assert.deepEqual(
    getMeasurementsWithinDays(measurements, { latestDate: '2026-05-01', days: 7 }),
    []
  )
})

test('paginates history rows with a 7-row default and supports 10/20/50 page sizes', () => {
  assert.deepEqual(HISTORY_PAGE_SIZE_OPTIONS, [7, 10, 20, 50])

  const firstPage = paginateMeasurements(measurements, { page: 1, pageSize: 7 })
  assert.equal(firstPage.page, 1)
  assert.equal(firstPage.totalPages, 2)
  assert.equal(firstPage.hasNextPage, true)
  assert.deepEqual(firstPage.items.map(item => item.date), [
    '2026-05-20', '2026-05-19', '2026-05-18', '2026-05-17', '2026-05-16', '2026-05-15', '2026-05-14',
  ])

  const secondPage = paginateMeasurements(measurements, { page: 2, pageSize: 7 })
  assert.equal(secondPage.hasPreviousPage, true)
  assert.deepEqual(secondPage.items.map(item => item.date), [
    '2026-05-13', '2026-05-12', '2026-05-08',
  ])
})

test('trend chart removes recent transition cards and app wires range/history controls', () => {
  assert.doesNotMatch(trendChartSource, /recentChangeEvents\.map/)
  assert.match(appSource, /selectedTrendRangeDays/)
  assert.match(appSource, /TREND_RANGE_OPTIONS\.map/)
  assert.match(appSource, /HISTORY_PAGE_SIZE_OPTIONS\.map/)
  assert.match(appSource, /每页显示/)
  assert.match(appSource, /上一页/)
  assert.match(appSource, /下一页/)
})
