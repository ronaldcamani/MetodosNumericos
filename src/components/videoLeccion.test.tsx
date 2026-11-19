import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import katex from 'katex'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AUDIOS_MANIFEST } from '../core/audiosManifest'
import { LECCIONES_VIDEO, type ModuloVideoId } from '../core/lecciones'
import VideoLeccion from './VideoLeccion'

const MODULOS: ModuloVideoId[] = [
  'errores',
  'ecuaciones',
  'sistemas',
  'interpolacion',
  'integracion',
  'diferenciales',
]

describe('LECCIONES_VIDEO y AUDIOS_MANIFEST (6 módulos, 2–3 min cada uno)', () => {
  it('cada módulo tiene 7 escenas con fórmulas KaTeX válidas, tabla en vivo y duración total de 120–180s', () => {
    for (const mod of MODULOS) {
      const lec = LECCIONES_VIDEO[mod]
      expect(lec.escenas.length).toBeGreaterThanOrEqual(6)
      expect(lec.escenas.length).toBeLessThanOrEqual(8)
      expect(lec.escenas).toHaveLength(7)

      let duracionTotal = 0
      for (const esc of lec.escenas) {
        duracionTotal += esc.duracion
        expect(esc.duracion).toBeGreaterThan(0)
        expect(esc.narracion.trim().length).toBeGreaterThan(80)
        expect(esc.notaClave.trim().length).toBeGreaterThan(10)
        expect(() => katex.renderToString(esc.formulaTex, { throwOnError: true })).not.toThrow()
        expect(esc.pasosTex.length).toBeGreaterThanOrEqual(2)
        esc.pasosTex.forEach((t) => {
          expect(() => katex.renderToString(t, { throwOnError: true })).not.toThrow()
        })
        expect(esc.tabla.titulo.trim().length).toBeGreaterThan(3)
        expect(esc.tabla.columnas.length).toBeGreaterThanOrEqual(2)
        expect(esc.tabla.filas.length).toBeGreaterThanOrEqual(2)
        expect(esc.tabla.filas[0].umbral).toBe(0)

        const meta = AUDIOS_MANIFEST[esc.id]
        expect(meta).toBeDefined()
        expect(meta.ruta).toMatch(new RegExp(`^audios/${mod}/escena-\\d+\\.mp3$`))
        expect(meta.duracionAudioSeg).toBeGreaterThan(10)
        expect(esc.duracion).toBe(Math.ceil(meta.duracionAudioSeg + 1.5))
      }

      expect(duracionTotal).toBeGreaterThanOrEqual(120)
      expect(duracionTotal).toBeLessThanOrEqual(210)
    }
  })
})

