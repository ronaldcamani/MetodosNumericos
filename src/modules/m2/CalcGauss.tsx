import Calculadora from '../../components/Calculadora'
import MensajeEstado from '../../components/MensajeEstado'
import { useAplicarPreset, type PresetActivo } from '../../components/PanelCalculadora'
import Selector from '../../components/Selector'
import TablaPasos from '../../components/TablaPasos'
import { useCalculadora } from '../../components/useCalculadora'
import { fmt } from '../../core/formato'
import {
  descomposicionLU,
  eliminacionGauss,
  eliminacionGaussJordan,
  matrizHilbert,
  numeroCondicionInf,
  type AnalisisCondicionamiento,
  type Matriz,
} from '../../core/m2'
import { EJERCICIO_1, EJERCICIO_2 } from './ejercicios'
import { CASO_SISTEMA, crearFSistema, EditorSistema, leerSistema, MatrizTabla, SISTEMA_SINGULAR, type FSistema } from './sistema'

export type MetodoDirecto = 'gauss' | 'gauss_jordan' | 'lu'
type FDirecto = FSistema & { metodoDirecto: MetodoDirecto }

const CASO_DIRECTO: FDirecto = { ...CASO_SISTEMA, metodoDirecto: 'gauss' }
const SISTEMA_HILBERT_4: FSistema = crearFSistema(matrizHilbert(4), [1, 0, 0, 0])

type Salida =
  | { metodo: 'gauss'; res: ReturnType<typeof eliminacionGauss>; A: Matriz; b: number[]; condicion: AnalisisCondicionamiento | null }
  | { metodo: 'gauss_jordan'; res: ReturnType<typeof eliminacionGaussJordan>; A: Matriz; b: number[]; condicion: AnalisisCondicionamiento | null }
  | { metodo: 'lu'; res: ReturnType<typeof descomposicionLU>; A: Matriz; b: number[]; condicion: AnalisisCondicionamiento | null }

function ejecutar(v: FDirecto) {
  const s = leerSistema(v)
  if ('errores' in s) return { errores: s.errores }
  const condicion = numeroCondicionInf(s.A)
  if (v.metodoDirecto === 'gauss_jordan') {
    return { salida: { metodo: 'gauss_jordan' as const, res: eliminacionGaussJordan(s), A: s.A, b: s.b, condicion } }
  }
  if (v.metodoDirecto === 'lu') {
    return { salida: { metodo: 'lu' as const, res: descomposicionLU(s), A: s.A, b: s.b, condicion } }
  }
  return { salida: { metodo: 'gauss' as const, res: eliminacionGauss(s), A: s.A, b: s.b, condicion } }
}

