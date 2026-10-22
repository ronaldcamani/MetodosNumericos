import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { lagrange, regresionLineal } from '../../core/m3'
import { CASO_DATOS, DATOS_REPETIDOS, DATOS_RUNGE, DATOS_X_IGUALES, EditorDatos, leerDatos, type FDatos } from './datos'
import { EJE_X, EJE_Y, intervaloDibujo, trazaConsulta, trazaDatos, trazaLagrange, trazaRecta } from './graficos'

type Salida = { lag: ReturnType<typeof lagrange>; reg: ReturnType<typeof regresionLineal>; x: number[]; y: number[]; consulta: number }

function ejecutar(v: FDatos) {
  const d = leerDatos(v)
  if ('errores' in d) return { errores: d.errores }
  // Los dos métodos son independientes: el fallo de uno no oculta la salida del otro.
  return { salida: { lag: lagrange(d), reg: regresionLineal(d), ...d } }
}

export default function Comparacion() {
  const c = useCalculadora<FDatos, Salida>(CASO_DATOS, ejecutar)
  const s = c.salida
  const l = s?.lag.resultado
  const r = s?.reg.resultado
  const diferencia = l && r ? Math.abs(l.valor - r.prediccion) : null
  const datos = s && [
    trazaDatos(s),
    ...(l ? [trazaLagrange(s, intervaloDibujo(s.x, s.consulta)), trazaConsulta(`Lagrange: ${fmt(l.valor, 4)}`, s.consulta, l.valor)] : []),
    ...(r ? [trazaRecta(r.intercepto, r.pendiente, intervaloDibujo(s.x, s.consulta)), trazaConsulta(`Regresión: ${fmt(r.prediccion, 4)}`, s.consulta, r.prediccion, 'square')] : []),
  ]
  return (
    <Calculadora
      titulo="Comparación: interpolar vs ajustar"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular(DATOS_RUNGE)}>Ejemplo de oscilación (6 nodos)</button>
          <button type="button" onClick={() => c.cargarYCalcular(DATOS_REPETIDOS)}>Probar fallo: abscisa repetida</button>
          <button type="button" onClick={() => c.cargarYCalcular(DATOS_X_IGUALES)}>Probar fallo: todas las x iguales</button>
        </>
      }
      salida={s && datos && (
        <>
          <div><strong>Interpolación de Lagrange</strong><MensajeEstado estado={s.lag.estado} mensaje={s.lag.mensaje} /></div>
          <div><strong>Regresión lineal</strong><MensajeEstado estado={s.reg.estado} mensaje={s.reg.mensaje} /></div>
          {[...(l?.advertencias ?? []), ...(r?.advertencias.filter((a) => !l?.advertencias.includes(a)) ?? [])].map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          <TablaPasos titulo="Comparación en la consulta" archivoCSV="comparacion-m3.csv"
            pasos={[
              { m: 'Lagrange', v: l?.valor ?? null, e: 'sobre los datos: 0 (pasa por todos)', g: l ? `polinomio de grado ${l.grado}` : '—' },
              { m: 'Regresión lineal', v: r?.prediccion ?? null, e: r ? fmt(r.sse, 8) : '—', g: r ? 'recta (grado 1)' : '—' },
            ]}
            columnas={[
              { clave: 'm', titulo: 'método', valor: (f) => f.m },
              { clave: 'v', titulo: `valor en x = ${fmt(s.consulta, 6)}`, valor: (f) => f.v },
              { clave: 'e', titulo: 'suma de cuadrados de residuos', valor: (f) => f.e },
              { clave: 'g', titulo: 'modelo', valor: (f) => f.g },
            ]} />
          {diferencia !== null && (
            <p className="aviso">
              Diferencia entre ambos valores: {fmt(diferencia, 8)}. No coinciden porque responden preguntas distintas: Lagrange exige pasar por <em>todos</em> los puntos (incluido su ruido de medición), mientras que la recta sacrifica pasar por ellos para capturar la tendencia con la menor suma de cuadrados de residuos. Interpolar no elimina el error de medición: lo reproduce.
            </p>
          )}
          <Grafico titulo="Datos, polinomio de Lagrange y recta de regresión" ejeX={EJE_X} ejeY={EJE_Y} datos={datos}
            descripcion="La curva continua pasa por todos los puntos; la recta discontinua sigue la tendencia. Los marcadores distintos (rombo y cuadrado) indican cada valor en la consulta sin depender solo del color." />
        </>
      )}
    >
      <EditorDatos valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
