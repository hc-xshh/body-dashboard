export default function AdvicePanel({ advice, engine = null }) {
  if (!advice.length) return null

  const bg = { good: 'bg-green-900/20 border-green-700/40', warn: 'bg-amber-900/20 border-amber-700/40', bad: 'bg-red-900/20 border-red-700/40' }
  const text = { good: 'text-green-400', warn: 'text-amber-400', bad: 'text-red-400' }

  const evidenceSections = engine
    ? [
        { label: '基线', value: engine.evidenceGroups?.baseline?.slice(0, 2).join('；') },
        { label: '趋势', value: engine.evidenceGroups?.trend?.slice(0, 2).join('；') },
        { label: '风险', value: engine.evidenceGroups?.risk?.slice(0, 2).join('；') },
        { label: '补水', value: engine.evidenceGroups?.hydration?.slice(0, 1).join('；') },
      ].filter(section => section.value)
    : []

  return (
    <div className="flex h-full flex-col gap-3">
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
              intake：{engine.intakeStrategy}
            </span>
            <span className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-400">
              置信度 {(engine.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-200">{engine.summary}</p>

          {!!evidenceSections.length && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {evidenceSections.map(section => (
                <div key={section.label} className="rounded-lg border border-dark-700 bg-dark-900/60 px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">{section.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{section.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {advice.map((a, i) => (
        <div key={i} className={`rounded-xl border p-3.5 sm:p-4 ${bg[a.level] ?? 'bg-dark-800 border-dark-600'} flex gap-3 items-start`}>
          <span className="text-lg flex-shrink-0 sm:text-xl">{a.icon}</span>
          <p className={`text-sm leading-relaxed ${text[a.level] ?? 'text-slate-400'}`}>{a.text}</p>
        </div>
      ))}
    </div>
  )
}
