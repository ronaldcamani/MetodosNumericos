import type { ResultadoMetodo } from '../tipos'
import { newton } from './newton'
import type { Modelo } from './modelos'

/** Coeficientes de mayor a menor grado: [aₙ, …, a₁, a₀]. */
export type Coeficientes = number[]

export const LIMITES_POLINOMIO = { gradoMax: 6, maxAbs: 1e6 } as const

/** Devuelve el mensaje de error o null si el polinomio es válido (grado 1 a 6, coeficiente principal no nulo). */
export function validarPolinomio(coef: Coeficientes): string | null {
  if (coef.length < 2 || coef.length > LIMITES_POLINOMIO.gradoMax + 1) return `El polinomio debe tener grado entre 1 y ${LIMITES_POLINOMIO.gradoMax} (de 2 a ${LIMITES_POLINOMIO.gradoMax + 1} coeficientes).`
  if (!coef.every(Number.isFinite)) return 'Todos los coeficientes deben ser números finitos.'
  if (coef.some((c) => Math.abs(c) > LIMITES_POLINOMIO.maxAbs)) return `Los coeficientes deben estar en [−${LIMITES_POLINOMIO.maxAbs}, ${LIMITES_POLINOMIO.maxAbs}].`
  if (coef[0] === 0) return 'El coeficiente principal (de mayor grado) no puede ser 0.'
  return null
}

export interface ResultadoHorner {
  /** p(x) */
  valor: number
  /** p′(x) */
  derivada: number
  /** Fila de la división sintética por (x − r): b₀…bₙ, con bₙ = p(r). Los primeros n son el cociente. */
  b: number[]
  /** Segunda división sintética sobre b: da p′(r) como último elemento. */
  c: number[]
}

/** Esquema de Horner: evalúa p y p′ con n multiplicaciones cada uno, sin calcular potencias. */
export function horner(coef: Coeficientes, x: number): ResultadoHorner {
  const b: number[] = [coef[0]]
  for (let i = 1; i < coef.length; i++) b.push(coef[i] + x * b[i - 1])
  const c: number[] = [b[0]]
  for (let i = 1; i < coef.length - 1; i++) c.push(b[i] + x * c[i - 1])
  return { valor: b[b.length - 1], derivada: c[c.length - 1], b, c }
}

/** División sintética por (x − r): cociente de grado n−1 y resto p(r). */
export function deflacionar(coef: Coeficientes, r: number): { cociente: Coeficientes; resto: number } {
  const { b } = horner(coef, r)
  return { cociente: b.slice(0, -1), resto: b[b.length - 1] }
}

const SUPERINDICES = ['', '', '²', '³', '⁴', '⁵', '⁶']

/** Texto legible, p. ej. [1, 0, −1, −2] → «x³ − x − 2». */
export function polinomioTexto(coef: Coeficientes): string {
  const n = coef.length - 1
  let s = ''
  coef.forEach((c, i) => {
    if (c === 0) return
    const g = n - i
    const abs = Math.abs(c)
    const cuerpo = g === 0 ? String(abs) : `${abs === 1 ? '' : abs}x${g === 1 ? '' : SUPERINDICES[g]}`
    s += s === '' ? (c < 0 ? `−${cuerpo}` : cuerpo) : ` ${c < 0 ? '−' : '+'} ${cuerpo}`
  })
  return s === '' ? '0' : s
}

/** Cota de Cauchy: todas las raíces (reales o complejas) cumplen |r| ≤ 1 + máx |aᵢ/aₙ|. */
export function cotaCauchy(coef: Coeficientes): number {
  return 1 + Math.max(...coef.slice(1).map((c) => Math.abs(c / coef[0])))
}

/** Convierte un polinomio en el Modelo que usan bisección, falsa posición, Newton y secante. */
export function crearModeloPolinomio(coef: Coeficientes): Modelo {
  return { id: 'polinomio', nombre: 'Polinomio', expresion: polinomioTexto(coef), f: (x) => horner(coef, x).valor, df: (x) => horner(coef, x).derivada }
}

