import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { analyzeBodySignals } from '../src/utils/rulesEngine.js'
import { getTrainingContext } from '../src/utils/trainingContext.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const measurementsPath = path.join(repoRoot, 'src/data/measurements.json')

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    full: argv.includes('--full'),
    limit: (() => {
      const raw = argv.find(arg => arg.startsWith('--limit='))
      if (!raw) return 8
      const parsed = Number(raw.split('=')[1])
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 8
    })(),
  }
}

function buildTimeline(records) {
  const asc = [...records].sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))

  return asc.map((record, index) => {
    const history = asc.slice(0, index + 1)
    const analysis = analyzeBodySignals(record, history, getTrainingContext(record.weekday))
    const decision = analysis.decision

    return {
      date: record.date,
      time: record.time ?? null,
      weekday: record.weekday,
      weight: record.weight,
      bodyFat: record.bodyFat,
      primaryMode: decision.primaryMode,
      badge: decision.badge,
      stageLabel: decision.stageLabel,
      trainingLoad: decision.trainingLoad,
      trainingLoadLabel: decision.trainingLoadLabel,
      intakeStrategy: decision.intakeStrategy,
      confidence: decision.confidence,
      baseline: decision.evidenceGroups?.baseline?.[0] ?? null,
      trend: decision.evidenceGroups?.trend?.[0] ?? null,
      risk: decision.evidenceGroups?.risk?.[0] ?? null,
      signals: analysis.signals.map(signal => signal.key),
    }
  })
}

function getTransitions(timeline) {
  return timeline.filter((entry, index, list) => {
    if (index === 0) return true
    const prev = list[index - 1]
    return entry.primaryMode !== prev.primaryMode || entry.stageLabel !== prev.stageLabel
  })
}

function formatConfidence(value) {
  return `${Math.round((value ?? 0) * 100)}%`
}

function printHumanSummary(timeline, transitions, limit, full) {
  const latest = timeline[timeline.length - 1]
  const visibleTimeline = full ? timeline : timeline.slice(-limit)
  const visibleTransitions = full ? transitions : transitions.slice(-limit)

  console.log('=== Body Dashboard Rules Replay ===')
  console.log(`records: ${timeline.length}`)
  console.log(`latest: ${latest.date} ${latest.time ?? ''} · ${latest.badge} · ${latest.stageLabel} · ${latest.trainingLoadLabel} · intake=${latest.intakeStrategy} · confidence=${formatConfidence(latest.confidence)}`)
  console.log('')
  console.log('--- Recent decision timeline ---')
  visibleTimeline.forEach(entry => {
    console.log(
      `${entry.date} ${entry.time ?? '--:--'} ${entry.weekday} | ` +
      `${entry.badge} / ${entry.stageLabel} | ` +
      `${entry.trainingLoadLabel} | intake=${entry.intakeStrategy} | ` +
      `weight=${entry.weight} | fat=${entry.bodyFat}% | conf=${formatConfidence(entry.confidence)}`,
    )
  })
  console.log('')
  console.log('--- Recent mode/stage transitions ---')
  visibleTransitions.forEach(entry => {
    console.log(
      `${entry.date} ${entry.weekday} | ${entry.badge} / ${entry.stageLabel} | ` +
      `${entry.trainingLoadLabel} | intake=${entry.intakeStrategy}`,
    )
    if (entry.baseline) console.log(`  baseline: ${entry.baseline}`)
    if (entry.trend) console.log(`  trend: ${entry.trend}`)
    if (entry.risk) console.log(`  risk: ${entry.risk}`)
  })
}

const args = parseArgs(process.argv.slice(2))
const raw = await fs.readFile(measurementsPath, 'utf8')
const records = JSON.parse(raw)
const timeline = buildTimeline(records)
const transitions = getTransitions(timeline)

if (args.json) {
  console.log(JSON.stringify({ latest: timeline[timeline.length - 1], transitions, timeline }, null, 2))
} else {
  printHumanSummary(timeline, transitions, args.limit, args.full)
}
