import { useEffect, useState } from 'react'

type Props = {
  q: string
  tags: string[]
  allTags: string[]
  onSearch: (q: string) => void
  onToggleTag: (tag: string) => void
}

/** Buscador (espera a que se deje de escribir) y chips de etiquetas. */
export function LibrarySearch({
  q,
  tags,
  allTags,
  onSearch,
  onToggleTag,
}: Props) {
  const [text, setText] = useState(q)
  const [lastQ, setLastQ] = useState(q)

  // Si la URL cambia por otra vía (atrás, migas), el campo la sigue
  if (q !== lastQ) {
    setLastQ(q)
    if (q !== text.trim()) setText(q)
  }

  useEffect(() => {
    if (text.trim() === q) return
    const timer = setTimeout(() => onSearch(text.trim()), 300)
    return () => clearTimeout(timer)
  }, [text, q, onSearch])

  return (
    <div className="space-y-2">
      <input
        type="search"
        aria-label="Buscar en la biblioteca"
        placeholder="Buscar por temática, dinámica, oración…"
        className="field"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {allTags.length > 0 && (
        <div
          role="group"
          aria-label="Etiquetas"
          className="flex flex-wrap gap-2"
        >
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="event-chip aria-pressed:border-brand-500 aria-pressed:bg-brand-50 aria-pressed:text-brand-700"
              aria-pressed={tags.includes(tag)}
              onClick={() => onToggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
