import ReactECharts from 'echarts-for-react'
import { getTrendData } from '../utils/healthAnalysis'
import { analyzeBodySignals } from '../utils/rulesEngine'
import { getTrainingContext } from '../utils/trainingContext'
import { getDecisionDisplay, getTrendSummaryText } from '../utils/decisionPresentation'
import { getTrendChartLayout, getTrendChartRenderProps } from '../utils/trendPresentation'


function buildDecisionTimeline(data = []) {
  const asc = [...data].sort((a, b) => a.date.localeCompare(b.date))

  return asc.map((record, index) => {
    const history = asc.slice(0, index + 1)
    const analysis = analyzeBodySignals(record, history, getTrainingContext(record.weekday))

    return {
      date: record.date,
      weekday: record.weekday,
      badge: analysis.decision.badge,
      stageLabel: analysis.decision.stageLabel,
      primaryMode: analysis.decision.primaryMode,
      trainingLoadLabel: analysis.decision.trainingLoadLabel,
      intakeStrategy: analysis.decision.intakeStrategy,
      confidence: Math.round((analysis.decision.confidence ?? 0) * 100),
      riskText: analysis.decision.evidenceGroups?.risk?.[0] ?? null,
      trendText: analysis.decision.evidenceGroups?.trend?.[0] ?? null,
    }
  })
}

/**
 * Compute the personal baseline band (P25–P75) for a metric from the full
 * dataset, so the trend chart can render it as a static "normal range" zone.
 * Returns { low, high } or null if there aren't enough records.
 */
function computeBaselineBand(data, metricKey, minSamples = 4) {
  const values = data
    .filter(d => d[metricKey] != null)
    .map(d => d[metricKey])
  if (values.length < minSamples) return null

  // Use the most recent 10 values to keep the band responsive to shifts
  const window = values.slice(0, 10)
  const sorted = [...window].sort((a, b) => a - b)
  const n = sorted.length
  return {
    low: sorted[Math.floor(n * 0.25)],
    high: sorted[Math.ceil(n * 0.75) - 1],
  }
}

