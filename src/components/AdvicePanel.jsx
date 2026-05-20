import { getDecisionDisplay } from '../utils/decisionPresentation'

export default function AdvicePanel({ advice, engine = null }) {
  if (!advice.length) return null

  const bg = { good: 'bg-green-900/20 border-green-700/40', warn: 'bg-amber-900/20 border-amber-700/40', bad: 'bg-red-900/20 border-red-700/40' }
  const text = { good: 'text-green-400', warn: 'text-amber-400', bad: 'text-red-400' }
  const decisionDisplay = engine ? getDecisionDisplay(engine) : null

  // ── evidenceGroups → structured card definitions ──
  const evidenceCards = []
  if (engine?.evidenceGroups) {
    const { baseline, trend, risk, hydration } = engine.evidenceGroups

    if (baseline?.length) {
      evidenceCards.push({
        label: '基线',
        icon: '📏',
        color: 'border-indigo-500/25',
        bg: 'bg-indigo-500/5',
        items: baseline,
        hint: '相对个人28天中位数与波动带的偏离判断',
      })
    }
    if (trend?.length) {
      evidenceCards.push({
        label: '趋势',
        icon: '📊',
        color: 'border-emerald-500/25',
        bg: 'bg-emerald-500/5',
        items: trend,
        hint: '最近几次连续变化的幅度与方向',
      })
    }
    if (risk?.length) {
      evidenceCards.push({
        label: '风险',
        icon: '⚡',
        color: 'border-red-500/20',
        bg: 'bg-red-500/5',
        items: risk,
        hint: '当前需要优先关注的健康风险',
      })
    }
    if (hydration?.length) {
      evidenceCards.push({
        label: '补水',
        icon: '💧',
        color: 'border-sky-500/25',
        bg: 'bg-sky-500/5',
        items: hydration,
        hint: '水分相关的连续表现与提醒',
      })
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* ── Engine summary card ── */}
      {engine && (
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-light">
              {engine.badge}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-200">
              {engine.stageLabel}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-300">
              负荷：{engine.trainingLoadLabel}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-300">
              饮食策略：{decisionDisplay?.intakeLabel ?? '—'}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-400">
              置信度 {decisionDisplay?.confidenceText ?? '—'}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-200">{decisionDisplay?.compactSummary ?? engine.summary}</p>

          {/* ── Structured evidence cards ── */}
          {!!evidenceCards.length && (
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {evidenceCards.map(card => (
                <div key={card.label} className={`rounded-lg border ${card.color} ${card.bg} px-3 py-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{card.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{card.label}</span>
                    <span className="text-[10px] text-slate-600 ml-auto">{card.hint}</span>
                  </div>
                  <div className="space-y-1.5">
                    {card.items.map((item, idx) => (
                      <p key={idx} className="text-xs leading-relaxed text-slate-300 pl-5 border-l-2 border-dark-600/50">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Advice cards ── */}
      {advice.map((a, i) => (
        <div key={i} className={`rounded-xl border p-3.5 sm:p-4 ${bg[a.level] ?? 'bg-dark-800 border-dark-600'} flex gap-3 items-start`}>
          <span className="text-lg flex-shrink-0 sm:text-xl">{a.icon}</span>
          <p className={`text-sm leading-relaxed ${text[a.level] ?? 'text-slate-400'}`}>{a.text}</p>
        </div>
      ))}
    </div>
  )
}
