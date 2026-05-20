import { useMemo, useState } from 'react'
import measurements from './data/measurements.json'
import TrendChart from './components/TrendChart'
import RadarChart from './components/RadarChart'
import MetricCard from './components/MetricCard'
import AdvicePanel from './components/AdvicePanel'
import DailyPlanPanel from './components/DailyPlanPanel'
import ReadingGuide from './components/ReadingGuide'
import {
  generateAdvice,
  getBodyFatStatus, getVisceralFatStatus, getWaterStatus,
  getBMRStatus, getBoneStatus, getScoreStatus
} from './utils/healthAnalysis'
import { analyzeBodySignals } from './utils/rulesEngine'
import { getTrainingContext } from './utils/trainingContext'
import { getMeasurementOverview } from './utils/dashboardState'
import { getDietPlan, getSkincarePlan, getTodayLabel, getTrainingPlan, weeklyTrainingLabel } from './data/dailyPlans'
import { getDecisionDisplay } from './utils/decisionPresentation'
import {
  DEFAULT_TREND_METRIC_KEYS,
  getMetricSelectorItems,
  sanitizeSelectedTrendMetrics,
} from './utils/trendPresentation'

const trendMetrics = [
  { key: 'weight', label: '体重(kg)' },
  { key: 'bodyFat', label: '体脂率(%)' },
  { key: 'muscle', label: '肌肉量(kg)' },
  { key: 'water', label: '水分(%)' },
  { key: 'leanBodyMass', label: '去脂体重(kg)' },
]

