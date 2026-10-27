import { recomendarMetodos, type Respuestas } from './decision'

const base: Respuestas = { signo: 'si', derivada: 'si', inicial: 'si', polinomio: 'no', prioridad: 'garantia' }
const nivel = (r: Respuestas, m: string) => recomendarMetodos(r).recomendaciones.find((x) => x.id === m)!.nivel

describe('Analiza y decide', () => {
  it('con cambio de signo y prioridad de garantía recomienda bisección', () => {
    expect(nivel(base, 'biseccion')).toBe('recomendado')
    expect(nivel(base, 'falsa')).toBe('posible')
  })
  it('con prioridad de velocidad, derivada y buen x₀: Newton y falsa posición recomendados', () => {
    const r = { ...base, prioridad: 'velocidad' as const }
    expect(nivel(r, 'newton')).toBe('recomendado')
    expect(nivel(r, 'falsa')).toBe('recomendado')
  })
  it('sin cambio de signo, los métodos cerrados no son recomendables', () => {
    const r = { ...base, signo: 'no' as const }
    expect(nivel(r, 'biseccion')).toBe('no')
    expect(nivel(r, 'falsa')).toBe('no')
  })
  it('«no lo sé»: la bisección es posible pero se pide tantear f', () => {
    const rec = recomendarMetodos({ ...base, signo: 'nose' }).recomendaciones.find((x) => x.id === 'biseccion')!
    expect(rec.nivel).toBe('posible')
    expect(rec.razones.join(' ')).toMatch(/tantea/)
  })
  it('sin derivada, Newton no se recomienda y la secante sí con buen punto inicial', () => {
    const r = { ...base, derivada: 'no' as const, prioridad: 'velocidad' as const }
    expect(nivel(r, 'newton')).toBe('no')
    expect(nivel(r, 'secante')).toBe('recomendado')
  })
  it('sin buen punto inicial, Newton solo es posible y se aconseja acotar antes', () => {
    const rec = recomendarMetodos({ ...base, inicial: 'no', signo: 'no' }).recomendaciones.find((x) => x.id === 'newton')!
    expect(rec.nivel).toBe('posible')
    expect(rec.razones.join(' ')).toMatch(/acote/)
  })
  it('un polinomio con todas las raíces recomienda Newton–Horner con deflación', () => {
    const r = { ...base, polinomio: 'si' as const }
    expect(nivel(r, 'todas')).toBe('recomendado')
    expect(recomendarMetodos(r).plan).toMatch(/Horner/)
  })
  it('si no es polinomio, «todas las raíces» no se recomienda', () => {
    expect(nivel(base, 'todas')).toBe('no')
  })
  it('las recomendaciones salen ordenadas: recomendado, posible y no recomendado', () => {
    const orden = recomendarMetodos({ ...base, derivada: 'no' }).recomendaciones.map((x) => x.nivel)
    const ranking = { recomendado: 0, posible: 1, no: 2 }
    expect(orden.map((n) => ranking[n])).toEqual([...orden.map((n) => ranking[n])].sort())
  })
  it('el plan es coherente con la información disponible', () => {
    expect(recomendarMetodos({ ...base, prioridad: 'velocidad' }).plan).toMatch(/híbrido/)
    expect(recomendarMetodos({ ...base, derivada: 'no', prioridad: 'velocidad' }).plan).toMatch(/falsa posición o secante/)
    expect(recomendarMetodos({ ...base, signo: 'no', derivada: 'no' }).plan).toMatch(/secante/)
    expect(recomendarMetodos({ signo: 'no', derivada: 'no', inicial: 'no', polinomio: 'no', prioridad: 'garantia' }).plan).toMatch(/grafique o tabule/)
  })
})
