/** /biblioteca, /biblioteca/2025-2026 o /biblioteca/2025-2026/Confirmación%20A */
export function libraryPath(year?: string, group?: string) {
  return ['/biblioteca', year, group]
    .filter((part) => part !== undefined)
    .map((part, i) => (i === 0 ? part : encodeURIComponent(part!)))
    .join('/')
}
