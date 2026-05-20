import { useMemo, useState } from 'react'
import measurements from './data/measurements.json'
import TrendChart from './components/TrendChart'
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
import {
  getMeasurementOverview,
  getMeasurementsWithinDays,
  getWeightPresentation,
  HISTORY_PAGE_SIZE_OPTIONS,
  paginateMeasurements,
  TREND_RANGE_OPTIONS,
} from './utils/dashboardState'
import {
  getDietPlan,
  getSkincarePanelPresentation,
  getSkincarePlan,
  getTodayLabel,
  getTrainingPanelPresentation,
  getTrainingPlan,
  getTrainingReadingReminders,
  weeklyTrainingLabel,
} from './data/dailyPlans'
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
    description: '核心指标 + 健康建议',
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
  const [selectedTrendRangeDays, setSelectedTrendRangeDays] = useState(TREND_RANGE_OPTIONS[0].days)
  const [historyPageSize, setHistoryPageSize] = useState(HISTORY_PAGE_SIZE_OPTIONS[0])
  const [historyPage, setHistoryPage] = useState(1)
  const trainingPlan = getTrainingPlan(todayLabel)
  const trainingPanel = getTrainingPanelPresentation(trainingPlan)
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
  const skincarePanel = getSkincarePanelPresentation(skincarePlan)
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
  const filteredTrendMeasurements = useMemo(
    () => getMeasurementsWithinDays(sorted, {
      latestDate: latest.date,
      days: selectedTrendRangeDays,
    }),
    [latest.date, selectedTrendRangeDays, sorted],
  )
  const paginatedHistory = useMemo(
    () => paginateMeasurements(sorted, { page: historyPage, pageSize: historyPageSize }),
    [historyPage, historyPageSize, sorted],
  )
  const weightPresentation = getWeightPresentation(sorted)
  const trainingReminders = getTrainingReadingReminders(todayLabel, trainingPlan.badge)
  const readingPathSummary = bodyEngine.primaryMode === 'recovery_first'
    ? '今天按恢复计划做，不用因为体重波动临时减量。'
    : bodyEngine.primaryMode === 'tighten_intake'
      ? '今天先管住吃的，训练按计划做。'
      : bodyEngine.primaryMode === 'protect_metabolism'
        ? '今天重点是好好吃饭和恢复，不要再额外减量。'
        : '今天按计划完成就行，不用额外加码。'
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

        <ReadingGuide sections={storylineSections} summary={readingPathSummary} />

        <section id="story-status" className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">核心指标</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="体重" value={latest.weight} unit="kg" status="na" sub={weightPresentation.status} references={weightPresentation.references} />
            <MetricCard label="体脂率" value={latest.bodyFat} unit="%" status={getBodyFatStatus(latest.bodyFat)} sub={latest.bodyFat > 20 ? '偏高' : latest.bodyFat < 10 ? '偏低' : '正常'} reference={metricReferenceMap.bodyFat} />
            <MetricCard label="BMI" value={latest.bmi} status="na" sub={latest.bmi > 23.9 ? '偏高' : latest.bmi < 18.5 ? '偏低' : '正常'} reference={metricReferenceMap.bmi} />
            <MetricCard label="基础代谢" value={latest.bmr} unit="kcal" status={getBMRStatus(latest.bmr)} sub={latest.bmr < 1550 ? '偏低' : '正常'} reference={metricReferenceMap.bmr} />
            <MetricCard label="内脏脂肪" value={latest.visceralFat} status={getVisceralFatStatus(latest.visceralFat)} sub={latest.visceralFat >= 10 ? '偏高' : '正常'} reference={metricReferenceMap.visceralFat} />
            <MetricCard label="水分" value={latest.water} unit="%" status={getWaterStatus(latest.water)} sub={latest.water < 55 ? '偏低' : latest.water > 65 ? '偏高' : '正常'} reference={metricReferenceMap.water} />
            <MetricCard label="骨量" value={latest.bone} unit="kg" status={getBoneStatus(latest.bone)} sub={latest.bone < 2.8 ? '偏低' : '正常'} reference={metricReferenceMap.bone} />
            <MetricCard label="综合得分" value={latest.score} status={getScoreStatus(latest.score)} sub={latest.score < 80 ? '偏低' : '正常'} reference={metricReferenceMap.score} />
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">健康建议</h2>
            <div className="bg-dark-800 rounded-xl p-4 border border-dark-600 min-h-[360px]">
              <AdvicePanel advice={advice} engine={bodyEngine} />
            </div>
          </div>
        </section>

        <section id="story-action" className="grid lg:grid-cols-2 gap-6 items-stretch scroll-mt-24">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日训练内容</h2>
            <DailyPlanPanel
              title={`${todayLabel} 训练执行单`}
              subtitle={trainingPanel.subtitle}
              summary={trainingPanel.summary}
              metaLine={trainingPanel.metaLine}
              highlights={trainingPanel.highlights}
              items={trainingPlan.items}
              reminders={trainingReminders}
              badge={trainingPlan.badge}
              accent="rose"
              compact
              variant="timeline"
              reminderTitle="执行提醒"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日护肤流程</h2>
            <DailyPlanPanel
              title={`${todayLabel} 护肤流程`}
              subtitle={skincarePanel.subtitle}
              summary={skincarePanel.summary}
              metaLine={skincarePanel.metaLine}
              highlights={skincarePanel.highlights}
              items={skincareItems}
              reminders={skincarePlan.reminders}
              badge={skincarePlan.evening.theme}
              accent="sky"
              compact
              variant="timeline"
              reminderTitle="护理提醒"
            />
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">今日推荐饮食</h2>
            <DailyPlanPanel
              title={`${todayLabel} 饮食执行单`}
              subtitle={dietPlan.subtitle}
              summary={dietPlan.summary}
              metaLine={dietPlan.metaLine}
              highlights={dietPlan.highlights}
              items={dietPlan.items}
              reminders={dietPlan.reminders}
              badge={dietPlan.badge}
              accent="emerald"
              variant="timeline"
              reminderTitle="执行提醒"
            />
          </div>
        </section>

        <section id="story-trend" className="scroll-mt-24">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">趋势总览</h2>
          <div className="bg-dark-800 rounded-xl p-4 border border-dark-600">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {TREND_RANGE_OPTIONS.map((option) => {
                const selected = selectedTrendRangeDays === option.days
                return (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => setSelectedTrendRangeDays(option.days)}
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs transition sm:text-sm',
                      selected
                        ? 'border-emerald-400/70 bg-emerald-500/18 text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]'
                        : 'border-slate-700/80 bg-slate-950/80 text-slate-300 hover:border-emerald-400/35 hover:text-slate-100',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">
              默认看体重、体脂、肌肉；按需勾选其他指标。当前窗口：{TREND_RANGE_OPTIONS.find(option => option.days === selectedTrendRangeDays)?.label ?? '近7天'}。
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
            <TrendChart
              data={filteredTrendMeasurements}
              metrics={selectedTrendMetrics}
              rangeLabel={TREND_RANGE_OPTIONS.find(option => option.days === selectedTrendRangeDays)?.label ?? '近7天'}
            />
          </div>
        </section>

        <section className="scroll-mt-24">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">历史记录</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:text-sm">
              <span>每页显示</span>
              <div className="flex flex-wrap gap-2">
                {HISTORY_PAGE_SIZE_OPTIONS.map((size) => {
                  const selected = historyPageSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setHistoryPageSize(size)
                        setHistoryPage(1)
                      }}
                      className={[
                        'rounded-full border px-3 py-1.5 transition',
                        selected
                          ? 'border-sky-400/70 bg-sky-500/18 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.16)]'
                          : 'border-slate-700/80 bg-slate-950/80 text-slate-300 hover:border-sky-400/35 hover:text-slate-100',
                      ].join(' ')}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
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
                {paginatedHistory.items.map((row) => {
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
          <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span>
              第 {paginatedHistory.page} / {paginatedHistory.totalPages} 页 · 共 {paginatedHistory.totalItems} 条
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHistoryPage((current) => Math.max(1, current - 1))}
                disabled={!paginatedHistory.hasPreviousPage}
                className="rounded-full border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-slate-300 transition enabled:hover:border-slate-500 enabled:hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <button
                type="button"
                onClick={() => setHistoryPage((current) => current + 1)}
                disabled={!paginatedHistory.hasNextPage}
                className="rounded-full border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-slate-300 transition enabled:hover:border-slate-500 enabled:hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs leading-relaxed text-slate-500 sm:pb-4">
          数据由 Hermes Agent 同步 · 仅供个人参考
        </footer>
      </main>
    </div>
  )
}
