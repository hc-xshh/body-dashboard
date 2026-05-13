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

export default function StorylineNav({ sections }) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? null)

  useEffect(() => {
    const updateActiveSection = () => {
      const next = getActiveSection(sections)
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
    <nav className="sticky top-3 z-20 sm:top-4">
      <div className="rounded-2xl border border-dark-600/80 bg-dark-900/85 px-2 py-2 shadow-lg shadow-black/20 backdrop-blur sm:px-3 sm:py-3">
        <div className="storyline-scroll flex items-stretch gap-2 overflow-x-auto sm:flex-wrap sm:items-center sm:overflow-visible">
          <div className="hidden px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:block">
            Storyline
          </div>
          {sections.map((section, index) => {
            const isActive = activeSection === section.id

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
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
                <div className="mt-1 text-sm font-medium">{section.label}</div>
                <div className="mt-1 hidden text-xs text-slate-500 group-hover:text-slate-400 sm:block">
                  {section.description}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
