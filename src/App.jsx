import measurements from './data/measurements.json'
import TrendChart from './components/TrendChart'
import RadarChart from './components/RadarChart'
import MetricCard from './components/MetricCard'
import AdvicePanel from './components/AdvicePanel'
import {
  generateAdvice,
  getBodyFatStatus, getVisceralFatStatus, getWaterStatus,
  getBMRStatus, getBoneStatus, getScoreStatus
} from './utils/healthAnalysis'

const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date))
const latest = sorted[0]
const prev = sorted[1] ?? null

const advice = generateAdvice(latest, prev)

const trendMetrics1 = [
  { key: 'weight', label: '体重(kg)' },
  { key: 'bodyFat', label: '体脂率(%)' },
]
const trendMetrics2 = [
  { key: 'muscle', label: '肌肉量(kg)' },
  { key: 'water', label: '水分(%)' },
  { key: 'leanBodyMass', label: '去脂体重(kg)' },
]

export default function App() {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Body Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Daemon · 身体数据可视化</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">{latest.score ?? '—'}</div>
          <div className="text-xs text-slate-500">综合得分</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-8">

        {/* 最新测量时间 */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
          最新记录：{latest.date} {latest.time ?? ''} &nbsp;·&nbsp; 体型：{latest.bodyType ?? '—'} &nbsp;·&nbsp; 身体年龄：{latest.bodyAge ?? '—'} 岁
        </div>

        {/* 核心指标卡片 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">核心指标</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="体重" value={latest.weight} unit="kg" status="na" />
            <MetricCard label="体脂率" value={latest.bodyFat} unit="%" status={getBodyFatStatus(latest.bodyFat)} sub={latest.bodyFat > 20 ? '偏高' : '正常'} />
            <MetricCard label="BMI" value={latest.bmi} status="na" />
            <MetricCard label="基础代谢" value={latest.bmr} unit="kcal" status={getBMRStatus(latest.bmr)} sub={latest.bmr < 1550 ? '偏低' : '正常'} />
            <MetricCard label="内脏脂肪" value={latest.visceralFat} status={getVisceralFatStatus(latest.visceralFat)} sub={latest.visceralFat >= 10 ? '偏高' : '正常'} />
            <MetricCard label="水分" value={latest.water} unit="%" status={getWaterStatus(latest.water)} sub={latest.water < 55 ? '偏低' : '正常'} />
            <MetricCard label="骨量" value={latest.bone} unit="kg" status={getBoneStatus(latest.bone)} sub={latest.bone < 2.8 ? '不足' : '正常'} />
            <MetricCard label="综合得分" value={latest.score} status={getScoreStatus(latest.score)} sub={`身体年龄 ${latest.bodyAge ?? '—'} 岁`} />
          </div>
        </section>

        {/* 趋势图 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">体重 & 体脂趋势</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <TrendChart data={measurements} metrics={trendMetrics1} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">肌肉 & 水分趋势</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <TrendChart data={measurements} metrics={trendMetrics2} />
          </div>
        </section>

        {/* 雷达图 + 建议 并排 */}
        <section className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">身体成分雷达</h2>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
              <RadarChart latest={latest} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">健康建议</h2>
            <AdvicePanel advice={advice} />
          </div>
        </section>

        {/* 历史记录表 */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">历史记录</h2>
          <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-slate-500 text-xs uppercase">
                  {['日期','体重','体脂%','BMI','肌肉量','内脏脂肪','水分%','骨量','得分'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => (
                  <tr key={d.date} className={`border-b border-dark-700 hover:bg-dark-700/50 transition-colors ${i === 0 ? 'text-white' : 'text-slate-400'}`}>
                    <td className="px-4 py-3 font-medium">{d.date}<span className="text-slate-600 text-xs ml-1">{d.weekday}</span></td>
                    <td className="px-4 py-3">{d.weight ?? '—'}</td>
                    <td className="px-4 py-3">{d.bodyFat ?? '—'}</td>
                    <td className="px-4 py-3">{d.bmi ?? '—'}</td>
                    <td className="px-4 py-3">{d.muscle ?? '—'}</td>
                    <td className="px-4 py-3">{d.visceralFat ?? '—'}</td>
                    <td className="px-4 py-3">{d.water ?? '—'}</td>
                    <td className="px-4 py-3">{d.bone ?? '—'}</td>
                    <td className="px-4 py-3">{d.score ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-700 pb-4">
          数据由 Hermes Agent 自动解析体测截图生成 · 仅供个人参考
        </footer>
      </main>
    </div>
  )
}
