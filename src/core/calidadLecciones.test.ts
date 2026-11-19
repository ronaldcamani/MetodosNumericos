import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { AUDIOS_MANIFEST } from './audiosManifest'
import {
  cifrasCorrectas,
  cifrasSignificativas,
  epsilonMaquina,
  erroresAproximacion,
  operarConPrecision,
  serieExponencial,
  sumaConPrecision,
} from './errores'
import { LECCIONES_VIDEO, type ModuloVideoId } from './lecciones'
import { biseccion, estimarOrdenEmpirico, newton, secante } from './m1'
import { dominanciaDiagonalEstricta, eliminacionGauss, gaussSeidel } from './m2'
import { lagrange, regresionLineal } from './m3'
import { aproximarDerivada, crearDerivable, integrarTasa, reglaCompuesta } from './m4'
import { factorEuler, factorRK4, integrarEnfriamiento } from './m5'

const MODULOS: ModuloVideoId[] = [
  'errores',
  'ecuaciones',
  'sistemas',
  'interpolacion',
  'integracion',
  'diferenciales',
]

describe('Calidad estructural, KaTeX, fonética y voces nativas en LECCIONES_VIDEO', () => {
  it('los 6 módulos tienen exactamente 7 escenas únicas (42 en total) con duración entre 120s y 210s', () => {
    const ids = new Set<string>()
    let totalEscenas = 0

    for (const mod of MODULOS) {
      const leccion = LECCIONES_VIDEO[mod]
      expect(leccion.escenas).toHaveLength(7)

      let duracionModulo = 0
      for (const escena of leccion.escenas) {
        totalEscenas++
        expect(ids.has(escena.id)).toBe(false)
        ids.add(escena.id)
        expect(escena.duracion).toBeGreaterThan(0)
        duracionModulo += escena.duracion
      }

      expect(duracionModulo).toBeGreaterThanOrEqual(120)
      expect(duracionModulo).toBeLessThanOrEqual(210)
    }

    expect(totalEscenas).toBe(42)
  })

  it('todas las fórmulas formulaTex y pasosTex de las 42 escenas compilan sin errores en KaTeX', () => {
    for (const mod of MODULOS) {
      for (const escena of LECCIONES_VIDEO[mod].escenas) {
        expect(() => katex.renderToString(escena.formulaTex, { throwOnError: true })).not.toThrow()
        expect(escena.pasosTex.length).toBeGreaterThanOrEqual(2)
        for (const paso of escena.pasosTex) {
          expect(() => katex.renderToString(paso, { throwOnError: true })).not.toThrow()
        }
      }
    }
  })

  it('las 42 narraciones están escritas para pronunciación natural en español y el manifiesto usa voz nativa', () => {
    for (const mod of MODULOS) {
      for (const escena of LECCIONES_VIDEO[mod].escenas) {
        const txt = escena.narracion.trim()
        expect(txt.length).toBeGreaterThan(80)
        expect(txt).not.toMatch(/\\/)
        expect(txt).not.toMatch(/[\^_]/)
        expect(txt.toLowerCase()).not.toContain('ere cuadrado')

        const meta = AUDIOS_MANIFEST[escena.id]
        expect(meta).toBeDefined()
        expect(meta.voz).not.toContain('Matilda')
        expect(meta.voz).not.toContain('XrExE9yKIg1WjnnlVkGX')
        expect(meta.voz).toMatch(/^es-(PE|MX|ES|419)-|español/i)
      }
    }
  })
})

