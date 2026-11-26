import type { ResultadoMetodo } from '../tipos'
import { LIMITES } from './modelos'
import { verificarRaiz, type VerificacionRaiz } from './verificacion'

export type IdModeloPuntoFijo = 'calibracion_cbrt' | 'coseno' | 'exponencial' | 'divergente'

export interface ModeloPuntoFijo {
  id: IdModeloPuntoFijo
  nombre: string
  ecuacionTex: string
  gTex: string
  dgTex: string
  expresionG: string
  x0Sugerido: number
  g: (x: number) => number
  dg: (x: number) => number
}

export const MODELOS_PUNTO_FIJO: Record<IdModeloPuntoFijo, ModeloPuntoFijo> = {
  calibracion_cbrt: {
    id: 'calibracion_cbrt',
    nombre: 'Calibración convergente: g(x) = ∛(x + 2)',
    ecuacionTex: String.raw`x^3 - x - 2 = 0`,
    gTex: String.raw`g(x) = \sqrt[3]{x + 2}`,
    dgTex: String.raw`g'(x) = \frac{1}{3(x + 2)^{2/3}}`,
    expresionG: '∛(x + 2)',
    x0Sugerido: 1.5,
    g: (x) => Math.cbrt(x + 2),
    dg: (x) => {
      const base = Math.cbrt(x + 2)
      return base === 0 ? Number.POSITIVE_INFINITY : 1 / (3 * base * base)
    },
  },
  coseno: {
    id: 'coseno',
    nombre: 'Ecuación trascendente: g(x) = cos(x)',
    ecuacionTex: String.raw`\cos(x) - x = 0`,
    gTex: String.raw`g(x) = \cos(x)`,
    dgTex: String.raw`g'(x) = -\operatorname{sen}(x)`,
    expresionG: 'cos(x)',
    x0Sugerido: 0.5,
    g: (x) => Math.cos(x),
    dg: (x) => -Math.sin(x),
  },
  exponencial: {
    id: 'exponencial',
    nombre: 'Decaimiento exponencial: g(x) = e⁻ˣ',
    ecuacionTex: String.raw`e^{-x} - x = 0`,
    gTex: String.raw`g(x) = e^{-x}`,
    dgTex: String.raw`g'(x) = -e^{-x}`,
    expresionG: 'e⁻ˣ',
    x0Sugerido: 0.5,
    g: (x) => Math.exp(-x),
    dg: (x) => -Math.exp(-x),
  },
  divergente: {
    id: 'divergente',
    nombre: 'Despeje divergente: g(x) = x³ − 2',
    ecuacionTex: String.raw`x^3 - x - 2 = 0`,
    gTex: String.raw`g(x) = x^3 - 2`,
    dgTex: String.raw`g'(x) = 3x^2`,
    expresionG: 'x³ − 2',
    x0Sugerido: 1.5,
    g: (x) => x ** 3 - 2,
    dg: (x) => 3 * x * x,
  },
}

export interface EntradaPuntoFijo {
  g: (x: number) => number
  dg?: (x: number) => number
  x0: number
  tol: number
  maxIter: number
}

export interface PasoPuntoFijo {
  k: number
  x: number
  gx: number
  errorAbs: number
  pendienteDg: number
  residuo: number
}

export type TipoConvergenciaPF = 'monotona' | 'oscilatoria' | 'divergente'

export interface DiagnosticoPuntoFijo {
  cumpleCriterio: boolean
  tipo: TipoConvergenciaPF
  pendienteInicial: number
  pendienteFinal: number
  explicacion: string
}

export interface SalidaPuntoFijo {
  raiz: number
  iteraciones: number
  ultimoCambio: number
  residuo: number
  pendienteDg: number
  criterio: string
  diagnostico: DiagnosticoPuntoFijo
  verificacion: VerificacionRaiz
}

export const CRITERIO_PUNTO_FIJO = 'error |xₖ₊₁ − xₖ| = |g(xₖ) − xₖ| ≤ tolerancia'
const LIMITE_DESBORDE = 1e12

function estimarDerivada(g: (x: number) => number, x: number): number {
  const h = 1e-6 * Math.max(1, Math.abs(x))
  return (g(x + h) - g(x - h)) / (2 * h)
}

function diagnosticarCriterio(pendienteInicial: number, pendienteFinal: number): DiagnosticoPuntoFijo {
  const absFinal = Math.abs(pendienteFinal)
  const cumpleCriterio = Number.isFinite(absFinal) && absFinal < 1
  if (!cumpleCriterio) {
    return {
      cumpleCriterio: false,
      tipo: 'divergente',
      pendienteInicial,
      pendienteFinal,
      explicacion: `No cumple el criterio suficiente |g′(x)| < 1 (|g′| ≈ ${Number.isFinite(absFinal) ? absFinal.toFixed(4) : '∞'} ≥ 1): los errores se amplifican y la iteración diverge.`,
    }
  }
  const tipo: TipoConvergenciaPF = pendienteFinal >= 0 ? 'monotona' : 'oscilatoria'
  return {
    cumpleCriterio: true,
    tipo,
    pendienteInicial,
    pendienteFinal,
    explicacion:
      tipo === 'monotona'
        ? `Cumple 0 ≤ g′(x) < 1 (g′ ≈ ${pendienteFinal.toFixed(4)}): convergencia monótona por un solo lado hacia el punto fijo.`
        : `Cumple −1 < g′(x) < 0 (g′ ≈ ${pendienteFinal.toFixed(4)}): convergencia oscilatoria en espiral alrededor del punto fijo.`,
  }
}

