import ReactECharts from 'echarts-for-react'

export default function RadarChart({ latest, height = 260 }) {
  const indicators = [
    { name: '肌肉量', max: 60 },
    { name: '骨骼肌率', max: 50 },
    { name: '水分', max: 65 },
    { name: '蛋白质', max: 20 },
    { name: '去脂体重', max: 65 },
  ]

  const values = [
    latest.muscle ?? 0,
    latest.skeletalMuscleRate ?? 0,
    latest.water ?? 0,
    latest.protein ?? 0,
    latest.leanBodyMass ?? 0,
  ]

  const option = {
    backgroundColor: 'transparent',
    tooltip: { backgroundColor: '#1a1d2e', borderColor: '#2f3354', textStyle: { color: '#e2e8f0' } },
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      nameGap: 8,
      name: { textStyle: { color: '#94a3b8', fontSize: 12 } },
      axisLine: { lineStyle: { color: '#2f3354' } },
      splitLine: { lineStyle: { color: '#2f3354' } },
      splitArea: { areaStyle: { color: ['#1a1d2e', '#252840'] } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: '当前',
        areaStyle: { color: 'rgba(108,99,255,0.25)' },
        lineStyle: { color: '#6c63ff', width: 2 },
        itemStyle: { color: '#6c63ff' },
      }],
    }],
  }

  return <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} opts={{ renderer: 'svg' }} />
}
