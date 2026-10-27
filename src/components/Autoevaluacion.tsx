import { useState } from 'react'
import { calificar, puntaje, type Pregunta, type Respuesta } from '../core/autoevaluacion'

const ROTULO = { correcta: '✔ Correcta', incorrecta: '✖ Incorrecta', sin_responder: '⚠ Sin responder', invalida: '⚠ Respuesta no válida' } as const

export default function Autoevaluacion({ preguntas }: { preguntas: Pregunta[] }) {
  const [resp, setResp] = useState<Record<string, Respuesta>>({})
  const [revisado, setRevisado] = useState(false)
  const poner = (id: string, v: Respuesta) => { setResp({ ...resp, [id]: v }); setRevisado(false) }
  const total = puntaje(preguntas, resp)

  return (
    <form className="autoevaluacion" onSubmit={(e) => { e.preventDefault(); setRevisado(true) }} noValidate>
      {preguntas.map((p, i) => {
        const v = revisado ? calificar(p, resp[p.id]) : null
        return (
          <fieldset key={p.id} className="pregunta">
            <legend>Pregunta {i + 1}</legend>
            <p>{p.enunciado}</p>
            {p.tipo === 'opcion' && p.opciones.map((o, k) => (
              <label key={k} className="opcion">
                <input type="radio" name={p.id} checked={resp[p.id] === k} onChange={() => poner(p.id, k)} /> {o}
              </label>
            ))}
            {p.tipo === 'vf' && ([true, false] as const).map((b) => (
              <label key={String(b)} className="opcion">
                <input type="radio" name={p.id} checked={resp[p.id] === b} onChange={() => poner(p.id, b)} /> {b ? 'Verdadero' : 'Falso'}
              </label>
            ))}
            {p.tipo === 'numerica' && (
              <label className="campo">
                Tu respuesta (se acepta ± {p.tolerancia})
                <input inputMode="decimal" value={String(resp[p.id] ?? '')} onChange={(e) => poner(p.id, e.target.value)}
                  aria-invalid={v?.estado === 'invalida' ? true : undefined} />
              </label>
            )}
            {v && (
              <div className={`estado ${v.estado === 'correcta' ? 'estado-ok' : 'estado-error'}`} role="status">
                <strong>{ROTULO[v.estado]}</strong>{v.detalle ? ` ${v.detalle}` : ''}
                {v.estado !== 'sin_responder' && v.estado !== 'invalida' && <span> {p.explicacion}</span>}
                {v.estado !== 'sin_responder' && v.estado !== 'invalida' && p.tipo === 'opcion' && p.porOpcion && typeof resp[p.id] === 'number' && (
                  <p className="por-opcion"><strong>Sobre tu elección:</strong> {p.porOpcion[resp[p.id] as number]}</p>
                )}
                {v.estado !== 'sin_responder' && v.estado !== 'invalida' && p.profundiza && (
                  <details className="profundiza">
                    <summary>Profundiza</summary>
                    <p>{p.profundiza}</p>
                  </details>
                )}
              </div>
            )}
          </fieldset>
        )
      })}
      <div className="acciones">
        <button type="submit">Comprobar respuestas</button>
        <button type="button" onClick={() => { setResp({}); setRevisado(false) }}>Reiniciar</button>
      </div>
      {revisado && <p role="status" className="retorno">Puntaje: {total} de {preguntas.length}</p>}
    </form>
  )
}
