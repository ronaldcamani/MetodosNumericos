/** Convierte texto de un formulario en número finito; null si no es válido. Acepta coma decimal. */
export function parseNumero(texto: string): number | null {
  const t = texto.trim().replace(',', '.')
  if (t === '' || !/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function parseEntero(texto: string): number | null {
  const n = parseNumero(texto)
  return n !== null && Number.isInteger(n) ? n : null
}
