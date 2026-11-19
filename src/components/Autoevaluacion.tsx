import { useMemo, useState } from 'react'
import { calificar, puntaje, type Pregunta, type Respuesta } from '../core/autoevaluacion'
import { parseNumero } from '../core/entrada'
import {
  crearTutorDesdePregunta,
  generarRondaGuiada,
  inferirTemaDesdePreguntas,
  type EjercicioGuiado,
  type PasoEncadenado,
  type TemaId,
} from '../core/practica/bancoGuiado'
import CaritaEstado, { BarraComprension, type EstadoCarita } from './CaritaEstado'
import Texto from './Texto'
import TutorPasoAPaso from './TutorPasoAPaso'

const ROTULO = {
  correcta: '✔ Correcta',
  incorrecta: '✖ Incorrecta',
  sin_responder: '⚠ Sin responder',
  invalida: '⚠ Respuesta no válida',
} as const

interface EstadoPasoGuiado {
  intentos: number
  resuelto: boolean
  usoTutor: boolean
  ultimoError: string | null
}

const ESTADO_PASO_INICIAL = (): EstadoPasoGuiado => ({
  intentos: 0,
  resuelto: false,
  usoTutor: false,
  ultimoError: null,
})

function TarjetaPasoGuiado({
  ejId,
  paso,
  desbloqueado,
  estado,
  onEvaluar,
  onUsoTutor,
}: {
  ejId: string
  paso: PasoEncadenado
  desbloqueado: boolean
  estado: EstadoPasoGuiado
  onEvaluar: (acierto: boolean, error?: string) => void
  onUsoTutor: () => void
}) {
  const [opcionSel, setOpcionSel] = useState<number | null>(null)
  const [valorNum, setValorNum] = useState('')
  const [tutorAbierto, setTutorAbierto] = useState(false)

  if (!desbloqueado) {
    return (
      <li className="guiado-paso guiado-paso-bloqueado">
        <span className="guiado-paso-titulo">🔒 {paso.etiqueta}</span>
        <span className="suave">Completa el paso anterior para desbloquear este razonamiento.</span>
      </li>
    )
  }

  const carita: EstadoCarita = estado.resuelto
    ? estado.usoTutor
      ? 'aprendiendo'
      : estado.intentos <= 1
        ? 'excelente'
        : 'bien'
    : estado.ultimoError
      ? 'trampa'
      : 'analizando'

  const comprobar = () => {
    if (paso.tipo === 'opcion') {
      if (opcionSel === null) {
        onEvaluar(false, 'Selecciona una alternativa antes de comprobar este paso.')
        return
      }
      const ok = opcionSel === paso.correctaOpcion
      onEvaluar(ok, ok ? undefined : paso.trampa)
      return
    }
    const num = parseNumero(valorNum)
    if (num === null) {
      onEvaluar(false, 'Ingresa un número válido (puedes usar coma o punto decimal).')
      return
    }
    const tol = paso.tolerancia ?? 1e-3
    const ok = Math.abs(num - (paso.correctaNumero ?? 0)) <= tol + 1e-12
    onEvaluar(ok, ok ? undefined : paso.trampa)
  }

  return (
    <li className={`guiado-paso${estado.resuelto ? ' guiado-paso-ok' : ''}`}>
      <div className="guiado-paso-cabecera">
        <strong>{paso.etiqueta}</strong>
        <CaritaEstado estado={carita} compacto />
      </div>

      <p className="guiado-enunciado">
        <Texto texto={paso.enunciado} />
      </p>

      {paso.tipo === 'opcion' && paso.opciones && (
        <div className="guiado-opciones">
          {paso.opciones.map((op, idx) => (
            <label key={idx} className="opcion opcion-card">
              <input
                type="radio"
                name={`${ejId}-p${paso.numero}`}
                checked={opcionSel === idx}
                disabled={estado.resuelto}
                onChange={() => setOpcionSel(idx)}
              />
              <span><Texto texto={op} /></span>
            </label>
          ))}
        </div>
      )}

      {paso.tipo === 'numerica' && (
        <label className="campo">
          Tu respuesta numérica (tolerancia ± {paso.tolerancia ?? 0.001})
          <input
            inputMode="decimal"
            value={valorNum}
            disabled={estado.resuelto}
            onChange={(e) => setValorNum(e.target.value)}
          />
        </label>
      )}

      <div className="acciones">
        {!estado.resuelto && (
          <button type="button" onClick={comprobar}>
            Comprobar paso {paso.numero}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (!tutorAbierto && !estado.resuelto) onUsoTutor()
            setTutorAbierto((v) => !v)
          }}
        >
          {tutorAbierto ? 'Ocultar guía paso a paso' : 'Ver guía paso a paso / Solucionario'}
        </button>
      </div>

      {estado.ultimoError && !estado.resuelto && (
        <CaritaEstado estado="trampa" mensaje={estado.ultimoError} />
      )}

      {estado.resuelto && (
        <div className="guiado-explicacion">
          <CaritaEstado
            estado={estado.usoTutor ? 'aprendiendo' : estado.intentos <= 1 ? 'excelente' : 'bien'}
            mensaje={paso.explicacion}
          />
        </div>
      )}

      {tutorAbierto && (
        <TutorPasoAPaso
          pasos={paso.tutor}
          titulo={`Solucionario guiado · ${paso.etiqueta}`}
          onCerrar={() => setTutorAbierto(false)}
        />
      )}
    </li>
  )
}

