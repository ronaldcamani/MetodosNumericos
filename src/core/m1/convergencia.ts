import type { ResultadoMetodo } from '../tipos'
import type { PasoBiseccion, SalidaBiseccion } from './biseccion'
import type { PasoFalsaPosicion, SalidaFalsaPosicion } from './falsaPosicion'
import type { PasoNewton, SalidaNewton } from './newton'
import type { PasoPuntoFijo, SalidaPuntoFijo } from './puntoFijo'
import type { PasoSecante, SalidaSecante } from './secante'

export type MetodoConvergencia = 'biseccion' | 'falsa' | 'punto_fijo' | 'newton' | 'secante' | 'polinomio'

export interface FichaConvergencia {
  metodo: MetodoConvergencia
  nombre: string
  familia: 'abierto' | 'cerrado' | 'polinomio'
  ordenTeorico: number
  ordenEtiqueta: string
  formulaOrdenTex: string
  condicionTex: string
  velocidadResumen: string
  riesgoPrincipal: string
  diagnosticoTipico: string
}

export interface SerieOrden {
  k: number
  cambio: number
  razonLineal: number | null
  ordenLocal: number | null
}

export interface AnalisisConvergencia {
  metodo: MetodoConvergencia
  ficha: FichaConvergencia
  ordenTeorico: number
  ordenEmpirico: number | null
  factorAsintotico: number | null
  razonLineal: number | null
  clasificacion: string
  resumen: string
  alertas: string[]
  serie: SerieOrden[]
}

const PHI = (1 + Math.sqrt(5)) / 2

