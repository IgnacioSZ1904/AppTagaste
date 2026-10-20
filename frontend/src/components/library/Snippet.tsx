import { snippetParts } from '@/lib/snippet'

/** Fragmento del buscador con lo encontrado resaltado. */
export function Snippet({ text }: { text: string }) {
  return (
    <p className="text-sm text-slate-600">
      …
      {snippetParts(text).map((part, i) =>
        part.marked ? (
          <mark key={i} className="bg-brand-100 text-brand-700 rounded px-0.5">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
      …
    </p>
  )
}
