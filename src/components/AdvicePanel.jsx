export default function AdvicePanel({ advice }) {
  if (!advice.length) return null

  const bg = { good: 'bg-green-900/20 border-green-700/40', warn: 'bg-amber-900/20 border-amber-700/40', bad: 'bg-red-900/20 border-red-700/40' }
  const text = { good: 'text-green-400', warn: 'text-amber-400', bad: 'text-red-400' }

  return (
    <div className="flex flex-col gap-3">
      {advice.map((a, i) => (
        <div key={i} className={`rounded-xl p-4 border ${bg[a.level] ?? 'bg-dark-800 border-dark-600'} flex gap-3 items-start`}>
          <span className="text-xl flex-shrink-0">{a.icon}</span>
          <p className={`text-sm leading-relaxed ${text[a.level] ?? 'text-slate-400'}`}>{a.text}</p>
        </div>
      ))}
    </div>
  )
}
