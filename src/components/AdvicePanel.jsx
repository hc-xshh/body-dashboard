import { useMemo, useState } from 'react'
import { getAdvicePanelPresentation, getDecisionDisplay } from '../utils/decisionPresentation'
import { getMetricInsightPresentation } from '../utils/metricGuidance'

export default function AdvicePanel({ advice, engine = null, metricInsights = [] }) {
  if (!advice.length) return null

  const text = { good: 'text-green-300', warn: 'text-amber-300', bad: 'text-red-300' }
  const accentBorder = { baseline: 'border-indigo-500/35', trend: 'border-emerald-500/35', risk: 'border-red-500/35', hydration: 'border-sky-500/35' }
  const decisionDisplay = engine ? getDecisionDisplay(engine) : null
  const [mobileExpanded, setMobileExpanded] = useState(false)

  // ── evidenceGroups → structured card definitions ──
  const evidenceCards = []
  if (engine?.evidenceGroups) {
    const { baseline, trend, risk, hydration } = engine.evidenceGroups

    if (baseline?.length) {
      evidenceCards.push({
        key: 'baseline',
        label: '基线',
        icon: '📏',
        items: baseline,
        hint: '相对个人28天中位数与波动带的偏离判断',
      })
    }
    if (trend?.length) {
      evidenceCards.push({
        key: 'trend',
        label: '趋势',
        icon: '📊',
        items: trend,
        hint: '最近几次连续变化的幅度与方向',
      })
    }
    if (risk?.length) {
      evidenceCards.push({
        key: 'risk',
        label: '风险',
        icon: '⚡',
        items: risk,
        hint: '当前需要优先关注的健康风险',
      })
    }
    if (hydration?.length) {
      evidenceCards.push({
        key: 'hydration',
        label: '补水',
        icon: '💧',
        items: hydration,
        hint: '水分相关的连续表现与提醒',
      })
    }
  }

  const advicePresentation = useMemo(
    () => getAdvicePanelPresentation({
      viewportWidth: typeof window === 'undefined' ? 1280 : window.innerWidth,
      evidenceCards,
      expanded: mobileExpanded,
    }),
    [evidenceCards, mobileExpanded],
  )

  const metricInsightPresentation = useMemo(
    () => getMetricInsightPresentation(metricInsights),
    [metricInsights],
  )

  return (
    <div className="flex h-full flex-col">
      {engine && (
        <div className="pb-4">
          <div className="text-sm leading-relaxed text-slate-200">
            {engine.badge} · {engine.stageLabel} · 负荷 {engine.trainingLoadLabel} · 饮食 {decisionDisplay?.intakeLabel ?? '—'} · 置信度 {decisionDisplay?.confidenceText ?? '—'}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{decisionDisplay?.compactSummary ?? engine.summary}</p>

          {!!evidenceCards.length && (
            <div className="mt-4 space-y-3 border-t border-dark-700 pt-4">
              {advicePresentation.visibleEvidenceCards.map(card => (
                <div key={card.label} className={`border-l-2 ${accentBorder[card.key] ?? 'border-dark-600'} pl-3`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">{card.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{card.label}</span>
                    <span className="text-[11px] text-slate-500">{card.hint}</span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {card.items.map((item, idx) => (
                      <p key={idx} className="text-sm leading-relaxed text-slate-300">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {advicePresentation.toggleLabel && (
                <button
                  type="button"
                  onClick={() => setMobileExpanded(current => !current)}
                  className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-3 py-1.5 text-xs text-slate-300 transition hover:border-accent/35 hover:text-slate-100 sm:hidden"
                >
                  {advicePresentation.toggleLabel}
                  {advicePresentation.hiddenEvidenceCount > 0 ? `（还有 ${advicePresentation.hiddenEvidenceCount} 组）` : ''}
                </button>
              )}
            </div>
          )}
          {!!metricInsightPresentation.items.length && (
            <details className="mt-4 border-t border-dark-700 pt-4 group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-slate-300">
                <span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">指标说明</span>
                  {metricInsightPresentation.summary && (
                    <span className="ml-2 text-xs text-slate-500">{metricInsightPresentation.summary}</span>
                  )}
                </span>
                <span className="text-xs text-slate-500 group-open:hidden">查看全部指标说明</span>
                <span className="hidden text-xs text-slate-500 group-open:inline">收起指标说明</span>
              </summary>
              <div className="mt-3 space-y-4 border-l-2 border-dark-700 pl-3">
                {metricInsightPresentation.items.map((insight) => (
                  <div key={insight.key} className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">{insight.label}</span>
                      <span className="text-xs text-slate-400">{insight.statusLabel}</span>
                      {insight.rangeText && <span className="text-[11px] text-slate-500">{insight.rangeText}</span>}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{insight.summary}</p>
                    <p className="text-sm leading-relaxed text-slate-400">{insight.analysis}</p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      <span className="text-slate-300">运动重点：</span>
                      {insight.movementAdvice.join('；')}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      <span className="text-slate-300">饮食重点：</span>
                      {insight.dietAdvice.join('；')}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <div className="border-t border-dark-700 pt-4">
        {advice.map((a, i) => (
          <div key={i} className={`flex gap-3 ${i > 0 ? 'mt-3 border-t border-dark-800 pt-3' : ''}`}>
            <span className="text-lg flex-shrink-0 sm:text-xl">{a.icon}</span>
            <p className={`text-sm leading-relaxed ${text[a.level] ?? 'text-slate-400'}`}>{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
