import { useEffect, useMemo, useState } from 'react'

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
  const guides = useMemo(() => {
    if (sections.length) {
      return sections.map((section) => ({
        id: section.id,
        target: `#${section.id}`,
        shortLabel: section.label,
        shortDescription: section.description,
      }))
    }

    return [
      {
        id: 'story-status',
        target: '#story-status',
        shortLabel: '状态',
        shortDescription: '核心指标 + 雷达 + 健康建议',
      },
      {
        id: 'story-action',
        target: '#story-action',
        shortLabel: '执行',
        shortDescription: '训练 + 护肤 + 饮食',
      },
      {
        id: 'story-trend',
        target: '#story-trend',
        shortLabel: '趋势',
        shortDescription: '趋势图 + 历史记录',
      },
    ]
  }, [sections])

  const [activeSection, setActiveSection] = useState(guides[0]?.id ?? null)

  useEffect(() => {
    const updateActiveSection = () => {
      const next = getActiveSection(guides)
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
  }, [guides])

  return (
    <>
      <section className="rounded-2xl border border-dark-600 bg-dark-800/90 p-4 shadow-sm shadow-black/10 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">阅读引导</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              先看状态，再看今天执行，最后再看趋势。今天是 {weekday}，训练主题是「{trainingLabel}」，
              直接用下面这条固定在顶部的阅读路径跳转即可。
            </p>
          </div>
          <div className="inline-flex w-fit rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-xs text-accent-light">
            日常打开时先按顺序看一遍
          </div>
        </div>
      </section>

      <nav className="sticky top-3 z-30 -mt-1 sm:top-4">
        <div className="rounded-2xl border border-dark-600/80 bg-dark-900/88 px-2 py-2 shadow-lg shadow-black/25 backdrop-blur-md sm:px-3 sm:py-3">
          <div className="mb-2 flex items-center justify-between px-1 sm:px-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">阅读路径</div>
              <div className="mt-1 text-xs text-slate-500 sm:hidden">左右滑动或点击跳转</div>
            </div>
            <div className="hidden text-xs text-slate-500 sm:block">滚动页面时会自动联动高亮</div>
          </div>

          <div className="storyline-scroll flex items-stretch gap-2 overflow-x-auto sm:flex-wrap sm:items-center sm:overflow-visible">
            {guides.map((guide, index) => {
              const isActive = activeSection === guide.id

              return (
                <a
                  key={guide.id}
                  href={guide.target}
                  className={[
                    'group min-w-[112px] shrink-0 rounded-xl border px-3 py-2.5 transition sm:min-w-[120px] sm:flex-1',
                    isActive
                      ? 'border-accent/70 bg-accent/12 text-white shadow-[0_0_0_1px_rgba(108,99,255,0.18)]'
                      : 'border-dark-600 bg-dark-800/80 text-slate-300 hover:border-accent/35 hover:bg-dark-700/70',
                  ].join(' ')}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">
                    0{index + 1}
                  </div>
                  <div className="mt-1 text-sm font-medium">{guide.shortLabel}</div>
                  <div className="mt-1 hidden text-xs leading-relaxed text-slate-500 group-hover:text-slate-400 sm:block">
                    {guide.shortDescription}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
