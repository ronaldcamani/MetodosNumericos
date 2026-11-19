import { useState } from 'react'
import type { MicroPasoSocratico } from '../core/practica/base'
import CaritaEstado from './CaritaEstado'
import Texto from './Texto'

interface Props {
  pasos: MicroPasoSocratico[]
  titulo?: string
  alCompletar?: () => void
  onCerrar?: () => void
}

/**
 * Solucionario socrático interactivo ("aprender resolviendo"):
 * Nunca entrega la respuesta final de golpe; guía con reglas y micro-preguntas
 * que desbloquean cada paso al razonar correctamente.
 */
export default function TutorPasoAPaso({ pasos, titulo = 'Guía socrática paso a paso', alCompletar, onCerrar }: Props) {
  const [idx, setIdx] = useState(0)
  const [seleccion, setSeleccion] = useState<number | null>(null)
  const [estado, setEstado] = useState<'pendiente' | 'acierto' | 'trampa'>('pendiente')
  const [completado, setCompletado] = useState(false)

  if (!pasos.length) return null
  const paso = pasos[idx]
  const esUltimo = idx + 1 >= pasos.length

  const elegirOpcion = (k: number) => {
    setSeleccion(k)
    if (k === paso.correcta) {
      setEstado('acierto')
      if (esUltimo && !completado) {
        setCompletado(true)
        alCompletar?.()
      }
    } else {
      setEstado('trampa')
    }
  }

  const avanzar = () => {
    if (esUltimo) return
    setIdx((prev) => prev + 1)
    setSeleccion(null)
    setEstado('pendiente')
  }

  const reiniciar = () => {
    setIdx(0)
    setSeleccion(null)
    setEstado('pendiente')
    setCompletado(false)
  }

  return (
    <div className="tutor-socratico" aria-label={titulo}>
      <div className="tutor-cabecera">
        <div className="tutor-cabecera-info">
          <strong>🧭 {titulo} · Sub-paso {idx + 1} de {pasos.length}</strong>
          <div className="tutor-stepper" aria-hidden="true">
            {pasos.map((_, k) => (
              <span
                key={k}
                className={`tutor-paso-pill${k < idx || (k === idx && estado === 'acierto') ? ' pill-ok' : k === idx ? ' pill-activo' : ''}`}
              >
                {k + 1}
              </span>
            ))}
          </div>
        </div>
        {onCerrar && (
          <button type="button" className="tutor-cerrar" onClick={onCerrar}>
            Ocultar guía
          </button>
        )}
      </div>

      <div className="tutor-regla">
        <Texto texto={paso.regla} />
      </div>

      <p className="tutor-pregunta">
        <strong>Tu turno:</strong> <Texto texto={paso.pregunta} />
      </p>

      <div className="tutor-opciones">
        {paso.opciones.map((op, k) => {
          const elegida = seleccion === k
          const clase =
            elegida && estado === 'acierto'
              ? 'tutor-opcion tutor-opcion-ok'
              : elegida && estado === 'trampa'
                ? 'tutor-opcion tutor-opcion-trampa'
                : 'tutor-opcion'
          return (
            <button
              key={k}
              type="button"
              className={clase}
              aria-pressed={elegida}
              onClick={() => elegirOpcion(k)}
            >
              <span className="tutor-letra" aria-hidden="true">{String.fromCharCode(65 + k)}</span>
              <span className="tutor-opcion-texto"><Texto texto={op} /></span>
            </button>
          )
        })}
      </div>

      {estado === 'pendiente' && (
        <CaritaEstado estado="analizando" mensaje="Elige la opción que mejor justifica este paso para desbloquear el siguiente." compacto />
      )}

      {estado === 'trampa' && (
        <CaritaEstado estado="trampa" mensaje={paso.trampa} />
      )}

      {estado === 'acierto' && (
        <div className="tutor-desbloqueado">
          <CaritaEstado
            estado={completado ? 'aprendiendo' : 'bien'}
            mensaje={completado ? `${paso.exito} ¡Guía completada paso a paso!` : paso.exito}
          />
          <div className="tutor-revelacion">
            <strong>Paso desbloqueado:</strong> <Texto texto={paso.revelacion} />
          </div>
          <div className="acciones">
            {!esUltimo && (
              <button type="button" onClick={avanzar}>
                Siguiente paso de la guía ({idx + 2} de {pasos.length}) →
              </button>
            )}
            {completado && (
              <button type="button" onClick={reiniciar}>
                Repasar guía otra vez
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