describe('VideoLeccion (reproductor audio-driven + fallback Web Speech API)', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete (window as unknown as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance
    delete (window as unknown as { speechSynthesis?: unknown }).speechSynthesis
  })

  it.each(MODULOS)('renderiza la lección de %s, carga el MP3 correspondiente y permite saltar entre 7 escenas', async (mod) => {
    const u = userEvent.setup()
    const { container } = render(<VideoLeccion modulo={mod} />)
    const lec = LECCIONES_VIDEO[mod]
    expect(screen.getByRole('region', { name: new RegExp(lec.titulo) })).toBeVisible()
    expect(screen.getByText(lec.escenas[0].narracion)).toBeVisible()
    expect(screen.getByText('Voz neuronal HD')).toBeVisible()

    const audio = container.querySelector('audio')
    expect(audio).not.toBeNull()
    expect(audio?.getAttribute('src')).toContain(`audios/${mod}/escena-1.mp3`)

    const nav = screen.getByRole('navigation', { name: 'Escenas de la video-lección' })
    expect(nav.querySelectorAll('button')).toHaveLength(7)
    await u.click(screen.getByRole('button', { name: lec.escenas[2].titulo }))
    expect(screen.getByText(lec.escenas[2].narracion)).toBeVisible()
    expect(audio?.getAttribute('src')).toContain(`audios/${mod}/escena-3.mp3`)
  })

  it('sincroniza playbackRate y muted en <audio> y nunca corta la frase antes de onEnded (+ pausa 1200ms)', async () => {
    vi.useFakeTimers()
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})

    const { container } = render(<VideoLeccion modulo="ecuaciones" />)
    const lec = LECCIONES_VIDEO.ecuaciones
    const audio = container.querySelector('audio') as HTMLAudioElement

    let tActual = 0
    Object.defineProperty(audio, 'duration', { configurable: true, get: () => 20 })
    Object.defineProperty(audio, 'currentTime', {
      configurable: true,
      get: () => tActual,
      set: (v: number) => {
        tActual = v
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    expect(playSpy).toHaveBeenCalled()

    // Cambio de velocidad y silencio sincronizados con el elemento <audio>
    fireEvent.click(screen.getByRole('button', { name: '1.25x' }))
    expect(audio.playbackRate).toBe(1.25)

    fireEvent.click(screen.getByRole('button', { name: /Voz activa/ }))
    expect(audio.muted).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Silenciado/ }))
    expect(audio.muted).toBe(false)

    // Avanza casi hasta el final (19.5s de 20s): NO debe cambiar de escena ni cortar la voz
    tActual = 19.5
    fireEvent(audio, new Event('timeupdate'))
    const subTexto = container.querySelector('.video-sub-texto')
    expect(subTexto).toHaveTextContent(lec.escenas[0].narracion)
    expect(container.querySelector('.sub-actual')).not.toBeNull()

    // Dispara ended: entra en pausa de asimilación (1200ms) antes de avanzar a escena 2
    tActual = 20
    fireEvent(audio, new Event('ended'))
    expect(screen.getByText('Asimilando…')).toBeVisible()
    expect(subTexto).toHaveTextContent(lec.escenas[0].narracion)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100)
    })
    expect(subTexto).toHaveTextContent(lec.escenas[0].narracion)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })
    expect(subTexto).toHaveTextContent(lec.escenas[1].narracion)

    fireEvent.click(screen.getByRole('button', { name: /Pausar/ }))
    expect(pauseSpy).toHaveBeenCalled()
  })

  it('hace fallback a aviso de subtítulos cuando falla el MP3 y no existe speechSynthesis', async () => {
    const u = userEvent.setup()
    const { container } = render(<VideoLeccion modulo="errores" />)
    const audio = container.querySelector('audio') as HTMLAudioElement

    fireEvent(audio, new Event('error'))
    expect(screen.getByText(/No se pudo reproducir el audio pregrabado ni la síntesis de voz/i)).toBeVisible()
    expect(screen.getByText('Solo subtítulos')).toBeVisible()

    const btn125 = screen.getByRole('button', { name: '1.25x' })
    const btn15 = screen.getByRole('button', { name: '1.5x' })
    await u.click(btn125)
    expect(btn125).toHaveAttribute('aria-pressed', 'true')
    await u.click(btn15)
    expect(btn15).toHaveAttribute('aria-pressed', 'true')

    await u.click(screen.getByRole('button', { name: /Reproducir/ }))
    expect(screen.getByRole('button', { name: /Pausar/ })).toBeVisible()
    await u.click(screen.getByRole('button', { name: /Reiniciar/ }))
    expect(screen.getByRole('button', { name: /Reproducir/ })).toBeVisible()
  })

  it('usa Web Speech API (speak/cancel) como respaldo si falla el MP3 cuando hay speechSynthesis', async () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    const getVoices = vi.fn(() => [{ lang: 'es-PE', name: 'Camila' } as SpeechSynthesisVoice])

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak, cancel, getVoices },
    })
    class FakeUtterance {
      text: string
      lang = ''
      rate = 1
      voice: SpeechSynthesisVoice | null = null
      onend?: () => void
      constructor(t: string) {
        this.text = t
      }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: FakeUtterance,
    })

    const u = userEvent.setup()
    const { container, unmount } = render(<VideoLeccion modulo="ecuaciones" />)
    const audio = container.querySelector('audio') as HTMLAudioElement
    fireEvent(audio, new Event('error'))
    expect(screen.getByText('Voz navegador')).toBeVisible()

    await u.click(screen.getByRole('button', { name: /Reproducir/ }))
    expect(speak).toHaveBeenCalledTimes(1)

    await u.click(screen.getByRole('button', { name: /Voz activa/ }))
    expect(cancel).toHaveBeenCalled()

    await u.click(screen.getByRole('button', { name: /Silenciado/ }))
    expect(speak).toHaveBeenCalledTimes(2)

    await u.click(screen.getByRole('button', { name: /Pausar/ }))
    expect(cancel).toHaveBeenCalled()

    await act(async () => {
      unmount()
    })
    expect(cancel).toHaveBeenCalled()
  })

  it('soporta 0.75x, salto ±5s, modo cine, 7 marcadores de capítulo y mini-tabla progresiva con caption', async () => {
    const u = userEvent.setup()
    const { container } = render(<VideoLeccion modulo="diferenciales" />)
    const lec = LECCIONES_VIDEO.diferenciales

    const btn075 = screen.getByRole('button', { name: '0.75x' })
    await u.click(btn075)
    expect(btn075).toHaveAttribute('aria-pressed', 'true')

    const btnCine = screen.getByRole('button', { name: /Modo cine/ })
    await u.click(btnCine)
    expect(screen.getByRole('button', { name: /Salir modo cine/ })).toHaveAttribute('aria-pressed', 'true')

    // La mini-tabla tiene caption y crece conforme avanza el progreso de la escena
    const tabla = screen.getByRole('table', { name: lec.escenas[0].tabla.titulo })
    expect(within(tabla).getAllByRole('row')).toHaveLength(2) // cabecera + primera fila (umbral 0)

    const total = lec.escenas.reduce((s, e) => s + e.duracion, 0)
    const targetSeg = Math.max(lec.escenas[0].duracion - 2, lec.escenas[0].duracion * 0.8)
    const sliderVal = String(Math.round((targetSeg / total) * 10000))
    const slider = screen.getByRole('slider', { name: /Línea de tiempo/ })
    fireEvent.change(slider, { target: { value: sliderVal } })
    expect(within(tabla).getAllByRole('row').length).toBeGreaterThan(2)

    // Salto +5s y −5s
    const subTexto = container.querySelector('.video-sub-texto')
    await u.click(screen.getByRole('button', { name: /\+5s/ }))
    expect(subTexto).toHaveTextContent(lec.escenas[1].narracion)
    await u.click(screen.getByRole('button', { name: /−5s/ }))
    expect(subTexto).toHaveTextContent(lec.escenas[0].narracion)

    // Botones de escena siguiente y anterior
    await u.click(screen.getByRole('button', { name: 'Siguiente escena' }))
    expect(subTexto).toHaveTextContent(lec.escenas[1].narracion)
    await u.click(screen.getByRole('button', { name: 'Escena anterior' }))
    expect(subTexto).toHaveTextContent(lec.escenas[0].narracion)

    // Marcadores de capítulo
    const marcadores = screen.getByLabelText('Marcadores de capítulo')
    const botonesMarcador = within(marcadores).getAllByRole('button')
    expect(botonesMarcador).toHaveLength(7)
    await u.click(botonesMarcador[2])
    expect(screen.getByText(lec.escenas[2].narracion)).toBeVisible()
  })
})
