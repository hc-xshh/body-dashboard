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

export default function ReadingGuide({ sections = [], summary }) {
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
    <nav className="sticky top-3 z-30 -mt-1 sm:top-4">
      <div className="rounded-2xl border border-dark-600/80 bg-dark-900/88 px-2 py-2 shadow-lg shadow-black/25 backdrop-blur-md sm:px-3 sm:py-3">
        <div className="mb-2 flex items-start justify-between gap-3 px-1 sm:px-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">阅读路径</div>
            {summary && <div className="mt-1 text-sm leading-relaxed text-slate-300">{summary}</div>}
          </div>
        </div>

        <div className="storyline-scroll flex items-stretch gap-2 overflow-x-auto sm:flex-wrap sm:items-center sm:overflow-visible">
          {guides.map((guide) => {
            const isActive = activeSection === guide.id

            return (
              <a
                key={guide.id}
                href={guide.target}
                className={[
                  'min-w-[96px] shrink-0 rounded-xl border px-3 py-2.5 text-center transition sm:min-w-[110px] sm:flex-1',
                  isActive
                    ? 'border-accent/70 bg-accent/12 text-white shadow-[0_0_0_1px_rgba(108,99,255,0.18)]'
                    : 'border-dark-600 bg-dark-800/80 text-slate-300 hover:border-accent/35 hover:bg-dark-700/70',
                ].join(' ')}
              >
                <div className="text-sm font-medium">{guide.shortLabel}</div>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
