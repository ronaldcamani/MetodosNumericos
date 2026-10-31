import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { CATALOGOS, NIVELES, crearAzar, evaluarCampo, generarProblemas } from '.'
import { PROGRESO_VACIO, dominio, estrellas, etiquetaDominio, normalizar, registrarIntento } from './progreso'

const TEMAS = Object.keys(CATALOGOS)
const textoDe = (p: ReturnType<typeof generarProblemas>[number]) => [p.titulo, p.enunciado, ...p.pasos, ...p.campos.map((c) => c.etiqueta)].join('\n')

describe('generadores de problemas', () => {
  it('hay seis temas con al menos dos generadores por nivel', () => {
    expect(TEMAS).toHaveLength(6)
    for (const t of TEMAS) for (const n of NIVELES) expect(CATALOGOS[t][n].length).toBeGreaterThanOrEqual(2)
  })

  it('son deterministas: la misma semilla da los mismos problemas', () => {
    for (const t of TEMAS) for (const n of NIVELES) {
      expect(generarProblemas(t, n, CATALOGOS[t], 123)).toEqual(generarProblemas(t, n, CATALOGOS[t], 123))
    }
  })

  it('semillas distintas dan problemas distintos', () => {
    for (const t of TEMAS) {
      const a = generarProblemas(t, 'intermedio', CATALOGOS[t], 1).map((p) => p.enunciado).join()
      const b = generarProblemas(t, 'intermedio', CATALOGOS[t], 2).map((p) => p.enunciado).join()
      expect(a).not.toBe(b)
    }
  })

  it('en 80 semillas: respuestas finitas, pasos presentes, sin NaN y fórmulas válidas en KaTeX', () => {
    for (const t of TEMAS) for (const n of NIVELES) for (let s = 1; s <= 80; s++) {
      for (const p of generarProblemas(t, n, CATALOGOS[t], s)) {
        const ctx = `${t}/${n}/semilla ${s}/${p.titulo}`
        expect(p.campos.length, ctx).toBeGreaterThan(0)
        expect(p.pasos.length, ctx).toBeGreaterThanOrEqual(3)
        for (const c of p.campos) { expect(Number.isFinite(c.valor), ctx).toBe(true); expect(c.tol, ctx).toBeGreaterThanOrEqual(0) }
        const txt = textoDe(p)
        expect(txt, ctx).not.toMatch(/NaN|undefined|Infinity|\[object/)
        expect(txt.split('$').length % 2, ctx).toBe(1)
        expect(txt.split('**').length % 2, ctx).toBe(1)
        txt.split('\n').forEach((l) => l.split('**').join('').split('$').forEach((m, k) => { if (k % 2) katex.renderToString(m, { throwOnError: true }) }))
      }
    }
  }, 30000)

  it('la respuesta correcta se acepta y una desviada grande se rechaza', () => {
    for (const t of TEMAS) for (const n of NIVELES) for (let s = 1; s <= 50; s++) {
      for (const p of generarProblemas(t, n, CATALOGOS[t], s)) for (const c of p.campos) {
        expect(evaluarCampo(c, c.valor)).toBe('correcto')
        expect(evaluarCampo(c, c.valor + Math.max(1, Math.abs(c.valor)))).toBe('incorrecto')
        expect(evaluarCampo(c, null)).toBe('invalido')
      }
    }
  })

  it('valores comprobados a mano', () => {
    // Fijamos la semilla y recalculamos con otro camino lo que el generador afirma.
    const [p] = generarProblemas('errores', 'basico', { ...CATALOGOS.errores, basico: [CATALOGOS.errores.basico[0]] }, 5)
    const num = p.enunciado.match(/x=(\d+)\$ y se aproxima por \$\\tilde x=([\d.]+)/)!
    const x = Number(num[1]); const xa = Number(num[2])
    expect(p.campos[0].valor).toBeCloseTo(Math.abs(x - xa), 9)
    expect(p.campos[1].valor).toBeCloseTo((Math.abs(x - xa) / x) * 100, 9)
  })

  it('azar: enteros dentro del rango', () => {
    const r = crearAzar(9)
    for (let i = 0; i < 500; i++) { const v = r.entero(-3, 4); expect(v).toBeGreaterThanOrEqual(-3); expect(v).toBeLessThanOrEqual(4) }
  })
})

describe('progreso', () => {
  const caso = (id: string, correcto = true, vioSolucion = false) => ({ id, nivel: 'basico' as const, correcto, vioSolucion })

  it('un acierto suma puntos y no se cuenta dos veces', () => {
    let p = registrarIntento(PROGRESO_VACIO(), caso('a'))
    expect(p.puntos).toBe(10); expect(p.correctas.basico).toBe(1)
    p = registrarIntento(p, caso('a'))
    expect(p.puntos).toBe(10); expect(p.intentos.basico).toBe(2)
  })
  it('un fallo o un acierto tras ver la solución no suman', () => {
    let p = registrarIntento(PROGRESO_VACIO(), caso('a', false))
    p = registrarIntento(p, caso('b', true, true))
    expect(p.puntos).toBe(0); expect(p.correctas.basico).toBe(0)
  })
  it('estrellas y dominio crecen con los aciertos', () => {
    expect([0, 1, 2, 3, 4, 6, 20].map(estrellas)).toEqual([0, 0, 1, 1, 2, 3, 3])
    let p = PROGRESO_VACIO()
    expect(dominio(p)).toBe(0); expect(etiquetaDominio(0)).toBe('Explorando')
    for (const n of ['basico', 'intermedio', 'avanzado'] as const) for (let i = 0; i < 6; i++) p = registrarIntento(p, { id: `${n}${i}`, nivel: n, correcto: true, vioSolucion: false })
    expect(dominio(p)).toBe(100); expect(etiquetaDominio(100)).toBe('Dominado')
    expect(p.puntos).toBe(6 * (10 + 20 + 30))
  })
  it('normalizar descarta datos dañados', () => {
    expect(normalizar('x')).toEqual(PROGRESO_VACIO())
    expect(normalizar({ puntos: -5, correctas: { basico: 'a' }, resueltos: [1, 'ok'] })).toEqual({ ...PROGRESO_VACIO(), resueltos: ['ok'] })
  })
})