const metricReferenceMap = {
  weight: '以近30天稳定区间为主',
  bodyFat: '10-20%',
  bmi: '18.5-23.9',
  bmr: '≥1600 kcal',
  visceralFat: '≤9',
  water: '55-65%',
  bone: '≥2.8 kg',
  score: '≥80',
}

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
  const todayLabel = getTodayLabel()
  const todayTraining = weeklyTrainingLabel[todayLabel] ?? '按周计划执行'
  const todayDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const {
    hasMeasurements,
    sorted,
    latest,
    prev,
    measurementSyncBanner,
  } = getMeasurementOverview(measurements, todayDate)

  if (!hasMeasurements || !latest) {
    return (
      <div className="min-h-screen bg-dark-900 text-slate-200 font-sans">
        <header className="border-b border-dark-700 px-4 py-4 sm:px-6 sm:py-4">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Body Dashboard</h1>
            <p className="mt-0.5 text-xs text-slate-500">Daemon · 身体数据可视化</p>
          </div>
        </header>

        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-3 py-8 sm:px-4 sm:py-10">
          <section className="rounded-2xl border border-amber-500/20 bg-dark-800/80 p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-lg text-amber-200">!</span>
              <div>
                <h2 className="text-base font-semibold text-white">暂无体测数据</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{measurementSyncBanner.text}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-dark-600 bg-dark-900/60 p-4 text-sm leading-relaxed text-slate-300">
              <p>当前页面已进入安全回退状态：不会白屏，也不会生成误导性饮食/训练建议。</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-400">
                <li>先同步最新体测截图，确认 <code>measurements.json</code> 有记录。</li>
                <li>如果刚改了同步脚本，先跑一次本地校验再打开页面。</li>
                <li>恢复数据后页面会自动回到正常故事线视图。</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    )
  }

  const skincarePlan = getSkincarePlan(todayLabel)
  const [selectedTrendMetricKeys, setSelectedTrendMetricKeys] = useState(DEFAULT_TREND_METRIC_KEYS)
  const trainingPlan = getTrainingPlan(todayLabel)
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
      note: skincarePlan.evening.emphasis && skincarePlan.evening.note !== skincarePlan.evening.emphasis
        ? skincarePlan.evening.note
        : undefined,
    },
  ]
  const advice = generateAdvice(latest, prev, sorted, todayLabel)
  const dietPlan = getDietPlan(latest, todayLabel, todayTraining, sorted)
  const todayTrainingContext = getTrainingContext(todayLabel)
  const bodyEngine = analyzeBodySignals(latest, sorted, todayTrainingContext).decision
  const selectedTrendMetrics = useMemo(
    () => {
      const selectedKeys = sanitizeSelectedTrendMetrics(selectedTrendMetricKeys, trendMetrics)
      return trendMetrics.filter(metric => selectedKeys.includes(metric.key))
    },
    [selectedTrendMetricKeys],
  )
  const trendSelectorItems = useMemo(
    () => getMetricSelectorItems(trendMetrics, selectedTrendMetricKeys),
    [selectedTrendMetricKeys],
  )
  const historyDecisionMap = new Map(
    [...sorted]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record, index, asc) => {
        const history = asc.slice(0, index + 1)
        const trainingContext = getTrainingContext(record.weekday)
        const decision = analyzeBodySignals(record, history, trainingContext).decision
        return [record.date, decision]
      }),
  )

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 font-sans">
      <header className="border-b border-dark-700 px-4 py-4 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">Body Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-500">Daemon · 身体数据可视化</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-3 py-5 sm:px-4 sm:py-6 md:gap-8">
        <div className="rounded-xl border border-dark-700 bg-dark-800/65 px-4 py-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <div className="flex items-start gap-2 text-sm text-slate-400 sm:flex-wrap sm:items-center sm:text-sm sm:text-slate-500">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accent sm:mt-0"></span>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
              <div className="leading-relaxed">
                <span className="text-slate-500">最新记录：</span>{latest.date} {latest.time ?? ''}
                <span className="hidden sm:inline"> &nbsp;·&nbsp; 体型：{latest.bodyType ?? '—'} &nbsp;·&nbsp; 身体年龄：{latest.bodyAge ?? '—'} 岁</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs sm:hidden">
                <span className="rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-slate-300">体型：{latest.bodyType ?? '—'}</span>
                <span className="rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-slate-300">身体年龄：{latest.bodyAge ?? '—'} 岁</span>
                <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-accent-light">今天：{todayLabel} / {todayTraining}</span>
              </div>
              <span className="hidden md:inline">&nbsp;·&nbsp;</span>
              <span className="hidden sm:inline">今天：{todayLabel} / {todayTraining}</span>
            </div>
          </div>
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed sm:text-sm ${
              measurementSyncBanner.tone === 'emerald'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-100'
            }`}
          >
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${
                measurementSyncBanner.tone === 'emerald' ? 'bg-emerald-300' : 'bg-amber-300'
              }`}
            ></span>
            <span
              className={measurementSyncBanner.tone === 'emerald' ? 'font-medium text-emerald-50' : 'font-medium text-amber-50'}
            >
              {measurementSyncBanner.text}
            </span>
          </div>
        </div>

        <ReadingGuide weekday={todayLabel} trainingLabel={todayTraining} sections={storylineSections} />

        <section id="story-status" className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">核心指标</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="体重" value={latest.weight} unit="kg" status="na" sub="结合近30天趋势判断" reference={metricReferenceMap.weight} />
            <MetricCard label="体脂率" value={latest.bodyFat} unit="%" status={getBodyFatStatus(latest.bodyFat)} sub={latest.bodyFat > 20 ? '偏高' : latest.bodyFat < 10 ? '偏低' : '正常'} reference={metricReferenceMap.bodyFat} />
            <MetricCard label="BMI" value={latest.bmi} status="na" sub={latest.bmi > 23.9 ? '偏高' : latest.bmi < 18.5 ? '偏低' : '正常'} reference={metricReferenceMap.bmi} />
            <MetricCard label="基础代谢" value={latest.bmr} unit="kcal" status={getBMRStatus(latest.bmr)} sub={latest.bmr < 1550 ? '偏低' : '正常'} reference={metricReferenceMap.bmr} />
            <MetricCard label="内脏脂肪" value={latest.visceralFat} status={getVisceralFatStatus(latest.visceralFat)} sub={latest.visceralFat >= 10 ? '偏高' : '正常'} reference={metricReferenceMap.visceralFat} />
            <MetricCard label="水分" value={latest.water} unit="%" status={getWaterStatus(latest.water)} sub={latest.water < 55 ? '偏低' : latest.water > 65 ? '偏高' : '正常'} reference={metricReferenceMap.water} />
            <MetricCard label="骨量" value={latest.bone} unit="kg" status={getBoneStatus(latest.bone)} sub={latest.bone < 2.8 ? '偏低' : '正常'} reference={metricReferenceMap.bone} />
            <MetricCard label="综合得分" value={latest.score} status={getScoreStatus(latest.score)} sub={latest.score < 80 ? '偏低' : '正常'} reference={metricReferenceMap.score} />
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
              <AdvicePanel advice={advice} engine={bodyEngine} />
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
                '力量训练动作后面已标组间休息，尽量不要边刷手机边把休息拖太长。',
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
              contextChips={[
                { label: '阶段', value: dietPlan.engine?.stageLabel ?? bodyEngine.stageLabel },
                { label: '负荷', value: dietPlan.engine?.trainingLoadLabel ?? bodyEngine.trainingLoadLabel },
                { label: '饮食策略', value: getDecisionDisplay(dietPlan.engine ?? bodyEngine).intakeLabel },
                { label: '置信度', value: getDecisionDisplay(dietPlan.engine ?? bodyEngine).confidenceText },
              ]}
            />
          </div>
        </section>

        <section id="story-trend" className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">趋势总览</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              这里改成一张总趋势图：默认看体重、体脂、肌肉；你也可以多选别的指标一起看。手机端优先看上方结论卡，再按需切换曲线。
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {trendSelectorItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedTrendMetricKeys((current) => {
                    const normalized = sanitizeSelectedTrendMetrics(current, trendMetrics)
                    if (normalized.includes(item.key)) {
                      return normalized.filter((key) => key !== item.key)
                    }
                    return [...normalized, item.key]
                  })}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs transition sm:text-sm',
                    item.selected
                      ? 'border-violet-400/70 bg-violet-500/18 text-violet-100 shadow-[0_0_0_1px_rgba(167,139,250,0.16)]'
                      : 'border-slate-700/80 bg-slate-950/80 text-slate-300 hover:border-violet-400/35 hover:text-slate-100',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <TrendChart data={measurements} metrics={selectedTrendMetrics} />
          </div>
        </section>

        <section className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">历史记录</h2>
          <div className="overflow-x-auto rounded-xl border border-dark-600 bg-dark-800">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-dark-600 text-slate-500 text-xs uppercase">
                  {['日期','阶段 / 模式','体重','体脂%','BMI','肌肉量','内脏脂肪','水分%','骨量','得分'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const decision = historyDecisionMap.get(row.date)
                  return (
                    <tr key={`${row.date}-${row.time ?? ''}`} className="border-b border-dark-700/70 last:border-b-0">
                      <td className="px-4 py-3 text-slate-300">{row.date}</td>
                      <td className="px-4 py-3 text-slate-300">{decision ? `${decision.stageLabel} / ${decision.badge}` : '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{row.weight}</td>
                      <td className="px-4 py-3 text-slate-300">{row.bodyFat}</td>
                      <td className="px-4 py-3 text-slate-300">{row.bmi}</td>
                      <td className="px-4 py-3 text-slate-300">{row.muscle}</td>
                      <td className="px-4 py-3 text-slate-300">{row.visceralFat}</td>
                      <td className="px-4 py-3 text-slate-300">{row.water}</td>
                      <td className="px-4 py-3 text-slate-300">{row.bone}</td>
                      <td className="px-4 py-3 text-slate-300">{row.score}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs leading-relaxed text-slate-500 sm:pb-4">
          数据由 Hermes Agent 自动解析体测截图生成 · 饮食/训练/护肤建议基于 Obsidian 现有方案 + 当日体测动态展示 · 仅供个人参考
        </footer>
      </main>
    </div>
  )
}