function EjercicioGuiadoCard({
  ej,
  indice,
  estados,
  onEvaluarPaso,
  onUsoTutorPaso,
}: {
  ej: EjercicioGuiado
  indice: number
  estados: [EstadoPasoGuiado, EstadoPasoGuiado, EstadoPasoGuiado]
  onEvaluarPaso: (pasoIdx: number, acierto: boolean, error?: string) => void
  onUsoTutorPaso: (pasoIdx: number) => void
}) {
  return (
    <article className="guiado-card">
      <div className="guiado-card-top">
        <h3>Ejercicio guiado {indice + 1}: {ej.titulo}</h3>
        <div className="guiado-stepper" aria-label="Progreso de los 3 pasos">
          {ej.pasos.map((p, k) => {
            const st = estados[k]
            const libre = k === 0 || estados[k - 1].resuelto
            const icono = st.resuelto ? (st.usoTutor ? '😅' : st.intentos <= 1 ? '🤩' : '😊') : libre ? '🤔' : '🔒'
            return (
              <div key={p.numero} className="guiado-step-nodo">
                {k > 0 && (
                  <span
                    className={`guiado-conector${estados[k - 1].resuelto ? ' conector-ok' : ''}`}
                    aria-hidden="true"
                  />
                )}
                <span className={`guiado-chip${st.resuelto ? ' chip-ok' : libre ? ' chip-activo' : ''}`}>
                  {icono} Paso {p.numero}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <p className="aviso">
        <Texto texto={ej.contexto} />
      </p>

      <ol className="guiado-lista-pasos">
        {ej.pasos.map((paso, k) => (
          <TarjetaPasoGuiado
            key={`${ej.id}-paso-${paso.numero}`}
            ejId={ej.id}
            paso={paso}
            desbloqueado={k === 0 || estados[k - 1].resuelto}
            estado={estados[k]}
            onEvaluar={(acierto, error) => onEvaluarPaso(k, acierto, error)}
            onUsoTutor={() => onUsoTutorPaso(k)}
          />
        ))}
      </ol>
    </article>
  )
}

const nuevaSemillaDiferente = (actual: number) => {
  let s = Math.floor(Math.random() * 900_000) + 100_000
  if (s === actual) s += 1
  return s
}

export default function Autoevaluacion({ preguntas, tema }: { preguntas: Pregunta[]; tema?: TemaId }) {
  const [resp, setResp] = useState<Record<string, Respuesta>>({})
  const [revisado, setRevisado] = useState(false)
  const [tutorAbiertoId, setTutorAbiertoId] = useState<Record<string, boolean>>({})
  const [usoTutorBase, setUsoTutorBase] = useState<Record<string, boolean>>({})
  const [modo, setModo] = useState<'base' | 'dinamico'>('base')
  const [semilla, setSemilla] = useState(101317)
  const [estadosGuiados, setEstadosGuiados] = useState<
    Record<string, [EstadoPasoGuiado, EstadoPasoGuiado, EstadoPasoGuiado]>
  >({})

  const temaEfectivo = useMemo(() => tema ?? inferirTemaDesdePreguntas(preguntas), [tema, preguntas])
  const rondaGuiada = useMemo(() => generarRondaGuiada(temaEfectivo, semilla, 3), [temaEfectivo, semilla])

  const poner = (id: string, v: Respuesta) => {
    setResp({ ...resp, [id]: v })
    setRevisado(false)
  }

  const total = puntaje(preguntas, resp)
  const sinGuiaBase = preguntas.filter(
    (p) => calificar(p, resp[p.id]).estado === 'correcta' && !usoTutorBase[p.id],
  ).length
  const conGuiaBase = preguntas.filter(
    (p) => calificar(p, resp[p.id]).estado === 'correcta' && usoTutorBase[p.id],
  ).length

  const iniciarNuevaVariacion = () => {
    setSemilla((prev) => nuevaSemillaDiferente(prev))
    setEstadosGuiados({})
    setModo('dinamico')
  }

  const getEstadosEj = (id: string): [EstadoPasoGuiado, EstadoPasoGuiado, EstadoPasoGuiado] =>
    estadosGuiados[id] ?? [ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL()]

  const evaluarPaso = (ejId: string, pasoIdx: number, acierto: boolean, error?: string) => {
    setEstadosGuiados((prev) => {
      const actual = prev[ejId] ?? [ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL()]
      const copia = [...actual] as [EstadoPasoGuiado, EstadoPasoGuiado, EstadoPasoGuiado]
      const item = copia[pasoIdx]
      copia[pasoIdx] = {
        ...item,
        intentos: item.intentos + 1,
        resuelto: acierto ? true : item.resuelto,
        ultimoError: acierto ? null : (error ?? item.ultimoError),
      }
      return { ...prev, [ejId]: copia }
    })
  }

  const marcarUsoTutor = (ejId: string, pasoIdx: number) => {
    setEstadosGuiados((prev) => {
      const actual = prev[ejId] ?? [ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL(), ESTADO_PASO_INICIAL()]
      const copia = [...actual] as [EstadoPasoGuiado, EstadoPasoGuiado, EstadoPasoGuiado]
      copia[pasoIdx] = { ...copia[pasoIdx], usoTutor: true }
      return { ...prev, [ejId]: copia }
    })
  }

  if (modo === 'dinamico') {
    const todosPasos = rondaGuiada.flatMap((ej) => getEstadosEj(ej.id))
    const resueltos = todosPasos.filter((s) => s.resuelto).length
    const sinGuia = todosPasos.filter((s) => s.resuelto && !s.usoTutor).length
    const conGuia = todosPasos.filter((s) => s.resuelto && s.usoTutor).length
    const pct = (resueltos / Math.max(todosPasos.length, 1)) * 100

    return (
      <div className="autoevaluacion autoevaluacion-dinamica">
        <div className="guiado-barra-superior">
          <div>
            <strong>Modo Guiado Multi-Paso (3 pasos encadenados por ejercicio)</strong>
            <p className="suave">
              Responde razonando cada paso en orden. Si te atascas, usa el solucionario socrático para aprender paso a paso sin copiar respuestas.
            </p>
          </div>
          <div className="acciones">
            <button type="button" className="btn-variacion" onClick={iniciarNuevaVariacion}>
              🔄 Generar nueva variación de ejercicios
            </button>
            <button type="button" onClick={() => setModo('base')}>
              Volver a autoevaluación base
            </button>
          </div>
        </div>

        <BarraComprension
          porcentaje={pct}
          sinGuia={sinGuia}
          conGuia={conGuia}
          total={todosPasos.length}
          etiqueta="Nivel de comprensión de la ronda"
        />

        {rondaGuiada.map((ej, i) => (
          <EjercicioGuiadoCard
            key={ej.id}
            ej={ej}
            indice={i}
            estados={getEstadosEj(ej.id)}
            onEvaluarPaso={(k, ok, err) => evaluarPaso(ej.id, k, ok, err)}
            onUsoTutorPaso={(k) => marcarUsoTutor(ej.id, k)}
          />
        ))}
      </div>
    )
  }

  return (
    <form className="autoevaluacion" onSubmit={(e) => { e.preventDefault(); setRevisado(true) }} noValidate>
      <div className="auto-banner-dinamico">
        <span>¿Quieres practicar ejercicios multi-paso que cambian en cada intento?</span>
        <button type="button" className="btn-variacion" onClick={iniciarNuevaVariacion}>
          🔄 Generar nueva variación de ejercicios
        </button>
      </div>

      {preguntas.map((p, i) => {
        const v = revisado ? calificar(p, resp[p.id]) : null
        const tutorAbierto = Boolean(tutorAbiertoId[p.id])
        const caritaPregunta: EstadoCarita = !v
          ? 'analizando'
          : v.estado === 'correcta'
            ? usoTutorBase[p.id]
              ? 'aprendiendo'
              : 'excelente'
            : v.estado === 'incorrecta'
              ? 'trampa'
              : 'analizando'

        return (
          <fieldset key={p.id} className="pregunta">
            <legend>Pregunta {i + 1}</legend>
            <p>{p.enunciado}</p>
            {p.tipo === 'opcion' && p.opciones.map((o, k) => (
              <label key={k} className="opcion opcion-card">
                <input type="radio" name={p.id} checked={resp[p.id] === k} onChange={() => poner(p.id, k)} /> <span>{o}</span>
              </label>
            ))}
            {p.tipo === 'vf' && ([true, false] as const).map((b) => (
              <label key={String(b)} className="opcion opcion-card">
                <input type="radio" name={p.id} checked={resp[p.id] === b} onChange={() => poner(p.id, b)} /> <span>{b ? 'Verdadero' : 'Falso'}</span>
              </label>
            ))}
            {p.tipo === 'numerica' && (
              <label className="campo">
                Tu respuesta (se acepta ± {p.tolerancia})
                <input
                  inputMode="decimal"
                  value={String(resp[p.id] ?? '')}
                  onChange={(e) => poner(p.id, e.target.value)}
                  aria-invalid={v?.estado === 'invalida' ? true : undefined}
                />
              </label>
            )}

            <div className="pregunta-pie-guia">
              <button
                type="button"
                className="btn-guia"
                onClick={() => {
                  if (!tutorAbierto && !revisado) {
                    setUsoTutorBase((prev) => ({ ...prev, [p.id]: true }))
                  }
                  setTutorAbiertoId((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                }}
              >
                {tutorAbierto ? 'Ocultar guía paso a paso' : 'Ver guía paso a paso / Solucionario'}
              </button>
              {v && <CaritaEstado estado={caritaPregunta} compacto />}
            </div>

            {tutorAbierto && (
              <TutorPasoAPaso
                pasos={crearTutorDesdePregunta(p)}
                titulo={`Tutor socrático · Pregunta ${i + 1}`}
                alCompletar={() => setUsoTutorBase((prev) => ({ ...prev, [p.id]: true }))}
                onCerrar={() => setTutorAbiertoId((prev) => ({ ...prev, [p.id]: false }))}
              />
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
        <button type="button" onClick={() => { setResp({}); setRevisado(false); setUsoTutorBase({}) }}>Reiniciar</button>
      </div>
      {revisado && (
        <>
          <p role="status" className="retorno">Puntaje: {total} de {preguntas.length}</p>
          <BarraComprension
            porcentaje={(total / Math.max(preguntas.length, 1)) * 100}
            sinGuia={sinGuiaBase}
            conGuia={conGuiaBase}
            total={preguntas.length}
          />
        </>
      )}
    </form>
  )
}
