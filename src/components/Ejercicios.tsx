import { useState } from 'react'
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
  /** Plan de solución: elegir el método antes de ver la pista o la solución. */
  plan?: PlanSolucion
  /** Ayuda intermedia entre el plan y la solución completa. */
  pista?: React.ReactNode
  /** Verificación opcional con la calculadora del módulo. */
  verificar?: React.ReactNode
  solucion: React.ReactNode
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

/** Cada ayuda se oculta tras su propio botón: primero el plan, luego la pista y al final la solución. */
export default function Ejercicios({ items }: { items: Ejercicio[] }) {
  const [visibles, setVisibles] = useState<Record<string, boolean>>({})
  const alternar = (k: string) => setVisibles((v) => ({ ...v, [k]: !v[k] }))
  return (
    <ol className="ejercicios">
      {items.map((e, i) => {
        const abierto = !!visibles[e.id]
        const pista = !!visibles[`${e.id}-pista`]
        const idSol = `sol-${e.id}`
        const idPista = `pista-${e.id}`
        return (
          <li key={e.id} className="ejercicio">
            <h3>Ejercicio {i + 1} · <span className="nivel">{e.nivel}</span>: {e.titulo}</h3>
            <div>{e.enunciado}</div>
            {e.plan && <Plan id={e.id} plan={e.plan} />}
            {e.verificar && <p className="aviso">{e.verificar}</p>}
            <div className="acciones">
              {e.pista && (
                <button type="button" aria-expanded={pista} aria-controls={idPista} onClick={() => alternar(`${e.id}-pista`)}>
                  {pista ? `Ocultar pista del ejercicio ${i + 1}` : `Ver pista del ejercicio ${i + 1}`}
                </button>
              )}
              <button type="button" aria-expanded={abierto} aria-controls={idSol} onClick={() => alternar(e.id)}>
                {abierto ? `Ocultar solución del ejercicio ${i + 1}` : `Ver solución del ejercicio ${i + 1}`}
              </button>
            </div>
            {pista && <div id={idPista} className="pista">{e.pista}</div>}
            {abierto && <div id={idSol} className="solucion">{e.solucion}</div>}
          </li>
        )
      })}
    </ol>
  )
}