export const FICHAS_CONVERGENCIA: Record<MetodoConvergencia, FichaConvergencia> = {
  newton: {
    metodo: 'newton',
    nombre: 'Newton-Raphson',
    familia: 'abierto',
    ordenTeorico: 2,
    ordenEtiqueta: 'Cuadrático (p = 2)',
    formulaOrdenTex: String.raw`e_{k+1} \approx \left|\frac{f''(r)}{2f'(r)}\right| e_k^2`,
    condicionTex: String.raw`f'(r)\neq 0 \;\text{ y }\; \left|\frac{f(x_0)\,f''(x_0)}{[f'(x_0)]^2}\right|<1`,
    velocidadResumen: 'Duplica aproximadamente las cifras significativas correctas en cada paso cerca de una raíz simple.',
    riesgoPrincipal: 'Derivada nula o casi nula (|f′(x)| ≪ 1), ciclos periódicos, divergencia con mal x₀ o degradación a lineal en raíces múltiples.',
    diagnosticoTipico: 'Si |f′(x)| decrece junto con |f(x)| hacia 0, el orden cae de p = 2 a p ≈ 1.',
  },
  secante: {
    metodo: 'secante',
    nombre: 'Secante',
    familia: 'abierto',
    ordenTeorico: PHI,
    ordenEtiqueta: 'Superlineal (p ≈ 1.618)',
    formulaOrdenTex: String.raw`e_{k+1} \approx C\,e_k^{\varphi},\quad \varphi = \frac{1+\sqrt{5}}{2}\approx 1.618`,
    condicionTex: String.raw`f'(r)\neq 0,\; x_0,x_1\text{ cercanos a }r,\; f(x_k)\neq f(x_{k-1})`,
    velocidadResumen: 'Supera la convergencia lineal sin calcular derivadas analíticas, reutilizando la pendiente entre los dos últimos puntos.',
    riesgoPrincipal: 'Secante casi horizontal cuando f(x_k) ≈ f(x_{k-1}) (pendiente nula) y posible escape si no encierra la raíz.',
    diagnosticoTipico: 'Más pasos que Newton por iteración, pero con una sola evaluación de f nueva por paso.',
  },
  polinomio: {
    metodo: 'polinomio',
    nombre: 'Newton–Horner y Durand–Kerner',
    familia: 'polinomio',
    ordenTeorico: 2,
    ordenEtiqueta: 'Cuadrático por raíz / simultáneo (p = 2)',
    formulaOrdenTex: String.raw`e_{k+1} \approx C\,e_k^2 \quad (\text{raíces simples})`,
    condicionTex: String.raw`|r|\le 1+\max_{i<n}\left|\frac{a_i}{a_n}\right|,\; p'(r)\neq 0`,
    velocidadResumen: 'Newton–Horner halla y pule raíces reales con orden cuadrático; Durand–Kerner aproxima todas las raíces complejas simultáneamente.',
    riesgoPrincipal: 'Raíces múltiples degradan el orden a p = 1; la deflación acumula error si no se pule sobre el polinomio original.',
    diagnosticoTipico: 'Verifica cada raíz con el residuo relativo |p(r)| / Σ|aᵢ||r|ⁱ ≤ 10⁻⁸.',
  },
  biseccion: {
    metodo: 'biseccion',
    nombre: 'Bisección',
    familia: 'cerrado',
    ordenTeorico: 1,
    ordenEtiqueta: 'Lineal garantizado (p = 1)',
    formulaOrdenTex: String.raw`e_k \le \frac{b-a}{2^k},\qquad \frac{e_{k+1}}{e_k}=0.5`,
    condicionTex: String.raw`f\in C[a,b] \;\text{ y }\; f(a)\cdot f(b)<0`,
    velocidadResumen: 'Razón de reducción constante igual a 0.5: cada ~3.32 iteraciones agrega una cifra decimal correcta.',
    riesgoPrincipal: 'Lenta frente a métodos abiertos; puede encerrar un polo en lugar de una raíz si no se comprueba f(r).',
    diagnosticoTipico: 'Convergencia incondicional mientras f sea continua y cambie de signo.',
  },
  falsa: {
    metodo: 'falsa',
    nombre: 'Falsa posición',
    familia: 'cerrado',
    ordenTeorico: 1,
    ordenEtiqueta: 'Lineal asintótico (p = 1)',
    formulaOrdenTex: String.raw`e_{k+1} \approx \lambda\,e_k,\quad \lambda \in (0,1)`,
    condicionTex: String.raw`f\in C[a,b] \;\text{ y }\; f(a)\cdot f(b)<0`,
    velocidadResumen: 'Mantiene el cambio de signo y suele acelerar al principio, pero puede estancarse con razón lineal cercana a 1.',
    riesgoPrincipal: 'Estancamiento unilateral: en curvas muy convexas o cóncavas un extremo queda fijo y el ancho b − a no tiende a 0.',
    diagnosticoTipico: 'Vigila si un extremo no se mueve durante varias iteraciones consecutivas.',
  },
  punto_fijo: {
    metodo: 'punto_fijo',
    nombre: 'Iteración de Punto Fijo',
    familia: 'abierto',
    ordenTeorico: 1,
    ordenEtiqueta: 'Lineal con razón |g′(r)| (p = 1)',
    formulaOrdenTex: String.raw`x_{k+1} = g(x_k), \qquad e_{k+1} \approx |g'(r)|\,e_k`,
    condicionTex: String.raw`|g'(x)| \le L < 1 \;\text{ en un entorno de }\; r=g(r)`,
    velocidadResumen: 'Cada iteración multiplica el error por la razón asintótica |g′(r)|: cuanto menor sea |g′(r)|, más rápida es la contracción.',
    riesgoPrincipal: 'Si |g′(x)| ≥ 1 en el entorno de la raíz, el método diverge (en escalera o en espiral creciente) según la forma elegida de despejar x = g(x).',
    diagnosticoTipico: '0 ≤ g′(r) < 1 produce convergencia monótona; −1 < g′(r) < 0 produce convergencia oscilatoria (telaraña).',
  },
}

const PISO_CAMBIO = 1e-14

