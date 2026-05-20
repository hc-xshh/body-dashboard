import { useMemo } from 'react'
import { getMetricInsightPresentation } from '../utils/metricGuidance'

export default function MetricInsightsPanel({ metricInsights = [] }) {
  const metricInsightPresentation = useMemo(
    () => getMetricInsightPresentation(metricInsights),
    [metricInsights],
  )

  if (!metricInsightPresentation.items.length) return null

  return (
    <details className="mt-4 rounded-xl border border-dark-600 bg-dark-800/70 p-4 group">
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
  )
}
