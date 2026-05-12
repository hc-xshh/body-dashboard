import ReactECharts from 'echarts-for-react'
import { getTrendData } from '../utils/healthAnalysis'

export default function TrendChart({ data, metrics }) {
  const colors = ['#6c63ff', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8']

  const series = metrics.map((m, i) => {
    const trend = getTrendData(data, m.key)
    return {
      name: m.label,
      type: 'line',
      data: trend.map(d => [d.date, d.value]),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: colors[i % colors.length], width: 2 },
      itemStyle: { color: colors[i % colors.length] },
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a1d2e',
      borderColor: '#2f3354',
      textStyle: { color: '#e2e8f0' },
      formatter: (params) => {
        let html = `<div style="font-size:12px;margin-bottom:4px;color:#94a3b8">${params[0].axisValue}</div>`
        params.forEach(p => {
          html += `<div>${p.marker}${p.seriesName}: <b>${p.value[1]}</b></div>`
        })
        return html
      }
    },
    legend: {
      data: metrics.map(m => m.label),
      textStyle: { color: '#94a3b8', fontSize: 12 },
      bottom: 0,
    },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#2f3354' } },
      axisLabel: { color: '#64748b', fontSize: 11, formatter: (v) => {
        const d = new Date(v)
        return `${d.getMonth()+1}/${d.getDate()}`
      }},
      splitLine: { show: false },
    },
    yAxis: {
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#1e2235', type: 'dashed' } },
    },
    series,
  }

  return (
    <ReactECharts option={option} style={{ height: '260px' }} opts={{ renderer: 'svg' }} />
  )
}
