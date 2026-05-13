import { useEffect, useState } from 'react'

function getActiveSection(sections) {
  if (typeof window === 'undefined') return sections[0]?.id ?? null

  const threshold = 180
  let current = sections[0]?.id ?? null

  for (const section of sections) {
    const element = document.getElementById(section.id)
    if (!element) continue

    const top = element.getBoundingClientRect().top
    if (top <= threshold) {
      current = section.id
    }
  }

  return window.location.hash?.slice(1) || current
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
    <nav className="sticky top-4 z-20">
      <div className="rounded-2xl border border-dark-600/80 bg-dark-900/85 backdrop-blur px-3 py-3 shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Storyline
          </div>
          {sections.map((section, index) => {
            const isActive = activeSection === section.id

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={[
                  'group min-w-[120px] flex-1 rounded-xl border px-3 py-2 transition',
                  isActive
                    ? 'border-accent/70 bg-accent/12 text-white shadow-[0_0_0_1px_rgba(108,99,255,0.18)]'
                    : 'border-dark-600 bg-dark-800/80 text-slate-300 hover:border-accent/35 hover:bg-dark-700/70',
                ].join(' ')}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/90">
                  0{index + 1}
                </div>
                <div className="mt-1 text-sm font-medium">{section.label}</div>
                <div className="mt-1 text-xs text-slate-500 group-hover:text-slate-400">
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