/**
 * Estima el orden empírico de convergencia p ≈ ln(|Δx_k|/|Δx_{k-1}|) / ln(|Δx_{k-1}|/|Δx_{k-2}|)
 * y el factor asintótico |Δx_k| / |Δx_{k-1}|^p a partir de la sucesión de cambios.
 */
export function estimarOrdenEmpirico(
  cambios: number[],
  ordenTeorico: number,
  pasosUtiles?: boolean[],
): {
  ordenEmpirico: number | null
  factorAsintotico: number | null
  razonLineal: number | null
  serie: SerieOrden[]
} {
  const serie: SerieOrden[] = []
  let ordenEmpirico: number | null = null
  let ultimoParValido: { prev: number; curr: number } | null = null
  let razonLineal: number | null = null
  const usarFiltro = pasosUtiles && pasosUtiles.filter(Boolean).length >= 3

  for (let k = 0; k < cambios.length; k++) {
    const curr = cambios[k]
    const prev = k >= 1 ? cambios[k - 1] : null
    const prev2 = k >= 2 ? cambios[k - 2] : null
    const sinRuido = !usarFiltro || Boolean(pasosUtiles[k])

    let razonLocal: number | null = null
    if (prev !== null && prev > PISO_CAMBIO && curr > PISO_CAMBIO && Number.isFinite(curr / prev)) {
      razonLocal = curr / prev
      if (sinRuido) {
        ultimoParValido = { prev, curr }
        razonLineal = razonLocal
      }
    }

    let ordenLocal: number | null = null
    if (prev !== null && prev2 !== null && prev2 > PISO_CAMBIO && prev > PISO_CAMBIO && curr > PISO_CAMBIO) {
      if (prev2 > prev && prev > curr) {
        const den = Math.log(prev / prev2)
        if (Math.abs(den) > 1e-9) {
          const p = Math.log(curr / prev) / den
          if (Number.isFinite(p) && p > 0 && p < 20) {
            ordenLocal = p
            if (sinRuido) ordenEmpirico = p
          }
        }
      }
    }

    serie.push({ k: k + 1, cambio: curr, razonLineal: razonLocal, ordenLocal })
  }

  let factorAsintotico: number | null = null
  if (ultimoParValido) {
    const pUsado = ordenEmpirico ?? ordenTeorico
    const c = ultimoParValido.curr / ultimoParValido.prev ** pUsado
    if (Number.isFinite(c) && c >= 0) factorAsintotico = c
  }

  return { ordenEmpirico, factorAsintotico, razonLineal, serie }
}

function clasificarOrden(ordenEmpirico: number | null, ordenTeorico: number, razonLineal: number | null): string {
  if (ordenEmpirico === null) {
    if (razonLineal !== null && razonLineal < 0.15) return 'Convergencia muy rápida (pocos pasos)'
    return `Sin orden empírico suficiente (< 3 pasos útiles; teórico p = ${ordenTeorico.toFixed(ordenTeorico === 1 || ordenTeorico === 2 ? 0 : 2)})`
  }
  if (ordenEmpirico >= 1.8) return 'Cuadrática observada (p ≈ 2)'
  if (ordenEmpirico >= 1.35) return 'Superlineal observada (1 < p < 2)'
  if (ordenEmpirico >= 0.75) return 'Lineal observada (p ≈ 1)'
  return 'Sublineal o lenta (p < 0.75)'
}

