// La API usa fechas en hora de España como texto "AAAA-MM-DD HH:MM".

const pad = (n: number) => String(n).padStart(2, '0')

/** Date (hora local del navegador) → "AAAA-MM-DD HH:MM". */
export const toApiDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}`

/** "AAAA-MM-DD HH:MM" → "AAAA-MM-DDTHH:MM" (formato de <input type="datetime-local"> y FullCalendar). */
export const apiToInput = (value: string) => value.replace(' ', 'T')

/** "AAAA-MM-DDTHH:MM" → "AAAA-MM-DD HH:MM". */
export const inputToApi = (value: string) => value.replace('T', ' ')

/** "AAAA-MM-DD HH:MM" → "13/11/2026 17:00". */
export const formatApiDate = (value: string) => {
  const [date, time] = value.split(' ')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} ${time}`
}

/** Rango legible: "17:00 – 18:30" si es el mismo día; si no, "14/10 10:00 – 15/10 18:00". */
export const formatApiRange = (start: string, end: string) => {
  const [startDate, startTime] = start.split(' ')
  const [endDate, endTime] = end.split(' ')
  if (startDate === endDate) return `${startTime} – ${endTime}`
  const short = (date: string) =>
    date.split('-').reverse().slice(0, 2).join('/')
  return `${short(startDate)} ${startTime} – ${short(endDate)} ${endTime}`
}
