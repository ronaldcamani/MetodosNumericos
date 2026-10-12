/** Muestrea f en [x0, x1]; los valores no finitos se devuelven como null para dejar huecos en el gráfico. */
export function muestrear(f: (x: number) => number, x0: number, x1: number, n = 200): { x: number[]; y: (number | null)[] } {
  const x: number[] = []
  const y: (number | null)[] = []
  for (let i = 0; i <= n; i++) {
    const xi = x0 + ((x1 - x0) * i) / n
    const yi = f(xi)
    x.push(xi)
    y.push(Number.isFinite(yi) ? yi : null)
  }
  return { x, y }
}