export function analizarConvergenciaNewton(res: ResultadoMetodo<SalidaNewton, PasoNewton>): AnalisisConvergencia {
  const ficha = FICHAS_CONVERGENCIA.newton
  const cambios = res.pasos.map((p) => p.cambio)
  const pisoFx = 1e-12 * Math.max(1, Math.abs(res.pasos[0]?.fx ?? 1))
  const pasosUtiles = res.pasos.map((p) => Math.abs(p.fx) > pisoFx)
  const { ordenEmpirico, factorAsintotico, razonLineal, serie } = estimarOrdenEmpirico(cambios, ficha.ordenTeorico, pasosUtiles)
  const alertas: string[] = []

  if (res.pasos.length > 0 && Math.abs(res.pasos[0].dfx) < 0.1) {
    alertas.push(`Sensibilidad inicial: |f′(x₀)| = ${Math.abs(res.pasos[0].dfx).toExponential(2)} ≪ 1; una tangente casi horizontal puede lanzar el iterado lejos de la raíz.`)
  }

  const ultimo = res.pasos[res.pasos.length - 1]
  const degradado =
    ultimo &&
    Math.abs(ultimo.dfx) < 0.05 &&
    ((ordenEmpirico !== null && ordenEmpirico < 1.35) || (razonLineal !== null && razonLineal > 0.35 && razonLineal < 0.75))
  if (degradado) {
    alertas.push('Posible raíz múltiple: |f′(x)| tiende a 0 junto con |f(x)| y el orden se degrada de cuadrático (p = 2) a lineal (p ≈ 1).')
  }

  if (res.estado === 'derivada_nula') {
    alertas.push('Derivada nula: |f′(xₙ)| cayó por debajo del umbral de seguridad y la tangente quedó paralela al eje x.')
  } else if (res.estado === 'max_iter') {
    alertas.push('No convergió dentro del límite de iteraciones: revisa posibles ciclos periódicos o elige un x₀ más cercano a la raíz.')
  } else if (res.estado === 'no_finito') {
    alertas.push('Divergencia numérica: los saltos salieron del dominio finito de punto flotante.')
  } else if (res.estado === 'no_converge') {
    alertas.push('Falsa convergencia descartada: el paso fue pequeño pero la verificación confirmó que no hay cruce de cero.')
  }

  const clasificacion = res.estado === 'convergio' ? clasificarOrden(ordenEmpirico, ficha.ordenTeorico, razonLineal) : 'Sin convergencia confirmada'
  const resumen =
    ordenEmpirico !== null
      ? `Orden empírico estimado p ≈ ${ordenEmpirico.toFixed(3)} frente al teórico p = 2${degradado ? ' (degradado a lineal por multiplicidad)' : ''}.`
      : res.pasos.length > 0 && res.estado === 'convergio'
        ? `Convergió en ${res.pasos.length} paso(s); se necesitan al menos 3 cambios útiles mayores a 10⁻¹⁴ para estimar p empíricamente.`
        : 'Ejecución sin convergencia completa: revisa las condiciones suficientes y el punto inicial x₀.'

  return { metodo: 'newton', ficha, ordenTeorico: ficha.ordenTeorico, ordenEmpirico, factorAsintotico, razonLineal, clasificacion, resumen, alertas, serie }
}

export function analizarConvergenciaSecante(res: ResultadoMetodo<SalidaSecante, PasoSecante>): AnalisisConvergencia {
  const ficha = FICHAS_CONVERGENCIA.secante
  const cambios = res.pasos.map((p) => p.cambio)
  const pisoFx = 1e-12 * Math.max(1, Math.abs(res.pasos[0]?.f1 ?? 1))
  const pasosUtiles = res.pasos.map((p) => Math.abs(p.f1) > pisoFx)
  const { ordenEmpirico, factorAsintotico, razonLineal, serie } = estimarOrdenEmpirico(cambios, ficha.ordenTeorico, pasosUtiles)
  const alertas: string[] = []

  const casiHorizontal = res.pasos.some((p) => Math.abs(p.x1 - p.x0) > 1e-6 && Math.abs(p.f1 - p.f0) / Math.abs(p.x1 - p.x0) < 1e-4)
  if (res.estado === 'derivada_nula' || casiHorizontal) {
    alertas.push('Secante casi horizontal: f(xₖ) ≈ f(xₖ₋₁), por lo que la pendiente se acerca a cero y el método pierde estabilidad o se detiene.')
  }
  if (res.estado === 'max_iter' || res.estado === 'no_finito' || res.estado === 'no_converge') {
    alertas.push('Sin garantía global: al ser un método abierto, si x₀ y x₁ no rodean bien la raíz puede divergir o detenerse.')
  }

  const clasificacion = res.estado === 'convergio' ? clasificarOrden(ordenEmpirico, ficha.ordenTeorico, razonLineal) : 'Sin convergencia confirmada'
  const resumen =
    ordenEmpirico !== null
      ? `Orden empírico estimado p ≈ ${ordenEmpirico.toFixed(3)} frente al teórico superlineal φ ≈ ${ficha.ordenTeorico.toFixed(3)}.`
      : res.pasos.length > 0 && res.estado === 'convergio'
        ? `Convergió en ${res.pasos.length} paso(s); requiere ≥ 3 cambios útiles para estimar p empíricamente.`
        : 'No se alcanzó la convergencia; prueba acercar x₀ y x₁ a la raíz.'

  return { metodo: 'secante', ficha, ordenTeorico: ficha.ordenTeorico, ordenEmpirico, factorAsintotico, razonLineal, clasificacion, resumen, alertas, serie }
}

