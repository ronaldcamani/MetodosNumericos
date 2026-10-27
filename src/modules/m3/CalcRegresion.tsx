import Calculadora from '../../components/Calculadora'
import Grafico from '../../components/Grafico'
import MensajeEstado from '../../components/MensajeEstado'
import TablaPasos from '../../components/TablaPasos'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import { regresionLineal } from '../../core/m3'
import { CASO_DATOS, DATOS_X_IGUALES, EditorDatos, leerDatos, type FDatos } from './datos'
import { EJE_X, EJE_Y, intervaloDibujo, trazaConsulta, trazaDatos, trazaRecta, trazaResiduos } from './graficos'

type Salida = { res: ReturnType<typeof regresionLineal>; x: number[]; y: number[]; consulta: number }

function ejecutar(v: FDatos) {
  const d = leerDatos(v)
  if ('errores' in d) return { errores: d.errores }
  return { salida: { res: regresionLineal(d), ...d } }
}

export default function CalcRegresion({ preset = null }: { preset?: PresetActivo | null }) {
  const c = useCalculadora<FDatos, Salida>(CASO_DATOS, ejecutar)
  useAplicarPreset('regresion', preset, (valores) => c.cargarYCalcular({ ...CASO_DATOS, ...valores }))
  const s = c.salida
  const r = s?.res.resultado
  return (
    <Calculadora
      titulo="Calculadora de regresión lineal"
      onCalcular={c.calcular}
      onCargarCaso={c.cargarCaso}
      onRestablecer={c.restablecer}
      extras={<button type="button" onClick={() => c.cargarYCalcular(DATOS_X_IGUALES)}>Probar fallo: todas las x iguales</button>}
      salida={s && (
        <>
          <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
          {r?.advertencias.map((a) => <p key={a} className="advertencia" role="note">⚠ {a}</p>)}
          {r && (
            <>
              <dl className="resumen">
                <dt>Recta ajustada</dt><dd>y = {fmt(r.intercepto, 8)} + {fmt(r.pendiente, 8)}·x</dd>
                <dt>Pendiente b₁ = Sxy / Sxx</dt><dd>{fmt(r.pendiente, 10)}</dd>
                <dt>Intercepto b₀ = ȳ − b₁·x̄</dt><dd>{fmt(r.intercepto, 10)}</dd>
                <dt>Suma de cuadrados de los residuos</dt><dd>{fmt(r.sse, 10)}</dd>
                <dt>R²</dt><dd>{r.r2 === null ? 'no definido' : fmt(r.r2, 8)}</dd>
                <dt>Predicción ŷ({fmt(s.consulta, 6)})</dt><dd>{fmt(r.prediccion, 10)}</dd>
              </dl>
              <TablaPasos titulo="Valores ajustados y residuos" archivoCSV="regresion-residuos.csv" pasos={s.res.pasos} columnas={[
                { clave: 'i', titulo: 'i', valor: (p) => p.i + 1 },
                { clave: 'x', titulo: 'xᵢ', valor: (p) => p.x },
                { clave: 'y', titulo: 'yᵢ', valor: (p) => p.y },
                { clave: 'a', titulo: 'ŷᵢ', valor: (p) => p.yAjustada },
                { clave: 'r', titulo: 'residuo yᵢ − ŷᵢ', valor: (p) => p.residuo },
                { clave: 'r2', titulo: 'residuo²', valor: (p) => p.residuo2 },
              ]} />
              <Grafico titulo="Recta de mínimos cuadrados y residuos" ejeX={EJE_X} ejeY={EJE_Y}
                datos={[trazaDatos(s), trazaRecta(r.intercepto, r.pendiente, intervaloDibujo(s.x, s.consulta)), trazaResiduos(s.res.pasos), trazaConsulta(`ŷ(${fmt(s.consulta, 4)}) = ${fmt(r.prediccion, 4)}`, s.consulta, r.prediccion, 'square')]}
                descripcion="La recta resume la tendencia y no tiene por qué pasar por los datos. Los segmentos rojos punteados son los residuos yᵢ − ŷᵢ: la recta elegida minimiza la suma de sus cuadrados." />
            </>
          )}
        </>
      )}
    >
      <EditorDatos valores={c.valores} errores={c.errores} set={c.set} />
    </Calculadora>
  )
}
