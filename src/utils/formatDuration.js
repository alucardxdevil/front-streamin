/** Formatea segundos a mm:ss o hh:mm:ss */
export function formats(seconds) {
  if (isNaN(seconds)) return '00:00'
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = date.getUTCSeconds().toString().padStart(2, '0')
  if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
  return `${mm}:${ss}`
}

export default formats
