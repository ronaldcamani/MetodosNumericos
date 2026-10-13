import { calificar, puntaje, type Pregunta } from './autoevaluacion'

const num: Pregunta = { id: 'n', tipo: 'numerica', enunciado: '', correcta: 3.75, tolerancia: 0.001, explicacion: '' }
const op: Pregunta = { id: 'o', tipo: 'opcion', enunciado: '', opciones: ['a', 'b'], correcta: 1, explicacion: '' }
const vf: Pregunta = { id: 'v', tipo: 'vf', enunciado: '', correcta: false, explicacion: '' }

describe('autoevaluación', () => {
  it('numérica acepta dentro de la tolerancia (también coma decimal) y rechaza fuera', () => {
    expect(calificar(num, '3.75').estado).toBe('correcta')
    expect(calificar(num, '3,7505').estado).toBe('correcta')
    expect(calificar(num, '3.752').estado).toBe('incorrecta')
    expect(calificar(num, '3.7489').estado).toBe('incorrecta')
  })
  it('numérica distingue vacío, texto no numérico y valores no finitos', () => {
    expect(calificar(num, '').estado).toBe('sin_responder')
    expect(calificar(num, undefined).estado).toBe('sin_responder')
    expect(calificar(num, 'abc').estado).toBe('invalida')
    expect(calificar(num, 'Infinity').estado).toBe('invalida')
    expect(calificar(num, '1e999').estado).toBe('invalida')
  })
  it('opción y verdadero/falso', () => {
    expect(calificar(op, 1).estado).toBe('correcta')
    expect(calificar(op, 0).estado).toBe('incorrecta')
    expect(calificar(vf, false).estado).toBe('correcta')
    expect(calificar(vf, true).estado).toBe('incorrecta')
    expect(calificar(vf, undefined).estado).toBe('sin_responder')
  })
  it('puntaje cuenta solo aciertos', () => {
    expect(puntaje([num, op, vf], { n: '3.75', o: 0, v: false })).toBe(2)
  })
})
