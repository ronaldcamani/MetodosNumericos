import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATALOGOS, generarProblemas } from '../core/practica'
import PracticaGenerada from './PracticaGenerada'
import { borrarProgreso } from './useProgreso'

const tarjetas = () => screen.getAllByRole('listitem').filter((li) => li.classList.contains('problema-generado'))

describe('PracticaGenerada', () => {
  beforeEach(() => {
    borrarProgreso()
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // semilla fija: 500001
  })
  afterEach(() => vi.restoreAllMocks())
  const esperados = (tema: string, nivel: 'basico' | 'intermedio' | 'avanzado' = 'basico') => generarProblemas(tema, nivel, CATALOGOS[tema], 500001)

  it('muestra los tres niveles y tres problemas del nivel elegido', async () => {
    render(<PracticaGenerada tema="ecuaciones" />)
    const grupo = screen.getByRole('group', { name: /nivel de dificultad/i })
    expect(within(grupo).getAllByRole('button')).toHaveLength(3)
    expect(tarjetas()).toHaveLength(3)
    await userEvent.click(within(grupo).getByRole('button', { name: /avanzado/i }))
    expect(within(grupo).getByRole('button', { name: /avanzado/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Cada acierto vale 30 puntos/)).toBeVisible()
  })

  it('«Generar problemas nuevos» cambia los enunciados', async () => {
    vi.mocked(Math.random).mockRestore()
    render(<PracticaGenerada tema="sistemas" />)
    const antes = tarjetas().map((t) => t.textContent).join()
    await userEvent.click(screen.getByRole('button', { name: /generar problemas nuevos/i }))
    expect(tarjetas().map((t) => t.textContent).join()).not.toBe(antes)
  })

  it('una respuesta equivocada no revela la solución ni suma puntos', async () => {
    render(<PracticaGenerada tema="errores" />)
    const t = tarjetas()[0]
    for (const c of within(t).getAllByRole('textbox')) await userEvent.type(c, '123456')
    await userEvent.click(within(t).getByRole('button', { name: /comprobar/i }))
    expect(within(t).getAllByText(/no coincide/).length).toBeGreaterThan(0)
    expect(within(t).queryByText('Paso 1')).toBeNull()
    expect(screen.getByText(/· 0 puntos/)).toBeVisible()
  })

  it('un valor no numérico avisa sin calificar', async () => {
    render(<PracticaGenerada tema="errores" />)
    const t = tarjetas()[0]
    await userEvent.type(within(t).getAllByRole('textbox')[0], 'abc')
    await userEvent.click(within(t).getByRole('button', { name: /comprobar/i }))
    expect(within(t).getByText(/Escribe un número en cada campo/)).toBeVisible()
    expect(screen.getByText(/· 0 puntos/)).toBeVisible()
  })

  it('los aciertos suman puntos, llenan estrellas y suben el dominio', async () => {
    render(<PracticaGenerada tema="diferenciales" />)
    const problemas = esperados('diferenciales')
    for (let i = 0; i < 2; i++) {
      const t = tarjetas()[i]
      const cajas = within(t).getAllByRole('textbox')
      for (let k = 0; k < cajas.length; k++) await userEvent.type(cajas[k], String(problemas[i].campos[k].valor))
      await userEvent.click(within(t).getByRole('button', { name: /comprobar/i }))
      expect(within(t).getByText(/¡Correcto!/)).toBeVisible()
    }
    expect(screen.getByText(/· 20 puntos/)).toBeVisible()
    expect(screen.getAllByRole('img', { name: '1 de 3 estrellas' }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('progressbar', { name: /dominio del tema/i })).toHaveAttribute('aria-valuenow', '10')
    // el avance sobrevive a un nuevo montaje (queda en el navegador)
    expect(window.localStorage.getItem('portal-mn-progreso-v1')).toContain('"puntos":20')
  })

  it('quien abre el desarrollo antes de acertar no suma puntos; los pasos se piden de uno en uno', async () => {
    render(<PracticaGenerada tema="interpolacion" />)
    const problemas = esperados('interpolacion')
    const t = tarjetas()[0]
    await userEvent.click(within(t).getByRole('button', { name: /ver el desarrollo paso a paso/i }))
    expect(within(t).queryByText(/^Paso 1$/, { selector: '.paso-visible .paso-numero' })).toBeNull()
    await userEvent.click(within(t).getByRole('button', { name: /mostrar siguiente paso \(1 de/i }))
    expect(within(t).getByText('Paso 1', { selector: '.paso-visible .paso-numero' })).toBeVisible()
    expect(within(t).queryByText('Paso 2', { selector: '.paso-visible .paso-numero' })).toBeNull()
    const cajas = within(t).getAllByRole('textbox')
    for (let k = 0; k < cajas.length; k++) await userEvent.type(cajas[k], String(problemas[0].campos[k].valor))
    await userEvent.click(within(t).getByRole('button', { name: /comprobar/i }))
    expect(within(t).getByText(/no suma puntos/)).toBeVisible()
    expect(screen.getByText(/· 0 puntos/)).toBeVisible()
  })
})
