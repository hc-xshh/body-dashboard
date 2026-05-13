export default function ReadingGuide({ weekday, trainingLabel }) {
  const guides = [
    {
      title: '先看什么',
      text: '顶部先看体脂率、内脏脂肪、基础代谢，快速判断今天要不要更收一点饮食。',
    },
    {
      title: '再看执行',
      text: `今天是 ${weekday}，训练主题是「${trainingLabel}」。饮食和护肤模块都按今天而不是通用模板展示。`,
    },
    {
      title: '最后看趋势',
      text: '如果当天状态正常，再下滑到趋势图和历史记录看变化，不用每次都先看整张表。',
    },
  ]

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">阅读引导</h2>
        <p className="text-sm text-slate-400 leading-relaxed">把页面拆成「判断状态 → 看今天该做什么 → 再看长期趋势」，减少来回找信息。</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {guides.map((guide, index) => (
          <div key={guide.title} className="rounded-xl border border-dark-700 bg-dark-900/50 px-4 py-4">
            <div className="text-xs text-accent mb-2">0{index + 1}</div>
            <div className="text-sm font-medium text-white mb-1.5">{guide.title}</div>
            <p className="text-sm text-slate-400 leading-relaxed">{guide.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
