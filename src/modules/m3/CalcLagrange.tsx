import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { lagrange } from '../../core/m3'
import { CASO_DATOS, DATOS_REPETIDOS, DATOS_RUNGE, EditorDatos, leerDatos, type FDatos } from './datos'
import { EJE_X, EJE_Y, intervaloDibujo, trazaConsulta, trazaDatos, trazaLagrange } from './graficos'

type Salida = { res: ReturnType<typeof lagrange>; x: number[]; y: number[]; consulta: number }

function ejecutar(v: FDatos) {
  const d = leerDatos(v)
  if ('errores' in d) return { errores: d.errores }
  return { salida: { res: lagrange(d), ...d } }
}

export default function CalcLagrange() {
  const c = useCalculadora<FDatos, Salida>(CASO_DATOS, ejecutar)
  const s = c.salida
  const r = s?.res.resultado
  return (
    <Calculadora
      titulo="Calculadora de interpolación de Lagrange"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular(DATOS_RUNGE)} title="6 nodos de 1/(1+25x²): el polinomio oscila">Ejemplo de oscilación (6 nodos)</button>
          <button type="button" onClick={() => c.cargarYCalcular(DATOS_REPETIDOS)}>Probar fallo: abscisa repetida</button>
        </>
      }
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <>
              <dl className="resumen">
                <dt>Valor interpolado P({fmt(s.consulta, 6)})</dt><dd>{fmt(r.valor, 10)}</dd>
                <dt>Grado del polinomio</dt><dd>{r.grado}</dd>
                <dt>Intervalo de los datos</dt><dd>[{fmt(r.intervalo[0])}, {fmt(r.intervalo[1])}]</dd>
              </dl>
              <TablaPasos titulo="Contribución de cada base de Lagrange" archivoCSV="lagrange-bases.csv" pasos={s.res.pasos} columnas={[
                { clave: 'i', titulo: 'i', valor: (p) => p.i },
                { clave: 'x', titulo: 'xᵢ', valor: (p) => p.xi },
                { clave: 'y', titulo: 'yᵢ', valor: (p) => p.yi },
                { clave: 'L', titulo: 'Lᵢ(x)', valor: (p) => p.base },
                { clave: 'c', titulo: 'yᵢ · Lᵢ(x)', valor: (p) => p.contribucion },
              ]} />
              <p>La suma de las contribuciones es P({fmt(s.consulta, 6)}) = {fmt(r.valor, 10)}. Las bases suman 1: {fmt(s.res.pasos.reduce((a, p) => a + p.base, 0), 10)}.</p>
              <Grafico titulo="Polinomio de Lagrange y datos" ejeX={EJE_X} ejeY={EJE_Y}
                datos={[trazaDatos(s), trazaLagrange(s, intervaloDibujo(s.x, s.consulta)), trazaConsulta(`P(${fmt(s.consulta, 4)}) = ${fmt(r.valor, 4)}`, s.consulta, r.valor)]}
                descripcion="Puntos negros: los datos. La curva pasa exactamente por todos ellos; el rombo marca el valor interpolado en la consulta. Entre los nodos la curva puede oscilar, sobre todo con muchos nodos, y fuera del intervalo de los datos es una extrapolación." />
            </>
          )}
        </>
      )}
    >
      <EditorDatos valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