export function analizarConvergenciaBiseccion(res: ResultadoMetodo<SalidaBiseccion, PasoBiseccion>): AnalisisConvergencia {
  const ficha = FICHAS_CONVERGENCIA.biseccion
  const cambios = res.pasos.map((p) => p.cota)
  const { ordenEmpirico, factorAsintotico, razonLineal, serie } = estimarOrdenEmpirico(cambios, ficha.ordenTeorico)
  const alertas: string[] = []

  if (res.estado === 'sin_cambio_signo') {
    alertas.push('No se cumple la condición suficiente f(a)·f(b) < 0 en los extremos ingresados.')
  } else if (res.estado === 'no_converge') {
    alertas.push('El intervalo se redujo con cambio de signo pero el candidato no verifica ser raíz (posible polo o discontinuidad).')
  }

  const clasificacion = res.estado === 'convergio' ? 'Lineal garantizada (p = 1, razón 0.5)' : 'Sin convergencia confirmada'
  const resumen =
    ordenEmpirico !== null
      ? `Cota de error decrece con orden lineal p ≈ ${ordenEmpirico.toFixed(2)} y razón exacta ${razonLineal?.toFixed(2) ?? '0.50'} por iteración.`
      : 'Cada iteración divide el ancho del intervalo exactamente a la mitad.'

  return { metodo: 'biseccion', ficha, ordenTeorico: ficha.ordenTeorico, ordenEmpirico, factorAsintotico, razonLineal, clasificacion, resumen, alertas, serie }
}

export function analizarConvergenciaFalsa(res: ResultadoMetodo<SalidaFalsaPosicion, PasoFalsaPosicion>): AnalisisConvergencia {
  const ficha = FICHAS_CONVERGENCIA.falsa
  const cambios = res.pasos.map((p) => p.cambio).filter((c): c is number => c !== null)
  const { ordenEmpirico, factorAsintotico, razonLineal, serie } = estimarOrdenEmpirico(cambios, ficha.ordenTeorico)
  const alertas: string[] = []

  if (res.pasos.length >= 4) {
    const a0 = res.pasos[0].a
    const b0 = res.pasos[0].b
    const fijoA = res.pasos.filter((p) => p.a === a0).length / res.pasos.length
    const fijoB = res.pasos.filter((p) => p.b === b0).length / res.pasos.length
    if (fijoA >= 0.75 || fijoB >= 0.75) {
      const lado = fijoA >= fijoB ? `izquierdo (a = ${a0})` : `derecho (b = ${b0})`
      alertas.push(`Estancamiento unilateral: el extremo ${lado} permaneció fijo en ${Math.round(Math.max(fijoA, fijoB) * 100)} % de los pasos; la curvatura frena la convergencia a orden lineal lento y el ancho b − a no tiende a 0.`)
    }
  }
  if (res.estado === 'sin_cambio_signo') {
    alertas.push('No hay cambio de signo en [a, b]: f(a)·f(b) > 0.')
  } else if (res.estado === 'no_converge') {
    alertas.push('El criterio de cambio se cumplió pero c no verifica ser raíz (posible discontinuidad).')
  }

  const clasificacion = res.estado === 'convergio' ? clasificarOrden(ordenEmpirico, ficha.ordenTeorico, razonLineal) : 'Sin convergencia confirmada'
  const resumen =
    ordenEmpirico !== null
      ? `Orden empírico p ≈ ${ordenEmpirico.toFixed(3)} con razón asintótica ≈ ${razonLineal?.toFixed(3) ?? '—'}.`
      : 'La convergencia depende de la curvatura de f en el intervalo.'

  return { metodo: 'falsa', ficha, ordenTeorico: ficha.ordenTeorico, ordenEmpirico, factorAsintotico, razonLineal, clasificacion, resumen, alertas, serie }
}

