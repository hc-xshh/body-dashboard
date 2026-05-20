import { analyzeBodySignals } from './rulesEngine.js'
import { getTrainingContext } from './trainingContext.js'

export const DECISION_SNAPSHOT_VERSION = 'rules-engine-snapshot-v1'

function cloneEvidenceGroups(evidenceGroups = {}) {
  return {
    baseline: [...(evidenceGroups.baseline ?? [])],
    trend: [...(evidenceGroups.trend ?? [])],
    risk: [...(evidenceGroups.risk ?? [])],
    hydration: [...(evidenceGroups.hydration ?? [])],
  }
}

export function createDecisionSnapshot(decision = {}) {
  return {
    version: DECISION_SNAPSHOT_VERSION,
    badge: decision.badge ?? '—',
    stageLabel: decision.stageLabel ?? '—',
    primaryMode: decision.primaryMode ?? 'hold_course',
    trainingLoad: decision.trainingLoad ?? 'general',
    trainingLoadLabel: decision.trainingLoadLabel ?? '常规执行日',
    intakeStrategy: decision.intakeStrategy ?? 'hold_steady',
    summary: decision.summary ?? '',
    confidence: decision.confidence ?? null,
    evidenceGroups: cloneEvidenceGroups(decision.evidenceGroups),
  }
}

export function getMeasurementDecision(record, history = []) {
  if (record?.decisionSnapshot?.version && record.decisionSnapshot.badge) {
    return {
      ...record.decisionSnapshot,
      evidenceGroups: cloneEvidenceGroups(record.decisionSnapshot.evidenceGroups),
      source: 'snapshot',
    }
  }

  const analysis = analyzeBodySignals(record, history, getTrainingContext(record?.weekday))
  return {
    ...createDecisionSnapshot(analysis.decision),
    source: 'computed',
  }
}

export function buildHistoricalDecisionTimeline(records = []) {
  const asc = [...records].sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))

  return asc.map((record, index) => {
    const history = asc.slice(0, index + 1)
    return {
      ...record,
      record,
      decision: getMeasurementDecision(record, history),
    }
  })
}
