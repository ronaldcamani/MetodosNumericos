import { useState } from 'react'
import { useCalculadoraLateral, type PresetCalculadora } from './PanelCalculadora'

export type Nivel = 'recomendado' | 'posible' | 'no'

export interface Recomendacion {
  id: string
  nombre: string
  nivel: Nivel
  razones: string[]
  /** Herramienta y datos con los que se prueba este método en la calculadora lateral. */
  preset?: PresetCalculadora
}

export interface AnalisisDecision {
  recomendaciones: Recomendacion[]
  plan: string
}

export interface PreguntaDecision<R> {
  clave: keyof R & string
  texto: string
  opciones: [valor: string, texto: string][]
}

export interface ProblemaPlanteado<R> {
  id: string
  titulo: string
  enunciado: React.ReactNode
  /** Lo que se observa del problema (lleva a las respuestas del analizador). */
  analisis: React.ReactNode
  respuestas: R
  /** Datos que se cargan en la calculadora al probar un método sobre este problema. */
  valores?: Record<string, string>
}

interface Props<R extends Record<string, string>> {
  problemas: ProblemaPlanteado<R>[]
  preguntas: PreguntaDecision<R>[]
  inicial: R
  recomendar: (r: R) => AnalisisDecision
}

const ROTULO: Record<Nivel, string> = { recomendado: '✔ Recomendado', posible: '⚠ Posible, con reservas', no: '✖ No recomendado' }

/**
 * «Analiza y decide»: el estudiante describe su problema (o elige uno de los planteados) y el portal explica qué métodos
 * convienen, cuáles no y por qué, con un plan de solución. La decisión final es suya: puede probar cualquiera en la calculadora.
 */
export default function Decisor<R extends Record<string, string>>({ problemas, preguntas, inicial, recomendar }: Props<R>) {
  const [r, setR] = useState<R>(inicial)
  const [elegido, setElegido] = useState<string | null>(null)
  const panel = useCalculadoraLateral()
  const { recomendaciones, plan } = recomendar(r)
  const problema = problemas.find((p) => p.id === elegido)
  return (
    <div className="decisor">
      <div className="dos-columnas">
        {problemas.map((p) => (
          <div key={p.id} className="problema">
            <span className="etiqueta">Problema</span>
            <h4>{p.titulo}</h4>
            {p.enunciado}
            <button type="button" aria-pressed={elegido === p.id} onClick={() => { setElegido(p.id); setR(p.respuestas) }}>Analizar este problema</button>
          </div>
        ))}
      </div>
      {problema && (
        <div className="idea" role="status">
          <strong>Cómo lo analizamos: {problema.titulo}.</strong>
          {problema.analisis}
        </div>
      )}
      <h3>Describe tu problema</h3>
      <p>Responde según lo que sabes de tu problema. Las respuestas cambian la recomendación al instante; tú decides qué método probar.</p>
      <div className="preguntas">
        {preguntas.map((q) => (
          <fieldset key={q.clave}>
            <legend>{q.texto}</legend>
            {q.opciones.map(([v, t]) => (
              <label key={v} className="opcion">
                <input type="radio" name={`dec-${q.clave}`} checked={r[q.clave] === v} onChange={() => setR({ ...r, [q.clave]: v })} /> {t}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <h3>Análisis</h3>
      <ul className="recomendaciones" style={{ listStyle: 'none', padding: 0 }}>
        {recomendaciones.map((x) => (
          <li key={x.id} className="recomendacion" data-nivel={x.nivel}>
            <h4>{x.nombre} · {ROTULO[x.nivel]}</h4>
            {x.razones.map((t) => <p key={t}>{t}</p>)}
            {x.nivel !== 'no' && x.preset && panel && (
              <button type="button" onClick={() => panel.abrir({ ...x.preset!, valores: { ...problema?.valores, ...x.preset!.valores } })}>Probar {x.nombre} en la calculadora</button>
            )}
          </li>
        ))}
      </ul>
      <p className="aviso"><strong>Plan de solución sugerido.</strong> {plan}</p>
    </div>
  )
}
