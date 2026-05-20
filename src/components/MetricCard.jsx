import { STATUS_COLOR } from '../utils/healthAnalysis'

export default function MetricCard({ label, value, unit, status, sub, reference, references }) {
  const color = STATUS_COLOR[status] ?? '#94a3b8'
  const referenceList = Array.isArray(references) && references.length ? references : (reference ? [reference] : [])
  return (
    <div className="bg-dark-800 rounded-xl p-3.5 sm:p-4 flex flex-col gap-1 border border-dark-600 hover:border-accent/50 transition-colors">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 sm:text-xs">{label}</span>
      <div className="flex items-end gap-1">
        <span className="text-xl font-bold sm:text-2xl" style={{ color }}>
          {value ?? '—'}
        </span>
        {unit && <span className="mb-0.5 text-xs text-slate-500 sm:text-sm">{unit}</span>}
      </div>
      {referenceList.map((item) => (
        <span key={item} className="text-[11px] leading-relaxed text-slate-500 sm:text-xs">{item}</span>
      ))}
      {sub && <span className="text-[11px] leading-relaxed sm:text-xs" style={{ color }}>当前：{sub}</span>}
    </div>
  )
}
