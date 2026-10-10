export type Celda = string | number | null | undefined

function escapar(c: Celda): string {
  const s = c === null || c === undefined ? '' : String(c)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Genera CSV con los valores completos (sin redondeo de presentación). */
export function aCSV(columnas: string[], filas: Celda[][]): string {
  return [columnas, ...filas].map((f) => f.map(escapar).join(',')).join('\n') + '\n'
}

export function descargarCSV(nombre: string, contenido: string): void {
  const url = URL.createObjectURL(new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
