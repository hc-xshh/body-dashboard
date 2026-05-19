import test from 'node:test'
import assert from 'node:assert/strict'

import { getMeasurementOverview } from '../src/utils/dashboardState.js'

test('returns a safe empty state when measurements are missing', () => {
  const overview = getMeasurementOverview([], '2026-05-19')

  assert.equal(overview.hasMeasurements, false)
  assert.equal(overview.latest, null)
  assert.equal(overview.prev, null)
  assert.equal(overview.sorted.length, 0)
  assert.equal(overview.isUsingLatestMeasurement, false)
  assert.match(overview.measurementSyncBanner.text, /暂无体测数据/)
})

test('derives latest measurement and sync banner when data exists', () => {
  const overview = getMeasurementOverview([
    { date: '2026-05-18', time: '07:50' },
    { date: '2026-05-19', time: '08:05' },
  ], '2026-05-19')

  assert.equal(overview.hasMeasurements, true)
  assert.equal(overview.latest?.date, '2026-05-19')
  assert.equal(overview.prev?.date, '2026-05-18')
  assert.equal(overview.isUsingLatestMeasurement, true)
  assert.equal(overview.measurementSyncBanner.tone, 'emerald')
})
