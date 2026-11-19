import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clamp } from '../core/animacionVideo'
import { AUDIOS_MANIFEST, urlAudioEscena } from '../core/audiosManifest'
import { LECCIONES_VIDEO, type ModuloVideoId } from '../core/lecciones'
import Matematica from './Matematica'
import VideoEscenarios from './VideoEscenarios'

const M = Matematica

type VelocidadVideo = 0.75 | 1 | 1.25 | 1.5
type ModoAudio = 'mp3' | 'speech' | 'silencio'
const VELOCIDADES: readonly VelocidadVideo[] = [0.75, 1, 1.25, 1.5]
const PAUSA_TRANSICION_MS = 1200

function tieneSpeech(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  )
}

function elegirVozEspanol(): SpeechSynthesisVoice | null {
  if (!tieneSpeech()) return null
  try {
    const voces = window.speechSynthesis.getVoices?.() ?? []
    return (
      voces.find((v) => /^es-(PE|419|MX|ES)/i.test(v.lang)) ??
      voces.find((v) => v.lang.toLowerCase().startsWith('es')) ??
      null
    )
  } catch {
    return null
  }
}

function detenerVoz(): void {
  if (!tieneSpeech()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Algunos navegadores lanzan si la pestaña no tuvo interacción previa.
  }
}

function hablarNarracion(texto: string, velocidad: number, onEnd?: () => void): void {
  if (!tieneSpeech()) return
  try {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(texto)
    utt.lang = 'es-PE'
    utt.rate = velocidad
    const voz = elegirVozEspanol()
    if (voz) utt.voice = voz
    if (onEnd) utt.onend = onEnd
    window.speechSynthesis.speak(utt)
  } catch {
    // Fallback silencioso manteniendo los subtítulos sincronizados.
  }
}

