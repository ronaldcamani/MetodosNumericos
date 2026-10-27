import { INICIAL_SISTEMA, recomendarSistema, type RespuestasSistema } from './m2/decision'
import { INICIAL_DATOS, recomendarDatos, type RespuestasDatos } from './m3/decision'
import { INICIAL_EDO, recomendarEdo, type RespuestasEdo } from './m5/decision'
import { INICIAL_INTEGRAL, recomendarIntegral, type RespuestasIntegral } from './m4/decision'

const nivel = (a: { recomendaciones: { id: string; nivel: string }[] }, id: string) => a.recomendaciones.find((x) => x.id === id)!.nivel

describe('Analiza y decide: sistemas lineales', () => {
  const r = (c: Partial<RespuestasSistema>) => recomendarSistema({ ...INICIAL_SISTEMA, ...c })
  it('pequeño y dominante: ambos sirven, el directo recomendado', () => {
    expect(nivel(r({}), 'gauss')).toBe('recomendado')
    expect(nivel(r({}), 'gs')).toBe('posible')
  })
  it('grande, dominante y con aproximación aceptable: Gauss-Seidel recomendado', () => {
    const a = r({ tamano: 'grande', prioridad: 'aproximar' })
    expect(nivel(a, 'gs')).toBe('recomendado')
    expect(nivel(a, 'gauss')).toBe('posible')
    expect(a.plan).toMatch(/Gauss-Seidel/)
  })
  it('sin dominancia: Gauss-Seidel solo posible (reordenar) y el plan lo menciona', () => {
    const a = r({ dominante: 'no' })
    expect(nivel(a, 'gs')).toBe('posible')
    expect(a.plan).toMatch(/reordene|Reordene/i)
  })
  it('«no lo sé»: se pide comprobar la dominancia', () => {
    expect(r({ dominante: 'nose' }).recomendaciones.find((x) => x.id === 'gs')!.razones.join(' ')).toMatch(/Primero comprueba/)
  })
  it('posible singular: la eliminación se recomienda siempre y Gauss-Seidel no', () => {
    const a = r({ singular: 'si', tamano: 'grande', prioridad: 'aproximar' })
    expect(nivel(a, 'gauss')).toBe('recomendado')
    expect(nivel(a, 'gs')).toBe('no')
    expect(a.plan).toMatch(/singular/)
  })
  it('las recomendaciones salen ordenadas y cada una tiene herramienta para la calculadora', () => {
    const a = r({ singular: 'si' })
    expect(a.recomendaciones.map((x) => x.nivel)).toEqual(['recomendado', 'no'])
    expect(a.recomendaciones.map((x) => x.preset?.herramienta)).toEqual(['gauss', 'gs'])
  })
})

describe('Analiza y decide: interpolación y ajuste', () => {
  const r = (c: Partial<RespuestasDatos>) => recomendarDatos({ ...INICIAL_DATOS, ...c })
  it('datos exactos, pocos nodos, consulta dentro: Lagrange recomendado y la recta solo posible', () => {
    expect(nivel(r({}), 'lagrange')).toBe('recomendado')
    expect(nivel(r({}), 'regresion')).toBe('posible')
  })
  it('con ruido y sin necesidad de pasar por los puntos: regresión recomendada y Lagrange no', () => {
    const a = r({ datos: 'ruido', pasar: 'no' })
    expect(nivel(a, 'regresion')).toBe('recomendado')
    expect(nivel(a, 'lagrange')).toBe('no')
    expect(a.plan).toMatch(/recta/)
  })
  it('con ruido pero exigiendo pasar por los puntos: Lagrange posible, con la advertencia del ruido', () => {
    const a = r({ datos: 'ruido', pasar: 'si' })
    expect(nivel(a, 'lagrange')).toBe('posible')
    expect(a.recomendaciones.find((x) => x.id === 'lagrange')!.razones.join(' ')).toMatch(/no elimina el error de medición/)
  })
  it('abscisa repetida: Lagrange no y la regresión admite réplicas', () => {
    const a = r({ repetidas: 'si' })
    expect(nivel(a, 'lagrange')).toBe('no')
    expect(a.recomendaciones.find((x) => x.id === 'regresion')!.razones.join(' ')).toMatch(/réplicas/)
  })
  it('muchos nodos y consulta fuera: avisos de Runge y de extrapolación', () => {
    const a = r({ cantidad: 'muchos', consulta: 'fuera' })
    expect(nivel(a, 'lagrange')).toBe('posible')
    const razones = a.recomendaciones.find((x) => x.id === 'lagrange')!.razones.join(' ')
    expect(razones).toMatch(/Runge/)
    expect(razones).toMatch(/extrapolación/)
    expect(a.plan).toMatch(/pocos nodos/)
  })
})