function TablaCuadrada({ titulo, M }: { titulo: string; M: Matriz }) {
  const n = M.length
  return (
    <div className="tabla-wrap" tabIndex={0}>
      <table>
        <caption>{titulo}</caption>
        <thead>
          <tr>
            {Array.from({ length: n }, (_, j) => (
              <th key={j} scope="col">col {j + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {M.map((fila, i) => (
            <tr key={i}>
              {fila.map((v, j) => (
                <td key={j}>{fmt(v, 8)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BloqueCondicion({ condicion }: { condicion: AnalisisCondicionamiento | null }) {
  if (!condicion) return null
  const etiquetaNivel =
    condicion.nivel === 'mal_condicionado'
      ? '⚠ Mal condicionado (κ∞ > 10⁴)'
      : condicion.nivel === 'moderado'
        ? 'Condicionamiento moderado (10² < κ∞ ≤ 10⁴)'
        : '✔ Bien condicionado (κ∞ ≤ 10²)'
  return (
    <div className={condicion.malCondicionado ? 'advertencia' : 'aviso'} role={condicion.malCondicionado ? 'note' : undefined}>
      <p>
        <strong>Condicionamiento de la matriz (norma ∞):</strong>{' '}
        ‖A‖∞ = {fmt(condicion.normaA, 6)} · ‖A⁻¹‖∞ = {fmt(condicion.normaAInv, 6)} ·{' '}
        <strong>κ∞(A) = {condicion.kappaInf > 1000 ? condicion.kappaInf.toExponential(4) : fmt(condicion.kappaInf, 4)}</strong> —{' '}
        <strong>{etiquetaNivel}</strong>.
      </p>
      {condicion.malCondicionado && (
        <p>
          Con κ∞(A) &gt; 10⁴, un residuo pequeño ‖b − Ax‖∞ no garantiza que el error relativo ‖x − x̃‖/‖x‖ sea pequeño.
        </p>
      )}
    </div>
  )
}

export default function CalcGauss({ preset = null }: { preset?: PresetActivo | null }) {
  const c = useCalculadora<FDirecto, Salida>(CASO_DIRECTO, ejecutar)
  useAplicarPreset('gauss', preset, (valores) => c.cargarYCalcular({ ...CASO_DIRECTO, ...(valores as Partial<FDirecto>) }))
  const s = c.salida
  const metodo = c.valores.metodoDirecto

  return (
    <Calculadora
      titulo="Calculadora de eliminación con pivoteo parcial"
      onCalcular={c.calcular}
      onCargarCaso={() => c.cargarYCalcular({ ...CASO_DIRECTO, metodoDirecto: metodo })}
      onRestablecer={() => c.reiniciar({ ...CASO_DIRECTO, metodoDirecto: metodo })}
      extras={
        <>
          <button type="button" onClick={() => c.cargarYCalcular({ ...EJERCICIO_1, metodoDirecto: metodo })}>Ejercicio 1 (3×3)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...EJERCICIO_2, metodoDirecto: metodo })} title="a, b, c, d se identifican con x1, x2, x3, x4">Ejercicio 2 (4×4)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...SISTEMA_HILBERT_4, metodoDirecto: metodo })}>Hilbert 4×4 (κ∞ &gt; 10⁴)</button>
          <button type="button" onClick={() => c.cargarYCalcular({ ...SISTEMA_SINGULAR, metodoDirecto: metodo })}>Probar fallo: sistema singular</button>
        </>
      }
      salida={
        s && (
          <>
            <MensajeEstado estado={s.res.estado} mensaje={s.res.mensaje} />
            {s.res.resultado?.advertencias.map((a) => (
              <p key={a} className="advertencia" role="note">⚠ {a}</p>
            ))}
            {s.res.resultado && (
              <>
                <TablaPasos
                  titulo="Solución (índices normalizados de demanda)"
                  archivoCSV={`${s.metodo}-solucion.csv`}
                  pasos={s.res.resultado.x.map((x, i) => ({ i: i + 1, x }))}
                  columnas={[
                    { clave: 'i', titulo: 'incógnita', valor: (p) => `x${p.i}` },
                    { clave: 'x', titulo: 'valor', valor: (p) => p.x },
                  ]}
                />
                <p>Residuo ‖b − Ax‖∞ = {fmt(s.res.resultado.residuoInf, 8)}. Criterio de pivote: {s.res.resultado.criterio}.</p>
                <BloqueCondicion condicion={s.condicion} />
              </>
            )}

            {s.metodo === 'gauss' && s.res.pasos.length > 0 && (
              <>
                <MatrizTabla titulo="Matriz aumentada inicial [A | b]" M={s.A.map((f, i) => [...f, s.b[i]])} />
                {s.res.pasos.map((p) => (
                  <div key={p.k}>
                    <p>
                      <strong>Paso {p.k}:</strong>{' '}
                      {p.intercambio ? `intercambio de las filas ${p.intercambio[0] + 1} y ${p.intercambio[1] + 1} (pivote mayor en valor absoluto); ` : 'sin intercambio; '}
                      pivote {fmt(p.pivote, 8)}; multiplicadores {p.multiplicadores.map((m) => fmt(m, 6)).join(', ')}.
                    </p>
                    <MatrizTabla titulo={`Matriz tras el paso ${p.k}`} M={p.matriz} />
                  </div>
                ))}
              </>
            )}

            {s.metodo === 'gauss_jordan' && s.res.pasos.length > 0 && (
              <>
                <MatrizTabla titulo="Matriz aumentada inicial [A | b]" M={s.A.map((f, i) => [...f, s.b[i]])} />
                {s.res.pasos.map((p) => (
                  <div key={p.k}>
                    <p>
                      <strong>Columna {p.k} (normalizada a 1 y reducida arriba/abajo):</strong>{' '}
                      {p.intercambio ? `intercambio de las filas ${p.intercambio[0] + 1} y ${p.intercambio[1] + 1}; ` : 'sin intercambio; '}
                      pivote original {fmt(p.pivoteOriginal, 8)}.
                    </p>
                    <MatrizTabla titulo={`[A | b] tras reducir la columna ${p.k}`} M={p.matriz} />
                  </div>
                ))}
              </>
            )}

            {s.metodo === 'lu' && s.res.resultado && (
              <>
                <p className="aviso">
                  Factorización Doolittle <strong>P·A = L·U</strong> · Error de factorización ‖PA − LU‖∞ = {fmt(s.res.resultado.errorFactorizacionInf, 12)}.
                </p>
                <TablaPasos
                  titulo="Sustitución hacia adelante (L·y = P·b)"
                  pasos={s.res.resultado.y.map((y, i) => ({ i: i + 1, y, x: s.res.resultado!.x[i] }))}
                  columnas={[
                    { clave: 'i', titulo: 'índice', valor: (p) => p.i },
                    { clave: 'y', titulo: 'vector intermedio yᵢ', valor: (p) => p.y },
                    { clave: 'x', titulo: 'solución xᵢ (U·x = y)', valor: (p) => p.x },
                  ]}
                />
                <TablaCuadrada titulo="Matriz triangular inferior L (Doolittle)" M={s.res.resultado.L} />
                <TablaCuadrada titulo="Matriz triangular superior U" M={s.res.resultado.U} />
                {s.res.resultado.intercambios > 0 && (
                  <TablaCuadrada titulo="Matriz de permutación P" M={s.res.resultado.P} />
                )}
              </>
            )}
          </>
        )
      }
    >
      <Selector
        etiqueta="Método directo"
        valor={c.valores.metodoDirecto}
        onChange={(x) => c.set('metodoDirecto', x as MetodoDirecto)}
        opciones={[
          { valor: 'gauss', texto: 'Eliminación de Gauss (pivoteo parcial)' },
          { valor: 'gauss_jordan', texto: 'Eliminación de Gauss-Jordan ([I | x])' },
          { valor: 'lu', texto: 'Descomposición LU (Doolittle PA = LU)' },
        ]}
      />
      <EditorSistema valores={c.valores} errores={c.errores} set={c.set as (k: keyof FSistema, v: string) => void} />
    </Calculadora>
  )
}
