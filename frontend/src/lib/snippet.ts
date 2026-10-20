export type SnippetPart = { text: string; marked: boolean }

/**
 * Parte el fragmento del buscador por sus <mark>…</mark>.
 * El resto del texto viene sin escapar y se pinta siempre como texto, nunca como HTML.
 */
export function snippetParts(snippet: string): SnippetPart[] {
  return snippet
    .split(/(<mark>|<\/mark>)/)
    .reduce<{ parts: SnippetPart[]; marked: boolean }>(
      ({ parts, marked }, piece) => {
        if (piece === '<mark>') return { parts, marked: true }
        if (piece === '</mark>') return { parts, marked: false }
        if (piece) parts.push({ text: piece, marked })
        return { parts, marked }
      },
      { parts: [], marked: false },
    ).parts
}
