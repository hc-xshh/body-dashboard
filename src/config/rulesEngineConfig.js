export const defaultRulesEngineConfig = {
  windows: {
    seriesLimit: 10,
    shortWindow: 4,
    mediumWindow: 8,
    longWindow: 10,
    minBaselineBandSamples: 4,
  },
  thresholds: {
    fatHigh: 22,
    fatMildHigh: 20,
    fatRisingPersistentDelta3: 0.6,
    fatFallingPersistentDelta3: -0.6,
    fatAboveBaselineDeviation: 1,
    minLongWindowCount: 6,
    visceralFatHigh: 10,
    waterLow: 55,
    hydrationDecliningDelta3: -0.4,
    bmrLow: 1550,
    muscleDropDelta3: -0.8,
    muscleDropBmrDelta3: -20,
    falseCutWeightDropDelta3: -0.4,
    falseCutFatRiseDelta3: 0.4,
    baselineDrivenTighteningFatDeviation: 1,
    baselineDrivenTighteningWeightDeviation: 0.6,
    recoveryBandDrivenFatDelta3: 0.4,
    tighteningWeightRiseDelta3: 0.4,
    tighteningFatRiseDelta3: 0.4,
    reboundWeightRiseDelta3: 0.3,
    reboundFatNonIncreaseDelta3: 0,
    reboundWeightNearBaseline: 1.2,
    reboundFatNearBaseline: 0.8,
    noiseHighMinSignals: 2,
    noiseHighConfidence: 0.6,
    metabolismProtectionConfidenceBoost: 0.05,
    defaultDecisionConfidence: 0.7,
  },
}

export function mergeRulesEngineConfig(overrides = {}) {
  return {
    windows: {
      ...defaultRulesEngineConfig.windows,
      ...(overrides.windows ?? {}),
    },
    thresholds: {
      ...defaultRulesEngineConfig.thresholds,
      ...(overrides.thresholds ?? {}),
    },
  }
}
