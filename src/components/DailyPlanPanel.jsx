export default function DailyPlanPanel({
  title,
  subtitle,
  summary,
  metaLine,
  highlights = [],
  items = [],
  reminders = [],
  accent = 'accent',
  badge,
  compact = false,
  contextChips = [],
  reminderTitle = '阅读友好提示',
  variant = 'cards',
}) {
  const badgeStyles = {
    accent: 'bg-accent/15 text-accent border-accent/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-4 h-full sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm leading-relaxed text-slate-400">{subtitle}</p>}
          {(summary || metaLine || highlights.length > 0) && (
            <div className="mt-3 rounded-xl border border-dark-700/80 bg-dark-900/45 p-3.5 sm:p-4">
              {summary && <p className="text-sm leading-relaxed text-slate-100">{summary}</p>}
              {metaLine && <p className="mt-2 text-xs leading-relaxed text-slate-500">{metaLine}</p>}
              {!!highlights.length && (
                <ul className="mt-3 space-y-2 border-t border-dark-700/70 pt-3 text-sm leading-relaxed text-slate-400">
                  {highlights.map((highlight, index) => (
                    <li key={`${title}-highlight-${index}`} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!!contextChips.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {contextChips.map(chip => (
                <span
                  key={`${title}-${chip.label}-${chip.value}`}
                  className="inline-flex rounded-full border border-dark-600 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-300"
                >
                  <span className="text-slate-500">{chip.label}：</span>
                  <span className="ml-1 text-slate-200">{chip.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {badge && (
          <span className={`inline-flex w-fit text-xs px-2.5 py-1 rounded-full border whitespace-nowrap ${badgeStyles[accent] ?? badgeStyles.accent}`}>
            {badge}
          </span>
        )}
      </div>

      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        {variant === 'timeline'
          ? items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={[
                'border-l-2 border-dark-700/80 pl-4 sm:pl-5',
                index === 0 ? 'pt-1' : 'border-t border-dark-700/70 pt-4',
              ].join(' ')}
            >
              <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="text-sm font-medium text-white">{item.title}</div>
                {item.time && (
                  <div className="w-fit rounded-full border border-dark-700 bg-dark-900/70 px-2.5 py-1 text-xs text-slate-500 sm:whitespace-nowrap">
                    {item.time}
                  </div>
                )}
              </div>
              {item.detail && <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>}
              {item.emphasis && <p className="mt-2 text-xs leading-relaxed text-amber-300">{item.emphasis}</p>}
              {item.note && <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.note}</p>}
              {item.steps?.length ? (
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-slate-300">
                  {item.steps.map((step, stepIndex) => (
                    <li key={`${item.title}-step-${stepIndex}`}>{step}</li>
                  ))}
                </ol>
              ) : null}
            </div>
          ))
          : items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-xl border border-dark-700 bg-dark-900/50 px-3.5 py-3 sm:px-4">
              <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="text-sm font-medium text-white">{item.title}</div>
                {item.time && <div className="text-xs text-slate-500 sm:whitespace-nowrap">{item.time}</div>}
              </div>
              {item.detail && <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>}
              {item.emphasis && <p className="mt-2 text-xs leading-relaxed text-amber-300">{item.emphasis}</p>}
              {item.note && <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.note}</p>}
              {item.steps?.length ? (
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-slate-300">
                  {item.steps.map((step, stepIndex) => (
                    <li key={`${item.title}-step-${stepIndex}`}>{step}</li>
                  ))}
                </ol>
              ) : null}
            </div>
          ))}
      </div>

      {!!reminders.length && (
        <div className="mt-4 rounded-xl border border-dark-700/80 bg-dark-900/35 p-3.5 sm:p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-slate-500">{reminderTitle}</div>
          <ul className="space-y-2.5 text-sm leading-relaxed text-slate-400">
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