export interface RaizPolinomio {
  re: number
  im: number
  metodo: string
  iteraciones: number
  /** |p(r)| / Σ|aᵢ||r|ⁱ: residuo relativo a la escala de los términos. */
  residuoRelativo: number
  verificada: boolean
}

export interface PasoPolinomio {
  k: number
  /** Punto inicial con el que Newton–Horner convergió. */
  x0: number
  raiz: number
  iteraciones: number
  /** Cociente tras dividir por (x − raíz). */
  cociente: Coeficientes
  /** Resto de la división (≈ 0 si la raíz es buena). */
  resto: number
}

export interface SalidaPolinomio {
  raices: RaizPolinomio[]
  grado: number
  cota: number
  criterio: string
  advertencias: string[]
}

export const CRITERIO_POLINOMIO = 'Newton–Horner con deflación: cada raíz real se pule sobre el polinomio original y se verifica con |p(r)|/Σ|aᵢ||r|ⁱ ≤ 10⁻⁸'
const UMBRAL_RESIDUO_REL = 1e-8

type Complejo = [number, number]
const mul = ([a, b]: Complejo, [c, d]: Complejo): Complejo => [a * c - b * d, a * d + b * c]
const sum = ([a, b]: Complejo, [c, d]: Complejo): Complejo => [a + c, b + d]
const sub = ([a, b]: Complejo, [c, d]: Complejo): Complejo => [a - c, b - d]
const div = ([a, b]: Complejo, [c, d]: Complejo): Complejo => {
  const m = c * c + d * d
  return [(a * c + b * d) / m, (b * c - a * d) / m]
}

function evaluarComplejo(coef: Coeficientes, z: Complejo): Complejo {
  return coef.reduce<Complejo>((acc, c) => sum(mul(acc, z), [c, 0]), [0, 0])
}

function residuoRelativo(coef: Coeficientes, z: Complejo): number {
  const [pr, pi] = evaluarComplejo(coef, z)
  const mod = Math.hypot(z[0], z[1])
  const n = coef.length - 1
  const escala = coef.reduce((s, c, i) => s + Math.abs(c) * mod ** (n - i), 0)
  return escala === 0 ? Math.hypot(pr, pi) : Math.hypot(pr, pi) / escala
}

/** Raíces de a x² + b x + c con la fórmula estable (evita la cancelación al restar números casi iguales). */
function cuadratica([a, b, c]: Coeficientes): Complejo[] {
  const disc = b * b - 4 * a * c
  if (disc >= 0) {
    const q = -(b + (b < 0 ? -Math.sqrt(disc) : Math.sqrt(disc))) / 2
    return q === 0 ? [[0, 0], [0, 0]] : [[q / a, 0], [c / q, 0]]
  }
  const re = -b / (2 * a)
  const im = Math.sqrt(-disc) / (2 * Math.abs(a))
  return [[re, im], [re, -im]]
}

/** Durand–Kerner: respaldo para un factor sin raíces reales de grado ≥ 3. */
function durandKerner(coef: Coeficientes): Complejo[] {
  const n = coef.length - 1
  const monico = coef.map((c) => c / coef[0])
  let z: Complejo[] = Array.from({ length: n }, (_, k) => {
    let p: Complejo = [1, 0]
    for (let i = 0; i < k; i++) p = mul(p, [0.4, 0.9])
    return p
  })
  for (let it = 0; it < 500; it++) {
    let cambio = 0
    z = z.map((zi, i) => {
      let den: Complejo = [1, 0]
      z.forEach((zj, j) => {
        if (j !== i) den = mul(den, sub(zi, zj))
      })
      const delta = div(evaluarComplejo(monico, zi), den)
      cambio = Math.max(cambio, Math.hypot(delta[0], delta[1]))
      return sub(zi, delta)
    })
    if (cambio < 1e-14) break
  }
  return z
}

const INICIOS = (cota: number) => [cota, -cota, cota / 2, -cota / 2, 0, 1, -1, 0.5, -0.5]

const falla = (mensaje: string, estado: ResultadoMetodo<never, never>['estado'] = 'invalido', pasos: PasoPolinomio[] = []): ResultadoMetodo<SalidaPolinomio, PasoPolinomio> => ({ estado, mensaje, resultado: null, pasos })