export function analizarConvergenciaPuntoFijo(res: ResultadoMetodo<SalidaPuntoFijo, PasoPuntoFijo>): AnalisisConvergencia {
  const ficha = FICHAS_CONVERGENCIA.punto_fijo
  const cambios = res.pasos.map((p) => p.errorAbs)
  const pasosUtiles = res.pasos.map((p) => p.errorAbs > 1e-13)
  const { ordenEmpirico, factorAsintotico, razonLineal, serie } = estimarOrdenEmpirico(cambios, ficha.ordenTeorico, pasosUtiles)
  const alertas: string[] = []

  const dg0 = res.pasos[0]?.pendienteDg
  if (dg0 !== undefined && Math.abs(dg0) >= 1) {
    alertas.push(`No cumple el criterio suficiente en x₀: |g′(x₀)| = ${Math.abs(dg0).toFixed(3)} ≥ 1; este despeje g(x) tiende a divergir.`)
  } else if (res.resultado && res.resultado.diagnostico.tipo === 'oscilatoria') {
    alertas.push(`Convergencia oscilatoria: g′(r) = ${res.resultado.pendienteDg.toFixed(4)} ∈ (−1, 0), por lo que los iterados alternan alrededor de la raíz.`)
  }

  if (res.resultado && Math.abs(res.resultado.pendienteDg) > 0.8 && Math.abs(res.resultado.pendienteDg) < 1) {
    alertas.push(`Contracción lenta: |g′(r)| = ${Math.abs(res.resultado.pendienteDg).toFixed(4)} es cercano a 1 y requiere más iteraciones.`)
  }

  if (res.estado === 'no_finito' || res.estado === 'max_iter' || res.estado === 'no_converge') {
    alertas.push('El despeje x = g(x) no contrajo hacia el punto fijo; elige una reescritura con |g′(x)| < 1.')
  }

  const clasificacion =
    res.estado === 'convergio'
      ? `Lineal (p ≈ 1, razón |g′| ≈ ${Math.abs(res.resultado?.pendienteDg ?? razonLineal ?? 0).toFixed(3)})`
      : 'Sin convergencia confirmada (|g′| ≥ 1)'

  const resumen =
    res.estado === 'convergio' && res.resultado
      ? `Orden teórico p = 1 con razón de contracción |g′(r)| = ${Math.abs(res.resultado.pendienteDg).toFixed(4)}${ordenEmpirico !== null ? ` (orden empírico p ≈ ${ordenEmpirico.toFixed(3)})` : ''}.`
      : 'Ejecución divergente o sin convergencia: verifica que |g′(x)| < 1 en el intervalo de interés.'

  return {
    metodo: 'punto_fijo',
    ficha,
    ordenTeorico: ficha.ordenTeorico,
    ordenEmpirico,
    factorAsintotico: res.resultado ? Math.abs(res.resultado.pendienteDg) : factorAsintotico,
    razonLineal,
    clasificacion,
    resumen,
    alertas,
    serie,
  }
}
