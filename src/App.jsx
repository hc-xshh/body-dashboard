import measurements from './data/measurements.json'
import TrendChart from './components/TrendChart'
import RadarChart from './components/RadarChart'
import MetricCard from './components/MetricCard'
import AdvicePanel from './components/AdvicePanel'
import DailyPlanPanel from './components/DailyPlanPanel'
import ReadingGuide from './components/ReadingGuide'
import StorylineNav from './components/StorylineNav'
import {
  generateAdvice,
  getBodyFatStatus, getVisceralFatStatus, getWaterStatus,
  getBMRStatus, getBoneStatus, getScoreStatus
} from './utils/healthAnalysis'
import { getDietPlan, getSkincarePlan, getTodayLabel, getTrainingPlan, weeklyTrainingLabel } from './data/dailyPlans'

const sorted = [...measurements].sort((a, b) => b.date.localeCompare(a.date))
const latest = sorted[0]
const prev = sorted[1] ?? null

const advice = generateAdvice(latest, prev)
const todayLabel = getTodayLabel()
const todayTraining = weeklyTrainingLabel[todayLabel] ?? '按周计划执行'
const skincarePlan = getSkincarePlan(todayLabel)
const trainingPlan = getTrainingPlan(todayLabel)
const dietPlan = getDietPlan(latest, todayLabel, todayTraining, sorted)

const trendMetrics1 = [
  { key: 'weight', label: '体重(kg)' },
  { key: 'bodyFat', label: '体脂率(%)' },
]
const trendMetrics2 = [
  { key: 'muscle', label: '肌肉量(kg)' },
  { key: 'water', label: '水分(%)' },
  { key: 'leanBodyMass', label: '去脂体重(kg)' },
]

const skincareItems = [
  {
    title: '晨间流程',
    time: '出门前',
    detail: '温和控油 + 美白 + 防晒，作为每天固定流程。',
    steps: skincarePlan.morning,
  },
  {
    title: `夜间流程 · ${skincarePlan.evening.theme}`,
    time: skincarePlan.evening.duration,
    detail: skincarePlan.evening.emphasis ?? skincarePlan.evening.note,
    steps: skincarePlan.evening.steps,
    note: skincarePlan.evening.note,
  },
]

const storylineSections = [
  {
    id: 'story-status',
    label: '状态',
    description: '核心指标 + 雷达 + 健康建议',
  },
  {
    id: 'story-action',
    label: '执行',
    description: '训练 + 护肤 + 饮食',
  },
  {
    id: 'story-trend',
    label: '趋势',
    description: '趋势图 + 历史记录',
  },
]

export default function App() {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 font-sans">
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

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
          最新记录：{latest.date} {latest.time ?? ''} &nbsp;·&nbsp; 体型：{latest.bodyType ?? '—'} &nbsp;·&nbsp; 身体年龄：{latest.bodyAge ?? '—'} 岁
          <span className="hidden md:inline">&nbsp;·&nbsp;</span>
          <span>今天：{todayLabel} / {todayTraining}</span>
        </div>

        <ReadingGuide weekday={todayLabel} trainingLabel={todayTraining} />

        <StorylineNav sections={storylineSections} />

        <section id="story-status" className="scroll-mt-24">
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

        <section className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">身体成分雷达</h2>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex-1 min-h-[360px] flex items-center">
              <RadarChart latest={latest} height={320} />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">健康建议</h2>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 flex-1 min-h-[360px]">
              <AdvicePanel advice={advice} />
            </div>
          </div>
        </section>

        <section id="story-action" className="grid lg:grid-cols-2 gap-6 items-stretch scroll-mt-24">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日训练内容</h2>
            <DailyPlanPanel
              title={`${todayLabel} 训练执行单`}
              subtitle={trainingPlan.subtitle}
              items={trainingPlan.items}
              reminders={[
                '先完成今天卡片里的内容，再去看趋势图，不要反过来。',
                '恢复日也算执行日，今天的目标是促进恢复，不是硬凑训练量。',
              ]}
              badge={trainingPlan.badge}
              accent="rose"
              compact
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日护肤流程</h2>
            <DailyPlanPanel
              title={`${todayLabel} 护肤流程`}
              subtitle="按周计划自动切到当天版本，直接照着做即可。"
              items={skincareItems}
              reminders={skincarePlan.reminders}
              badge={skincarePlan.evening.theme}
              accent="sky"
              compact
            />
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日推荐饮食</h2>
            <DailyPlanPanel
              title={`${todayLabel} 饮食执行单`}
              subtitle={dietPlan.subtitle}
              items={dietPlan.items}
              reminders={dietPlan.reminders}
              badge={dietPlan.badge}
              accent="emerald"
            />
          </div>
        </section>

        <section id="story-trend" className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">体重 & 体脂趋势</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <TrendChart data={measurements} metrics={trendMetrics1} />
          </div>
        </section>

        <section className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">肌肉 & 水分趋势</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <TrendChart data={measurements} metrics={trendMetrics2} />
          </div>
        </section>

        <section className="scroll-mt-24">
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
          数据由 Hermes Agent 自动解析体测截图生成 · 饮食/训练/护肤建议基于 Obsidian 现有方案 + 当日体测动态展示 · 仅供个人参考
        </footer>
      </main>
    </div>
  )
}
