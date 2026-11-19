import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import PasosOcultos from './PasosOcultos'

vi.mock('./Grafico', () => ({
  default: ({ titulo }: { titulo: string }) => (
    <figure className="grafico" aria-label={titulo}>
      <div className="grafico-marco" />
    </figure>
  ),
}))

describe('Prevención de autoscroll hacia la autoevaluación', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('PasosOcultos bajo StrictMode NO llama focus al montar y sí usa preventScroll al interactuar', async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    const u = userEvent.setup()

    render(
      <StrictMode>
        <PasosOcultos pasos={[<p key="1">Paso 1</p>, <p key="2">Paso 2</p>]} nombre="prueba" />
      </StrictMode>,
    )

    expect(focusSpy).not.toHaveBeenCalled()

    await u.click(screen.getByRole('button', { name: /Mostrar siguiente paso/ }))
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
  })

  it.each([
    '/',
    '/errores',
    '/ecuaciones',
    '/sistemas',
    '/interpolacion',
    '/integracion',
    '/diferenciales',
  ])('la ruta %s monta al inicio (scrollY = 0) sin enfocar autoevaluación ni ejercicios', (ruta) => {
    const scrollSpy = vi.spyOn(window, 'scrollTo')
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
    document.documentElement.scrollTop = 420
    document.body.scrollTop = 420

    render(
      <StrictMode>
        <MemoryRouter initialEntries={[ruta]}>
          <App />
        </MemoryRouter>
      </StrictMode>,
    )

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    expect(document.documentElement.scrollTop).toBe(0)
    expect(document.body.scrollTop).toBe(0)
    expect(focusSpy).not.toHaveBeenCalled()

    const activo = document.activeElement
    expect(activo?.closest('#ejercicios')).toBeNull()
    expect(activo?.closest('#autoevaluacion')).toBeNull()
    expect(activo?.closest('#practica')).toBeNull()
  })
})
