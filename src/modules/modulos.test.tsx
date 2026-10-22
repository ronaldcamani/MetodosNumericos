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

describe('Módulo 3', () => {
  it('Lagrange: caso base da 1.9375', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByRole('status')).toHaveTextContent('1.9375')
    expect(within(calc).getAllByRole('row')).toHaveLength(5)
  })
  it('Lagrange: abscisa repetida se rechaza', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
    await u.click(within(calc).getByRole('button', { name: /Probar fallo/ }))
    expect(within(calc).getByRole('alert')).toHaveTextContent('invalido')
    expect(within(calc).queryByRole('table')).toBeNull()
  })
  it('regresión: caso base y fallo con x iguales', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: 'Calculadora de regresión lineal' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByText('y = 0.9 + 0.9·x', { selector: 'dd' })).toBeInTheDocument()
    await u.click(within(calc).getByRole('button', { name: /Probar fallo/ }))
    expect(within(calc).getByRole('alert')).toHaveTextContent('singular')
  })
  it('comparación: con abscisa repetida Lagrange falla y la regresión se conserva', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: /Comparación: interpolar/ })
    await u.click(within(calc).getByRole('button', { name: /abscisa repetida/ }))
    expect(within(calc).getAllByRole('alert')).toHaveLength(1)
    expect(within(calc).getAllByRole('status')).toHaveLength(1)
  })
  it('consulta fuera del intervalo muestra aviso de extrapolación', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: 'Calculadora de interpolación de Lagrange' })
    await u.clear(within(calc).getByLabelText('Consulta x'))
    await u.type(within(calc).getByLabelText('Consulta x'), '5')
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByRole('note')).toHaveTextContent(/extrapolación/)
  })
  it('cambiar a 2 puntos oculta las filas 3 y 4', async () => {
    const u = userEvent.setup()
    irA('/m3')
    const calc = screen.getByRole('region', { name: 'Calculadora de regresión lineal' })
    await u.selectOptions(within(calc).getByLabelText('Cantidad de puntos'), '2')
    expect(within(calc).queryByLabelText('x3')).toBeNull()
  })
})

describe('Módulo 4', () => {
  it('trapecio: caso base da 4.75 con 5 nodos', async () => {
    const u = userEvent.setup()
    irA('/m4')
    const calc = screen.getByRole('region', { name: 'Calculadora de trapecio compuesto' })
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByRole('status')).toHaveTextContent('4.75')
    expect(within(calc).getAllByRole('row')).toHaveLength(6)
  })
  it('Simpson: n = 3 se rechaza y explica la paridad', async () => {
    const u = userEvent.setup()
    irA('/m4')
    const calc = screen.getByRole('region', { name: 'Calculadora de Simpson 1/3 compuesto' })
    await u.click(within(calc).getByRole('button', { name: /n = 3/ }))
    expect(within(calc).getByRole('alert')).toHaveTextContent(/n par/)
    expect(within(calc).queryByRole('table')).toBeNull()
  })
  it('n = 0 se rechaza en ambos métodos', async () => {
    const u = userEvent.setup()
    irA('/m4')
    for (const nombre of ['Calculadora de trapecio compuesto', 'Calculadora de Simpson 1/3 compuesto']) {
      const calc = screen.getByRole('region', { name: nombre })
      await u.click(within(calc).getByRole('button', { name: /n = 0/ }))
      expect(within(calc).getByRole('alert')).toHaveTextContent(/entero positivo/)
    }
  })
  it('comparación con n impar: Simpson falla y el trapecio se conserva', async () => {
    const u = userEvent.setup()
    irA('/m4')
    const calc = screen.getByRole('region', { name: /Comparación: trapecio/ })
    await u.click(within(calc).getByRole('button', { name: /n = 3/ }))
    expect(within(calc).getAllByRole('alert')).toHaveLength(1)
    expect(within(calc).getAllByRole('status')).toHaveLength(1)
  })
  it('tasa negativa avisa de que no es un volumen físico', async () => {
    const u = userEvent.setup()
    irA('/m4')
    const calc = screen.getByRole('region', { name: 'Calculadora de trapecio compuesto' })
    await u.click(within(calc).getByRole('button', { name: /tasa negativa/ }))
    expect(within(calc).getByRole('note')).toHaveTextContent(/negativa/)
  })
  it('campo no numérico marca el error y no calcula', async () => {
    const u = userEvent.setup()
    irA('/m4')
    const calc = screen.getByRole('region', { name: 'Calculadora de trapecio compuesto' })
    await u.clear(within(calc).getByLabelText('Subintervalos n'))
    await u.click(within(calc).getByRole('button', { name: 'Calcular' }))
    expect(within(calc).getByText(/Ingresa un número/)).toBeInTheDocument()
  })
})
