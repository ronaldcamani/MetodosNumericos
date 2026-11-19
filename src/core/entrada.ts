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

/**
 * Convierte una lista de números separados por comas, punto y coma (;) o espacios.
 * Preserva la coma decimal cuando hay `;` o cuando los elementos con coma decimal van separados por espacios.
 */
export function parseListaNumeros(texto: string): number[] | null {
  const t = texto.trim()
  if (!t) return null

  let partes: string[]
  if (t.includes(';')) {
    partes = t
      .split(';')
      .flatMap((seg) => seg.trim().split(/\s+/))
      .filter(Boolean)
  } else {
    const porEspacio = t.split(/\s+/).filter(Boolean)
    const pareceComaDecimal =
      porEspacio.length > 1 &&
      porEspacio.every((tok) => !tok.endsWith(',') && !tok.startsWith(',') && tok.split(',').length <= 2) &&
      porEspacio.some((tok) => /,\d/.test(tok))
    partes = pareceComaDecimal ? porEspacio : t.split(/[\s,]+/).filter(Boolean)
  }

  if (!partes.length) return null
  const nums = partes.map(parseNumero)
  return nums.every((x): x is number => x !== null) ? nums : null
}
