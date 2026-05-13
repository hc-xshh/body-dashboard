export default function ReadingGuide({ weekday, trainingLabel }) {
  const guides = [
    {
      title: '先看什么',
      text: '顶部先看体脂率、内脏脂肪、基础代谢，快速判断今天要不要更收一点饮食。',
      target: '#story-status',
      jumpLabel: '跳到 核心指标 + 雷达 + 健康建议',
    },
    {
      title: '再看执行',
      text: `今天是 ${weekday}，训练主题是「${trainingLabel}」。饮食和护肤模块都按今天而不是通用模板展示。`,
      target: '#story-action',
      jumpLabel: '跳到 今日训练 + 护肤 + 饮食',
    },
    {
      title: '最后看趋势',
      text: '如果当天状态正常，再下滑到趋势图和历史记录看变化，不用每次都先看整张表。',
      target: '#story-trend',
      jumpLabel: '跳到 趋势 + 历史记录',
    },
  ]

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-400">阅读引导</h2>
        <p className="text-sm leading-relaxed text-slate-400">把页面拆成「判断状态 → 看今天该做什么 → 再看长期趋势」，减少来回找信息。</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {guides.map((guide, index) => (
          <a
            key={guide.title}
            href={guide.target}
            className="rounded-xl border border-dark-700 bg-dark-900/50 px-4 py-4 transition hover:border-accent/50 hover:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-accent/40 sm:px-4 sm:py-4"
          >
            <div className="mb-2 text-xs text-accent">0{index + 1}</div>
            <div className="mb-1.5 text-sm font-medium text-white">{guide.title}</div>
            <p className="text-sm leading-relaxed text-slate-400">{guide.text}</p>
            <div className="mt-3 text-xs leading-relaxed text-slate-500">{guide.jumpLabel}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