/**
 * Todas las raíces de un polinomio de grado 1 a 6: Newton–Horner para las reales con deflación,
 * fórmula cuadrática cuando queda grado 2 y Durand–Kerner si queda un factor sin raíces reales de grado ≥ 3.
 */
export function raicesPolinomio({ coef, tol, maxIter }: { coef: Coeficientes; tol: number; maxIter: number }): ResultadoMetodo<SalidaPolinomio, PasoPolinomio> {
  const error = validarPolinomio(coef)
  if (error) return falla(error)
  if (!Number.isFinite(tol) || tol < 1e-15) return falla('La tolerancia debe ser un número ≥ 1e-15.')
  if (!Number.isInteger(maxIter) || maxIter < 1 || maxIter > 1000) return falla('El máximo de iteraciones debe estar entre 1 y 1000.')

  const raices: RaizPolinomio[] = []
  const pasos: PasoPolinomio[] = []
  const advertencias: string[] = []
  const original = coef
  const cotaOriginal = cotaCauchy(original)
  const complejas = (zs: Complejo[], metodo: string) =>
    zs.forEach(([re, im]) => raices.push({ re, im, metodo, iteraciones: 0, residuoRelativo: residuoRelativo(original, [re, im]), verificada: false }))

  let actual = coef
  while (actual.length - 1 >= 3) {
    let hallada: { raiz: number; it: number; x0: number } | null = null
    for (const x0 of INICIOS(cotaCauchy(actual))) {
      const r = newton({ f: (x) => horner(actual, x).valor, df: (x) => horner(actual, x).derivada, x0, tol, maxIter })
      if (r.estado === 'convergio') {
        hallada = { raiz: r.resultado!.raiz, it: r.resultado!.iteraciones, x0 }
        break
      }
    }
    if (!hallada) break
    // Pulido sobre el polinomio original para que el error de la deflación no se acumule.
    const pulido = newton({ f: (x) => horner(original, x).valor, df: (x) => horner(original, x).derivada, x0: hallada.raiz, tol, maxIter })
    const raiz = pulido.estado === 'convergio' ? pulido.resultado!.raiz : hallada.raiz
    const { cociente, resto } = deflacionar(actual, raiz)
    pasos.push({ k: pasos.length + 1, x0: hallada.x0, raiz, iteraciones: hallada.it + (pulido.resultado?.iteraciones ?? 0), cociente, resto })
    raices.push({ re: raiz, im: 0, metodo: 'Newton–Horner', iteraciones: hallada.it + (pulido.resultado?.iteraciones ?? 0), residuoRelativo: residuoRelativo(original, [raiz, 0]), verificada: false })
    actual = cociente
  }
  const restante = actual.length - 1
  if (restante === 2) complejas(cuadratica(actual), 'Fórmula cuadrática')
  else if (restante === 1) complejas([[-actual[1] / actual[0], 0]], 'Despeje lineal')
  else if (restante >= 3) {
    advertencias.push(`El factor restante de grado ${restante} no tiene raíces reales que Newton–Horner encuentre; sus raíces (complejas) se calcularon con Durand–Kerner.`)
    complejas(durandKerner(actual), 'Durand–Kerner')
  }
  for (const r of raices) r.verificada = r.residuoRelativo <= UMBRAL_RESIDUO_REL
  raices.sort((p, q) => p.re - q.re || p.im - q.im)

  const malas = raices.filter((r) => !r.verificada)
  if (malas.length) {
    return { ...falla(`No converge: ${malas.length} raíz(ces) no verifican el criterio (|p(r)|/Σ|aᵢ||r|ⁱ > ${UMBRAL_RESIDUO_REL}); no se afirman como raíces.`, 'no_converge', pasos) }
  }
  const reales = raices.filter((r) => r.im === 0).length
  return {
    estado: 'ok',
    mensaje: `Grado ${coef.length - 1}: ${raices.length} raíces (${reales} real(es) y ${raices.length - reales} complejas), todas verificadas.`,
    resultado: { raices, grado: coef.length - 1, cota: cotaOriginal, criterio: CRITERIO_POLINOMIO, advertencias },
    pasos,
  }
}