function fmtTiempo(seg: number): string {
  const s = Math.max(0, Math.floor(seg))
  const m = Math.floor(s / 60)
  const resto = s % 60
  return `${String(m).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

/**
 * Estudio reproductor interactivo 60 FPS estilo Remotion/HyperFrames con escenario vectorial 16:9,
 * reloj gobernado por audio neuronal pre-renderizado (MP3) para no cortar frases, pizarra KaTeX y subtítulos sincronizados.
 */
export default function VideoLeccion({ modulo }: { modulo: ModuloVideoId }) {
  return <VideoLeccionReproductor key={modulo} modulo={modulo} />
}

function VideoLeccionReproductor({ modulo }: { modulo: ModuloVideoId }) {
  const leccion = LECCIONES_VIDEO[modulo]
  const escenas = leccion.escenas

  const [escenaIdx, setEscenaIdx] = useState(0)
  const [progreso, setProgreso] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [velocidad, setVelocidad] = useState<VelocidadVideo>(1)
  const [audioActivo, setAudioActivo] = useState(true)
  const [modoCine, setModoCine] = useState(false)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [enPausaTransicion, setEnPausaTransicion] = useState(false)
  const [fallosMp3, setFallosMp3] = useState<Record<string, true>>({})

  const soporteVoz = useMemo(() => tieneSpeech(), [])
  const escenaActual = escenas[escenaIdx] ?? escenas[0]
  const metaAudio = AUDIOS_MANIFEST[escenaActual.id]
  const srcAudio = metaAudio ? urlAudioEscena(metaAudio.ruta) : null
  const modoAudio: ModoAudio =
    srcAudio && !fallosMp3[escenaActual.id]
      ? 'mp3'
      : soporteVoz
        ? 'speech'
        : 'silencio'

  const audioRef = useRef<HTMLAudioElement>(null)
  const ultimoFrameRef = useRef<number | null>(null)
  const progresoRef = useRef(0)
  const seekPendienteRef = useRef<number | null>(null)
  const transicionTimerRef = useRef<number | null>(null)
  const escenaIdxRef = useRef(escenaIdx)
  const contenedorRef = useRef<HTMLElement>(null)

  useEffect(() => {
    escenaIdxRef.current = escenaIdx
  }, [escenaIdx])

  const { duracionTotal, iniciosEscena } = useMemo(() => {
    const inicios: number[] = []
    let acc = 0
    for (const esc of escenas) {
      inicios.push(acc)
      acc += esc.duracion
    }
    return { duracionTotal: acc, iniciosEscena: inicios }
  }, [escenas])

  const tiempoTranscurrido = useMemo(() => {
    const prev = iniciosEscena[escenaIdx] ?? 0
    return prev + progreso * escenaActual.duracion
  }, [iniciosEscena, escenaIdx, progreso, escenaActual.duracion])

  const palabrasNarracion = useMemo(
    () => escenaActual.narracion.trim().split(/\s+/),
    [escenaActual.narracion],
  )

  const marcarFalloMp3 = useCallback((id: string) => {
    setFallosMp3((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
  }, [])

  const cancelarTransicion = useCallback(() => {
    if (transicionTimerRef.current !== null) {
      window.clearTimeout(transicionTimerRef.current)
      transicionTimerRef.current = null
    }
    setEnPausaTransicion(false)
  }, [])

  const programarSiguienteEscena = useCallback(() => {
    if (transicionTimerRef.current !== null) return
    progresoRef.current = 1
    setProgreso(1)
    setEnPausaTransicion(true)
    transicionTimerRef.current = window.setTimeout(() => {
      transicionTimerRef.current = null
      setEnPausaTransicion(false)
      const actual = escenaIdxRef.current
      if (actual + 1 < escenas.length) {
        progresoRef.current = 0
        setProgreso(0)
        seekPendienteRef.current = 0
        setEscenaIdx(actual + 1)
      } else {
        setReproduciendo(false)
      }
    }, PAUSA_TRANSICION_MS)
  }, [escenas.length])

  const intentarReproducirAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || modoAudio !== 'mp3' || !srcAudio) return
    try {
      audio.playbackRate = velocidad
      audio.muted = !audioActivo
      const d = audio.duration
      if (seekPendienteRef.current !== null && Number.isFinite(d) && d > 0) {
        audio.currentTime = seekPendienteRef.current * d
        seekPendienteRef.current = null
      }
      if (audio.paused) {
        const promesa = audio.play()
        if (promesa && typeof promesa.catch === 'function') {
          promesa.catch((err: unknown) => {
            const nombre = err instanceof Error ? err.name : ''
            if (nombre === 'NotSupportedError') {
              marcarFalloMp3(escenaActual.id)
            }
          })
        }
      }
    } catch {
      // Mantiene estabilidad si el navegador/jsdom no soporta reproducción directa.
    }
  }, [audioActivo, escenaActual.id, marcarFalloMp3, modoAudio, srcAudio, velocidad])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const onFullscreen = () => {
      setEnPantallaCompleta(document.fullscreenElement === contenedorRef.current)
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => document.removeEventListener('fullscreenchange', onFullscreen)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = velocidad
    audio.muted = !audioActivo
  }, [velocidad, audioActivo, srcAudio])

  useEffect(() => {
    if (!reproduciendo || enPausaTransicion) {
      if (modoAudio === 'mp3') {
        const audio = audioRef.current
        if (audio && !audio.paused) {
          try {
            audio.pause()
          } catch {
            // jsdom
          }
        }
      }
      if (modoAudio === 'speech') {
        detenerVoz()
      }
      return
    }

    if (modoAudio === 'mp3') {
      intentarReproducirAudio()
      return
    }

    if (modoAudio === 'speech') {
      if (audioActivo) {
        hablarNarracion(escenaActual.narracion, velocidad, programarSiguienteEscena)
      } else {
        detenerVoz()
      }
      return () => detenerVoz()
    }
  }, [
    reproduciendo,
    enPausaTransicion,
    modoAudio,
    escenaIdx,
    escenaActual.narracion,
    audioActivo,
    velocidad,
    intentarReproducirAudio,
    programarSiguienteEscena,
  ])

  useEffect(() => {
    if (!reproduciendo || enPausaTransicion) {
      ultimoFrameRef.current = null
      return
    }
    let rafId = 0
    const tick = (ahora: number) => {
      if (ultimoFrameRef.current === null) {
        ultimoFrameRef.current = ahora
      }
      const dt = Math.max(0, (ahora - ultimoFrameRef.current) / 1000) * velocidad
      ultimoFrameRef.current = ahora

      if (modoAudio === 'mp3') {
        const audio = audioRef.current
        if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
          const p = clamp(audio.currentTime / audio.duration, 0, 1)
          progresoRef.current = p
          setProgreso(p)
        }
      } else if (modoAudio === 'speech') {
        const hablando =
          typeof window !== 'undefined' &&
          'speechSynthesis' in window &&
          window.speechSynthesis.speaking === true
        const raw = progresoRef.current + dt / escenaActual.duracion
        const next = hablando ? Math.min(0.98, raw) : clamp(raw, 0, 1)
        progresoRef.current = next
        setProgreso(next)
        if (!hablando && next >= 1) {
          programarSiguienteEscena()
        }
      } else {
        const next = clamp(progresoRef.current + dt / escenaActual.duracion, 0, 1)
        progresoRef.current = next
        setProgreso(next)
        if (next >= 1) {
          programarSiguienteEscena()
        }
      }

      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [
    reproduciendo,
    enPausaTransicion,
    velocidad,
    modoAudio,
    escenaActual.duracion,
    programarSiguienteEscena,
  ])

  useEffect(() => {
    return () => {
      cancelarTransicion()
      detenerVoz()
    }
  }, [cancelarTransicion])

  const alCargarMetadatos = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = velocidad
    audio.muted = !audioActivo
    const d = audio.duration
    if (seekPendienteRef.current !== null && Number.isFinite(d) && d > 0) {
      audio.currentTime = seekPendienteRef.current * d
      seekPendienteRef.current = null
    }
    if (reproduciendo && !enPausaTransicion) {
      intentarReproducirAudio()
    }
  }

  const alActualizarTiempoAudio = () => {
    const audio = audioRef.current
    if (!audio || modoAudio !== 'mp3') return
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const p = clamp(audio.currentTime / audio.duration, 0, 1)
      progresoRef.current = p
      setProgreso(p)
    }
  }

  const alTerminarAudio = () => {
    if (modoAudio !== 'mp3' || !reproduciendo) return
    programarSiguienteEscena()
  }

  const alFallarAudio = () => {
    if (!srcAudio) return
    marcarFalloMp3(escenaActual.id)
  }

  const irATiempoGlobal = (tObjetivoSeg: number) => {
    const t = clamp(tObjetivoSeg, 0, duracionTotal)
    let acum = 0
    for (let i = 0; i < escenas.length; i++) {
      const d = escenas[i].duracion
      if (t < acum + d || i === escenas.length - 1) {
        const pLocal = clamp((t - acum) / d, 0, 1)
        cancelarTransicion()
        progresoRef.current = pLocal
        setProgreso(pLocal)
        ultimoFrameRef.current = null
        if (i === escenaIdx) {
          const audio = audioRef.current
          if (modoAudio === 'mp3' && audio) {
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
              audio.currentTime = pLocal * audio.duration
            } else {
              seekPendienteRef.current = pLocal
            }
          }
        } else {
          seekPendienteRef.current = pLocal
          setEscenaIdx(i)
        }
        break
      }
      acum += d
    }
  }

  const togglePlay = () => {
    if (reproduciendo) {
      cancelarTransicion()
      setReproduciendo(false)
      try {
        audioRef.current?.pause()
      } catch {
        // jsdom
      }
      detenerVoz()
      return
    }
    const alFinal = escenaIdx === escenas.length - 1 && progreso >= 0.99
    if (alFinal) {
      progresoRef.current = 0
      seekPendienteRef.current = 0
      setEscenaIdx(0)
      setProgreso(0)
    }
    ultimoFrameRef.current = null
    setReproduciendo(true)
    if (!alFinal && modoAudio === 'mp3') {
      intentarReproducirAudio()
    }
  }

  const reiniciar = () => {
    cancelarTransicion()
    setReproduciendo(false)
    setEscenaIdx(0)
    progresoRef.current = 0
    seekPendienteRef.current = 0
    setProgreso(0)
    const audio = audioRef.current
    if (audio) {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
        // jsdom
      }
    }
    detenerVoz()
  }

  const irAEscena = (idx: number) => {
    cancelarTransicion()
    progresoRef.current = 0
    seekPendienteRef.current = 0
    setProgreso(0)
    ultimoFrameRef.current = null
    if (idx === escenaIdx) {
      const audio = audioRef.current
      if (audio) {
        try {
          audio.currentTime = 0
        } catch {
          // jsdom
        }
      }
      if (reproduciendo && modoAudio === 'mp3') {
        intentarReproducirAudio()
      }
    } else {
      setEscenaIdx(idx)
    }
  }

  const cambiarVelocidad = (v: VelocidadVideo) => {
    setVelocidad(v)
    if (audioRef.current) {
      audioRef.current.playbackRate = v
    }
  }

  const toggleAudio = () => {
    const nuevo = !audioActivo
    setAudioActivo(nuevo)
    if (audioRef.current) {
      audioRef.current.muted = !nuevo
    }
    if (!nuevo && modoAudio === 'speech') {
      detenerVoz()
    }
  }

  const togglePantallaCompleta = async () => {
    const el = contenedorRef.current
    if (!el || typeof el.requestFullscreen !== 'function') {
      setModoCine((v) => !v)
      return
    }
    try {
      if (document.fullscreenElement === el && typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      setModoCine((v) => !v)
    }
  }

  const nPasos = escenaActual.pasosTex.length
  const pasosVisiblesCount =
    progreso >= 0.99
      ? nPasos
      : Math.min(
          nPasos,
          1 + Math.floor((progreso / 0.85) * Math.max(1, nPasos - 1)),
        )

  const filasVisibles = escenaActual.tabla.filas.filter(
    (f, i) => progreso >= f.umbral || i === 0,
  )

  const resaltadoActivo = reproduciendo || progreso > 0 || enPausaTransicion
  const idxPalabraActiva = resaltadoActivo
    ? Math.min(palabrasNarracion.length - 1, Math.floor(progreso * palabrasNarracion.length))
    : -1

  return (
    <section
      ref={contenedorRef}
      className={`video-leccion${modoCine ? ' video-leccion-cine' : ''}${enPantallaCompleta ? ' video-leccion-fullscreen' : ''}`}
      aria-label={`Video-lección: ${leccion.titulo}`}
    >
      <audio
        ref={audioRef}
        src={srcAudio ?? undefined}
        preload="auto"
        aria-hidden="true"
        onLoadedMetadata={alCargarMetadatos}
        onTimeUpdate={alActualizarTiempoAudio}
        onEnded={alTerminarAudio}
        onError={alFallarAudio}
      />

      <header className="video-cabecera">
        <div className="video-cabecera-titulo">
          <h3 title={leccion.subtitulo}>🎬 {leccion.titulo}</h3>
        </div>
        <div className="video-cabecera-badges">
          <span className="video-fps-badge">60 FPS · HD 16:9</span>
          <span className="video-voz-badge">
            {modoAudio === 'mp3'
              ? 'Voz neuronal HD'
              : modoAudio === 'speech'
                ? 'Voz navegador'
                : 'Solo subtítulos'}
          </span>
          <span className="video-escena-tag">
            Escena {escenaIdx + 1} / {escenas.length}
          </span>
        </div>
      </header>

      <div className="video-escenario">
        <div className="video-col-visual">
          <div className="video-pizarra">
            <VideoEscenarios
              modulo={modulo}
              visual={escenaActual.visual}
              progreso={progreso}
              duracion={escenaActual.duracion}
              escenaIdx={escenaIdx}
              totalEscenas={escenas.length}
            />
          </div>

          <div className="video-subtitulos" aria-live="off">
            <span className="video-sub-icono" aria-hidden="true">💬</span>
            <p className="video-sub-texto">
              {!resaltadoActivo
                ? escenaActual.narracion
                : palabrasNarracion.map((palabra, i) => {
                    const cls =
                      i < idxPalabraActiva
                        ? 'sub-leido'
                        : i === idxPalabraActiva
                          ? 'sub-actual'
                          : 'sub-pendiente'
                    return (
                      <Fragment key={i}>
                        <span className={cls}>{palabra}</span>
                        {i < palabrasNarracion.length - 1 ? ' ' : ''}
                      </Fragment>
                    )
                  })}
            </p>
            {enPausaTransicion && (
              <span className="video-transicion-pill">Asimilando…</span>
            )}
          </div>
        </div>

        <div className="video-formulas">
          <nav className="video-capitulos" aria-label="Escenas de la video-lección">
            {escenas.map((esc, idx) => (
              <button
                key={esc.id}
                type="button"
                className={`video-cap-btn${idx === escenaIdx ? ' video-cap-activo' : ''}`}
                aria-label={esc.titulo}
                title={esc.titulo}
                aria-current={idx === escenaIdx ? 'step' : undefined}
                onClick={() => irAEscena(idx)}
              >
                Esc. {idx + 1}
              </button>
            ))}
          </nav>

          <div className="video-pizarra-scroll">
            <p className="video-escena-titulo-panel">{escenaActual.titulo}</p>

            <div className="video-formula-principal">
              <M bloque tex={escenaActual.formulaTex} />
            </div>

            <ol className="video-pasos-tex">
              {escenaActual.pasosTex.map((tex, i) => {
                const visible = i < pasosVisiblesCount
                return (
                  <li key={i} className={visible ? 'video-paso-activo' : 'video-paso-espera'}>
                    {visible ? <M tex={tex} /> : <span className="suave">… siguiente paso en curso</span>}
                  </li>
                )
              })}
            </ol>

            <div className="video-mini-tabla-wrap">
              <table className="video-mini-tabla">
                <caption>{escenaActual.tabla.titulo}</caption>
                <thead>
                  <tr>
                    {escenaActual.tabla.columnas.map((col, idx) => (
                      <th key={col} scope="col" className={idx === 0 ? 'txt' : undefined}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filasVisibles.map((fila, idx) => (
                    <tr key={idx} className={fila.destacada ? 'video-mini-fila-destacada' : undefined}>
                      {fila.celdas.map((celda, cIdx) => (
                        <td key={cIdx} className={cIdx === 0 ? 'txt' : undefined}>
                          {celda}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="video-nota-clave">
              <strong>Idea clave:</strong> {escenaActual.notaClave}
            </p>
          </div>
        </div>
      </div>

      <div className="video-barra-inferior">
        <div className="video-timeline-wrap">
          <div className="video-timeline-pista">
            <input
              type="range"
              className="video-timeline"
              min={0}
              max={10000}
              value={Math.round((tiempoTranscurrido / Math.max(duracionTotal, 1)) * 10000)}
              onChange={(e) => irATiempoGlobal((Number(e.target.value) / 10000) * duracionTotal)}
              aria-label="Línea de tiempo de la video-lección"
            />
            <div className="video-marcadores" aria-label="Marcadores de capítulo">
              {escenas.map((esc, idx) => {
                const leftPct = ((iniciosEscena[idx] ?? 0) / Math.max(duracionTotal, 1)) * 100
                return (
                  <button
                    key={esc.id}
                    type="button"
                    className={`video-capitulo-marca${idx === escenaIdx ? ' marca-activa' : ''}`}
                    style={{ left: `${leftPct}%` }}
                    aria-label={`Ir al capítulo ${esc.titulo}`}
                    onClick={() => irAEscena(idx)}
                  />
                )
              })}
            </div>
          </div>
          <span className="video-tiempo">
            {fmtTiempo(tiempoTranscurrido)} / {fmtTiempo(duracionTotal)}
          </span>
        </div>

        <div className="video-controles">
          <div className="video-controles-izq">
            <button type="button" className="video-btn-play" onClick={togglePlay}>
              {reproduciendo ? '⏸ Pausar' : '▶ Reproducir'}
            </button>
            <button
              type="button"
              aria-label="Escena anterior"
              title="Escena anterior"
              disabled={escenaIdx === 0}
              onClick={() => irAEscena(Math.max(0, escenaIdx - 1))}
            >
              ⏮
            </button>
            <button
              type="button"
              aria-label="Siguiente escena"
              title="Siguiente escena"
              disabled={escenaIdx === escenas.length - 1}
              onClick={() => irAEscena(Math.min(escenas.length - 1, escenaIdx + 1))}
            >
              ⏭
            </button>
            <button
              type="button"
              aria-label="Retroceder 5 segundos (−5s)"
              onClick={() => irATiempoGlobal(tiempoTranscurrido - 5)}
            >
              −5s
            </button>
            <button
              type="button"
              aria-label="Avanzar 5 segundos (+5s)"
              onClick={() => irATiempoGlobal(tiempoTranscurrido + 5)}
            >
              +5s
            </button>
            <button
              type="button"
              aria-label="Reiniciar video-lección"
              title="Reiniciar"
              onClick={reiniciar}
            >
              ↺
            </button>
          </div>

          <div className="video-controles-der">
            <div className="video-velocidades" role="group" aria-label="Velocidad de reproducción">
              {VELOCIDADES.map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={velocidad === v}
                  onClick={() => cambiarVelocidad(v)}
                >
                  {v}x
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleAudio}
              aria-pressed={audioActivo}
              aria-label={audioActivo ? 'Voz activa — silenciar' : 'Silenciado — activar voz'}
              title={audioActivo ? 'Voz activa' : 'Silenciado'}
            >
              {audioActivo ? '🔊' : '🔇'}
            </button>
            <button
              type="button"
              aria-pressed={modoCine}
              aria-label={modoCine ? 'Salir modo cine' : 'Modo cine'}
              title={modoCine ? 'Salir modo cine' : 'Modo cine'}
              onClick={() => setModoCine((v) => !v)}
            >
              🎬
            </button>
            <button
              type="button"
              aria-label={enPantallaCompleta ? 'Salir pantalla completa' : 'Pantalla completa'}
              title={enPantallaCompleta ? 'Salir pantalla completa' : 'Pantalla completa'}
              onClick={togglePantallaCompleta}
            >
              ⛶
            </button>
          </div>
        </div>

        {modoAudio === 'silencio' && !soporteVoz && (
          <p className="suave video-aviso-tts">
            No se pudo reproducir el audio pregrabado ni la síntesis de voz del navegador; sigue la explicación animada con los subtítulos sincronizados.
          </p>
        )}
      </div>
    </section>
  )
}
