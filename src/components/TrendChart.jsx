import ReactECharts from 'echarts-for-react'
import { getTrendData } from '../utils/healthAnalysis'
import { analyzeBodySignals } from '../utils/rulesEngine'
import { getTrainingContext } from '../utils/trainingContext'


function buildDecisionTimeline(data = []) {
  const asc = [...data].sort((a, b) => a.date.localeCompare(b.date))

  return asc.map((record, index) => {
    const history = asc.slice(0, index + 1)
    const decision = analyzeBodySignals(record, history, getTrainingContext(record.weekday)).decision

    return {
      date: record.date,
      weekday: record.weekday,
      badge: decision.badge,
      stageLabel: decision.stageLabel,
      primaryMode: decision.primaryMode,
      trainingLoadLabel: decision.trainingLoadLabel,
      intakeStrategy: decision.intakeStrategy,
      confidence: Math.round((decision.confidence ?? 0) * 100),
      riskText: decision.evidenceGroups?.risk?.[0] ?? null,
      trendText: decision.evidenceGroups?.trend?.[0] ?? null,
    }
  })
}

export default function TrendChart({ data, metrics }) {
  const colors = ['#6c63ff', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8']
  const decisionTimeline = buildDecisionTimeline(data)
  const decisionMap = new Map(decisionTimeline.map(item => [item.date, item]))
  const latestDecision = decisionTimeline[decisionTimeline.length - 1] ?? null
  const changeEvents = decisionTimeline.filter((item, index, list) => {
    if (index === 0) return true
    const prev = list[index - 1]
    return item.primaryMode !== prev.primaryMode || item.stageLabel !== prev.stageLabel
  })
  const recentChangeEvents = changeEvents.slice(-4).reverse()

  const series = metrics.map((m, i) => {
    const trend = getTrendData(data, m.key)
    const baseSeries = {
      name: m.label,
      type: 'line',
      data: trend.map(d => [d.date, d.value]),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: colors[i % colors.length], width: 2 },
      itemStyle: { color: colors[i % colors.length] },
    }

    if (i === 0 && changeEvents.length > 1) {
      baseSeries.markLine = {
        symbol: ['none', 'none'],
        label: {
          show: true,
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
          html += `<div style="margin-bottom:6px;color:#94a3b8">负荷：${decision.trainingLoadLabel} / intake：${decision.intakeStrategy} / 置信度 ${decision.confidence}%</div>`
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
      bottom: 0,
    },
    grid: { left: 40, right: 20, top: 24, bottom: 40 },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#2f3354' } },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        formatter: v => {
          const d = new Date(v)
          return `${d.getMonth() + 1}/${d.getDate()}`
        },
      },
      splitLine: { show: false },
    },
    yAxis: {
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e2235', type: 'dashed' } },
    },
    series,
  }

  return (
    <div>
      {latestDecision && (
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent-light">
              最近一次体测阶段：{latestDecision.stageLabel}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-200">
              对应模式：{latestDecision.badge}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-300">
              负荷：{latestDecision.trainingLoadLabel}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-300">
              intake：{latestDecision.intakeStrategy}
            </span>
          </div>

          {!!recentChangeEvents.length && (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {recentChangeEvents.map(event => (
                <div key={`${event.date}-${event.primaryMode}`} className="rounded-lg border border-dark-700 bg-dark-900/55 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">{event.date} · {event.weekday}</div>
                  <div className="mt-1 text-sm font-medium text-slate-100">{event.badge}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">{event.stageLabel} · {event.trainingLoadLabel}</div>
                  {(event.trendText || event.riskText) && (
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{event.trendText ?? event.riskText}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ReactECharts option={option} style={{ height: '320px' }} opts={{ renderer: 'svg' }} />
    </div>
  )
}