const falla = (
  estado: ResultadoMetodo<never, never>['estado'],
  mensaje: string,
  pasos: PasoPuntoFijo[] = [],
): ResultadoMetodo<SalidaPuntoFijo, PasoPuntoFijo> => ({ estado, mensaje, resultado: null, pasos })

/**
 * Método abierto de Iteración de Punto Fijo (x_{k+1} = g(x_k)) para Tema 04 (Cap. II).
 * Evalúa el criterio suficiente de convergencia |g'(x)| < 1 en cada iteración.
 */
export function puntoFijo({ g, dg, x0, tol, maxIter }: EntradaPuntoFijo): ResultadoMetodo<SalidaPuntoFijo, PasoPuntoFijo> {
  if (![x0, tol].every(Number.isFinite) || !Number.isInteger(maxIter)) {
    return falla('invalido', 'Los datos deben ser números finitos y el máximo de iteraciones un entero.')
  }
  if (Math.abs(x0) > LIMITES.maxAbs) {
    return falla('invalido', `El punto inicial debe estar en [−${LIMITES.maxAbs}, ${LIMITES.maxAbs}].`)
  }
  if (tol < LIMITES.tolMin) {
    return falla('invalido', `La tolerancia debe ser ≥ ${LIMITES.tolMin}.`)
  }
  if (maxIter < 1 || maxIter > LIMITES.maxIter) {
    return falla('invalido', `El máximo de iteraciones debe estar entre 1 y ${LIMITES.maxIter}.`)
  }

  const evalDg = dg ?? ((t: number) => estimarDerivada(g, t))
  const pasos: PasoPuntoFijo[] = []
  let x = x0
  let pendienteInicial = Number.NaN

  for (let k = 1; k <= maxIter; k++) {
    const gx = g(x)
    const pendienteDg = evalDg(x)
    if (k === 1) pendienteInicial = pendienteDg

    if (!Number.isFinite(gx) || Math.abs(gx) > LIMITE_DESBORDE) {
      const detalleDg = Number.isFinite(pendienteDg) ? ` |g′(x)| = ${Math.abs(pendienteDg).toExponential(2)}.` : ''
      return falla(
        'no_finito',
        `Divergencia en la iteración ${k}: g(x) salió de rango o creció sin cota porque no se cumple |g′(x)| < 1.${detalleDg}`,
        pasos,
      )
    }

    const errorAbs = Math.abs(gx - x)
    const gSiguiente = g(gx)
    const residuo = Number.isFinite(gSiguiente) ? Math.abs(gSiguiente - gx) : Math.abs(gx - x)
    pasos.push({ k, x, gx, errorAbs, pendienteDg, residuo })
    x = gx

    if (errorAbs <= tol) {
      const fEquivalente = (t: number) => g(t) - t
      const verificacion = verificarRaiz(fEquivalente, x, tol)
      if (!verificacion.verificada) {
        return falla(
          'no_converge',
          `El paso fue ≤ tolerancia en x = ${x}, pero |g(x) − x| = ${Math.abs(verificacion.fRaiz)} no verifica ser punto fijo.`,
          pasos,
        )
      }
      const dgFinal = evalDg(x)
      const diagnostico = diagnosticarCriterio(pendienteInicial, Number.isFinite(dgFinal) ? dgFinal : pendienteDg)
      return {
        estado: 'convergio',
        mensaje: `Criterio de parada alcanzado en ${k} iteraciones (${diagnostico.tipo === 'oscilatoria' ? 'convergencia oscilatoria' : 'convergencia monótona'}, |g′(r)| = ${Math.abs(diagnostico.pendienteFinal).toFixed(4)} < 1).`,
        resultado: {
          raiz: x,
          iteraciones: k,
          ultimoCambio: errorAbs,
          residuo: Math.abs(fEquivalente(x)),
          pendienteDg: diagnostico.pendienteFinal,
          criterio: CRITERIO_PUNTO_FIJO,
          diagnostico,
          verificacion,
        },
        pasos,
      }
    }
  }

  const ultimo = pasos[pasos.length - 1]
  const avisoContraccion =
    ultimo && Math.abs(ultimo.pendienteDg) >= 1
      ? ` Además |g′(x)| = ${Math.abs(ultimo.pendienteDg).toFixed(3)} ≥ 1 (no cumple el criterio suficiente de contracción).`
      : ''
  return falla(
    'max_iter',
    `Se agotaron las ${maxIter} iteraciones sin cumplir el criterio de parada.${avisoContraccion}`,
    pasos,
  )
}