export default function TrendChart({ data, metrics, rangeLabel = '近7天' }) {
  const colors = ['#6c63ff', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8']
  const layout = getTrendChartLayout(typeof window === 'undefined' ? 1280 : window.innerWidth)

  if (!metrics.length) {
    return (
      <div className="rounded-xl border border-dashed border-dark-600 bg-dark-900/45 px-4 py-8 text-center text-sm leading-relaxed text-slate-400">
        当前未选择任何指标，图表留空。勾选上方指标后再看趋势线。
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-dark-600 bg-dark-900/45 px-4 py-8 text-center text-sm leading-relaxed text-slate-400">
        {rangeLabel}内暂无可用样本，先保留空图；切换更长时间范围后再看趋势。
      </div>
    )
  }

  const decisionTimeline = buildDecisionTimeline(data)
  const decisionMap = new Map(decisionTimeline.map(item => [item.date, item]))
  const latestDecision = decisionTimeline[decisionTimeline.length - 1] ?? null
  const latestDecisionDisplay = latestDecision ? getDecisionDisplay(latestDecision) : null
  const changeEvents = decisionTimeline.filter((item, index, list) => {
    if (index === 0) return true
    const prev = list[index - 1]
    return item.primaryMode !== prev.primaryMode || item.stageLabel !== prev.stageLabel
  })

  // Earliest/latest date range for band overlay
  const dates = data.filter(d => d.date).map(d => d.date).sort()
  const bandStart = dates[0] ?? null
  const bandEnd = dates[dates.length - 1] ?? null

  const series = metrics.map((m, i) => {
    const trend = getTrendData(data, m.key)
    const baseSeries = {
      name: m.label,
      type: 'line',
      data: trend.map(d => [d.date, d.value]),
      smooth: true,
      symbol: 'circle',
      symbolSize: layout.symbolSize,
      lineStyle: { color: colors[i % colors.length], width: 2 },
      itemStyle: { color: colors[i % colors.length] },
    }

    // --- Baseline band overlay (on first metric only) ---
    if (i === 0 && bandStart && bandEnd) {
      const band = computeBaselineBand(data, m.key)
      if (band && band.high > band.low) {
        baseSeries.markArea = {
          silent: true,
          label: { show: false },
          itemStyle: {
            color: 'rgba(148, 163, 184, 0.08)',
            borderColor: 'rgba(148, 163, 184, 0.15)',
            borderWidth: 1,
            borderType: 'dashed',
          },
          data: [[
            { xAxis: bandStart, yAxis: band.low },
            { xAxis: bandEnd, yAxis: band.high },
          ]],
        }
      }
    }

    // --- Strategy change markers (on first metric only) ---
    if (i === 0 && changeEvents.length > 1) {
      baseSeries.markLine = {
        symbol: ['none', 'none'],
        label: {
          show: layout.showChangeLabels,
          color: '#94a3b8',
          fontSize: 10,
          formatter: ({ data }) => data?.label ?? '',
        },
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.35)',
          type: 'dashed',
          width: 1,
        },
        data: changeEvents.slice(1).map(event => ({
          xAxis: event.date,
          label: event.badge,
        })),
      }
    }

    return baseSeries
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1d2e',
      borderColor: '#2f3354',
      textStyle: { color: '#e2e8f0' },
      formatter: params => {
        const axisDate = params?.[0]?.axisValueLabel ?? params?.[0]?.value?.[0]
        const decision = decisionMap.get(axisDate)
        let html = `<div style="font-size:12px;margin-bottom:4px;color:#94a3b8">${axisDate}</div>`

        if (decision) {
          html += `<div style="margin-bottom:6px;color:#e2e8f0"><b>${decision.badge}</b> · ${decision.stageLabel}</div>`
          html += `<div style="margin-bottom:6px;color:#94a3b8">负荷：${decision.trainingLoadLabel} / 饮食策略：${getDecisionDisplay(decision).intakeLabel} / 置信度 ${getDecisionDisplay(decision).confidenceText}</div>`
        }

        params.forEach(p => {
          html += `<div>${p.marker}${p.seriesName}: <b>${p.value[1]}</b></div>`
        })

        if (decision?.trendText) {
          html += `<div style="margin-top:6px;color:#cbd5e1">趋势：${decision.trendText}</div>`
        }
        if (decision?.riskText) {
          html += `<div style="margin-top:4px;color:#fca5a5">风险：${decision.riskText}</div>`
        }
        return html
      },
    },
    legend: {
      data: metrics.map(m => m.label),
      textStyle: { color: '#94a3b8', fontSize: 12 },
      bottom: layout.legendBottom,
    },
    grid: layout.grid,
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#2f3354' } },
      axisLabel: {
        color: '#64748b',
        fontSize: layout.xAxisFontSize,
        formatter: v => {
          const d = new Date(v)
          return `${d.getMonth() + 1}/${d.getDate()}`
        },
      },
      splitLine: { show: false },
    },
    yAxis: {
      axisLabel: { color: '#64748b', fontSize: layout.yAxisFontSize },
      splitLine: { lineStyle: { color: '#1e2235', type: 'dashed' } },
    },
    series,
  }

  return (
    <div>
      {latestDecision && (
        <div className="mb-4 border-b border-dark-700 pb-4">
          <p className="text-sm leading-relaxed text-slate-200">
            {getTrendSummaryText(latestDecision)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {latestDecisionDisplay?.compactSummary ?? latestDecision.summary}
          </p>
        </div>
      )}

      <ReactECharts
        option={option}
        style={{ height: `${layout.height}px` }}
        opts={{ renderer: 'svg' }}
        {...getTrendChartRenderProps()}
      />
    </div>
  )
}
