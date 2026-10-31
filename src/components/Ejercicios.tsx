import { Children, Fragment, isValidElement, useState } from 'react'
import PasosOcultos from './PasosOcultos'
import { useProgreso } from './useProgreso'
import { useCalculadoraLateral, type PresetCalculadora } from './PanelCalculadora'

export type Veredicto = 'adecuado' | 'posible' | 'inadecuado'

export interface OpcionPlan {
  id: string
  texto: string
  veredicto: Veredicto
  /** Por qué esa elección es o no adecuada para este problema. */
  razon: string
  /** Si existe y la página tiene calculadora lateral, se ofrece probar el método elegido. */
  preset?: PresetCalculadora
}

/** «Antes de calcular»: el estudiante decide cómo resolverá el problema y recibe retroalimentación sobre su plan. */
export interface PlanSolucion {
  pregunta: string
  opciones: OpcionPlan[]
}

export interface Ejercicio {
  id: string
  nivel: 'Intermedio' | 'Avanzado'
  titulo: string
  enunciado: React.ReactNode
  /** Plan de solución: elegir el método antes de ver la solución. */
  plan?: PlanSolucion
  /** Verificación opcional con la calculadora del módulo. */
  verificar?: React.ReactNode
  /** Cada hijo directo del fragmento es un paso que el estudiante revela por separado. */
  solucion: React.ReactNode
}

function pasosDe(sol: React.ReactNode): React.ReactNode[] {
  const nodo = isValidElement<{ children?: React.ReactNode }>(sol) && sol.type === Fragment ? Children.toArray(sol.props.children) : [sol]
  return nodo.filter((x) => !(typeof x === 'string' && x.trim() === ''))
}

const ROTULO: Record<Veredicto, string> = { adecuado: '✔ Adecuado', posible: '⚠ Posible, con reservas', inadecuado: '✖ No recomendado' }

function Plan({ id, plan }: { id: string; plan: PlanSolucion }) {
  const [elegida, setElegida] = useState<string | null>(null)
  const panel = useCalculadoraLateral()
  const op = plan.opciones.find((o) => o.id === elegida)
  return (
    <fieldset className="plan">
      <legend>Tu plan: {plan.pregunta}</legend>
      {plan.opciones.map((o) => (
        <label key={o.id} className="opcion">
          <input type="radio" name={`plan-${id}`} checked={elegida === o.id} onChange={() => setElegida(o.id)} /> {o.texto}
        </label>
      ))}
      {op && (
        <div className={`plan-respuesta plan-${op.veredicto}`} role="status">
          <strong>{ROTULO[op.veredicto]}.</strong> {op.razon}
          {op.preset && panel && (
            <p><button type="button" onClick={() => panel.abrir(op.preset!)}>Probar este método en la calculadora</button></p>
          )}
        </div>
      )}
    </fieldset>
  )
}

/** El tema se deduce de la ruta (#/ecuaciones/cerrados → «ecuaciones»). */
const temaActual = () => window.location.hash.split('/')[1]?.split('?')[0] || 'general'

/** Un ejercicio abierto: enunciado, plan, espacio para el desarrollo propio y solución en tarjetas escondidas. */
function Item({ e, i }: { e: Ejercicio; i: number }) {
  const { estudiado } = useProgreso(temaActual())
  const [propio, setPropio] = useState('')
  return (
    <li className="ejercicio">
      <h3>Ejercicio {i + 1} · <span className="nivel">{e.nivel}</span>: {e.titulo}</h3>
      <div>{e.enunciado}</div>
      {e.plan && <Plan id={e.id} plan={e.plan} />}
      {e.verificar && <p className="aviso">{e.verificar}</p>}
      <label className="campo">
        Tu desarrollo del ejercicio {i + 1} (opcional; solo tú lo ves)
        <textarea rows={3} value={propio} onChange={(ev) => setPropio(ev.target.value)} placeholder="Escribe aquí tus pasos y tu resultado antes de revelar la solución." />
      </label>
      <h4 className="subtitulo-solucion">Solución paso a paso</h4>
      <PasosOcultos pasos={pasosDe(e.solucion)} nombre={`ejercicio ${i + 1}`} alCompletar={() => estudiado(e.id)} />
    </li>
  )
}

/** Cada ejercicio se resuelve primero por el estudiante; la solución aparece en tarjetas que se revelan de una en una. */
export default function Ejercicios({ items }: { items: Ejercicio[] }) {
  return (
    <ol className="ejercicios">
      {items.map((e, i) => <Item key={e.id} e={e} i={i} />)}
    </ol>
  )
}
