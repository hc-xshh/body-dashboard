import { STATUS_COLOR } from '../utils/healthAnalysis'

export default function MetricCard({ label, value, unit, status, sub }) {
  const color = STATUS_COLOR[status] ?? '#94a3b8'
  return (
    <div className="bg-dark-800 rounded-xl p-4 flex flex-col gap-1 border border-dark-600 hover:border-accent/50 transition-colors">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold" style={{ color }}>
          {value ?? '—'}
        </span>
        {unit && <span className="text-sm text-slate-500 mb-0.5">{unit}</span>}
      </div>
      {sub && <span className="text-xs" style={{ color }}>{sub}</span>}
    </div>
  )
}
