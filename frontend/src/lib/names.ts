/** Un nombre por línea, sin líneas vacías ni repetidos. */
export function parseNames(text: string) {
  const seen = new Set<string>()
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((name) => {
      const key = name.toLocaleLowerCase('es')
      if (!name || seen.has(key)) return false
      seen.add(key)
      return true
    })
}
