import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

vi.mock('../components/Grafico', () => ({ default: ({ titulo }: { titulo: string }) => <figure aria-label={titulo} /> }))

const irA = (ruta: string) => render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)

describe('Módulo 1', () => {
  it('bisección: calcula el caso base y muestra 20 iteraciones', async () => {
    const u = userEvent.setup()
    irA('/m1')
    const calc = screen.getByRole('region', { name: 'Calculadora de bisección' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByRole('status')).toHaveTextContent('20 iteraciones')
    expect(within(calc).getAllByRole('row')).toHaveLength(21)
  })
  it('editar un campo descarta el resultado previo', async () => {
    const u = userEvent.setup()
    irA('/m1')
    const calc = screen.getByRole('region', { name: 'Calculadora de bisección' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    await u.type(within(calc).getByLabelText('Tolerancia'), '1')
    expect(within(calc).queryByRole('table')).toBeNull()
  })
  it('Newton: derivada nula se informa como error', async () => {
    const u = userEvent.setup()
    irA('/m1')
    const calc = screen.getByRole('region', { name: 'Calculadora de Newton' })
    await u.click(within(calc).getByRole('button', { name: /Probar fallo/ }))
    expect(within(calc).getByRole('alert')).toHaveTextContent('derivada_nula')
  })
  it('campo no numérico muestra el error y no calcula', async () => {
    const u = userEvent.setup()
    irA('/m1')
    const calc = screen.getByRole('region', { name: 'Calculadora de Newton' })
    await u.clear(within(calc).getByLabelText(/Punto inicial/))
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByText(/Ingresa un número/)).toBeInTheDocument()
  })
})

describe('Módulo 2', () => {
  it('Gauss-Seidel: caso base converge', async () => {
    const u = userEvent.setup()
    irA('/m2')
    const calc = screen.getByRole('region', { name: 'Calculadora de Gauss-Seidel' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByRole('status')).toHaveTextContent('convergio')
  })
  it('eliminación: sistema singular no muestra solución', async () => {
    const u = userEvent.setup()
    irA('/m2')
    const calc = screen.getByRole('region', { name: 'Calculadora de eliminación con pivoteo parcial' })
    await u.click(within(calc).getByRole('button', { name: /Probar fallo/ }))
    expect(within(calc).getByRole('alert')).toHaveTextContent('singular')
    expect(within(calc).queryByRole('table', { name: /Solución/ })).toBeNull()
  })
  it('comparación: con singular ambos métodos informan error', async () => {
    const u = userEvent.setup()
    irA('/m2')
    const calc = screen.getByRole('region', { name: /Comparación: método directo/ })
    await u.click(within(calc).getByRole('button', { name: /Probar fallo/ }))
    expect(within(calc).getAllByRole('alert')).toHaveLength(2)
  })
  it('cambiar a 2×2 oculta los coeficientes de la tercera fila', async () => {
    const u = userEvent.setup()
    irA('/m2')
    const calc = screen.getByRole('region', { name: 'Calculadora de Gauss-Seidel' })
    expect(within(calc).getByLabelText('a33')).toBeInTheDocument()
    await u.selectOptions(within(calc).getByLabelText('Tamaño del sistema'), '2')
    expect(within(calc).queryByLabelText('a33')).toBeNull()
  })
})
