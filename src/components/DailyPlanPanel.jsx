export default function DailyPlanPanel({ title, subtitle, items = [], reminders = [], accent = 'accent', badge, compact = false }) {
  const badgeStyles = {
    accent: 'bg-accent/15 text-accent border-accent/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-5 h-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {badge && (
          <span className={`text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${badgeStyles[accent] ?? badgeStyles.accent}`}>
            {badge}
          </span>
        )}
      </div>

      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-xl border border-dark-700 bg-dark-900/50 px-4 py-3">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="text-sm font-medium text-white">{item.title}</div>
              {item.time && <div className="text-xs text-slate-500 whitespace-nowrap">{item.time}</div>}
            </div>
            {item.detail && <p className="text-sm text-slate-300 leading-relaxed">{item.detail}</p>}
            {item.emphasis && <p className="text-xs text-amber-300 mt-2 leading-relaxed">{item.emphasis}</p>}
            {item.note && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.note}</p>}
            {item.steps?.length ? (
              <ol className="mt-2 space-y-1 text-sm text-slate-300 leading-relaxed list-decimal list-inside">
                {item.steps.map((step, stepIndex) => (
                  <li key={`${item.title}-step-${stepIndex}`}>{step}</li>
                ))}
              </ol>
            ) : null}
          </div>
        ))}
      </div>

      {!!reminders.length && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">阅读友好提示</div>
          <ul className="space-y-1.5 text-sm text-slate-400 leading-relaxed">
            {reminders.map((text, index) => (
              <li key={`${text}-${index}`} className="flex gap-2">
                <span className="text-slate-600">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