describe('Auditoría matemática exacta de los 6 ejercicios contra src/core/', () => {
  it('errores: π ≈ 22/7, corte vs redondeo en 8/3, serie de e¹, cancelación y suma en t = 4', () => {
    const errPi = erroresAproximacion({ verdadero: Math.PI, aproximado: 22 / 7 }).resultado!
    expect(errPi.absoluto).toBeCloseTo(1.2645e-3, 7)
    expect(errPi.relativo!).toBeCloseTo(4.025e-4, 7)
    expect(errPi.porcentual!).toBeCloseTo(0.04025, 5)
    expect(errPi.cifras).toBe(3)
    expect(cifrasCorrectas(Math.PI, 0.0012645)).toBe(3)

    const corte = cifrasSignificativas(8 / 3, 3, 'truncamiento')
    const redondeo = cifrasSignificativas(8 / 3, 3, 'redondeo')
    expect(corte).toBeCloseTo(2.66, 10)
    expect(redondeo).toBeCloseTo(2.67, 10)
    const errCorte = erroresAproximacion({ verdadero: 8 / 3, aproximado: corte }).resultado!
    const errRed = erroresAproximacion({ verdadero: 8 / 3, aproximado: redondeo }).resultado!
    expect(errCorte.absoluto).toBeCloseTo(0.00667, 5)
    expect(errCorte.porcentual!).toBeCloseTo(0.25, 5)
    expect(errRed.absoluto).toBeCloseTo(0.00333, 5)
    expect(errRed.porcentual!).toBeCloseTo(0.125, 5)

    const serie = serieExponencial({ x: 1, terminos: 5 })
    expect(serie.estado).toBe('ok')
    expect(serie.pasos[0].suma).toBeCloseTo(1, 10)
    expect(serie.pasos[2].suma).toBeCloseTo(2.5, 10)
    expect(serie.pasos[2].error).toBeCloseTo(0.2183, 4)
    expect(serie.pasos[3].suma).toBeCloseTo(2.6667, 4)
    expect(serie.pasos[4].suma).toBeCloseTo(2.7083, 4)
    expect(serie.pasos[4].error).toBeCloseTo(0.00995, 5)
    expect(serie.pasos[4].cota).toBeCloseTo(0.02265, 5)

    const canc = operarConPrecision({ a: 0.12345, op: '−', b: 0.12341, t: 4, modo: 'redondeo' }).resultado!
    expect(canc.aRed).toBeCloseTo(0.1235, 10)
    expect(canc.bRed).toBeCloseTo(0.1234, 10)
    expect(canc.calculado).toBeCloseTo(0.0001, 10)
    expect(canc.exacto).toBeCloseTo(0.00004, 10)
    expect(canc.relativo!).toBeCloseTo(1.5, 8)

    const suma = sumaConPrecision({ valores: [1000, 0.4, 0.4], t: 4, modo: 'redondeo' }).resultado!
    expect(suma.resultadoOrden).toBeCloseTo(1000, 10)
    expect(suma.resultadoCreciente).toBeCloseTo(1001, 10)
    expect(suma.errorOrden).toBeCloseTo(0.8, 10)
    expect(suma.errorCreciente).toBeCloseTo(0.2, 10)
    expect(epsilonMaquina()).toBeCloseTo(2.220446e-16, 20)
  })

  it('ecuaciones (M1): f(x) = x³ − x − 2 con Bisección, Newton-Raphson, Secante y órdenes', () => {
    const f = (x: number) => x ** 3 - x - 2
    const df = (x: number) => 3 * x ** 2 - 1

    const rBis = biseccion({ f, a: 1, b: 2, tol: 1e-6, maxIter: 50 })
    expect(rBis.estado).toBe('convergio')
    expect(rBis.resultado!.iteraciones).toBe(20)
    expect(rBis.pasos[0].medio).toBeCloseTo(1.5, 10)
    expect(rBis.pasos[0].fMedio).toBeCloseTo(-0.125, 10)
    expect(rBis.pasos[1].medio).toBeCloseTo(1.75, 10)
    expect(rBis.pasos[2].medio).toBeCloseTo(1.625, 10)
    expect(rBis.resultado!.raiz).toBeCloseTo(1.52138, 5)

    const rNew = newton({ f, df, x0: 1.5, tol: 1e-6, maxIter: 20 })
    expect(rNew.estado).toBe('convergio')
    expect(rNew.resultado!.iteraciones).toBe(3)
    expect(rNew.pasos[0].dfx).toBeCloseTo(5.75, 10)
    expect(rNew.pasos[0].siguiente).toBeCloseTo(1.5217391, 7)
    expect(rNew.pasos[1].siguiente).toBeCloseTo(1.5213798, 7)
    expect(rNew.pasos[1].residuo).toBeCloseTo(5.89e-7, 9)
    expect(rNew.pasos[2].siguiente).toBeCloseTo(1.5213797, 7)
    expect(rNew.pasos[2].cambio).toBeCloseTo(9.92e-8, 10)
    expect(rNew.pasos[2].residuo).toBeCloseTo(4.53e-14, 16)
    const ordNew = estimarOrdenEmpirico(
      rNew.pasos.map((p) => p.cambio),
      2,
      rNew.pasos.map((p) => Math.abs(p.fx) > 1e-12),
    )
    expect(ordNew.ordenEmpirico!).toBeCloseTo(2, 2)

    const rSec = secante({ f, x0: 1, x1: 2, tol: 1e-6, maxIter: 30 })
    expect(rSec.estado).toBe('convergio')
    expect(rSec.resultado!.iteraciones).toBe(7)
    expect(rSec.pasos[0].siguiente).toBeCloseTo(4 / 3, 10)
    expect(rSec.pasos[1].siguiente).toBeCloseTo(1.46269, 5)
    expect(rSec.pasos[2].siguiente).toBeCloseTo(1.53117, 5)
    expect(rSec.pasos[2].residuo).toBeCloseTo(0.05863, 5)
    expect(rSec.resultado!.raiz).toBeCloseTo(1.5213797, 7)
    const ordSec = estimarOrdenEmpirico(
      rSec.pasos.map((p) => p.cambio),
      (1 + Math.sqrt(5)) / 2,
      rSec.pasos.map((p) => Math.abs(p.f1) > 1e-12),
    )
    expect(ordSec.ordenEmpirico!).toBeCloseTo(1.618, 1)
  })

  it('sistemas (M2): dominancia diagonal, Gauss con pivoteo parcial y Gauss-Seidel', () => {
    const A = [
      [4, 1, 1],
      [1, 5, 1],
      [1, 1, 6],
    ]
    const b = [9, 14, 21]

    expect(dominanciaDiagonalEstricta(A)).toBe(true)

    const rGauss = eliminacionGauss({ A, b })
    expect(rGauss.estado).toBe('ok')
    expect(rGauss.resultado!.x[0]).toBeCloseTo(1, 10)
    expect(rGauss.resultado!.x[1]).toBeCloseTo(2, 10)
    expect(rGauss.resultado!.x[2]).toBeCloseTo(3, 10)
    expect(rGauss.resultado!.residuoInf).toBeLessThan(1e-12)
    expect(rGauss.pasos[0].multiplicadores).toEqual([0.25, 0.25])
    expect(rGauss.pasos[1].multiplicadores[0]).toBeCloseTo(3 / 19, 10)

    const rGS = gaussSeidel({ A, b, tol: 1e-6, maxIter: 30 })
    expect(rGS.estado).toBe('convergio')
    expect(rGS.resultado!.iteraciones).toBe(8)
    expect(rGS.pasos[0].x[0]).toBeCloseTo(2.25, 4)
    expect(rGS.pasos[0].x[1]).toBeCloseTo(2.35, 4)
    expect(rGS.pasos[0].x[2]).toBeCloseTo(2.7333, 4)
    expect(rGS.pasos[0].residuoInf).toBeCloseTo(5.0833, 4)
    expect(rGS.pasos[1].x[0]).toBeCloseTo(0.9792, 4)
    expect(rGS.pasos[1].x[1]).toBeCloseTo(2.0575, 4)
    expect(rGS.pasos[1].x[2]).toBeCloseTo(2.9939, 4)
    expect(rGS.pasos[1].residuoInf).toBeCloseTo(0.2606, 4)
    expect(rGS.pasos[2].x[0]).toBeCloseTo(0.9872, 4)
    expect(rGS.pasos[2].x[1]).toBeCloseTo(2.0038, 4)
    expect(rGS.pasos[2].x[2]).toBeCloseTo(3.0015, 4)
    expect(rGS.pasos[3].residuoInf).toBeCloseTo(0.0051, 4)
    expect(rGS.resultado!.residuoInf).toBeLessThanOrEqual(1e-6)
  })

  it('interpolacion (M3): bases de Lagrange, Runge de 6 nodos y regresión lineal', () => {
    const x = [0, 1, 2, 3]
    const y = [1, 2, 2, 4]

    const rLag = lagrange({ x, y, consulta: 1.5 })
    expect(rLag.estado).toBe('ok')
    expect(rLag.pasos[0].base).toBeCloseTo(-0.0625, 10)
    expect(rLag.pasos[1].base).toBeCloseTo(0.5625, 10)
    expect(rLag.pasos[2].base).toBeCloseTo(0.5625, 10)
    expect(rLag.pasos[3].base).toBeCloseTo(-0.0625, 10)
    expect(rLag.pasos.reduce((s, p) => s + p.base, 0)).toBeCloseTo(1, 10)
    expect(rLag.resultado!.valor).toBeCloseTo(1.9375, 10)

    const rungeX = [-1, -0.6, -0.2, 0.2, 0.6, 1]
    const rungeY = rungeX.map((xi) => 1 / (1 + 25 * xi * xi))
    const rRunge = lagrange({ x: rungeX, y: rungeY, consulta: 0.8 })
    expect(rRunge.resultado!.valor).toBeCloseTo(-0.0481, 4)

    const rReg = regresionLineal({ x, y, consulta: 1.5 })
    expect(rReg.estado).toBe('ok')
    expect(rReg.resultado!.xMedia).toBeCloseTo(1.5, 10)
    expect(rReg.resultado!.yMedia).toBeCloseTo(2.25, 10)
    expect(rReg.resultado!.sxx).toBeCloseTo(5, 10)
    expect(rReg.resultado!.sxy).toBeCloseTo(4.5, 10)
    expect(rReg.resultado!.pendiente).toBeCloseTo(0.9, 10)
    expect(rReg.resultado!.intercepto).toBeCloseTo(0.9, 10)
    expect(rReg.resultado!.prediccion).toBeCloseTo(2.25, 10)
    expect(rReg.resultado!.sse).toBeCloseTo(0.7, 10)
    expect(rReg.resultado!.r2!).toBeCloseTo(0.8526, 4)
  })

  it('integracion (M4): Trapecio/Simpson en r(t)=t²+1, orden en t⁴ y derivación de eᵗ', () => {
    const tasa = { a: 1, b: 0, c: 1 }

    const rTrap = integrarTasa('trapecio', { tasa, inicio: 0, fin: 2, n: 4 })
    expect(rTrap.estado).toBe('ok')
    expect(rTrap.resultado!.h).toBeCloseTo(0.5, 10)
    expect(rTrap.pasos.map((p) => p.peso)).toEqual([1, 2, 2, 2, 1])
    expect(rTrap.resultado!.integral).toBeCloseTo(4.75, 10)
    expect(rTrap.resultado!.errorAbs).toBeCloseTo(1 / 12, 10)

    const rSimp = integrarTasa('simpson', { tasa, inicio: 0, fin: 2, n: 4 })
    expect(rSimp.estado).toBe('ok')
    expect(rSimp.pasos.map((p) => p.peso)).toEqual([1, 4, 2, 4, 1])
    expect(rSimp.resultado!.integral).toBeCloseTo(14 / 3, 10)
    expect(rSimp.resultado!.errorAbs).toBeCloseTo(0, 10)

    const eT2 = Math.abs(reglaCompuesta('trapecio', (t) => t ** 4, 0, 1, 2).integral - 0.2)
    const eT4 = Math.abs(reglaCompuesta('trapecio', (t) => t ** 4, 0, 1, 4).integral - 0.2)
    const eT8 = Math.abs(reglaCompuesta('trapecio', (t) => t ** 4, 0, 1, 8).integral - 0.2)
    expect(eT2).toBeCloseTo(0.08125, 6)
    expect(eT4).toBeCloseTo(0.020703, 6)
    expect(eT8).toBeCloseTo(0.0052, 6)

    const eS2 = Math.abs(reglaCompuesta('simpson', (t) => t ** 4, 0, 1, 2).integral - 0.2)
    const eS4 = Math.abs(reglaCompuesta('simpson', (t) => t ** 4, 0, 1, 4).integral - 0.2)
    const eS8 = Math.abs(reglaCompuesta('simpson', (t) => t ** 4, 0, 1, 8).integral - 0.2)
    expect(eS2).toBeCloseTo(0.008333, 6)
    expect(eS4).toBeCloseTo(0.000521, 6)
    expect(eS8).toBeCloseTo(0.000033, 6)

    const derivExp = crearDerivable('exponencial')
    const d01 = aproximarDerivada({ derivable: derivExp, t: 1, h: 0.1 }).resultado!
    expect(d01.progresiva).toBeCloseTo(2.85884, 5)
    expect(d01.errorProgresiva).toBeCloseTo(0.14056, 5)
    expect(d01.central).toBeCloseTo(2.72281, 5)
    expect(d01.errorCentral).toBeCloseTo(0.00453, 5)

    const d1e5 = aproximarDerivada({ derivable: derivExp, t: 1, h: 1e-5 }).resultado!
    expect(d1e5.errorCentral).toBeCloseTo(5.86e-11, 12)

    const d1e12 = aproximarDerivada({ derivable: derivExp, t: 1, h: 1e-12 }).resultado!
    expect(d1e12.errorCentral).toBeCloseTo(2.1e-4, 5)
  })

  it('diferenciales (M5): Euler vs RK4 en enfriamiento y regímenes de estabilidad (h=3, h=5)', () => {
    const modelo = { T0: 80, Ta: 20, k: 0.5, tf: 1.5 }
    const rEu = integrarEnfriamiento('euler', modelo, 0.5)
    expect(rEu.estado).toBe('ok')
    expect(rEu.pasos[1].T).toBeCloseTo(65, 10)
    expect(rEu.pasos[1].exacta).toBeCloseTo(66.728, 4)
    expect(rEu.pasos[1].error).toBeCloseTo(1.728, 4)
    expect(rEu.pasos[2].T).toBeCloseTo(53.75, 10)
    expect(rEu.pasos[3].T).toBeCloseTo(45.3125, 10)
    expect(rEu.pasos[3].error).toBeCloseTo(3.0295, 4)

    const rRK = integrarEnfriamiento('rk4', { T0: 80, Ta: 20, k: 0.5, tf: 0.5 }, 0.5)
    expect(rRK.estado).toBe('ok')
    const kArr = rRK.pasos[1].k!
    expect(kArr[0]).toBeCloseTo(-30, 5)
    expect(kArr[1]).toBeCloseTo(-26.25, 5)
    expect(kArr[2]).toBeCloseTo(-26.71875, 5)
    expect(kArr[3]).toBeCloseTo(-23.3203125, 5)
    expect(rRK.pasos[1].T).toBeCloseTo(66.728516, 6)
    expect(rRK.pasos[1].error).toBeCloseTo(4.69e-4, 6)
    expect(factorRK4(0.5, 0.5)).toBeCloseTo(0.7788086, 6)

    expect(factorEuler(0.5, 5)).toBeCloseTo(-1.5, 10)
    const rExpl = integrarEnfriamiento('euler', { T0: 80, Ta: 20, k: 0.5, tf: 15 }, 5)
    expect(rExpl.estado).toBe('no_converge')
    expect(rExpl.pasos.map((p) => p.T)).toEqual([80, -70, 155, -182.5])

    expect(factorEuler(0.5, 3)).toBeCloseTo(-0.5, 10)
    const rOsc = integrarEnfriamiento('euler', { T0: 80, Ta: 20, k: 0.5, tf: 12 }, 3)
    expect(rOsc.estado).toBe('ok')
    expect(rOsc.resultado!.fisicamenteValida).toBe(false)
    expect(rOsc.pasos.map((p) => p.T)).toEqual([80, -10, 35, 12.5, 23.75])
  })
})
