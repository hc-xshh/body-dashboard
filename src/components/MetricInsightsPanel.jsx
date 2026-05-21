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
      <div className="mt-3 divide-y divide-dark-700/80 border-l-2 border-dark-700 pl-3">
        {metricInsightPresentation.items.map((insight) => (
          <div key={insight.key} className="space-y-3 py-4 first:pt-0 last:pb-0">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-slate-100">{insight.label}</span>
                <span className="text-xs font-medium text-slate-300">状态：{insight.statusLabel}</span>
              </div>
              {insight.rangeText && (
                <p className="text-[11px] leading-relaxed text-slate-500">区间：{insight.rangeText}</p>
              )}
            </div>
            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-slate-300">
                <span className="font-semibold text-slate-200">概览：</span>
                {insight.summary}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold text-slate-200">分析：</span>
                {insight.analysis}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold text-slate-200">运动重点：</span>
                {insight.movementAdvice.join('；')}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold text-slate-200">饮食重点：</span>
                {insight.dietAdvice.join('；')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}
