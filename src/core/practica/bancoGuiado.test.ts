import katex from 'katex'
import { describe, expect, it } from 'vitest'
import type { Pregunta } from '../autoevaluacion'
import { CATALOGOS, generarProblemas } from '.'
import {
  BANCO_GUIADO,
  crearTutorDesdePregunta,
  crearTutorDesdeProblema,
  generarRondaGuiada,
  inferirTemaDesdePreguntas,
  type TemaId,
} from './bancoGuiado'

const TEMAS: TemaId[] = ['errores', 'ecuaciones', 'sistemas', 'interpolacion', 'integracion', 'diferenciales']

function verificarTextoKatex(txt: string, ctx: string) {
  expect(txt, ctx).not.toMatch(/NaN|undefined|Infinity|\[object/)
  expect(txt.split('$').length % 2, `${ctx} ($ desbalanceado) -> ${txt}`).toBe(1)
  expect(txt.split('**').length % 2, `${ctx} (** desbalanceado) -> ${txt}`).toBe(1)
  txt
    .split('\n')
    .forEach((linea) =>
      linea
        .split('**')
        .join('')
        .split('$')
        .forEach((frag, idx) => {
          if (idx % 2) katex.renderToString(frag, { throwOnError: true })
        }),
    )
}

describe('Banco dinámico guiado multi-paso (Anti-IA)', () => {
  it('cubre los 6 temas con 3 generadores por tema', () => {
    for (const t of TEMAS) {
      expect(BANCO_GUIADO[t]).toHaveLength(3)
    }
  })

  it('en 30 semillas produce 3 pasos encadenados válidos y fórmulas KaTeX sin errores', () => {
    for (const tema of TEMAS) {
      for (let semilla = 1; semilla <= 30; semilla++) {
        const ronda = generarRondaGuiada(tema, semilla, 3)
        expect(ronda).toHaveLength(3)
        for (const ej of ronda) {
          const ctxEj = `${tema}/s${semilla}/${ej.titulo}`
          expect(ej.pasos).toHaveLength(3)
          verificarTextoKatex(ej.contexto, ctxEj)
          ej.pasos.forEach((p, idx) => {
            expect(p.numero).toBe(idx + 1)
            const ctxPaso = `${ctxEj}/paso${p.numero}`
            verificarTextoKatex(p.enunciado, ctxPaso)
            verificarTextoKatex(p.explicacion, ctxPaso)
            verificarTextoKatex(p.trampa, ctxPaso)
            if (p.tipo === 'opcion') {
              expect(p.opciones?.length).toBeGreaterThanOrEqual(2)
              expect(p.correctaOpcion).toBeGreaterThanOrEqual(0)
              expect(p.correctaOpcion).toBeLessThan(p.opciones!.length)
              p.opciones!.forEach((o) => verificarTextoKatex(o, ctxPaso))
            } else {
              expect(Number.isFinite(p.correctaNumero)).toBe(true)
              expect(p.tolerancia).toBeGreaterThanOrEqual(0)
            }
            expect(p.tutor.length).toBeGreaterThanOrEqual(1)
            p.tutor.forEach((m) => {
              expect(m.correcta).toBeGreaterThanOrEqual(0)
              expect(m.correcta).toBeLessThan(m.opciones.length)
              verificarTextoKatex(m.regla, ctxPaso)
              verificarTextoKatex(m.pregunta, ctxPaso)
              verificarTextoKatex(m.exito, ctxPaso)
              verificarTextoKatex(m.trampa, ctxPaso)
              verificarTextoKatex(m.revelacion, ctxPaso)
              m.opciones.forEach((o) => verificarTextoKatex(o, ctxPaso))
            })
          })
        }
      }
    }
  }, 30000)

  it('es determinista por semilla y varía al cambiar de semilla', () => {
    for (const tema of TEMAS) {
      expect(generarRondaGuiada(tema, 42)).toEqual(generarRondaGuiada(tema, 42))
      const r1 = generarRondaGuiada(tema, 10).map((e) => e.contexto).join('|')
      const r2 = generarRondaGuiada(tema, 25).map((e) => e.contexto).join('|')
      expect(r1).not.toBe(r2)
    }
  })

  it('infiere correctamente el tema desde los prefijos de IDs de preguntas', () => {
    const mock = (id: string): Pregunta[] => [{ id, tipo: 'vf', enunciado: '', correcta: true, explicacion: '' }]
    expect(inferirTemaDesdePreguntas(mock('err-q1'))).toBe('errores')
    expect(inferirTemaDesdePreguntas(mock('abi-q1'))).toBe('ecuaciones')
    expect(inferirTemaDesdePreguntas(mock('sis-q1'))).toBe('sistemas')
    expect(inferirTemaDesdePreguntas(mock('reg-q1'))).toBe('interpolacion')
    expect(inferirTemaDesdePreguntas(mock('sim-q1'))).toBe('integracion')
    expect(inferirTemaDesdePreguntas(mock('rk-q1'))).toBe('diferenciales')
  })

  it('genera tutores socráticos válidos para preguntas y problemas generados', () => {
    const p: Pregunta = {
      id: 'abi-q1',
      tipo: 'opcion',
      enunciado: 'Pregunta de prueba',
      opciones: ['Opción A', 'Opción B'],
      correcta: 0,
      explicacion: 'Explicación',
      porOpcion: ['Bien A', 'Mal B'],
    }
    const tutorP = crearTutorDesdePregunta(p)
    expect(tutorP).toHaveLength(2)
    const [prob] = generarProblemas('errores', 'basico', CATALOGOS.errores, 7, 1)
    const tutorProb = crearTutorDesdeProblema(prob)
    expect(tutorProb).toHaveLength(2)
  })
})
