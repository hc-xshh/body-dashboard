import { useEffect, useState } from 'react'

function getActiveSection(sections) {
  if (typeof window === 'undefined') return sections[0]?.id ?? null

  const viewportHeight = window.innerHeight
  const visibleSections = sections
    .map((section) => {
      const element = document.getElementById(section.id)
      if (!element) return null

      const rect = element.getBoundingClientRect()
      const visibleTop = Math.max(rect.top, 0)
      const visibleBottom = Math.min(rect.bottom, viewportHeight)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)

      return {
        id: section.id,
        top: rect.top,
        visibleHeight,
      }
    })
    .filter(Boolean)

  if (!visibleSections.length) return sections[0]?.id ?? null

  const visible = visibleSections.filter((section) => section.visibleHeight > 0)
  if (visible.length) {
    return visible.reduce((best, current) => {
      if (current.visibleHeight === best.visibleHeight) {
        return current.top < best.top ? current : best
      }
      return current.visibleHeight > best.visibleHeight ? current : best
    }).id
  }

  return visibleSections.reduce((best, current) => (
    Math.abs(current.top) < Math.abs(best.top) ? current : best
  )).id
}

export default function ReadingGuide({ weekday, trainingLabel, sections = [] }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? null)

  const guides = [
    {
      id: 'story-status',
      title: '先看什么',
      text: '顶部先看体脂率、内脏脂肪、基础代谢，快速判断今天要不要更收一点饮食。',
      target: '#story-status',
      jumpLabel: '跳到 核心指标 + 雷达 + 健康建议',
      shortLabel: '状态',
      shortDescription: '核心指标 + 雷达 + 健康建议',
    },
    {
      id: 'story-action',
      title: '再看执行',
      text: `今天是 ${weekday}，训练主题是「${trainingLabel}」。饮食和护肤模块都按今天而不是通用模板展示。`,
      target: '#story-action',
      jumpLabel: '跳到 今日训练 + 护肤 + 饮食',
      shortLabel: '执行',
      shortDescription: '训练 + 护肤 + 饮食',
    },
    {
      id: 'story-trend',
      title: '最后看趋势',
      text: '如果当天状态正常，再下滑到趋势图和历史记录看变化，不用每次都先看整张表。',
      target: '#story-trend',
      jumpLabel: '跳到 趋势 + 历史记录',
      shortLabel: '趋势',
      shortDescription: '趋势图 + 历史记录',
    },
  ]

  useEffect(() => {
    const updateActiveSection = () => {
      const next = getActiveSection(sections.length ? sections : guides)
      if (next) {
        setActiveSection(next)
      }
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('hashchange', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('hashchange', updateActiveSection)
    }
  }, [sections])

  return (
    <section className="flex flex-col gap-3">
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

      <nav className="sticky top-3 z-20 sm:top-4">
        <div className="rounded-2xl border border-dark-600/80 bg-dark-900/85 px-2 py-2 shadow-lg shadow-black/20 backdrop-blur sm:px-3 sm:py-3">
          <div className="storyline-scroll flex items-stretch gap-2 overflow-x-auto sm:flex-wrap sm:items-center sm:overflow-visible">
            <div className="hidden px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:block">
              阅读路径
            </div>
            {guides.map((guide, index) => {
              const isActive = activeSection === guide.id

              return (
                <a
                  key={guide.id}
                  href={guide.target}
                  className={[
                    'group min-w-[108px] shrink-0 rounded-xl border px-3 py-2 transition sm:min-w-[120px] sm:flex-1',
                    isActive
                      ? 'border-accent/70 bg-accent/12 text-white shadow-[0_0_0_1px_rgba(108,99,255,0.18)]'
                      : 'border-dark-600 bg-dark-800/80 text-slate-300 hover:border-accent/35 hover:bg-dark-700/70',
                  ].join(' ')}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">
                    0{index + 1}
                  </div>
                  <div className="mt-1 text-sm font-medium">{guide.shortLabel}</div>
                  <div className="mt-1 hidden text-xs text-slate-500 group-hover:text-slate-400 sm:block">
                    {guide.shortDescription}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </section>
  )
}