describe('Analiza y decide: integración', () => {
  const r = (c: Partial<RespuestasIntegral>) => recomendarIntegral({ ...INICIAL_INTEGRAL, ...c })
  it('tasa suave, n par y alta precisión: Simpson recomendado', () => {
    expect(nivel(r({}), 'simpson')).toBe('recomendado')
    expect(nivel(r({}), 'trapecio')).toBe('posible')
  })
  it('n impar: Simpson no (exige par) y el trapecio recomendado', () => {
    const a = r({ n: 'impar' })
    expect(nivel(a, 'simpson')).toBe('no')
    expect(nivel(a, 'trapecio')).toBe('recomendado')
    expect(a.plan).toMatch(/n par/)
  })
  it('tasa no suave: el trapecio es más predecible', () => {
    const a = r({ suave: 'no' })
    expect(nivel(a, 'trapecio')).toBe('recomendado')
    expect(nivel(a, 'simpson')).toBe('posible')
  })
  it('evaluación cara en una tasa suave: Simpson por precisión con menos nodos', () => {
    const a = r({ precision: 'moderada', costo: 'caro' })
    expect(nivel(a, 'simpson')).toBe('recomendado')
  })
  it('precisión moderada y evaluación barata: el trapecio basta', () => {
    const a = r({ precision: 'moderada' })
    expect(nivel(a, 'trapecio')).toBe('recomendado')
  })
})

describe('Analiza y decide: ecuaciones diferenciales', () => {
  const r = (c: Partial<RespuestasEdo>) => recomendarEdo({ ...INICIAL_EDO, ...c })
  it('precisión moderada y paso libre: Euler recomendado', () => {
    expect(nivel(r({}), 'euler')).toBe('recomendado')
    expect(nivel(r({}), 'rk4')).toBe('posible')
  })
  it('precisión alta: RK4 recomendado y Euler no (hacen falta miles de pasos)', () => {
    const a = r({ precision: 'alta' })
    expect(nivel(a, 'rk4')).toBe('recomendado')
    expect(nivel(a, 'euler')).toBe('no')
  })
  it('paso impuesto grande: RK4 recomendado y se avisa de la estabilidad', () => {
    const a = r({ paso: 'impuesto' })
    expect(nivel(a, 'rk4')).toBe('recomendado')
    expect(a.recomendaciones.find((x) => x.id === 'euler')!.razones.join(' ')).toMatch(/2\/k/)
  })
  it('constante grande y paso impuesto: Euler no recomendado y el plan empieza por la estabilidad', () => {
    const a = r({ rigidez: 'si', paso: 'impuesto' })
    expect(nivel(a, 'euler')).toBe('no')
    expect(a.plan).toMatch(/estabilidad/)
  })
  it('evaluación cara con alta precisión: RK4 sigue recomendado con su justificación', () => {
    const a = r({ precision: 'alta', costo: 'caro' })
    expect(a.recomendaciones.find((x) => x.id === 'rk4')!.razones.join(' ')).toMatch(/evaluar f es caro/)
  })
  it('cada recomendación abre su herramienta', () => {
    expect(r({}).recomendaciones.map((x) => x.preset?.herramienta).sort()).toEqual(['euler', 'rk4'])
  })
})
